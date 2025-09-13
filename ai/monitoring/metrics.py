import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict, Tuple
from sqlalchemy import func, case
from monitoring.app_scripts.database import Session, EndpointMetrics, ModelMetrics, SystemMetrics


class MetricsCollector:
    def __init__(self):
        try:
            if Session is None:
                self.session = None
                self.logger = logging.getLogger("metrics")
                self.logger.error("Database session factory is None - metrics collection disabled")
            else:
                self.session = Session()
                self.logger = logging.getLogger("metrics")
        except Exception as e:
            self.session = None
            self.logger = logging.getLogger("metrics")
            self.logger.error(f"Failed to initialize metrics collector: {e}")
            
        
    def _get_time_filter_and_bucket(self, hours: int, table):
        """Determine appropriate time filter and bucket based on hours"""
        time_filter = table.timestamp >= datetime.utcnow() - timedelta(hours=hours)
        
        # For monthly view (720+ hours), use daily buckets
        if hours >= 720:
            time_bucket = func.date_trunc('day', table.timestamp)
        # For weekly view (168+ hours), use 6-hour buckets
        elif hours >= 168:
            time_bucket = func.date_trunc('hour', 
                func.timezone('UTC', table.timestamp) - 
                func.make_interval(hours=func.date_part('hour', table.timestamp) % 6)
            )
        # For daily view (24+ hours), use hourly buckets
        elif hours >= 24:
            time_bucket = func.date_trunc('hour', table.timestamp)
        # For shorter periods, use minute buckets
        else:
            time_bucket = func.date_trunc('minute', table.timestamp)
            
        return time_filter, time_bucket

    def track_request(self, endpoint: str, response_time: float, status_code: int):
        try:
            metric = EndpointMetrics(
                endpoint=endpoint,
                response_time=response_time,
                status_code=status_code,
                timestamp=datetime.utcnow()
            )
            self.session.add(metric)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            self.logger.error(f"Error tracking request: {e}")

    def track_model_metrics(self, model_name: str, metrics: Dict):
        """Track multiple metrics for a specific model"""
        try:
            timestamp = datetime.utcnow()
            for metric_name, metric_value in metrics.items():
                if metric_value is not None:  # Skip None values
                    metric = ModelMetrics(
                        model_name=model_name,
                        metric_name=metric_name,
                        metric_value=float(metric_value),
                        timestamp=timestamp
                    )
                    self.session.add(metric)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            self.logger.error(f"Error tracking model metrics: {e}")

    def get_model_metrics(self, hours: int = 24, model_name: str = None) -> Dict:
        """Get aggregated model metrics with advanced statistics"""
        try:
            # Get time filter based on hours
            time_filter, _ = self._get_time_filter_and_bucket(hours, ModelMetrics)
            
            # Base query
            query = self.session.query(
                ModelMetrics.model_name,
                ModelMetrics.metric_name,
                func.avg(ModelMetrics.metric_value).label("avg_value"),
                func.min(ModelMetrics.metric_value).label("min_value"),
                func.max(ModelMetrics.metric_value).label("max_value"),
                func.stddev(ModelMetrics.metric_value).label("stddev"),
                func.count().label("sample_count"),
                func.max(ModelMetrics.timestamp).label("last_recorded")
            ).filter(time_filter)

            # Optional model filtering
            if model_name:
                query = query.filter(ModelMetrics.model_name == model_name)

            # Execute query
            results = query.group_by(
                ModelMetrics.model_name,
                ModelMetrics.metric_name
            ).order_by(
                ModelMetrics.model_name,
                ModelMetrics.metric_name
            ).all()

            # Structure the results
            metrics = {}
            for (model, metric, avg_val, min_val, max_val, std_val, count, last_rec) in results:
                if model not in metrics:
                    metrics[model] = {}

                metrics[model][metric] = {
                    "average": float(avg_val) if avg_val is not None else 0,
                    "minimum": float(min_val) if min_val is not None else 0,
                    "maximum": float(max_val) if max_val is not None else 0,
                    "std_dev": float(std_val) if std_val is not None else 0,
                    "count": int(count),
                    "last_recorded": last_rec.isoformat() if last_rec else None,
                    "percentiles": self._get_metric_percentiles(model, metric, hours)
                }
                
                # For monthly view, add time series with appropriate granularity
                metrics[model][metric]["time_series"] = self._get_time_series_data(
                    model, metric, hours
                )

            return metrics

        except Exception as e:
            self.logger.error(f"Error getting model metrics: {e}")
            return {}
            
    def _get_time_series_data(self, model_name: str, metric_name: str, hours: int) -> Dict:
        """Get time series data with appropriate bucketing based on time range"""
        try:
            time_filter, time_bucket = self._get_time_filter_and_bucket(hours, ModelMetrics)
            
            # Query with appropriate time bucket
            results = self.session.query(
                time_bucket.label("time_bucket"),
                func.avg(ModelMetrics.metric_value).label("avg_value")
            ).filter(
                ModelMetrics.model_name == model_name,
                ModelMetrics.metric_name == metric_name,
                time_filter
            ).group_by(
                "time_bucket"
            ).order_by(
                "time_bucket"
            ).all()
            
            # Format results as lists for easy plotting
            return {
                "timestamps": [r.time_bucket.isoformat() for r in results],
                "values": [float(r.avg_value) if r.avg_value is not None else 0 for r in results]
            }
        except Exception as e:
            self.logger.warning(
                f"Couldn't get time series for {model_name}.{metric_name}: {e}")
            return {"timestamps": [], "values": []}

    def _get_metric_percentiles(self, model_name: str, metric_name: str, hours: int) -> Dict:
        """Helper method to calculate percentiles for specific metrics"""
        try:
            time_filter, _ = self._get_time_filter_and_bucket(hours, ModelMetrics)
            
            percentiles = self.session.query(
                func.percentile_cont(0.25).within_group(
                    ModelMetrics.metric_value).label("p25"),
                func.percentile_cont(0.50).within_group(
                    ModelMetrics.metric_value).label("p50"),
                func.percentile_cont(0.75).within_group(
                    ModelMetrics.metric_value).label("p75"),
                func.percentile_cont(0.95).within_group(
                    ModelMetrics.metric_value).label("p95")
            ).filter(
                ModelMetrics.model_name == model_name,
                ModelMetrics.metric_name == metric_name,
                time_filter
            ).first()

            return {
                "p25": float(percentiles.p25) if percentiles.p25 is not None else 0,
                "p50": float(percentiles.p50) if percentiles.p50 is not None else 0,
                "p75": float(percentiles.p75) if percentiles.p75 is not None else 0,
                "p95": float(percentiles.p95) if percentiles.p95 is not None else 0
            }
        except Exception as e:
            self.logger.warning(
                f"Couldn't calculate percentiles for {model_name}.{metric_name}: {e}")
            return {}

    def track_system_metrics(self):
        try:
            metric = SystemMetrics(
                cpu_usage=psutil.cpu_percent(),
                memory_usage=psutil.virtual_memory().percent,
                timestamp=datetime.utcnow()
            )
            self.session.add(metric)
            self.session.commit()
            return {"cpu": metric.cpu_usage, "memory": metric.memory_usage}
        except Exception as e:
            self.logger.error(f"Error tracking system metrics: {e}")
            return {}

    def get_endpoint_metrics(self, hours: int = 24) -> Dict:
        """Get aggregated endpoint metrics for the last N hours"""
        try:
            time_filter, _ = self._get_time_filter_and_bucket(hours, EndpointMetrics)
            
            # Get summary statistics
            results = self.session.query(
                EndpointMetrics.endpoint,
                func.avg(EndpointMetrics.response_time).label("avg_response_time"),
                func.count().label("request_count"),
                func.sum(case(
                    (EndpointMetrics.status_code >= 400, 1),
                    else_=0
                )).label("error_count")
            ).filter(time_filter).group_by(
                EndpointMetrics.endpoint
            ).all()

            # Format basic endpoint metrics
            endpoint_metrics = {
                ep: {
                    "avg_response_time": avg_time,
                    "request_count": count,
                    "error_rate": error_count / count if count else 0
                }
                for ep, avg_time, count, error_count in results
            }
            
            # For each endpoint, get time series data with appropriate granularity
            for endpoint in endpoint_metrics:
                endpoint_metrics[endpoint]["time_series"] = self._get_endpoint_time_series(
                    endpoint, hours
                )
                
            return endpoint_metrics
            
        except Exception as e:
            self.logger.error(f"Error getting endpoint metrics: {e}")
            return {}
            
    def _get_endpoint_time_series(self, endpoint: str, hours: int) -> Dict:
        """Get time series data for an endpoint with appropriate time buckets"""
        try:
            time_filter, time_bucket = self._get_time_filter_and_bucket(hours, EndpointMetrics)
            
            # Query with appropriate time bucket
            results = self.session.query(
                time_bucket.label("time_bucket"),
                func.avg(EndpointMetrics.response_time).label("avg_response_time"),
                func.count().label("request_count"),
                func.sum(case(
                    (EndpointMetrics.status_code >= 400, 1),
                    else_=0
                )).label("error_count")
            ).filter(
                EndpointMetrics.endpoint == endpoint,
                time_filter
            ).group_by(
                "time_bucket"
            ).order_by(
                "time_bucket"
            ).all()
            
            # Format results for plotting
            return {
                "timestamps": [r.time_bucket.isoformat() for r in results],
                "response_times": [float(r.avg_response_time) if r.avg_response_time is not None else 0 for r in results],
                "request_counts": [int(r.request_count) for r in results],
                "error_rates": [float(r.error_count / r.request_count) if r.request_count else 0 for r in results]
            }
        except Exception as e:
            self.logger.warning(f"Couldn't get time series for endpoint {endpoint}: {e}")
            return {"timestamps": [], "response_times": [], "request_counts": [], "error_rates": []}

    def get_system_metrics(self, hours: int = 1) -> Dict:
        """Get recent system metrics with appropriate time bucketing"""
        try:
            time_filter, time_bucket = self._get_time_filter_and_bucket(hours, SystemMetrics)
            
            # Get average metrics
            summary = self.session.query(
                func.avg(SystemMetrics.cpu_usage).label("avg_cpu"),
                func.avg(SystemMetrics.memory_usage).label("avg_memory")
            ).filter(time_filter).first()
            
            # Get time series with appropriate bucketing
            time_series = self.session.query(
                time_bucket.label("time_bucket"),
                func.avg(SystemMetrics.cpu_usage).label("avg_cpu"),
                func.avg(SystemMetrics.memory_usage).label("avg_memory")
            ).filter(time_filter).group_by(
                "time_bucket"
            ).order_by(
                "time_bucket"
            ).all()
            
            # Format results
            return {
                "avg_cpu": float(summary.avg_cpu) if summary and summary.avg_cpu else 0,
                "avg_memory": float(summary.avg_memory) if summary and summary.avg_memory else 0,
                "time_series": {
                    "timestamps": [r.time_bucket.isoformat() for r in time_series],
                    "cpu_values": [float(r.avg_cpu) if r.avg_cpu is not None else 0 for r in time_series],
                    "memory_values": [float(r.avg_memory) if r.avg_memory is not None else 0 for r in time_series]
                }
            }
        except Exception as e:
            self.logger.error(f"Error getting system metrics: {e}")
            return {
                "avg_cpu": 0, 
                "avg_memory": 0,
                "time_series": {"timestamps": [], "cpu_values": [], "memory_values": []}
            }


metrics_collector = MetricsCollector()
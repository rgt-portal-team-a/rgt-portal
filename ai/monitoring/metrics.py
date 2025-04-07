import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict
from sqlalchemy import func, case
from monitoring.app_scripts.database import Session, EndpointMetrics, ModelMetrics, SystemMetrics


class MetricsCollector:
    def __init__(self):
        self.session = Session()
        self.logger = logging.getLogger("metrics")

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
            ).filter(
                ModelMetrics.timestamp >= datetime.utcnow() - timedelta(hours=hours)
            )

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

            return metrics

        except Exception as e:
            self.logger.error(f"Error getting model metrics: {e}")
            return {}

    def _get_metric_percentiles(self, model_name: str, metric_name: str, hours: int) -> Dict:
        """Helper method to calculate percentiles for specific metrics"""
        try:
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
                ModelMetrics.timestamp >= datetime.utcnow() - timedelta(hours=hours)
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
            results = self.session.query(
                EndpointMetrics.endpoint,
                func.avg(EndpointMetrics.response_time).label(
                    "avg_response_time"),
                func.count().label("request_count"),
                func.sum(case(
                    (EndpointMetrics.status_code >= 400, 1),
                    else_=0
                )).label("error_count")
            ).filter(
                EndpointMetrics.timestamp >= datetime.utcnow() - timedelta(hours=hours)
            ).group_by(
                EndpointMetrics.endpoint
            ).all()

            return {
                ep: {
                    "avg_response_time": avg_time,
                    "request_count": count,
                    "error_rate": error_count / count if count else 0
                }
                for ep, avg_time, count, error_count in results
            }
        except Exception as e:
            self.logger.error(f"Error getting endpoint metrics: {e}")
            return {}

    def get_system_metrics(self, hours: int = 1) -> Dict:
        """Get recent system metrics"""
        try:
            result = self.session.query(
                func.avg(SystemMetrics.cpu_usage).label("avg_cpu"),
                func.avg(SystemMetrics.memory_usage).label("avg_memory")
            ).filter(
                SystemMetrics.timestamp >= datetime.utcnow() - timedelta(hours=hours)
            ).first()

            return {
                "avg_cpu": result.avg_cpu if result else 0,
                "avg_memory": result.avg_memory if result else 0
            }
        except Exception as e:
            self.logger.error(f"Error getting system metrics: {e}")
            return {"avg_cpu": 0, "avg_memory": 0}


metrics_collector = MetricsCollector()

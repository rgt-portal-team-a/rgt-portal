import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict
from sqlalchemy import func, case
from .database import Session, EndpointMetrics, ModelMetrics, SystemMetrics


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

    def track_model_performance(self, model_name: str, metrics: Dict[str, float]):
        try:
            timestamp = datetime.utcnow()
            for metric_name, metric_value in metrics.items():
                metric = ModelMetrics(
                    model_name=model_name,
                    metric_name=metric_name,
                    metric_value=metric_value,
                    timestamp=timestamp
                )
                self.session.add(metric)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            self.logger.error(f"Error tracking model metrics: {e}")

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

from fastapi import APIRouter, Depends
from typing import Dict
from monitoring.metrics import metrics_collector

router = APIRouter(
    prefix="/api/metrics",
    tags=["Metrics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_all_metrics(hours: int = 24) -> Dict:
    """Get all metrics including endpoint, system and model metrics"""
    return {
        "endpoints": metrics_collector.get_endpoint_metrics(hours),
        "system": metrics_collector.get_system_metrics(min(hours, 1)),  # System metrics typically look at shorter windows
        "models": metrics_collector.get_model_metrics(hours)
    }

@router.get("/endpoints")
async def get_endpoint_metrics(hours: int = 24) -> Dict:
    """Get only endpoint metrics"""
    return metrics_collector.get_endpoint_metrics(hours)

@router.get("/system")
async def get_system_metrics(hours: int = 1) -> Dict:
    """Get only system metrics (recommended to keep max 1 hour window)"""
    return metrics_collector.get_system_metrics(hours)

@router.get("/models")
async def get_model_metrics(hours: int = 24, model_name: str = None) -> Dict:
    """Get model performance metrics"""
    return metrics_collector.get_model_metrics(hours, model_name)

@router.post("/system/collect")
async def collect_system_metrics() -> Dict:
    """Trigger immediate system metrics collection"""
    return metrics_collector.track_system_metrics()
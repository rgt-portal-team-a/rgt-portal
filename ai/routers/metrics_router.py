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
    """Get all metrics including endpoint and system metrics"""
    endpoint_metrics = metrics_collector.get_endpoint_metrics(hours)
    system_metrics = metrics_collector.get_system_metrics(hours)
    return {
        "endpoints": endpoint_metrics,
        "system": system_metrics
    }
@router.get("/endpoints")
async def get_endpoint_metrics(hours: int = 24) -> Dict:
    """Get only endpoint metrics"""
    return metrics_collector.get_endpoint_metrics(hours)
@router.get("/system")
async def get_system_metrics(hours: int = 1) -> Dict:
    """Get only system metrics"""
    return metrics_collector.get_system_metrics(hours)

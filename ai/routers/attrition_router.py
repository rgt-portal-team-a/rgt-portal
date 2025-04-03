# attrition/router.py
from fastapi import APIRouter, HTTPException
from attrition.predictor import EmployeeData, PredictionResponse, predict_attrition
from monitoring.metrics import metrics_collector
import time

router = APIRouter(tags=["Attrition Prediction"], prefix="/predict-attrition")


@router.post("", response_model=PredictionResponse)
def predict_attrition_endpoint(employee: EmployeeData):
    start_time = time.time()
    try:
        # Get prediction
        result = predict_attrition(employee)
        inference_time = time.time() - start_time

        # Track endpoint metrics
        metrics_collector.track_request(
            endpoint="/predict-attrition",
            response_time=inference_time,
            status_code=200
        )

        # Track model-specific metrics
        metrics_collector.track_model_metrics(
            model_name="attrition_model",
            metrics={
                "inference_time": inference_time,
                "prediction": float(result.attrition_probability),
                "confidence": float(result.confidence) if hasattr(result, 'confidence') else 0.0,
                "actual": float(employee.attrition) if hasattr(employee, 'attrition') else None
            }
        )

        return result
    except Exception as e:
        metrics_collector.track_request(
            endpoint="/predict-attrition",
            response_time=time.time() - start_time,
            status_code=500
        )
        raise HTTPException(status_code=500, detail=str(e))

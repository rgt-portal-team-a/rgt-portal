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

        # Track model performance metrics
        metrics_collector.track_model_performance(
            model_name="attrition_model",
            metrics={
                "inference_time_sec": inference_time,
                # Convert to float if needed
                "prediction": float(result.attrition_probability),
                "confidence": float(result.confidence) if hasattr(result, 'confidence') else 0.0
            }
        )

        return result
    except Exception as e:
        # Track failed predictions too
        metrics_collector.track_model_performance(
            model_name="attrition_model",
            metrics={
                "error": 1.0,
                "inference_time_sec": time.time() - start_time
            }
        )
        raise HTTPException(status_code=500, detail=str(e))

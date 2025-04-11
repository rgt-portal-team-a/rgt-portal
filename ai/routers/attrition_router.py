from fastapi import APIRouter, HTTPException
from attrition.predictor import EmployeeData, PredictionResponse, predict_attrition

router = APIRouter(tags=["Attrition Prediction"], prefix="/predict-attrition")

@router.post("", response_model=PredictionResponse)
def predict_attrition_endpoint(employee: EmployeeData):
    try:
        return predict_attrition(employee)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
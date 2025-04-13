import pickle
import pandas as pd
from typing import List
from pydantic import BaseModel, validator
from sklearn.metrics import r2_score, accuracy_score

# Pydantic model for input data validation
class EmployeeData(BaseModel):
    age: int
    region: str
    work_mode: str
    skills: List[str]
    department: str
    duration: float  # Duration in months

    @validator('work_mode')
    def validate_work_mode(cls, v, values):
        if 'region' in values and values['region'].lower() != "greater accra":
            return "Remote"
        return v

# Response model including prediction and model metrics
class PredictionResponse(BaseModel):
    attrition_probability: float
    risk_level: str
    assessment: str


# Load the model with metrics if stored
def load_model(): 
    try:
        with open('attrition/best_tuned_model.pkl', 'rb') as file:
            model_bundle = pickle.load(file)
        return model_bundle
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Preprocess input data
def preprocess_data(employee: EmployeeData):
    skills_str = ",".join(employee.skills) if employee.skills else "None"
    return pd.DataFrame({
        'age': [employee.age],
        'region': [employee.region],
        'work_mode': [employee.work_mode],
        'skills': [skills_str],
        'department': [employee.department],
        'duration': [employee.duration]
    })

# Predict attrition and include model metrics
def predict_attrition(employee: EmployeeData) -> PredictionResponse:
    model_bundle = load_model()
    if not model_bundle:
        raise Exception("Model could not be loaded")

    # Fix: Check the structure of model_bundle and access appropriately
    if isinstance(model_bundle, dict):
        # If model_bundle is a dictionary
        model = model_bundle.get("model")
        r2 = model_bundle.get("r2", 0.0)
        acc = model_bundle.get("accuracy", 0.0)
    else:
        # If model_bundle is the model itself
        model = model_bundle
        r2 = getattr(model, "r2_score", 0.0)
        acc = getattr(model, "accuracy", 0.0)

    input_data = preprocess_data(employee)
    
    # Handle different prediction methods
    try:
        probability = float(model.predict_proba(input_data)[0][1]) * 100
    except (AttributeError, IndexError):
        # Fallback if predict_proba is not available or returns unexpected format
        try:
            raw_prediction = model.predict(input_data)[0]
            probability = 100.0 if raw_prediction > 0.5 else 0.0
        except:
            raise Exception("Failed to make prediction with model")

    if probability >= 75:
        risk_level = "High Risk"
        assessment = "This employee has a high probability of leaving the organization soon."
    elif 50 <= probability < 75:
        risk_level = "Medium Risk"
        assessment = "This employee has a moderate risk of attrition and should be monitored."
    else:
        risk_level = "Low Risk"
        assessment = "This employee has a low probability of leaving in the near future."

    return PredictionResponse(
        attrition_probability=probability,
        risk_level=risk_level,
        assessment=assessment
    )
import pandas as pd
import pickle
import numpy as np
import os
from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

# Define class labels
CLASS_LABELS = {
    0: '1st Interview',
    1: 'CV Review',
    2: 'Technical Interview',
    3: 'Online Exam',
    4: 'Contract Terms Interview',
    5: 'Pre-Online Exam',
    6: 'Customer Interview',
    7: 'Position on Hold'
}

# Position and Source Mappings
POSITION_MAPPING = {
    'AI': 0, 'Admin': 1, 'Android Developer': 2, 'Android developer': 3,
    'Angular': 4, 'Angular + Node': 5, 'Backend Developer': 6, 'Blockchain': 7,
    'Business': 8, 'C#': 9, 'Data Analyst': 10, 'DevOps': 11, 'Flutter': 12,
    'IOS developer': 13, 'IT SUPPORT': 14, 'Marketing': 15, 'National Service': 16,
    'Project Manager': 17, 'Python Developer': 18, 'QA': 19, 'R&D': 20,
    'React + Node': 21, 'React Native Developer': 22, 'React.js': 23,
    'Senior Developer': 24, 'UI/UX Designer': 25, 'Untitled': 26,
    'WordPress Developer': 27
}

SOURCE_MAPPING = {
    'Adjoa': 0, 'Aldelia': 1, 'Ayelet': 2, 'Bar': 3, 'Belinda': 4,
    'Benjamin': 5, 'Bernard': 6, 'Bimpong': 7, 'Career Compass': 8,
    'CodeIn': 9, 'Codeln': 10, 'Eli': 11, 'Fiifi': 12, 'Flyers': 13,
    'Ghana Tech Job': 14, 'HR Bureau': 15, 'HR HUB': 16, 'Internal': 17,
    'Internal Emails-KNUST': 18, 'Jobmannor': 19, 'Joe': 20, 'Kilu': 21,
    'Kingdom': 22, 'Kwaku Agency': 23, 'Leasafrica': 24, 'Micheal stevens': 25,
    'Nelson': 26, 'Nimo': 27, 'Pearl': 28, 'Prasanth': 29, 'Quality Services': 30,
    'Redeemer': 31, 'Richard': 32, 'Roni': 33, 'Silas': 34, 'Slack': 35,
    'Sujith': 36, 'Unknown': 37, 'Vacancies Limited': 38, 'Website': 39,
    'WhyteCleon': 40, 'Winifred': 41
}


class RawApplicantData(BaseModel):
    source: str = Field(..., description="Source of the application")
    position: str = Field(..., description="Job position applied for")
    statusDueDate: str = Field(
        ..., description="Status due date in YYYY-MM-DD format", alias="statusDueDate")
    date: str = Field(...,
                      description="Application date in YYYY-MM-DD format", alias="date")
    updatedAt: str = Field(
        ..., description="Last update timestamp in YYYY-MM-DD HH:MM:SS format", alias="updatedAt")
    phoneNumber: Optional[str] = Field(
        None, description="Applicant's phone number", alias="phoneNumber")
    email: Optional[str] = Field(None, description="Applicant's email address")
    hasAppliedBefore: bool = Field(
        ..., description="Has the applicant applied before", alias="hasAppliedBefore")

    class Config:
        json_schema_extra = {
            "example": {
                "source": "LinkedIn",
                "position": "Software Engineer",
                "statusDueDate": "2023-12-31",
                "date": "2023-12-15",
                "updatedAt": "2023-12-20 14:30:00",
                "phoneNumber": "+1234567890",
                "email": "applicant@example.com",
                "hasAppliedBefore": True
            }
        }


class ProcessedApplicantData(BaseModel):
    source: int
    clean_Position: int
    days_to_Status_Due: int
    year: int
    month: int
    day: int
    updated_hour: int
    date_Timestamp: int
    status_due_date_Timestamp: int
    updated_Timestamp: int
    days_to_decision: int
    has_phone_number: int
    has_applied_before: int
    has_email: int


class PredictionResult(BaseModel):
    predicted_stage: str
    probability: float = Field(...,
                               description="Prediction probability as percentage (0-100)")


class DropoffPredictor:
    def __init__(self, model_path: str):
        self.model = self._load_model(model_path)
        self.feature_order = [
            'source', 'clean_Position', 'days_to_Status_Due', 'year',
            'month', 'day', 'updated_hour', 'date_Timestamp', 'status_due_date_Timestamp',
            'updated_Timestamp', 'days_to_decision', 'has_phone_number',
            'has_applied_before', 'has_email'
        ]

    def _load_model(self, model_path: str):
        try:
            with open(model_path, 'rb') as file:
                return pickle.load(file)
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {str(e)}")

    def _encode_source(self, source: str) -> int:
        return SOURCE_MAPPING.get(source, -1)

    def _encode_position(self, position: str) -> int:
        return POSITION_MAPPING.get(position, -1)

    def _preprocess_raw_data(self, raw_data: List[RawApplicantData]) -> List[ProcessedApplicantData]:
        processed_list = []

        for item in raw_data:
            try:
                app_date = datetime.strptime(item.date, "%Y-%m-%d")
                status_due_date = datetime.strptime(
                    item.statusDueDate, "%Y-%m-%d")
                updated_at = datetime.strptime(
                    item.updatedAt, "%Y-%m-%d %H:%M:%S")
            except ValueError as e:
                raise ValueError(f"Invalid date format: {str(e)}")

            days_to_status_due = (status_due_date - app_date).days
            days_to_decision = (updated_at - app_date).days

            processed = {
                "source": self._encode_source(item.source),
                "clean_Position": self._encode_position(item.position),
                "days_to_Status_Due": days_to_status_due,
                "year": app_date.year,
                "month": app_date.month,
                "day": app_date.day,
                "updated_hour": updated_at.hour,
                "date_Timestamp": int(app_date.timestamp()),
                "status_due_date_Timestamp": int(status_due_date.timestamp()),
                "updated_Timestamp": int(updated_at.timestamp()),
                "days_to_decision": days_to_decision,
                "has_phone_number": 1 if item.phoneNumber else 0,
                "has_applied_before": 1 if item.hasAppliedBefore else 0,
                "has_email": 1 if item.email else 0
            }
            processed_list.append(ProcessedApplicantData(**processed))

        return processed_list

    def preprocess_input(self, input_data: List[ProcessedApplicantData]) -> pd.DataFrame:
        data_dicts = [item.dict() for item in input_data]
        return pd.DataFrame(data_dicts)[self.feature_order]

    def predict_from_raw(self, raw_data: List[RawApplicantData]) -> List[PredictionResult]:
        processed_data = self._preprocess_raw_data(raw_data)
        return self._make_predictions(processed_data)

    def _make_predictions(self, processed_data: List[ProcessedApplicantData]) -> List[PredictionResult]:
        if not self.model:
            raise RuntimeError("Model not loaded")

        input_df = self.preprocess_input(processed_data)
        predictions = self.model.predict(input_df)

        if not hasattr(self.model, 'predict_proba'):
            raise RuntimeError(
                "Model does not support probability predictions")

        probabilities = self.model.predict_proba(input_df)

        return [
            PredictionResult(
                predicted_stage=CLASS_LABELS[np.argmax(prob)],
                probability=round(float(np.max(prob)) * 100, 2)
            )
            for prob in probabilities
        ]

import pandas as pd
import pickle
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional, Union
from pydantic import BaseModel, Field
import re
import json
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Define class labels for fail stages
FAIL_STAGE_LABELS = {
    'CV Review': 1,
    '1st interview': 2,
    'Technical interview': 3,
    'Contract terms interview': 4,
    'Online Exam': 5,
    'Hired': 0
}

# Reverse mapping for prediction output
STAGE_LABELS_REVERSE = {v: k for k, v in FAIL_STAGE_LABELS.items()}


class RawCandidateData(BaseModel):
    date: str = Field(..., description="Application date in YYYY-MM-DD format")
    highestDegree: str = Field(..., description="Highest education level",
                               alias="highestDegree")
    statusDueDate: str = Field(
        ..., description="Status due date in YYYY-MM-DD format", alias="statusDueDate")
    seniorityLevel: Optional[str] = Field("Mid", description="Seniority level (defaults to Mid if missing)",
                                          alias="seniorityLevel")
    totalYearsInTech: str = Field(
        ..., description="Total years in tech field", alias="totalYearsInTech")
    Job_1_Duration: Optional[str] = Field(
        "0", description="Duration of job 1 (defaults to 0 if missing)")
    Job_2_Duration: Optional[str] = Field(
        "0", description="Duration of job 2 (defaults to 0 if missing)")
    Job_3_Duration: Optional[str] = Field(
        "0", description="Duration of job 3 (defaults to 0 if missing)")
    source: str = Field(..., description="Source of the application")
    position: str = Field(..., description="Position applying to")

    class Config:
        # Pydantic V2 uses `validate_by_name` instead of `allow_population_by_field_name`
        validate_by_name = True


class ProcessedCandidateData(BaseModel):
    days_since_application: int
    days_to_status_due: int
    education_encoded: int
    seniority_level: int
    experience_years: float
    job_stability: float
    source_encoded: int
    position_encoded: int


class PredictionResult(BaseModel):
    predicted_stage: str
    probability: float = Field(..., ge=0, le=100,
                               description="Prediction probability percentage")
    confidence: str = Field(...,
                            description="Confidence level (Low/Medium/High)")
    warning: Optional[str] = Field(
        None, description="Any warnings about the input data")


class DropoffPredictor:
    def __init__(self, model_path: str = 'dropoff_final/best_dropoff_model.pkl',
                 scaler_path: str = 'dropoff_final/dropoff_feature_scaler.pkl'):
        self.model = self._load_model(model_path)
        self.scaler = self._load_scaler(scaler_path)

        # Define mappings
        self.education_mapping = {
            'Unknown': 0, 'HND': 1, 'Bachelor': 2,
            'Master': 3, 'PhD': 4
        }

        self.seniority_mapping = {
            'Junior': 1, 'Mid': 2, 'Senior': 3, 'Lead': 4
        }

        self.source_mapping = {
            'Adjoa': 0, 'Aldelia': 1, 'Bernard': 2, 'Career Compass': 3,
            'Codeln': 4, 'Flyers': 5, 'Ghana Tech Job': 6,
            'Ghana Tech Jobs': 7, 'HR HUB': 8, 'Internal': 9,
            'Jobmannor': 10, 'Kingdom': 11, 'Nimo': 12, 'Pearl': 13,
            'Quality Services': 14, 'Roni': 15, 'Slack': 16,
            'Vacancies Limited': 17, 'Website': 18, 'WhyteCleon': 19,
            'Winifred': 20
        }

        self.position_mapping = {
            'AI': 0, 'Admin': 1, 'C#': 2, 'Data Analytics': 3,
            'DevOps': 4, 'FullStack': 5, 'IT Support': 6, 'Marketing': 7,
            'Mobile Developer': 8, 'PM': 9, 'Python': 10, 'QA': 11,
            'UI/UX': 12, 'Unknown': 13, 'Untitled': 14, 'WordPress': 15
        }

        # Corrected feature order with proper comma placement
        self.feature_order = [
            'experience_years', 'education_encoded', 'seniority_level',
            'job_stability', 'days_since_application', 'days_to_status_due',
            'position_encoded', 'source_encoded'
        ]

    def _load_model(self, model_path: str):
        try:
            with open(model_path, 'rb') as file:
                model = pickle.load(file)
                if not hasattr(model, 'predict'):
                    raise ValueError(
                        "Model object doesn't have predict method")
                return model
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {str(e)}")

    def _load_scaler(self, scaler_path: str):
        try:
            with open(scaler_path, 'rb') as file:
                scaler = pickle.load(file)
                if not hasattr(scaler, 'transform'):
                    raise ValueError(
                        "Scaler object doesn't have transform method")
                return scaler
        except Exception as e:
            print(
                f"Warning: Could not load scaler - using unscaled features: {str(e)}")
            return None

    def _convert_job_duration(self, duration: str) -> float:
        """Convert job duration string to years"""
        if pd.isna(duration) or duration in ['Unknown', ' ', '']:
            return 0.0

        try:
            return float(duration)
        except ValueError:
            pass

        years = 0.0
        months = 0.0

        year_match = re.search(r'(\d+)\s*year', duration, re.IGNORECASE)
        if year_match:
            years = float(year_match.group(1))

        month_match = re.search(r'(\d+)\s*month', duration, re.IGNORECASE)
        if month_match:
            months = float(month_match.group(1))

        return years + (months / 12)

    def _preprocess_raw_data(self, raw_data: List[RawCandidateData]) -> List[ProcessedCandidateData]:
        processed_list = []

        for item in raw_data:
            warnings = []

            # Date handling
            try:
                app_date = datetime.strptime(item.date, "%Y-%m-%d")
                status_due_date = datetime.strptime(
                    item.statusDueDate, "%Y-%m-%d")
                current_date = datetime.now()

                days_since_application = (current_date - app_date).days
                days_to_status_due = (status_due_date - app_date).days
            except ValueError as e:
                raise ValueError(f"Invalid date format: {str(e)}")

            # Education processing
            education = item.highestDegree.strip() if item.highestDegree else 'Unknown'
            education_encoded = self.education_mapping.get(education, 0)
            if education_encoded == 0 and education != 'Unknown':
                warnings.append(f"Unknown education level: {education}")

            # Seniority processing - default to 'Mid' if not provided
            seniority = item.seniorityLevel.strip() if item.seniorityLevel else 'Mid'
            seniority_level = self.seniority_mapping.get(
                seniority, 2)  # 2 is 'Mid'
            if seniority_level == 0 and seniority != 'Unknown':
                warnings.append(f"Unknown seniority level: {seniority}")

            # Position processing
            position = item.position.strip() if item.position else 'Unknown'
            position_encoded = self.position_mapping.get(
                position, 13)  # 13 is 'Unknown'
            if position_encoded == 13 and position != 'Unknown':
                warnings.append(f"Unknown position: {position}")

            # Experience years processing
            try:
                # First try direct conversion
                experience_years = float(item.totalYearsInTech)
            except ValueError:
                # Handle mixed formats
                experience_years = float(''.join(filter(lambda x: x.isdigit() or x == '.',
                                                        str(item.totalYearsInTech))) or 0.0)
            except:
                experience_years = 0.0
                warnings.append("Could not parse years of experience")

            # Job stability calculation - use defaults if missing
            job1 = self._convert_job_duration(item.Job_1_Duration)
            job2 = self._convert_job_duration(item.Job_2_Duration)
            job3 = self._convert_job_duration(item.Job_3_Duration)
            job_stability = job1 + job2 + job3

            # Source processing
            source = item.source.strip() if item.source else 'Unknown'
            source_encoded = self.source_mapping.get(
                source, 21)  # 21 as 'Other'
            if source_encoded == 21:
                warnings.append(f"Unknown source: {source}")

            processed = ProcessedCandidateData(
                days_since_application=days_since_application,
                days_to_status_due=days_to_status_due,
                education_encoded=education_encoded,
                seniority_level=seniority_level,
                experience_years=experience_years,
                job_stability=job_stability,
                source_encoded=source_encoded,
                position_encoded=position_encoded
            )

            processed_list.append(processed)

        return processed_list

    def predict_from_raw(self, raw_data: List[RawCandidateData]) -> List[PredictionResult]:
        processed_data = self._preprocess_raw_data(raw_data)
        return self._make_predictions(processed_data)

    def _make_predictions(self, processed_data: List[ProcessedCandidateData]) -> List[PredictionResult]:
        if not self.model:
            raise RuntimeError("Model not loaded")

        # Convert to DataFrame
        data_dicts = [item.dict() for item in processed_data]
        input_df = pd.DataFrame(data_dicts)[self.feature_order]

        # Feature scaling
        if self.scaler:
            try:
                input_df = pd.DataFrame(self.scaler.transform(input_df),
                                        columns=input_df.columns)
            except Exception as e:
                print(
                    f"Warning: Scaling failed - using unscaled features: {str(e)}")

        # Get predictions and probabilities
        predictions = self.model.predict(input_df)
        probabilities = self.model.predict_proba(input_df) if hasattr(
            self.model, 'predict_proba') else None

        results = []
        for i, pred in enumerate(predictions):
            if probabilities is not None:
                max_prob = np.max(probabilities[i])
                prob_percent = round(max_prob * 100, 2)
            else:
                max_prob = 1.0
                prob_percent = 100.0

            confidence = "High" if max_prob > 0.75 else "Medium" if max_prob > 0.5 else "Low"

            results.append(PredictionResult(
                predicted_stage=STAGE_LABELS_REVERSE.get(pred, "Unknown"),
                probability=prob_percent,
                confidence=confidence,
            ))

        return results

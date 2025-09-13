import pandas as pd
import pickle
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Union
from pydantic import BaseModel, Field, validator, ValidationError
import re
import logging

logger = logging.getLogger(__name__)

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
    date: Optional[str] = Field(None, description="Application date in YYYY-MM-DD format")
    highestDegree: Optional[str] = Field(None, description="Highest education level")
    statusDueDate: Optional[str] = Field(None, description="Status due date in YYYY-MM-DD format")
    seniorityLevel: Optional[str] = Field("Mid", description="Seniority level (defaults to Mid if missing)")
    totalYearsInTech: Optional[str] = Field(None, description="Total years in tech field")
    Job_1_Duration: Optional[str] = Field("0", description="Duration of job 1 (defaults to 0 if missing)")
    Job_2_Duration: Optional[str] = Field("0", description="Duration of job 2 (defaults to 0 if missing)")
    Job_3_Duration: Optional[str] = Field("0", description="Duration of job 3 (defaults to 0 if missing)")
    source: Optional[str] = Field(None, description="Source of the application")
    position: Optional[str] = Field(None, description="Position applying to")

    @validator('date', pre=True)
    def validate_date_format(cls, v):
        # Handle None/empty values by providing a default date
        if v is None or v == "":
            # Default to today for application date
            return datetime.now().strftime("%Y-%m-%d")
        
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            # If invalid date, return today's date
            logger.warning(f"Invalid date format. Expected YYYY-MM-DD, got {v}. Using default date.")
            return datetime.now().strftime("%Y-%m-%d")

    @validator('statusDueDate', pre=True)
    def validate_status_date_format(cls, v):
        # Handle None/empty values by providing a default date
        if v is None or v == "":
            # Will be set properly by set_status_due_date validator later
            return None
        
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            # If invalid date, return None and let set_status_due_date handle it
            logger.warning(f"Invalid date format. Expected YYYY-MM-DD, got {v}. Using default date.")
            return None

    @validator('totalYearsInTech', pre=True)
    def validate_experience(cls, v):
        # Default to "1" for experience if not provided
        if v is None or v == "":
            return "1"
        
        try:
            # Try to extract numeric value from string if needed
            numeric_value = float(
                ''.join(filter(lambda x: x.isdigit() or x == '.', str(v))))
            if numeric_value < 0:
                logger.warning("Negative experience value provided. Using default of 1.")
                return "1"
            return str(numeric_value)
        except:
            logger.warning(f"Invalid value for totalYearsInTech: {v}. Using default of 1.")
            return "1"

    @validator('highestDegree', pre=True)
    def validate_education(cls, v):
        # Default to "Bachelor" if not provided
        return v if v is not None and v != "" else "Bachelor"

    @validator('source', pre=True)
    def validate_source(cls, v):
        # Default to "Website" if not provided
        return v if v is not None and v != "" else "Website"

    @validator('position', pre=True)
    def validate_position(cls, v):
        # Default to "Unknown" if not provided
        return v if v is not None and v != "" else "Unknown"

    @validator('statusDueDate', pre=True, always=True)
    def set_status_due_date(cls, v, values):
        # If status due date is missing but application date exists, set it to app_date + 30 days
        if (v is None or v == "") and 'date' in values and values['date']:
            try:
                app_date = datetime.strptime(values['date'], "%Y-%m-%d")
                due_date = app_date + timedelta(days=30)
                return due_date.strftime("%Y-%m-%d")
            except:
                # If there's any issue, use today + 30 days
                due_date = datetime.now() + timedelta(days=30)
                return due_date.strftime("%Y-%m-%d")
        return v
    
    class Config:
        validate_assignment = True
        json_encoders = {
            datetime: lambda v: v.strftime("%Y-%m-%d")
        }


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
    confidence: float = Field(...,
                            description="Confidence level")
    warning: Optional[str] = Field(None, description="Any warnings about the input data")


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
            'Winifred': 20, 'Other': 21
        }

        self.position_mapping = {
            'AI': 0, 'Admin': 1, 'C#': 2, 'Data Analytics': 3,
            'DevOps': 4, 'FullStack': 5, 'IT Support': 6, 'Marketing': 7,
            'Mobile Developer': 8, 'PM': 9, 'Python': 10, 'QA': 11,
            'UI/UX': 12, 'Unknown': 13, 'Untitled': 14, 'WordPress': 15
        }

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
            logger.warning(f"Could not load scaler - using unscaled features: {str(e)}")
            return None

    def _convert_job_duration(self, duration: str) -> float:
        """Convert job duration string to years"""
        if pd.isna(duration) or duration in ['Unknown', ' ', ''] or duration is None:
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
        warnings_list = []

        for item in raw_data:
            warnings = []

            # Track which fields had default values applied
            default_fields = []

            # Check for defaults applied in each field
            if not item.date or item.date == datetime.now().strftime("%Y-%m-%d"):
                default_fields.append("date")
            if not item.highestDegree or item.highestDegree == "Bachelor":
                default_fields.append("highestDegree")
            if not item.source or item.source == "Website":
                default_fields.append("source")
            if not item.position or item.position == "Unknown":
                default_fields.append("position")
            if not item.totalYearsInTech or item.totalYearsInTech == "1":
                default_fields.append("totalYearsInTech")

            # Date handling - with defaults if needed
            try:
                # Apply defaults for missing values
                if not item.date:
                    item.date = datetime.now().strftime("%Y-%m-%d")
                    warnings.append("Missing application date, using today's date")
                
                if not item.statusDueDate:
                    app_date = datetime.strptime(item.date, "%Y-%m-%d")
                    item.statusDueDate = (app_date + timedelta(days=30)).strftime("%Y-%m-%d")
                    warnings.append("Missing status due date, using application date + 30 days")
                    default_fields.append("statusDueDate")
                    
                app_date = datetime.strptime(item.date, "%Y-%m-%d")
                status_due_date = datetime.strptime(item.statusDueDate, "%Y-%m-%d")
                current_date = datetime.now()

                days_since_application = (current_date - app_date).days
                days_to_status_due = (status_due_date - app_date).days
            except ValueError as e:
                # If any date parsing fails, use defaults
                logger.warning(f"Date parsing error: {str(e)}. Using default dates.")
                current_date = datetime.now()
                app_date = current_date
                status_due_date = current_date + timedelta(days=30)
                
                days_since_application = 0
                days_to_status_due = 30
                warnings.append("Date parsing error, using default values")
                default_fields.extend(["date", "statusDueDate"])

            # Education processing - with default
            if not item.highestDegree:
                item.highestDegree = "Bachelor"
                warnings.append("Missing education level, using 'Bachelor'")
                
            education = item.highestDegree.strip() if item.highestDegree else 'Bachelor'
            education_encoded = self.education_mapping.get(education, 2)  # Default to Bachelor (2)
            if education_encoded == 0 and education != 'Unknown':
                warnings.append(f"Unknown education level: {education}, using default")

            # Seniority processing - with default
            if not item.seniorityLevel:
                item.seniorityLevel = "Mid"
                warnings.append("Missing seniority level, using 'Mid'")
                default_fields.append("seniorityLevel")
                
            seniority = item.seniorityLevel.strip() if item.seniorityLevel else 'Mid'
            seniority_level = self.seniority_mapping.get(seniority, 2)  # Default to Mid (2)
            if seniority_level == 0 and seniority != 'Unknown':
                warnings.append(f"Unknown seniority level: {seniority}, using default")

            # Position processing - with default
            if not item.position:
                item.position = "Unknown"
                warnings.append("Missing position, using 'Unknown'")
                
            position = item.position.strip() if item.position else 'Unknown'
            position_encoded = self.position_mapping.get(position, 13)  # Default to Unknown (13)
            if position_encoded == 13 and position != 'Unknown':
                warnings.append(f"Unknown position: {position}, using default")

            # Experience years processing - with default
            if not item.totalYearsInTech:
                item.totalYearsInTech = "1"
                warnings.append("Missing experience years, using '1'")
                
            try:
                # First try direct conversion
                experience_years = float(item.totalYearsInTech)
            except (ValueError, TypeError):
                # Handle mixed formats
                try:
                    experience_years = float(''.join(filter(lambda x: x.isdigit() or x == '.',
                                                          str(item.totalYearsInTech))) or 1.0)
                except:
                    experience_years = 1.0
                    warnings.append("Could not parse years of experience, using default value")
                    default_fields.append("totalYearsInTech")

            # Job stability calculation - use defaults if missing
            if not item.Job_1_Duration or item.Job_1_Duration == "0":
                default_fields.append("Job_1_Duration")
            if not item.Job_2_Duration or item.Job_2_Duration == "0":
                default_fields.append("Job_2_Duration")
            if not item.Job_3_Duration or item.Job_3_Duration == "0":
                default_fields.append("Job_3_Duration")
                
            job1 = self._convert_job_duration(item.Job_1_Duration)
            job2 = self._convert_job_duration(item.Job_2_Duration)
            job3 = self._convert_job_duration(item.Job_3_Duration)
            job_stability = job1 + job2 + job3

            # Source processing - with default
            if not item.source:
                item.source = "Website"
                warnings.append("Missing source, using 'Website'")
                
            source = item.source.strip() if item.source else 'Website'
            source_encoded = self.source_mapping.get(source, 18)  # Default to Website (18)
            if source_encoded == 21:
                warnings.append(f"Unknown source: {source}, using 'Other'")

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

            # Create a summary warning if defaults were used
            if default_fields:
                fields_str = ", ".join(default_fields)
                default_warning = f"Default values used for: {fields_str}"
                warnings_list.append(default_warning)
            else:
                warnings_list.append(None)  # No defaults used

            processed_list.append(processed)

        return processed_list, warnings_list

    def predict_from_raw(self, raw_data: List[RawCandidateData]) -> List[PredictionResult]:
        try:
            # Handle empty list case
            if not raw_data:
                logger.warning("Empty applicant data received, creating default applicant")
                # Create a default applicant if none provided
                default_applicant = RawCandidateData(
                    date=datetime.now().strftime("%Y-%m-%d"),
                    highestDegree="Bachelor",
                    statusDueDate=(datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                    seniorityLevel="Mid",
                    totalYearsInTech="1",
                    Job_1_Duration="0",
                    Job_2_Duration="0",
                    Job_3_Duration="0",
                    source="Website",
                    position="Unknown"
                )
                raw_data = [default_applicant]
                
            processed_data, default_warnings = self._preprocess_raw_data(raw_data)
            results = self._make_predictions(processed_data)
            
            # Add default warnings to results
            for i, result in enumerate(results):
                if i < len(default_warnings) and default_warnings[i]:
                    result.warning = default_warnings[i]
                    
            return results
        except ValidationError as e:
            errors = []
            for error in e.errors():
                field = ".".join(str(loc) for loc in error['loc'])
                msg = error['msg']
                errors.append(f"{field}: {msg}")
            logger.error(f"Validation errors: {'; '.join(errors)}")
            
            # Create a fallback prediction with warning
            return [PredictionResult(
                predicted_stage="CV Review",
                probability=50.0,
                confidence= 0.5,
                warning=f"Validation errors: {'; '.join(errors)}; Using fallback prediction"
            )]
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            
            # Create a fallback prediction with warning
            return [PredictionResult(
                predicted_stage="CV Review",
                probability=50.0,
                confidence=0.5,
                warning=f"Prediction error: {str(e)}; Using fallback prediction"
            )]

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
                logger.warning(f"Scaling failed - using unscaled features: {str(e)}")

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

            confidence = max_prob

            results.append(PredictionResult(
                predicted_stage=STAGE_LABELS_REVERSE.get(pred, "Unknown"),
                probability=prob_percent,
                confidence=confidence,
                warning=None  # Will be set later if defaults were used
            ))

        return results
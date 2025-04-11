from fastapi import APIRouter, HTTPException, Request, Body
from pydantic import ValidationError
import pandas as pd
from models.profile import JobRequest
from models.nsp import NSPDataDirectInput
from config.settings import api_key
from utils.profiles import format_profile
from smart_match.predict import match_jobs_to_applicant, df
from nsp_retention.nsp_analyzer import NSPAnalyzer, generate_recommendations, generate_report
from nsp_retention.nsp_models import ReportResponse
from dropoff_final.predict import DropoffPredictor, RawCandidateData, PredictionResult
from typing import List, Dict, Any, Union, Optional
from pydantic import BaseModel, Field
import os
import logging

router = APIRouter(tags=["Recruitment"])
logger = logging.getLogger(__name__)

class DropoffRequest(BaseModel):
    applicants: List[RawCandidateData]

# Field descriptions instead of required fields
FIELD_DESCRIPTIONS = {
    "date": "Application date in YYYY-MM-DD format (default: today)",
    "highestDegree": "Highest education level (default: Bachelor)",
    "statusDueDate": "Status due date in YYYY-MM-DD format (default: date + 30 days)",
    "seniorityLevel": "Seniority level (default: Mid)",
    "totalYearsInTech": "Total years in tech field (default: 1)",
    "Job_1_Duration": "Duration of job 1 (default: 0)",
    "Job_2_Duration": "Duration of job 2 (default: 0)",
    "Job_3_Duration": "Duration of job 3 (default: 0)",
    "source": "Source of the application (default: Website)",
    "position": "Position applying to (default: Unknown)"
}

# For Swagger UI documentation
class ApplicantInput(BaseModel):
    date: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["date"], example="2023-01-15")
    highestDegree: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["highestDegree"], example="Bachelor")
    statusDueDate: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["statusDueDate"], example="2023-02-15")
    seniorityLevel: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["seniorityLevel"], example="Mid")
    totalYearsInTech: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["totalYearsInTech"], example="3")
    Job_1_Duration: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["Job_1_Duration"], example="2")
    Job_2_Duration: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["Job_2_Duration"], example="1")
    Job_3_Duration: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["Job_3_Duration"], example="0")
    source: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["source"], example="Website")
    position: Optional[str] = Field(None, description=FIELD_DESCRIPTIONS["position"], example="Python")

    class Config:
        schema_extra = {
            "example": {
                "date": "2023-01-15",
                "highestDegree": "Bachelor",
                "statusDueDate": "2023-02-15",
                "seniorityLevel": "Mid",
                "totalYearsInTech": "3",
                "Job_1_Duration": "2",
                "Job_2_Duration": "1",
                "Job_3_Duration": "0",
                "source": "Website",
                "position": "Python"
            }
        }

# Initialize the updated dropoff predictor.
try:
    # Adjust the path if necessary.
    predictor = DropoffPredictor(os.path.join('dropoff_final', 'best_dropoff_model.pkl'))
except Exception as e:
    logger.error(f"Failed to initialize predictor: {str(e)}")
    raise RuntimeError(f"Failed to initialize predictor: {str(e)}")

@router.post("/predict-match")
def match_job_endpoint(request: JobRequest):
    try:
        # Get formatted profile with fallback for missing values
        profile_str = format_profile(request.profile)

        # Ensure we have at least some basic data to work with
        if not any([request.profile.technicalSkills,
                   request.profile.programmingLanguages,
                   request.profile.toolsAndTechnologies]):
            raise HTTPException(
                status_code=400,
                detail="At least one of technicalSkills, programmingLanguages, or toolsAndTechnologies must be provided"
            )

        return match_jobs_to_applicant(
            profile_str,
            request.applied_position,
            df
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report", response_model=ReportResponse)
async def generate_report_endpoint(input_data: NSPDataDirectInput):
    try:
        analyzer = NSPAnalyzer(pd.DataFrame(input_data.records))
        subject_outcomes = analyzer.analyze_hiring_success()
        recommendations = generate_recommendations(subject_outcomes, api_key)
        report_markdown = generate_report(subject_outcomes, recommendations)
        return ReportResponse(report_markdown=report_markdown, report_html=report_markdown)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/predict-dropoff", 
    response_model=List[PredictionResult],
    description="Predict dropout stage for applicants. Accepts either a single applicant object or an array of applicant objects. All fields are optional with reasonable defaults.",
    responses={
        200: {
            "description": "Successful prediction",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "predicted_stage": "Hired",
                            "probability": 85.3,
                            "confidence": "High",
                            "warning": "Used default values for missing data"
                        }
                    ]
                }
            }
        }
    }
)
async def predict_dropoff_endpoint(
    applicant: Union[ApplicantInput, List[ApplicantInput]] = Body(
        ...,
        examples={
            "single": {
                "summary": "Single Applicant",
                "description": "Example of a single applicant input",
                "value": {
                    "date": "2023-01-15",
                    "highestDegree": "Bachelor",
                    "statusDueDate": "2023-02-15",
                    "seniorityLevel": "Mid",
                    "totalYearsInTech": "3",
                    "Job_1_Duration": "2",
                    "Job_2_Duration": "1",
                    "Job_3_Duration": "0",
                    "source": "Website",
                    "position": "Python"
                }
            },
            "multiple": {
                "summary": "Multiple Applicants",
                "description": "Example of multiple applicants input",
                "value": [
                    {
                        "date": "2023-01-15",
                        "highestDegree": "Bachelor",
                        "statusDueDate": "2023-02-15",
                        "seniorityLevel": "Mid",
                        "totalYearsInTech": "3"
                    },
                    {
                        "highestDegree": "Master",
                        "totalYearsInTech": "5",
                        "source": "Jobmannor",
                        "position": "DevOps"
                    }
                ]
            },
            "minimal": {
                "summary": "Minimal Input",
                "description": "Example with minimal input (all defaults)",
                "value": {
                    "totalYearsInTech": "2"
                }
            },
            "empty": {
                "summary": "Empty Object",
                "description": "Example with empty object (all defaults)",
                "value": {}
            }
        }
    )
):
    try:
        # Convert Pydantic model to dict or list of dicts
        if isinstance(applicant, list):
            data = [item.dict(exclude_none=True) for item in applicant]
        else:
            data = applicant.dict(exclude_none=True)
        
        # Convert to list if single object
        raw_data = data if isinstance(data, list) else [data]
        
        # Create RawCandidateData objects with all the defaults
        candidates = []
        for item in raw_data:
            # Create RawCandidateData object which will apply all the default values
            candidate = RawCandidateData(**item)
            candidates.append(candidate)
            
        # Get predictions with defaults for any missing data
        predictions = predictor.predict_from_raw(candidates)
        return predictions

    except Exception as e:
        logger.error(f"Error in predict_dropoff_endpoint: {str(e)}", exc_info=True)
        # Instead of failing, return a default prediction with warning
        return [PredictionResult(
            predicted_stage="CV Review",
            probability=50.0,
            confidence="Low",
            warning=f"Error processing request: {str(e)}; Using default prediction"
        )]

# Keeping the original endpoint signature but updating implementation
@router.post("/predict-dropoff-original", response_model=List[PredictionResult])
def predict_dropoff_original_endpoint(request: DropoffRequest):
    try:
        candidates = []
        
        # Simply pass all applicants directly to the predictor
        # The predictor will handle all missing values and defaults
        for applicant_data in request.applicants:
            candidates.append(applicant_data)
        
        # Get predictions with defaults for any missing data
        predictions = predictor.predict_from_raw(candidates)
        return predictions
    except Exception as e:
        logger.error(f"Error in predict_dropoff_original_endpoint: {str(e)}", exc_info=True)
        # Instead of failing, return a default prediction with warning
        return [PredictionResult(
            predicted_stage="CV Review",
            probability=50.0,
            confidence="Low",
            warning=f"Error processing request: {str(e)}; Using default prediction"
        )]
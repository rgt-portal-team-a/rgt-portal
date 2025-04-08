from fastapi import APIRouter, HTTPException
import pandas as pd
from models.profile import JobRequest
from models.nsp import NSPDataDirectInput
from utils.profiles import format_profile
from smart_match.predict import match_jobs_to_applicant, df
from nsp_retention.nsp_analyzer import NSPAnalyzer, generate_recommendations, generate_report
from nsp_retention.nsp_models import ReportResponse
from config.settings import api_key
from dropoff_final.predict import DropoffPredictor, RawCandidateData, PredictionResult
from monitoring.metrics import metrics_collector
from typing import List
import os
import logging
import time
import datetime

router = APIRouter(tags=["Recruitment"])
logger = logging.getLogger(__name__)

# Initialize the updated dropoff predictor.
try:
    # Adjust the path if necessary.
    predictor = DropoffPredictor(os.path.join(
        'dropoff_final', 'best_dropoff_model.pkl'))
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


@router.post("/predict-dropoff", response_model=List[PredictionResult])
def predict_dropoff_endpoint(applicants: List[RawCandidateData]):
    start_time = time.time()
    try:
        # Get predictions
        predictions = predictor.predict_from_raw(applicants)
        inference_time = time.time() - start_time

         # Track endpoint metrics
        metrics_collector.track_request(
            endpoint="/predict-dropoff",
            response_time=inference_time,
            status_code=200
        )

        # Track comprehensive metrics
        metrics_collector.track_model_metrics(
            model_name="dropoff_model",
            metrics={
                "inference_time": inference_time,
                "prediction": float(predictions.prediction) if hasattr(applicants, 'prediction') else 0.0,
                "confidence": float(predictions.confidence) if hasattr(applicants, 'confidence') else 0.0,
                "actual": float(applicants.dropoff) if hasattr(applicants, 'dropoff') else None
            }
        )

        return predictions

    except Exception as e:
        # Track system errors
        metrics_collector.track_request(
            endpoint="/predict-dropoff",
            response_time=time.time() - start_time,
            status_code=500
        )
        raise HTTPException(status_code=500, detail=str(e))

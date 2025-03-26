from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
import markdown
from typing import Dict, Any, Optional
import tempfile
from pydantic import BaseModel, Field
from attrition.predictor import EmployeeData, PredictionResponse, predict_attrition
from smart_match.predict import match_jobs_to_applicant, df
from datetime import datetime
from nsp_retention.nsp_analyzer import NSPAnalyzer, NSPVisualizer, generate_recommendations, generate_report
from nsp_retention.nsp_models import (
    RecommendationRequest, RecommendationResponse, ReportResponse,
    AnalysisResponse, )

from typing import List, Any, Optional
from cv_screening.schemas import StageConfidence, ApplicantData, ApplicantPrediction
from cv_screening.model_utils import initialize_models, predict_applicant_score
from cv_screening.cv_processor import process_cv, create_cv_text

# Initialize FastAPI app
app = FastAPI(
    title="RGT API Project",
    description="AI APIs for RGT Portal",
    version="1.0.0"
)

# Set Groq API key - in production, use environment variables
GROQ_API_KEY = "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"

analysis_cache = {}
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Profile(BaseModel):
    current_title: str
    current_company: str
    total_years_in_tech: int
    highest_degree: str
    program: str
    school: str
    graduation_year: str
    technical_skills: str
    programming_languages: str
    tools_and_technologies: str
    soft_skills: str
    industries: str
    certifications: Optional[str] = None
    key_projects: str
    recent_achievements: str


class JobRequest(BaseModel):
    profile: Profile
    applied_position: str  # New field for the applied job position


class NSPDataDirectInput(BaseModel):
    """Model for direct NSP data input"""
    records: List[Dict[str, Any]] = Field(
        ...,
        description="List of NSP records with Program and Current status",
        example=[
            {"programOfStudy": "Computer Science", "currentStatus": "Hired"},
            {"programOfStudy": "Information Technology",
                "currentStatus": "Not Hired"},
            {"programOfStudy": "Computer Engineering",
                "currentStatus": "Offered Bootcamp"}
        ]
    )

# Root endpoint


@app.get("/")
def read_root():
    return {"message": "RGT API Project"}
# Health check endpoint


@app.get("/health")
def health_check():
    return {"status": "healthy",  "timestamp": datetime.now().isoformat()}
# Prediction endpoint


@app.post("/upload-cv/")
async def upload_cv(file: UploadFile = File(...)):
    """Upload and process a CV file, and return extracted information"""
    try:
        # Save the uploaded file to a temporary location
        temp_file_path = None
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Process the CV file
        cv_info = process_cv(temp_file_path)

        # Clean up the temporary file
        os.unlink(temp_file_path)

        if "error" in cv_info:
            raise HTTPException(
                status_code=400, detail=f"Error processing CV: {cv_info['error']}")

        # Return all extracted information directly
        return cv_info

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing request: {str(e)}")


@app.post("/predict-attrition", response_model=PredictionResponse)
def predict(employee: EmployeeData):
    try:
        # Get prediction
        prediction = predict_attrition(employee)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-match")
def match_job(request: JobRequest):
    try:
        # Convert the structured profile to the string format expected by the matching function
        profile_str = format_profile(request.profile)

        # Call the matching function
        best_job = match_jobs_to_applicant(
            profile_str,
            request.applied_position,
            df
        )
        return best_job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/report", response_model=ReportResponse)
async def generate_full_report(input_data: NSPDataDirectInput):
    """
    Generate a full report based on NSP data provided directly in the request.

    Accepts data in the format:
    {
        "records": [
            {"programOfStudy": "Computer Science", "currentStatus": "Hired"},
            {"programOfStudy": "Information Technology", "currentStatus": "Not Hired"},
            {"programOfStudy": "Computer Engineering", "currentStatus": "Offered Bootcamp"},
            ...
        ]
    }
    """
    try:
        # Convert input data to DataFrame
        report_df = pd.DataFrame(input_data.records)

        # Create analyzer
        analyzer = NSPAnalyzer(report_df)

        # Analyze data
        subject_outcomes = analyzer.analyze_hiring_success()

        # Generate recommendations asynchronously
        recommendations = generate_recommendations(
            subject_outcomes, GROQ_API_KEY)

        # Generate report in markdown (plain text)
        report_markdown = generate_report(subject_outcomes, recommendations)

        # Return plain text report (without converting to HTML)
        return ReportResponse(
            report_markdown=report_markdown,
            report_html=report_markdown  # or simply return the plain text in both fields
        )

    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # This will appear in your server logs
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000,)

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from dotenv import load_dotenv
import tempfile
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Optional, Any
import warnings
from sklearn.exceptions import DataConversionWarning
import json

# Import modules from your project
from attrition.predictor import EmployeeData, PredictionResponse, predict_attrition
from smart_match.predict import match_jobs_to_applicant, df
from nsp_retention.nsp_analyzer import NSPAnalyzer, generate_recommendations, generate_report
from nsp_retention.nsp_models import ReportResponse
# Updated dropoff predictor import; note that we now use RawCandidateData from our updated module.
from dropoff_final.predict import DropoffPredictor, RawCandidateData, PredictionResult
from cv_screening.cv_processor import process_cv

# Suppress sklearn warnings
warnings.filterwarnings("ignore", category=DataConversionWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# Initialize FastAPI app
app = FastAPI(
    title="RGT API Project",
    description="AI APIs for RGT Portal",
    version="1.0.0"
)

# Load environment variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models


class Profile(BaseModel):
    currentTitle: Optional[str] = "Not provided"
    currentCompany: Optional[str] = "Not provided"
    totalYearsInTech: Optional[int] = 0
    highestDegree: Optional[str] = "Not provided"
    programOfStudy: Optional[str] = "Not provided"
    university: Optional[str] = "Not provided"
    graduationYear: Optional[str] = "Not provided"
    technicalSkills: Optional[str] = ""
    programmingLanguages: Optional[str] = ""
    toolsAndTechnologies: Optional[str] = ""
    softSkills: Optional[str] = ""
    industries: Optional[str] = ""
    certifications: Optional[str] = None
    keyProjects: Optional[str] = ""
    recentAchievements: Optional[str] = ""


class JobRequest(BaseModel):
    profile: Profile
    applied_position: str


class NSPDataDirectInput(BaseModel):
    records: List[Dict[str, Any]] = Field(
        ...,
        example=[
            {"programOfStudy": "Computer Science", "currentStatus": "Hired"},
            {"programOfStudy": "Information Technology",
                "currentStatus": "Not Hired"}
        ]
    )


# Initialize the updated dropoff predictor.
try:
    # Adjust the path if necessary.
    predictor = DropoffPredictor(os.path.join(
        'dropoff_final', 'best_dropoff_model.pkl'))
except Exception as e:
    raise RuntimeError(f"Failed to initialize predictor: {str(e)}")

# Helper functions


def format_profile(profile: Profile) -> str:
    """Format profile data into a string for matching"""
    profile_str = f"""
    Current Title: {profile.currentTitle}
    Current Company: {profile.currentCompany}
    Experience: {profile.totalYearsInTech} years in tech
    Education: {profile.highestDegree} from {profile.university} ({profile.graduationYear})
    
    Technical Skills: {profile.technicalSkills}
    Programming Languages: {profile.programmingLanguages}
    Tools & Technologies: {profile.toolsAndTechnologies}
    """
    if profile.certifications:
        profile_str += f"\nCertifications: {profile.certifications}"
    return profile_str

# Endpoints


@app.get("/")
def read_root():
    return {"message": "RGT API Project"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/upload-cv/")
async def upload_cv(file: UploadFile = File(...)):
    """Process uploaded CV file"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        cv_info = process_cv(temp_file_path)
        os.unlink(temp_file_path)

        if "error" in cv_info:
            raise HTTPException(status_code=400, detail=cv_info["error"])
        return cv_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-attrition", response_model=PredictionResponse)
def predict_attrition_endpoint(employee: EmployeeData):
    try:
        return predict_attrition(employee)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-match")
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


@app.post("/report", response_model=ReportResponse)
async def generate_report_endpoint(input_data: NSPDataDirectInput):
    try:
        analyzer = NSPAnalyzer(pd.DataFrame(input_data.records))
        subject_outcomes = analyzer.analyze_hiring_success()
        recommendations = generate_recommendations(subject_outcomes, api_key)
        report_markdown = generate_report(subject_outcomes, recommendations)
        return ReportResponse(report_markdown=report_markdown, report_html=report_markdown)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-dropoff", response_model=List[PredictionResult])
async def predict_dropoff_endpoint(applicants: List[RawCandidateData]):
    try:
        predictions = predictor.predict_from_raw(applicants)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

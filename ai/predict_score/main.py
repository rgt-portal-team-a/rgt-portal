import os
import json
import pandas as pd
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uvicorn
import logging
from scoring import CandidateJobMatcher

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize the matcher
matcher = CandidateJobMatcher()

# Global variable to store jobs data
JOBS_DATA = []

# Pydantic models for request/response validation without examples


class CandidateProfile(BaseModel):
    currentTitle: str
    currentCompany: str
    totalYearsInTech: int
    highestDegree: str
    programOfStudy: str
    university: str
    graduationYear: str
    technicalSkills: str
    programmingLanguages: str
    toolsAndTechnologies: str
    softSkills: str
    industries: str
    certifications: str
    keyProjects: str
    recentAchievements: str


class CandidateRequest(BaseModel):
    profile: CandidateProfile
    applied_position: str


def load_jobs_data(file_path: str) -> List[Dict]:
    """Load jobs data from file and clean NaN values"""
    ext = os.path.splitext(file_path)[1].lower()

    try:
        data = None
        if ext == '.csv':
            df = pd.read_csv(file_path)
            data = df.to_dict('records')
        elif ext == '.json':
            with open(file_path, 'r') as f:
                data = json.load(f)
        elif ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
            data = df.to_dict('records')
        else:
            raise ValueError(f"Unsupported file format: {ext}")
        
        # Clean NaN values from the data
        return clean_nan_values(data)
    except Exception as e:
        logger.error(f"Error loading jobs data: {str(e)}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize jobs data on startup from job_descriptions.xlsx"""
    global JOBS_DATA

    # Use job_descriptions.xlsx file in the directory
    jobs_file = "job_descriptions.xlsx"

    if os.path.exists(jobs_file):
        try:
            JOBS_DATA = load_jobs_data(jobs_file)
            logger.info(f"Loaded {len(JOBS_DATA)} jobs from {jobs_file}")
        except Exception as e:
            logger.error(f"Failed to load jobs data: {str(e)}")
            logger.error(f"Error details: {str(e)}")
    else:
        logger.warning(f"Jobs data file not found: {jobs_file}")


@app.post("/api/match-applied-position", response_class=JSONResponse)
async def match_applied_position(candidate_input: CandidateRequest):
    """Match a candidate with a specific applied position using JSON input"""
    global JOBS_DATA, matcher

    if not JOBS_DATA:
        raise HTTPException(
            status_code=400, detail="No jobs data available. Check if job_descriptions.xlsx exists in the directory.")

    # Access fields correctly from the Pydantic model
    profile_data = candidate_input.profile
    applied_position = candidate_input.applied_position.lower()  # Convert to lowercase for case-insensitive matching

    # Format candidate data for the matcher as a pandas Series
    # This is important because the matcher expects a pandas Series with an index attribute
    formatted_candidate = pd.Series({
        'Technical Skills': profile_data.technicalSkills,
        'Soft Skills': profile_data.softSkills,
        'Tools & Technologies': profile_data.toolsAndTechnologies,
        'Programming Languages': profile_data.programmingLanguages,
        'Total Years in Tech': str(profile_data.totalYearsInTech),
        'Highest Degree': profile_data.highestDegree,
        'Industries': profile_data.industries,
        'Job_1_Title': profile_data.currentTitle,
        'Job_1_Company': profile_data.currentCompany,
    })

    try:
        # Determine the field name that contains job titles
        title_fields = ['title', 'Title', 'job_title', 'position', 'Position', 'job title']
        job_field_name = None
        
        if JOBS_DATA and len(JOBS_DATA) > 0:
            sample_keys = list(JOBS_DATA[0].keys())
            for field in title_fields:
                if field in sample_keys:
                    job_field_name = field
                    break
        
        if not job_field_name:
            # Log available keys to help diagnose the issue
            if JOBS_DATA and len(JOBS_DATA) > 0:
                logger.info(f"Available job fields: {list(JOBS_DATA[0].keys())}")
            raise ValueError("Could not identify job title field in the data")
        
        # Try exact match first (case-insensitive)
        job_match = next(
            (job for job in JOBS_DATA if job[job_field_name].lower() == applied_position), None)
        
        # If no exact match, try partial match
        if job_match is None:
            job_match = next(
                (job for job in JOBS_DATA if applied_position in job[job_field_name].lower()), None)
        
        # If still no match, return appropriate error
        if job_match is None:
            # For debugging: Log available job titles
            available_titles = [job[job_field_name] for job in JOBS_DATA]
            logger.info(f"Available job titles: {available_titles}")
            raise ValueError(f"No job found for position: {applied_position}")

        # Clean NaN values before processing
        clean_job_match = clean_nan_values(job_match)
        
        # Calculate match score using the matcher
        # Note: predict_match_score is the right method to call based on your CandidateJobMatcher class
        match_score = matcher.predict_match_score(formatted_candidate, clean_job_match)
        
        # Return the job with match score
        return {
            "position": applied_position,
            "match_score": round(float(match_score), 2),  # Round to 2 decimal places
        }

    except Exception as e:
        # Enhance error logging with detailed exception info
        logger.error(f"Error matching with job {applied_position}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
def clean_nan_values(obj):
    """Replace NaN values with None for JSON serialization"""
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float) and pd.isna(obj):
        return None
    else:
        return obj


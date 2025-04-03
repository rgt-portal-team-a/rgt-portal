# from fastapi import APIRouter, HTTPException
# from fastapi.responses import JSONResponse
# import pandas as pd
# import os
# import logging
# import traceback
# from models.profile import CandidateRequest
# from utils.data import clean_nan_values, load_jobs_data
# from predict_score.scoring import CandidateJobMatcher

# router = APIRouter(tags=["Candidate Scoring"])
# logger = logging.getLogger(__name__)

# # Initialize the matcher
# matcher = CandidateJobMatcher()

# # Global variable to store jobs data
# JOBS_DATA = []

# # Load jobs data on module import
# try:
#     jobs_file = "./predict_score/job_descriptions.xlsx"
#     if os.path.exists(jobs_file):
#         JOBS_DATA = load_jobs_data(jobs_file)
#         logger.info(f"Loaded {len(JOBS_DATA)} jobs from {jobs_file}")
#     else:
#         logger.warning(f"Jobs data file not found: {jobs_file}")
# except Exception as e:
#     logger.error(f"Failed to load jobs data: {str(e)}")


# @router.post("/predict-score", response_class=JSONResponse)
# async def match_applied_position(candidate_input: CandidateRequest):
#     """Match a candidate with a specific applied position using JSON input"""
#     global JOBS_DATA, matcher

#     if not JOBS_DATA:
#         raise HTTPException(
#             status_code=400, detail="No jobs data available. Check if job_descriptions.xlsx exists in the directory.")

#     # Access fields correctly from the Pydantic model
#     profile_data = candidate_input.profile
#     applied_position = candidate_input.applied_position.lower()  # Convert to lowercase for case-insensitive matching

#     # Format candidate data for the matcher as a pandas Series
#     # This is important because the matcher expects a pandas Series with an index attribute
#     formatted_candidate = pd.Series({
#         'Technical Skills': profile_data.technicalSkills,
#         'Soft Skills': profile_data.softSkills,
#         'Tools & Technologies': profile_data.toolsAndTechnologies,
#         'Programming Languages': profile_data.programmingLanguages,
#         'Total Years in Tech': str(profile_data.totalYearsInTech),
#         'Highest Degree': profile_data.highestDegree,
#         'Industries': profile_data.industries,
#         'Job_1_Title': profile_data.currentTitle,
#         'Job_1_Company': profile_data.currentCompany,
#     })

#     try:
#         # Determine the field name that contains job titles
#         title_fields = ['title', 'Title', 'job_title', 'position', 'Position', 'job title']
#         job_field_name = None
        
#         if JOBS_DATA and len(JOBS_DATA) > 0:
#             sample_keys = list(JOBS_DATA[0].keys())
#             for field in title_fields:
#                 if field in sample_keys:
#                     job_field_name = field
#                     break
        
#         if not job_field_name:
#             # Log available keys to help diagnose the issue
#             if JOBS_DATA and len(JOBS_DATA) > 0:
#                 logger.info(f"Available job fields: {list(JOBS_DATA[0].keys())}")
#             raise ValueError("Could not identify job title field in the data")
        
#         # Try exact match first (case-insensitive)
#         job_match = next(
#             (job for job in JOBS_DATA if job[job_field_name].lower() == applied_position), None)
        
#         # If no exact match, try partial match
#         if job_match is None:
#             job_match = next(
#                 (job for job in JOBS_DATA if applied_position in job[job_field_name].lower()), None)
        
#         # If still no match, return appropriate error
#         if job_match is None:
#             # For debugging: Log available job titles
#             available_titles = [job[job_field_name] for job in JOBS_DATA]
#             logger.info(f"Available job titles: {available_titles}")
#             raise ValueError(f"No job found for position: {applied_position}")

#         # Clean NaN values before processing
#         clean_job_match = clean_nan_values(job_match)
        
#         # Calculate match score using the matcher
#         match_score = matcher.predict_match_score(formatted_candidate, clean_job_match)
        
#         # Return the job with match score
#         return {
#             "position": applied_position,
#             "match_score": round(float(match_score), 2),  # Round to 2 decimal places
#         }

#     except Exception as e:
#         # Enhance error logging with detailed exception info
#         logger.error(f"Error matching with job {applied_position}: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=str(e))


from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import os
import logging
import traceback
import re
from models.profile import CandidateRequest
from utils.data import clean_nan_values, load_jobs_data
from predict_score.scoring import CandidateJobMatcher

router = APIRouter(tags=["Candidate Scoring"])
logger = logging.getLogger(__name__)

# Initialize the matcher
matcher = CandidateJobMatcher()

# Global variable to store jobs data
JOBS_DATA = []

# Define job title mappings for better matching
JOB_TITLE_MAPPINGS = {
    "ui/ux": ["ui/ux designer", "ux designer", "ui designer", "ux/ui", "ui/ux"],
    "fullstack": ["react/nodejs", "fullstack", "full stack", "react", "nodejs", "react + node"],
    "data analytics": ["data analytics", "data analyst", "data science", "analytics"],
    "ai/llm": ["ai llm", "ai/llm", "ai/llm engineer", "llm", "ai engineer", "machine learning", "ml engineer"],
    "pm": ["project manager", "product manager", "operations manager", "pm", "project management"],
    "qa": ["qa", "quality assurance", "tester", "test engineer"],
    "devops": ["devops", "devops engineer", "site reliability", "sre", "infrastructure"],
    "blockchain": ["blockchain", "blockchain developer", "web3", "smart contract"],
    "mobile development": ["mobile developer", "android", "ios", "react native", "flutter", "mobile"],
    "it support": ["it support", "technical support", "help desk", "support engineer"],
    "social media marketing": ["social media", "marketing", "social media marketing", "digital marketing"]
}

# Load jobs data on module import
try:
    jobs_file = "./predict_score/job_descriptions.xlsx"
    if os.path.exists(jobs_file):
        JOBS_DATA = load_jobs_data(jobs_file)
        logger.info(f"Loaded {len(JOBS_DATA)} jobs from {jobs_file}")
    else:
        logger.warning(f"Jobs data file not found: {jobs_file}")
except Exception as e:
    logger.error(f"Failed to load jobs data: {str(e)}")


def find_matching_job(applied_position, job_field_name, jobs_data):
    """
    Find a matching job using more flexible matching criteria including category matching.
    
    Args:
        applied_position: The position applied for (user input)
        job_field_name: The field name in the jobs data that contains job titles
        jobs_data: List of job dictionaries
        
    Returns:
        The matched job or None if no match is found
    """
    applied_position_lower = applied_position.lower()
    
    # Try exact match first
    for job in jobs_data:
        if job[job_field_name].lower() == applied_position_lower:
            return job
            
    # Try substring match
    for job in jobs_data:
        if applied_position_lower in job[job_field_name].lower():
            return job
            
    # Try category matching
    for category, variations in JOB_TITLE_MAPPINGS.items():
        if any(variation in applied_position_lower for variation in variations):
            # Found a category match, now find a job that matches this category
            for job in jobs_data:
                job_title_lower = job[job_field_name].lower()
                if any(variation in job_title_lower for variation in variations):
                    return job
    
    # If all else fails, try generic word matching
    applied_words = set(re.findall(r'\w+', applied_position_lower))
    best_match = None
    best_match_score = 0
    
    for job in jobs_data:
        job_title_lower = job[job_field_name].lower()
        job_words = set(re.findall(r'\w+', job_title_lower))
        
        # Count common words
        common_words = applied_words.intersection(job_words)
        match_score = len(common_words)
        
        if match_score > best_match_score:
            best_match = job
            best_match_score = match_score
    
    # Return the best match if we found one with at least one common word
    if best_match_score > 0:
        return best_match
            
    return None


@router.post("/predict-score", response_class=JSONResponse)
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
        
        # Log available job titles for debugging
        available_titles = [job[job_field_name] for job in JOBS_DATA]
        logger.info(f"Available job titles: {available_titles}")
        
        # Use enhanced job matching function
        job_match = find_matching_job(applied_position, job_field_name, JOBS_DATA)
        
        # If still no match, return appropriate error
        if job_match is None:
            raise ValueError(f"No job found for position: {applied_position}. Available positions: {', '.join(available_titles)}")

        # Clean NaN values before processing
        clean_job_match = clean_nan_values(job_match)
        
        # Calculate match score using the matcher
        match_score = matcher.predict_match_score(formatted_candidate, clean_job_match)
        
        # Return the job with match score
        return {
            "position": job_match[job_field_name],  # Return the actual matched position
            "match_score": round(float(match_score), 2),  # Round to 2 decimal places
            "applied_for": applied_position  # Include what was originally applied for
        }

    except Exception as e:
        # Enhance error logging with detailed exception info
        logger.error(f"Error matching with job {applied_position}: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return a more helpful error message
        if "No job found for position" in str(e):
            # Suggest alternatives based on our mappings
            suggested_positions = []
            applied_position_lower = applied_position.lower()
            
            for category, variations in JOB_TITLE_MAPPINGS.items():
                if any(variation in applied_position_lower for variation in variations):
                    suggested_positions.append(category.upper())
            
            if suggested_positions:
                error_msg = f"No exact match found for '{applied_position}'. Try one of these instead: {', '.join(suggested_positions)}"
            else:
                error_msg = f"No match found for '{applied_position}'. Available options: UI/UX, FullStack, Data Analytics, AI/LLM, PM, QA, DevOps, Blockchain, Mobile Development"
                
            raise HTTPException(status_code=404, detail=error_msg)
        else:
            raise HTTPException(status_code=500, detail=str(e))
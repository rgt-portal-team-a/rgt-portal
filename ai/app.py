from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from dotenv import load_dotenv
import tempfile
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import warnings
from sklearn.exceptions import DataConversionWarning
import json
from fastapi.responses import JSONResponse
from datetime import datetime, date, time
from fastapi.responses import JSONResponse, Response
# Import modules from your project
from attrition.predictor import EmployeeData, PredictionResponse, predict_attrition
from smart_match.predict import match_jobs_to_applicant, df
from nsp_retention.nsp_analyzer import NSPAnalyzer, generate_recommendations, generate_report
from nsp_retention.nsp_models import ReportResponse
# Updated dropoff predictor import; note that we now use RawCandidateData from our updated module.
from dropoff_final.predict import DropoffPredictor, RawCandidateData, PredictionResult
from cv_screening.cv_processor import process_cv
from langchain_community.document_loaders import PyPDFLoader
# Suppress sklearn warnings
warnings.filterwarnings("ignore", category=DataConversionWarning)
warnings.filterwarnings("ignore", category=UserWarning)

from kairo.helper import (
    get_db_connection,
    get_db_cursor,
    natural_language_to_sql,
    system_prompt,
    groq_client
)


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
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date, time)):
            return obj.isoformat()
        return super().default(obj)

class MarkdownResponse(Response):
    media_type = "text/markdown"


class QueryReport(BaseModel):
    query: str
    summary: Dict[str, Any]
    resultCount: int


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


# @app.post("/upload-cv/")
# async def upload_cv(file: UploadFile = File(...)):
#     """Process uploaded CV file"""
#     try:
#         with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
#             content = await file.read()
#             temp_file.write(content)
#             temp_file_path = temp_file.name

#         cv_info = process_cv(temp_file_path)
#         os.unlink(temp_file_path)

#         if "error" in cv_info:
#             raise HTTPException(status_code=400, detail=cv_info["error"])
#         return cv_info
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-cv/")
async def upload_cv(file: UploadFile = File(...)):
    """
    Upload and process a CV file, and return extracted information.
    Rejects CVs that exceed the page limit.
    """
    # Define maximum page limit
    MAX_PAGES = 5  # Set your preferred page limit here
    
    temp_file_path = None
    
    try:
        # Read content
        content = await file.read()
        
        # Save the uploaded file to a temporary location
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Check page count for PDF files
        if suffix.lower() == '.pdf':
            try:
                # Use PyPDFLoader to count pages
                loader = PyPDFLoader(temp_file_path)
                documents = loader.load()
                
                # Count pages
                page_count = len(documents)
                
                if page_count > MAX_PAGES:
                    # Clean up the temporary file before returning
                    if temp_file_path:
                        os.unlink(temp_file_path)
                        temp_file_path = None
                    
                    # Return a direct response with the error
                    return JSONResponse(
                        status_code=413,  # Payload Too Large
                        content={"detail": f"CV contains {page_count} pages, which exceeds our limit of {MAX_PAGES} pages. Please reduce the length of your CV and try again."}
                    )
            except Exception as e:
                # If there's an error counting pages, log it but continue processing
                print(f"Error counting PDF pages: {str(e)}")
        
        # Process the CV file
        cv_info = process_cv(temp_file_path)

        # Return all extracted information directly
        return cv_info

    except Exception as e:
        # Return a properly formatted error
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error processing request: {str(e)}"}
        )
    
    finally:
        # Always clean up the temporary file in a finally block
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                print(f"Error removing temporary file: {str(e)}")


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
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query")
async def process_query(query: str = Form(...)):
    """
    Process a natural language query and return data in Markdown format
    
    Args:
        query: Natural language query string
        
    Returns:
        Markdown response with SQL query and data results
    """
    try:
        # Convert natural language to SQL
        sql_query = natural_language_to_sql(query)
        
        # Execute the query
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        try:
            cursor.execute(sql_query)
            data = cursor.fetchall()
        except Exception as e:
            return MarkdownResponse(content=f"""
# Error

**SQL Error:** {str(e)}

```sql
{sql_query}
```
""")
        
        # Convert data to markdown table
        markdown_content = f"""
# Query Results

## SQL Query
```sql
{sql_query}
```

## Results
"""
        
        # Only proceed if we have data
        if data and len(data) > 0:
            # Get column headers from first row
            headers = list(data[0].keys())
            
            # Create markdown table header
            markdown_content += "| " + " | ".join(headers) + " |\n"
            markdown_content += "| " + " | ".join(["---" for _ in headers]) + " |\n"
            
            # Add data rows
            for row in data:
                row_values = []
                for header in headers:
                    value = row[header]
                    # Format value based on type
                    if value is None:
                        formatted_value = "NULL"
                    elif isinstance(value, (datetime, date, time)):
                        formatted_value = value.isoformat()
                    else:
                        formatted_value = str(value).replace("|", "\\|")  # Escape pipe characters
                    row_values.append(formatted_value)
                
                markdown_content += "| " + " | ".join(row_values) + " |\n"
                
            markdown_content += f"\n*Total Results: {len(data)}*"
        else:
            markdown_content += "\n*No results found*"
        
        cursor.close()
        conn.close()
        
        return MarkdownResponse(content=markdown_content)
    
    except Exception as e:
        return MarkdownResponse(content=f"""
# Error

An error occurred while processing your query: {str(e)}
""")

@app.post("/generate_query_report")
async def generate_query_report(report_request: QueryReport):
    """
    Generate a report based on query results
    
    Args:
        report_request: QueryReport model containing query and data summary
        
    Returns:
        Markdown response with generated analysis report
    """
    try:
        # Get data from request
        user_query = report_request.query
        data_summary = report_request.summary
        result_count = report_request.resultCount
        
        # Prepare a prompt for generating a report for this specific query
        report_prompt = f"""
Generate a detailed analytical report for the following recruitment data query:

Query: "{user_query}"

Results: The query returned {result_count} records.

Data Summary:
"""
        
        # Add column information to the prompt
        column_types = data_summary.get('columnTypes', {})
        for column, type_name in column_types.items():
            report_prompt += f"- Column: {column} (Type: {type_name})\n"
            
            # Add statistical info for number columns
            if type_name == 'number':
                min_val = data_summary.get(f'{column}_min', 'N/A')
                max_val = data_summary.get(f'{column}_max', 'N/A')
                avg_val = data_summary.get(f'{column}_avg', 'N/A')
                if avg_val != 'N/A':
                    avg_val = round(avg_val, 2)
                
                report_prompt += f"  - Min: {min_val}, Max: {max_val}, Average: {avg_val}\n"
            
            # Add sample values
            samples = data_summary.get('samplesPerColumn', {}).get(column, [])
            if samples:
                samples_str = ", ".join([str(s) for s in samples[:5]])
                if len(samples) > 5:
                    samples_str += "..."
                report_prompt += f"  - Sample values: {samples_str}\n"
        
        report_prompt += """
Based on the query and data summary above, create a professional report with the following sections:

1. Executive Summary - Brief overview of the query and key findings
2. Data Analysis - Detailed analysis of the query results, including patterns and trends
3. Insights - Key insights derived from the data
4. Recommendations - Actionable recommendations based on the data
5. Next Steps - Suggested follow-up actions or additional analyses

Format the report with Markdown headings and bullet points where appropriate to ensure readability.
"""
        
        # Generate a report using Groq
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system", 
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": report_prompt,
                }
            ],
            model="gemma2-9b-it",
        )
        
        report = chat_completion.choices[0].message.content
        
        # The report is already in Markdown format from the LLM
        return MarkdownResponse(content=report)
    
    except Exception as e:
        return MarkdownResponse(content=f"""
# Error

An error occurred while generating the report: {str(e)}
""")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

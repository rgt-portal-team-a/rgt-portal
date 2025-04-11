
# from kairo.helper import (
#     get_db_connection,
#     get_db_cursor,
#     natural_language_to_sql,
#     system_prompt,
#     groq_client
# )

# import markdown
# from fastapi import FastAPI,  Query, HTTPException, UploadFile, File, Form, Request, Body
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse, Response, HTMLResponse
# from fastapi.staticfiles import StaticFiles
# from fastapi.templating import Jinja2Templates
# import pandas as pd
# import os
# from dotenv import load_dotenv
# import tempfile
# from pydantic import BaseModel, Field
# from typing import List, Dict, Optional, Any
# import warnings
# from sklearn.exceptions import DataConversionWarning
# import json
# import logging
# from datetime import datetime, date, time
# import traceback
# import uvicorn
# from enum import Enum

# import psycopg2
# import psycopg2.extras
# # Import modules from your project
# from attrition.predictor import EmployeeData, PredictionResponse, predict_attrition
# from smart_match.predict import match_jobs_to_applicant, df
# from nsp_retention.nsp_analyzer import NSPAnalyzer, generate_recommendations, generate_report
# from nsp_retention.nsp_models import ReportResponse
# from dropoff_final.predict import DropoffPredictor, RawCandidateData, PredictionResult
# from cv_screening.cv_processor import process_cv
# from predict_score.scoring import CandidateJobMatcher  # Import for candidate-job matcher
# from langchain_community.document_loaders import PyPDFLoader
# from decimal import Decimal
# # Suppress sklearn warnings
# warnings.filterwarnings("ignore", category=DataConversionWarning)
# warnings.filterwarnings("ignore", category=UserWarning)
# from  report.llm_helpers import (
#     generate_employee_insights,
#     generate_recruitment_insights
# )
# # Set up logging
# logging.basicConfig(level=logging.INFO,
#                     format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Initialize FastAPI app
# app = FastAPI(
#     title="RGT API Project",
#     description="AI APIs for RGT Portal",
#     version="1.0.0"
# )

# # Load environment variables
# load_dotenv()
# api_key = os.getenv("GROQ_API_KEY")

# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Initialize the matcher from main.py
# matcher = CandidateJobMatcher()

# # Global variable to store jobs data from main.py
# JOBS_DATA = []

# # Models

# class CustomJSONEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, (datetime, date, time)):
#             return obj.isoformat()
#         return super().default(obj)


# class QueryReport(BaseModel):
#     query: str
#     summary: Dict[str, Any]
#     resultCount: int


# class Profile(BaseModel):
#     currentTitle: Optional[str] = "Not provided"
#     currentCompany: Optional[str] = "Not provided"
#     totalYearsInTech: Optional[int] = 0
#     highestDegree: Optional[str] = "Not provided"
#     programOfStudy: Optional[str] = "Not provided"
#     university: Optional[str] = "Not provided"
#     graduationYear: Optional[str] = "Not provided"
#     technicalSkills: Optional[str] = ""
#     programmingLanguages: Optional[str] = ""
#     toolsAndTechnologies: Optional[str] = ""
#     softSkills: Optional[str] = ""
#     industries: Optional[str] = ""
#     certifications: Optional[str] = None
#     keyProjects: Optional[str] = ""
#     recentAchievements: Optional[str] = ""


# class JobRequest(BaseModel):
#     profile: Profile
#     applied_position: str


# class NSPDataDirectInput(BaseModel):
#     records: List[Dict[str, Any]] = Field(
#         ...,
#         example=[
#             {"programOfStudy": "Computer Science", "currentStatus": "Hired"},
#             {"programOfStudy": "Information Technology",
#                 "currentStatus": "Not Hired"}
#         ]
#     )


# # Models from main.py
# class CandidateProfile(BaseModel):
#     currentTitle: str
#     currentCompany: str
#     totalYearsInTech: int
#     highestDegree: str
#     programOfStudy: str
#     university: str
#     graduationYear: str
#     technicalSkills: str
#     programmingLanguages: str
#     toolsAndTechnologies: str
#     softSkills: str
#     industries: str
#     certifications: str
#     keyProjects: str
#     recentAchievements: str


# class CandidateRequest(BaseModel):
#     profile: CandidateProfile
#     applied_position: str


# # Initialize the updated dropoff predictor.
# try:
#     # Adjust the path if necessary.
#     predictor = DropoffPredictor(os.path.join(
#         'dropoff_final', 'best_dropoff_model.pkl'))
# except Exception as e:
#     raise RuntimeError(f"Failed to initialize predictor: {str(e)}")

# # Helper functions from both files

# def format_profile(profile: Profile) -> str:
#     """Format profile data into a string for matching"""
#     profile_str = f"""
#     Current Title: {profile.currentTitle}
#     Current Company: {profile.currentCompany}
#     Experience: {profile.totalYearsInTech} years in tech
#     Education: {profile.highestDegree} from {profile.university} ({profile.graduationYear})
    
#     Technical Skills: {profile.technicalSkills}
#     Programming Languages: {profile.programmingLanguages}
#     Tools & Technologies: {profile.toolsAndTechnologies}
#     """
#     if profile.certifications:
#         profile_str += f"\nCertifications: {profile.certifications}"
#     return profile_str


# def load_jobs_data(file_path: str) -> List[Dict]:
#     """Load jobs data from file and clean NaN values"""
#     ext = os.path.splitext(file_path)[1].lower()

#     try:
#         data = None
#         if ext == '.csv':
#             df = pd.read_csv(file_path)
#             data = df.to_dict('records')
#         elif ext == '.json':
#             with open(file_path, 'r') as f:
#                 data = json.load(f)
#         elif ext in ['.xlsx', '.xls']:
#             df = pd.read_excel(file_path)
#             data = df.to_dict('records')
#         else:
#             raise ValueError(f"Unsupported file format: {ext}")
        
#         # Clean NaN values from the data
#         return clean_nan_values(data)
#     except Exception as e:
#         logger.error(f"Error loading jobs data: {str(e)}")
#         raise


# def clean_nan_values(obj):
#     """Replace NaN values with None for JSON serialization"""
#     if isinstance(obj, dict):
#         return {k: clean_nan_values(v) for k, v in obj.items()}
#     elif isinstance(obj, list):
#         return [clean_nan_values(item) for item in obj]
#     elif isinstance(obj, float) and pd.isna(obj):
#         return None
#     else:
#         return obj

# # Database configuration
# DB_CONFIG = {
#     "host": os.getenv("DB_HOST", "tramway.proxy.rlwy.net"),
#     "port": int(os.getenv("DB_PORT", "55140")),
#     "user": os.getenv("DB_USERNAME", "postgres"),
#     "password": os.getenv("DB_PASSWORD", "sQBXitkORvKixULmKfAufGUKZanZTeuv"),
#     "database": os.getenv("DB_NAME", "railway")
# }
# # Custom JSON encoder for handling Decimal and datetime types
# class DecimalEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, Decimal):
#             return float(obj)  # Convert Decimal to float for JSON serialization
#         if isinstance(obj, (datetime, date)):
#             return obj.isoformat()  # Convert datetime/date objects to ISO format string
#         return super(DecimalEncoder, self).default(obj)

# # Startup event
# @app.on_event("startup")
# async def startup_event():
#     """Initialize jobs data on startup from job_descriptions.xlsx"""
#     global JOBS_DATA

#     # Use job_descriptions.xlsx file in the directory
#     jobs_file = "./predict_score/job_descriptions.xlsx"

#     if os.path.exists(jobs_file):
#         try:
#             JOBS_DATA = load_jobs_data(jobs_file)
#             logger.info(f"Loaded {len(JOBS_DATA)} jobs from {jobs_file}")
#         except Exception as e:
#             logger.error(f"Failed to load jobs data: {str(e)}")
#             logger.error(f"Error details: {str(e)}")
#     else:
#         logger.warning(f"Jobs data file not found: {jobs_file}")
        
        
# class MarkdownResponse(Response):
#     media_type = "text/markdown"



# def get_db_connection():
#     """Get a connection to the PostgreSQL database"""
#     try:
#         conn = psycopg2.connect(
#             host=DB_CONFIG["host"],
#             port=DB_CONFIG["port"],
#             user=DB_CONFIG["user"],
#             password=DB_CONFIG["password"],
#             database=DB_CONFIG["database"]
#         )
#         return conn
#     except Exception as e:
#         logger.error(f"Database connection error: {str(e)}")
#         # Log more detailed information for debugging
#         logger.error(f"DB Config: {DB_CONFIG['host']}:{DB_CONFIG['port']}, DB: {DB_CONFIG['database']}")
#         raise

# def get_db_cursor(conn):
#     """Get a cursor that returns results as dictionaries"""
#     return conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

# # Define format type enum for validation
# class FormatType(str, Enum):
#     html = "html"
#     markdown = "markdown"

# def generate_employees_report():
#     """Generate a report for employees table"""
#     try:
#         conn = get_db_connection()
#         cursor = get_db_cursor(conn)
        
#         # Get summary data
#         cursor.execute("""
#             SELECT 
#                 COUNT(*) as total_employees,
#                 COUNT(*) FILTER (WHERE "endDate" IS NULL) as active_employees,
#                 COUNT(*) FILTER (WHERE "endDate" IS NOT NULL) as former_employees,
#                 AVG(EXTRACT(EPOCH FROM (CURRENT_DATE - "hireDate")) / 86400 / 365)::numeric(10,2) as avg_tenure_years,
#                 COUNT(DISTINCT "departmentId") as departments,
#                 AVG("vacationDaysBalance")::numeric(10,2) as avg_vacation_balance
#             FROM employees
#         """)
#         summary = cursor.fetchone()
        
#         # Get employee types
#         cursor.execute("""
#             SELECT "employeeType", COUNT(*) as count
#             FROM employees
#             GROUP BY "employeeType"
#             ORDER BY count DESC
#         """)
#         employee_types = cursor.fetchall()
        
#         # Get department distribution
#         cursor.execute("""
#             SELECT 
#                 CASE 
#                     WHEN d.name IS NULL THEN 'Not Assigned' 
#                     ELSE d.name 
#                 END as department_name, 
#                 COUNT(e.*) as employee_count
#             FROM employees e
#             LEFT JOIN departments d ON e."departmentId" = d.id
#             GROUP BY department_name
#             ORDER BY employee_count DESC
#         """)
#         departments = cursor.fetchall()
        
#         # Get recent hires
#         cursor.execute("""
#             SELECT "firstName", "lastName", "position", "hireDate"
#             FROM employees
#             WHERE "endDate" IS NULL
#             ORDER BY "hireDate" DESC
#             LIMIT 5
#         """)
#         recent_hires = cursor.fetchall()

#         # Get skill distribution (for LLM analysis)
#         cursor.execute("""
#             SELECT "skills", COUNT(*) as count
#             FROM employees
#             WHERE "skills" IS NOT NULL
#             GROUP BY "skills"
#             ORDER BY count DESC
#             LIMIT 10
#         """)
#         skills = cursor.fetchall()
        
#         # Build the markdown report
#         markdown_content = """
# # Employee Report

# ## Summary
# """
#         if summary:
#             markdown_content += f"""
# - **Total Employees:** {summary['total_employees']}
# - **Active Employees:** {summary['active_employees']}
# - **Former Employees:** {summary['former_employees']}
# - **Average Tenure:** {summary['avg_tenure_years'] or 'N/A'} years
# - **Departments:** {summary['departments']}
# - **Average Vacation Balance:** {summary['avg_vacation_balance'] or 'N/A'} days
# """

#         markdown_content += """
# ## Employee Type Distribution
# | Type | Count |
# |------|-------|
# """
#         for et in employee_types:
#             markdown_content += f"| {et['employeeType'] or 'Not Specified'} | {et['count']} |\n"

#         markdown_content += """
# ## Department Distribution
# | Department | Employee Count |
# |------------|----------------|
# """
#         for dept in departments:
#             markdown_content += f"| {dept['department_name']} | {dept['employee_count']} |\n"

#         markdown_content += """
# ## Recent Hires
# | Name | Position | Hire Date |
# |------|----------|-----------|
# """
#         for hire in recent_hires:
#             full_name = f"{hire['firstName'] or ''} {hire['lastName'] or ''}".strip()
#             if not full_name:
#                 full_name = "Not Available"
#             hire_date = hire['hireDate'].strftime('%Y-%m-%d') if hire['hireDate'] else 'Not Available'
#             markdown_content += f"| {full_name} | {hire['position'] or 'Not Specified'} | {hire_date} |\n"

#         # Prepare data for LLM analysis
#         employee_data_for_llm = {
#             "summary": dict(summary) if summary else {},
#             "employee_types": [dict(et) for et in employee_types],
#             "departments": [dict(dept) for dept in departments],
#             "recent_hires": [dict(hire) for hire in recent_hires],
#             "skills": [dict(skill) for skill in skills]
#         }
        
#         # Add LLM insights - Use the DecimalEncoder for JSON serialization
#         llm_insights = generate_employee_insights(
#             json.dumps(employee_data_for_llm, cls=DecimalEncoder)
#         )
        
#         markdown_content += f"""

# ---

# # AI-Powered HR Insights

# {llm_insights}
# """

#         cursor.close()
#         conn.close()
        
#         return markdown_content
        
#     except Exception as e:
#         logger.error(f"Error generating employees report: {str(e)}")
#         return f"""
# # Error Generating Employee Report

# An error occurred while generating the employee report: {str(e)}
# """

# def generate_recruitment_report():
#     """Generate a report for recruitments table"""
#     try:
#         conn = get_db_connection()
#         cursor = get_db_cursor(conn)
        
#         # First, let's check the values in the currentStatus field to understand the type
#         cursor.execute("""
#             SELECT DISTINCT "currentStatus"::text 
#             FROM recruitments
#             ORDER BY "currentStatus"::text
#         """)
#         available_statuses = cursor.fetchall()
#         logger.info(f"Available status values: {[s['currentStatus'] for s in available_statuses]}")
        
#         # Get summary data - Cast to text for comparison
#         cursor.execute("""
#             SELECT 
#                 COUNT(*) as total_candidates,
#                 COUNT(*) FILTER (WHERE "currentStatus"::text = 'HIRED') as hired_candidates,
#                 COUNT(*) FILTER (WHERE "currentStatus"::text = 'REJECTED') as rejected_candidates,
#                 COUNT(*) FILTER (WHERE "currentStatus"::text = 'IN_PROCESS') as in_process,
#                 COUNT(DISTINCT "position") as positions,
#                 COUNT(DISTINCT "source") as sources
#             FROM recruitments
#         """)
#         summary = cursor.fetchone()
        
#         # Get positions
#         cursor.execute("""
#             SELECT "position", COUNT(*) as count
#             FROM recruitments
#             GROUP BY "position"
#             ORDER BY count DESC
#             LIMIT 10
#         """)
#         positions = cursor.fetchall()
        
#         # Get recruitment sources
#         cursor.execute("""
#             SELECT "source", COUNT(*) as count
#             FROM recruitments
#             GROUP BY "source"
#             ORDER BY count DESC
#         """)
#         sources = cursor.fetchall()
        
#         # Get recent applications
#         cursor.execute("""
#             SELECT "name", "position", "currentStatus"::text, "createdAt"
#             FROM recruitments
#             ORDER BY "createdAt" DESC
#             LIMIT 5
#         """)
#         recent_applications = cursor.fetchall()
        
#         # Get status distribution
#         cursor.execute("""
#             SELECT "currentStatus"::text, COUNT(*) as count
#             FROM recruitments
#             GROUP BY "currentStatus"::text
#             ORDER BY count DESC
#         """)
#         status_distribution = cursor.fetchall()
        
#         # Get time-to-hire data
#         cursor.execute("""
#             SELECT 
#                 AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 86400)::numeric(10,2) as avg_days_to_process
#             FROM recruitments
#             WHERE "currentStatus"::text = 'HIRED'
#         """)
#         time_to_hire = cursor.fetchone()
        
#         # Get rejection reasons
#         cursor.execute("""
#             SELECT "failReason", COUNT(*) as count
#             FROM recruitments
#             WHERE "failReason" IS NOT NULL AND "currentStatus"::text = 'REJECTED'
#             GROUP BY "failReason"
#             ORDER BY count DESC
#             LIMIT 5
#         """)
#         rejection_reasons = cursor.fetchall()
        
#         # Build the markdown report
#         markdown_content = """
# # Recruitment Report

# ## Summary
# """
#         if summary:
#             markdown_content += f"""
# - **Total Candidates:** {summary['total_candidates']}
# - **Hired Candidates:** {summary['hired_candidates']}
# - **Rejected Candidates:** {summary['rejected_candidates']}
# - **In Process:** {summary['in_process']}
# - **Open Positions:** {summary['positions']}
# - **Recruitment Sources:** {summary['sources']}
# """

#         if time_to_hire and time_to_hire['avg_days_to_process']:
#             markdown_content += f"- **Average Days to Hire:** {time_to_hire['avg_days_to_process']} days\n"

#         markdown_content += """
# ## Status Distribution
# | Status | Count |
# |--------|-------|
# """
#         for status in status_distribution:
#             markdown_content += f"| {status['currentStatus'] or 'Not Specified'} | {status['count']} |\n"

#         markdown_content += """
# ## Top Positions
# | Position | Candidate Count |
# |----------|----------------|
# """
#         for pos in positions:
#             markdown_content += f"| {pos['position'] or 'Not Specified'} | {pos['count']} |\n"

#         markdown_content += """
# ## Recruitment Sources
# | Source | Candidate Count |
# |--------|----------------|
# """
#         for source in sources:
#             markdown_content += f"| {source['source'] or 'Not Specified'} | {source['count']} |\n"

#         if rejection_reasons:
#             markdown_content += """
# ## Top Rejection Reasons
# | Reason | Count |
# |--------|-------|
# """
#             for reason in rejection_reasons:
#                 markdown_content += f"| {reason['failReason'] or 'Not Specified'} | {reason['count']} |\n"

#         markdown_content += """
# ## Recent Applications
# | Name | Position | Status | Application Date |
# |------|----------|--------|------------------|
# """
#         for app in recent_applications:
#             application_date = app['createdAt'].strftime('%Y-%m-%d') if app['createdAt'] else 'Not Available'
#             markdown_content += f"| {app['name']} | {app['position'] or 'Not Specified'} | {app['currentStatus']} | {application_date} |\n"

#         # Prepare data for LLM analysis
#         recruitment_data_for_llm = {
#             "summary": dict(summary) if summary else {},
#             "time_to_hire": dict(time_to_hire) if time_to_hire else {},
#             "status_distribution": [dict(status) for status in status_distribution],
#             "positions": [dict(pos) for pos in positions],
#             "sources": [dict(source) for source in sources],
#             "rejection_reasons": [dict(reason) for reason in rejection_reasons] if rejection_reasons else [],
#             "recent_applications": [dict(app) for app in recent_applications]
#         }
        
#         # Add LLM insights - Use the DecimalEncoder for JSON serialization
#         llm_insights = generate_recruitment_insights(
#             json.dumps(recruitment_data_for_llm, cls=DecimalEncoder)
#         )
        
#         markdown_content += f"""

# ---

# # AI-Powered Recruitment Insights

# {llm_insights}
# """

#         cursor.close()
#         conn.close()
        
#         return markdown_content
        
#     except Exception as e:
#         logger.error(f"Error generating recruitment report: {str(e)}")
#         return f"""
# # Error Generating Recruitment Report

# An error occurred while generating the recruitment report: {str(e)}
# """

# # Endpoints from app.py
# @app.get("/")
# def read_root():
#     return {"message": "RGT API Project"}


# @app.get("/health")
# def health_check():
#     return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# @app.post("/upload-cv/")
# async def upload_cv(file: UploadFile = File(...)):
#     """
#     Upload and process a CV file, and return extracted information.
#     Rejects CVs that exceed the page limit.
#     """
#     # Define maximum page limit
#     MAX_PAGES = 5  # Set your preferred page limit here

#     temp_file_path = None

#     try:
#         # Read content
#         content = await file.read()

#         # Save the uploaded file to a temporary location
#         suffix = os.path.splitext(file.filename)[1]
#         with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
#             temp_file.write(content)
#             temp_file_path = temp_file.name

#         # Check page count for PDF files
#         if suffix.lower() == '.pdf':
#             try:
#                 # Use PyPDFLoader to count pages
#                 loader = PyPDFLoader(temp_file_path)
#                 documents = loader.load()

#                 # Count pages
#                 page_count = len(documents)

#                 if page_count > MAX_PAGES:
#                     # Clean up the temporary file before returning
#                     if temp_file_path:
#                         os.unlink(temp_file_path)
#                         temp_file_path = None

#                     # Return a direct response with the error
#                     return JSONResponse(
#                         status_code=413,  # Payload Too Large
#                         content={
#                             "detail": f"CV contains {page_count} pages, which exceeds our limit of {MAX_PAGES} pages. Please reduce the length of your CV and try again."}
#                     )
#             except Exception as e:
#                 # If there's an error counting pages, log it but continue processing
#                 print(f"Error counting PDF pages: {str(e)}")

#         # Process the CV file
#         cv_info = process_cv(temp_file_path)

#         # Return all extracted information directly
#         return cv_info

#     except Exception as e:
#         # Return a properly formatted error
#         return JSONResponse(
#             status_code=500,
#             content={"detail": f"Error processing request: {str(e)}"}
#         )

#     finally:
#         # Always clean up the temporary file in a finally block
#         if temp_file_path and os.path.exists(temp_file_path):
#             try:
#                 os.unlink(temp_file_path)
#             except Exception as e:
#                 print(f"Error removing temporary file: {str(e)}")


# @app.post("/predict-attrition", response_model=PredictionResponse)
# def predict_attrition_endpoint(employee: EmployeeData):
#     try:
#         return predict_attrition(employee)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/predict-match")
# def match_job_endpoint(request: JobRequest):
#     try:
#         # Get formatted profile with fallback for missing values
#         profile_str = format_profile(request.profile)

#         # Ensure we have at least some basic data to work with
#         if not any([request.profile.technicalSkills,
#                    request.profile.programmingLanguages,
#                    request.profile.toolsAndTechnologies]):
#             raise HTTPException(
#                 status_code=400,
#                 detail="At least one of technicalSkills, programmingLanguages, or toolsAndTechnologies must be provided"
#             )

#         return match_jobs_to_applicant(
#             profile_str,
#             request.applied_position,
#             df
#         )
#     except HTTPException:
#         raise  # Re-raise HTTP exceptions
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/report", response_model=ReportResponse)
# async def generate_report_endpoint(input_data: NSPDataDirectInput):
#     try:
#         analyzer = NSPAnalyzer(pd.DataFrame(input_data.records))
#         subject_outcomes = analyzer.analyze_hiring_success()
#         recommendations = generate_recommendations(subject_outcomes, api_key)
#         report_markdown = generate_report(subject_outcomes, recommendations)
#         return ReportResponse(report_markdown=report_markdown, report_html=report_markdown)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/predict-dropoff", response_model=List[PredictionResult])
# async def predict_dropoff_endpoint(applicants: List[RawCandidateData]):
#     try:
#         predictions = predictor.predict_from_raw(applicants)
#         return predictions
#     except ValueError as e:
#         raise HTTPException(status_code=422, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/query")
# async def process_query(query: str = Form(...)):
#     """
#     Process a natural language query and return data in Markdown format

#     Args:
#         query: Natural language query string

#     Returns:
#         Markdown response with SQL query and data results
#     """
#     try:
#         # Convert natural language to SQL
#         sql_query = natural_language_to_sql(query)

#         # Execute the query
#         conn = get_db_connection()
#         cursor = get_db_cursor(conn)

#         try:
#             cursor.execute(sql_query)
#             data = cursor.fetchall()
#         except Exception as e:
#             return MarkdownResponse(content=f"""
# # Error

# **SQL Error:** {str(e)}

# ```sql
# {sql_query}
# ```
# """)

#         # Convert data to markdown table
#         markdown_content = f"""
# # Query Results

# ## SQL Query
# ```sql
# {sql_query}
# ```

# ## Results
# """

#         # Only proceed if we have data
#         if data and len(data) > 0:
#             # Get column headers from first row
#             headers = list(data[0].keys())

#             # Create markdown table header
#             markdown_content += "| " + " | ".join(headers) + " |\n"
#             markdown_content += "| " + \
#                 " | ".join(["---" for _ in headers]) + " |\n"

#             # Add data rows
#             for row in data:
#                 row_values = []
#                 for header in headers:
#                     value = row[header]
#                     # Format value based on type
#                     if value is None:
#                         formatted_value = "NULL"
#                     elif isinstance(value, (datetime, date, time)):
#                         formatted_value = value.isoformat()
#                     else:
#                         formatted_value = str(value).replace(
#                             "|", "\\|")  # Escape pipe characters
#                     row_values.append(formatted_value)

#                 markdown_content += "| " + " | ".join(row_values) + " |\n"

#             markdown_content += f"\n*Total Results: {len(data)}*"
#         else:
#             markdown_content += "\n*No results found*"

#         cursor.close()
#         conn.close()

#         return MarkdownResponse(content=markdown_content)

#     except Exception as e:
#         return MarkdownResponse(content=f"""
# # Error

# An error occurred while processing your query: {str(e)}
# """)


# @app.post("/generate_query_report")
# async def generate_query_report(report_request: QueryReport):
#     """
#     Generate a report based on query results

#     Args:
#         report_request: QueryReport model containing query and data summary

#     Returns:
#         Markdown response with generated analysis report
#     """
#     try:
#         # Get data from request
#         user_query = report_request.query
#         data_summary = report_request.summary
#         result_count = report_request.resultCount

#         # Prepare a prompt for generating a report for this specific query
#         report_prompt = f"""
# Generate a detailed analytical report for the following recruitment data query:

# Query: "{user_query}"

# Results: The query returned {result_count} records.

# Data Summary:
# """

#         # Add column information to the prompt
#         column_types = data_summary.get('columnTypes', {})
#         for column, type_name in column_types.items():
#             report_prompt += f"- Column: {column} (Type: {type_name})\n"

#             # Add statistical info for number columns
#             if type_name == 'number':
#                 min_val = data_summary.get(f'{column}_min', 'N/A')
#                 max_val = data_summary.get(f'{column}_max', 'N/A')
#                 avg_val = data_summary.get(f'{column}_avg', 'N/A')
#                 if avg_val != 'N/A':
#                     avg_val = round(avg_val, 2)

#                 report_prompt += f"  - Min: {min_val}, Max: {max_val}, Average: {avg_val}\n"

#             # Add sample values
#             samples = data_summary.get('samplesPerColumn', {}).get(column, [])
#             if samples:
#                 samples_str = ", ".join([str(s) for s in samples[:5]])
#                 if len(samples) > 5:
#                     samples_str += "..."
#                 report_prompt += f"  - Sample values: {samples_str}\n"

#         report_prompt += """
# Based on the query and data summary above, create a professional report with the following sections:

# 1. Executive Summary - Brief overview of the query and key findings
# 2. Data Analysis - Detailed analysis of the query results, including patterns and trends
# 3. Insights - Key insights derived from the data
# 4. Recommendations - Actionable recommendations based on the data
# 5. Next Steps - Suggested follow-up actions or additional analyses

# Format the report with Markdown headings and bullet points where appropriate to ensure readability.
# """

#         # Generate a report using Groq
#         chat_completion = groq_client.chat.completions.create(
#             messages=[
#                 {
#                     "role": "system",
#                     "content": system_prompt
#                 },
#                 {
#                     "role": "user",
#                     "content": report_prompt,
#                 }
#             ],
#             model="gemma2-9b-it",
#         )

#         report = chat_completion.choices[0].message.content

#         # The report is already in Markdown format from the LLM
#         return MarkdownResponse(content=report)

#     except Exception as e:
#         return MarkdownResponse(content=f"""
# # Error

# An error occurred while generating the report: {str(e)}
# """)


# # New endpoint from main.py
# @app.post("/predict-score", response_class=JSONResponse)
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


# @app.get("/api/employees")
# async def employees_report(format: FormatType = Query(FormatType.html, description="Output format (html or markdown)")):
#     try:
#         report_content = generate_employees_report()
        
#         if format == FormatType.markdown:
#             # Return raw markdown
#             return Response(content=report_content, media_type="text/markdown")
#         else:
#             # Convert to HTML without templates, return raw HTML
#             html_content = markdown.markdown(report_content, extensions=['tables'])
#             return HTMLResponse(content=html_content)
#     except Exception as e:
#         logger.error(f"Route error in employees_report: {str(e)}")
#         error_content = f"""
# # Error Generating Employee Report

# An error occurred while generating the employee report: {str(e)}

# Please check the server logs for more details.
# """
#         if format == FormatType.markdown:
#             return Response(content=error_content, media_type="text/markdown")
#         else:
#             html_content = markdown.markdown(error_content, extensions=['tables'])
#             return HTMLResponse(content=html_content)

# @app.get("/api/recruitment")
# async def recruitment_report(format: FormatType = Query(FormatType.html, description="Output format (html or markdown)")):
#     try:
#         report_content = generate_recruitment_report()
        
#         if format == FormatType.markdown:
#             # Return raw markdown
#             return Response(content=report_content, media_type="text/markdown")
#         else:
#             # Convert to HTML without templates, return raw HTML
#             html_content = markdown.markdown(report_content, extensions=['tables'])
#             return HTMLResponse(content=html_content)
#     except Exception as e:
#         logger.error(f"Route error in recruitment_report: {str(e)}")
#         error_content = f"""
# # Error Generating Recruitment Report

# An error occurred while generating the recruitment report: {str(e)}

# Please check the server logs for more details.
# """
#         if format == FormatType.markdown:
#             return Response(content=error_content, media_type="text/markdown")
#         else:
#             html_content = markdown.markdown(error_content, extensions=['tables'])
#             return HTMLResponse(content=html_content)


# if __name__ == "__main__":
#     # Run the server
#     port = int(os.environ.get("PORT", 8000))
#     uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)


import psycopg2
import psycopg2.extras
from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration using environment variables
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

# Initialize Groq client with API key from environment variable
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# System prompt for recruitment analysis
system_prompt = """
# Recruitment Analysis Assistant

You are an expert AI recruitment analyst specializing in talent acquisition metrics and workforce insights. Your primary role is to analyze recruitment data and generate comprehensive, data-driven reports with strategic recommendations.

## Your Capabilities

- Analyze candidate status distributions and identify bottlenecks in the recruitment pipeline
- Generate actionable insights based on recruitment metrics
- Provide strategic recommendations to improve hiring efficiency
- Identify trends and patterns in recruitment data
- Offer industry benchmarks and best practices when relevant

## Guidelines for Analysis

When analyzing recruitment data:
1. First acknowledge the current state of the recruitment pipeline based on the provided metrics
2. Identify potential issues or bottlenecks in the recruitment process
3. Provide concrete, actionable recommendations with expected outcomes
4. Include quantitative targets where appropriate
5. Consider industry standards and best practices in your analysis
6. Organize insights in a clear, structured format

## Response Format

Structure your reports with the following sections:
- Executive Summary (brief overview of key findings)
- Current Pipeline Status (detailed analysis of provided metrics)
- Key Insights (interpretation of the data and identification of patterns)
- Strategic Recommendations (3-5 specific, actionable items)
- Expected Outcomes (projections for implementing recommendations)

Remember to maintain a professional, consultative tone while providing insights that would be valuable to recruitment managers and HR executives.
"""

# Define the recruitments table schema
RECRUITMENTS_SCHEMA = [
    "name", "date", "email", "phoneNumber", "cvPath", "type", "currentStatus",
    "statusDueDate", "assignee", "notified", "location", "firstPriority",
    "secondPriority", "university", "position", "source", "failStage",
    "failReason", "notes", "createdAt", "updatedAt", "photoUrl", "created_by",
    "employee_id", "programOfStudy", "currentTitle", "highestDegree",
    "graduationYear", "technicalSkills", "programmingLanguages",
    "toolsAndTechnologies", "softSkills", "industries", "certifications",
    "keyProjects", "recentAchievements", "id"
]


def get_db_connection():
    """Get a connection to the PostgreSQL database"""
    conn = psycopg2.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"]
    )
    return conn


def get_db_cursor(conn):
    """Get a cursor that returns results as dictionaries"""
    return conn.cursor(cursor_factory=psycopg2.extras.DictCursor)


def natural_language_to_sql(query: str) -> str:
    """
    Convert natural language to SQL using Groq

    Args:
        query: Natural language query string

    Returns:
        SQL query string
    """
    # Create the schema information string
    schema_info = "Database Schema:\n"
    schema_info += "Table: recruitments\n"
    schema_info += f"Columns: {', '.join(RECRUITMENTS_SCHEMA)}\n\n"

    # Create the prompt
    prompt = f"""
{schema_info}

Convert the following natural language query to a valid PostgreSQL query:
"{query}"

The table contains recruitment data with candidates' information.

IMPORTANT POSTGRESQL SYNTAX REQUIREMENTS:
1. All column names MUST be enclosed in double quotes: "columnName"
2. All field references must include the table name: "recruitments"."columnName"
3. Be careful with camelCase fields (like "createdAt", "phoneNumber", "currentStatus")
4. Use the exact column names as provided in the schema

Guidelines:
- Return ONLY the valid SQL query without any explanation
- For date/time operations, use PostgreSQL's date_trunc() function
- Always alias complex expressions for readability
- For counting or aggregating data, include appropriate GROUP BY clauses
- For arrays like "technicalSkills", use PostgreSQL's array functions
- Limit result sets to a reasonable size (use LIMIT when appropriate)

Here's an example of correct syntax:
SELECT date_trunc('month', "recruitments"."createdAt") AS month, 
       COUNT(*) AS candidate_count 
FROM "recruitments" 
GROUP BY month 
ORDER BY month DESC;

SQL Query:
"""

    # Generate SQL query
    response = groq_client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert in PostgreSQL who creates precise, syntactically correct SQL queries. You always use double quotes for column names and fully qualify them with table names."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="gemma2-9b-it"
    )

    # Get the SQL query from the response
    sql_query = response.choices[0].message.content.strip()

    # Additional validation: ensure column names are properly quoted
    for column in RECRUITMENTS_SCHEMA:
        if len(column) > 3 and column in sql_query and f'"{column}"' not in sql_query:
            # Replace unquoted column names, but only if they're whole words
            # This helps avoid replacing parts of other words
            sql_query = sql_query.replace(
                f' {column} ', f' "recruitments"."{column}" ')
            sql_query = sql_query.replace(
                f'({column} ', f'("recruitments"."{column}" ')
            sql_query = sql_query.replace(
                f' {column},', f' "recruitments"."{column}",')
            sql_query = sql_query.replace(
                f'({column},', f'("recruitments"."{column}",')
            sql_query = sql_query.replace(
                f' {column})', f' "recruitments"."{column}")')

    return sql_query



from fastapi import APIRouter, Form, Query
from fastapi.responses import JSONResponse, HTMLResponse
from models.query import QueryReport
from utils.responses import MarkdownResponse
from utils.db import get_db_connection, get_db_cursor
from kairo.helper import natural_language_to_sql, system_prompt, groq_client
from utils.html_formatter import add_report_styling
from datetime import datetime, date, time
import logging
from typing import Optional
import statistics
from pydantic import BaseModel
import markdown2
import json

router = APIRouter(tags=["Database Queries"])
logger = logging.getLogger(__name__)

class QueryRequest(BaseModel):
    query: str
    generate_report: bool = False
    format: str = "html"  # "markdown" or "html"

@router.post("/query")
async def process_query(
    query: str = Form(...),
    generate_report: bool = Form(False),
    format: str = Form("html")  # Options: "markdown" or "html"
):
    """
    Process a natural language query, execute it against the database,
    and optionally generate an analytical report based on the results.

    Args:
        query: Natural language query string
        generate_report: Whether to generate an analytical report based on results
        format: Response format - "markdown" or "html"

    Returns:
        JSONResponse with queryResponse and queryReport fields
    """
    try:
        # Convert natural language to SQL
        try:
            sql_query = natural_language_to_sql(query)
        except Exception as e:
            logger.error(f"Failed to convert natural language to SQL: {str(e)}")
            error_content = """
# Query Generation Failed

Query not successful, ask information about the recruitment data.
"""
            html_content = markdown2.markdown(error_content, extras=["tables", "fenced-code-blocks"])
            styled_html = add_report_styling(html_content)
            
            response_data = {
                "queryResponse": styled_html,
                "queryReport": ""
            }
            return JSONResponse(content=response_data)

        # Execute the query
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        try:
            cursor.execute(sql_query)
            data = cursor.fetchall()
        except Exception as e:
            error_content = """
# Query Execution Failed

Query not successful, ask information about the recruitment data.
"""
            html_content = markdown2.markdown(error_content, extras=["tables", "fenced-code-blocks"])
            styled_html = add_report_styling(html_content)
            
            response_data = {
                "queryResponse": styled_html,
                "queryReport": ""
            }
            return JSONResponse(content=response_data)

        # Initialize markdown content with query results
        markdown_content = f"""
# Query Results

## SQL Query
```sql
{sql_query}
```

## Results
"""

        data_summary = {}
        result_count = 0
        report_html = ""
        
        # Only proceed if we have data
        if data and len(data) > 0:
            result_count = len(data)
            # Get column headers from first row
            headers = list(data[0].keys())

            # Create markdown table header
            markdown_content += "| " + " | ".join(headers) + " |\n"
            markdown_content += "| " + " | ".join(["---" for _ in headers]) + " |\n"

            # Prepare data for summary if report generation is requested
            if generate_report:
                data_summary = {
                    "columnTypes": {},
                    "samplesPerColumn": {}
                }
                
                # Initialize data structures for column analysis
                for header in headers:
                    data_summary["samplesPerColumn"][header] = []
                    
                    # Detect column type from first non-null value
                    column_type = "string"  # default
                    for row in data:
                        if row[header] is not None:
                            if isinstance(row[header], (int, float)):
                                column_type = "number"
                                break
                            elif isinstance(row[header], (datetime, date, time)):
                                column_type = "date"
                                break
                    
                    data_summary["columnTypes"][header] = column_type
                    
                    # For numeric columns, collect values for statistics
                    if column_type == "number":
                        values = [row[header] for row in data if row[header] is not None]
                        if values:
                            data_summary[f"{header}_min"] = min(values)
                            data_summary[f"{header}_max"] = max(values)
                            data_summary[f"{header}_avg"] = sum(values) / len(values)

            # Add data rows
            for row in data:
                row_values = []
                for header in headers:
                    value = row[header]
                    
                    # For report generation, collect sample values
                    if generate_report and header in data_summary["samplesPerColumn"] and len(data_summary["samplesPerColumn"][header]) < 10 and value is not None:
                        if value not in data_summary["samplesPerColumn"][header]:
                            data_summary["samplesPerColumn"][header].append(value)
                    
                    # Format value for markdown display
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
            markdown_content += "\n*No results found for your query. Please try modifying your search criteria.*"
            result_count = 0

        # Generate report if requested and we have data
        if generate_report and result_count > 0:
            try:
                # Prepare the report prompt
                report_prompt = f"""
Generate a detailed analytical report for the following recruitment data query:

Query: "{query}"

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
                
                # Convert report to HTML separately
                report_html = markdown2.markdown(report, extras=["tables", "fenced-code-blocks"])
                report_html = add_report_styling(report_html)
                
            except Exception as e:
                logger.error(f"Error generating report: {str(e)}")
                report_error = """
# Report Generation Failed

Query not successful, ask information about the recruitment data.
"""
                report_html = markdown2.markdown(report_error, extras=["tables", "fenced-code-blocks"])
                report_html = add_report_styling(report_html)

        cursor.close()
        conn.close()

        # Convert the main content to HTML
        query_response_html = markdown2.markdown(markdown_content, extras=["tables", "fenced-code-blocks"])
        query_response_html = add_report_styling(query_response_html)
        
        # Prepare the response in the requested JSON format
        response_data = {
            "queryResponse": query_response_html,
            "queryReport": report_html
        }
        
        return JSONResponse(content=response_data)

    except Exception as e:
        logger.error(f"Unexpected error processing query: {str(e)}")
        error_content = """
# Query Failed

Query not successful, ask information about the recruitment data.
"""
        error_html = markdown2.markdown(error_content, extras=["tables", "fenced-code-blocks"])
        error_html = add_report_styling(error_html)
        
        response_data = {
            "queryResponse": error_html,
            "queryReport": ""
        }
        
        return JSONResponse(content=response_data)

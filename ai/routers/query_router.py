from fastapi import APIRouter, Form
from models.query import QueryReport
from utils.responses import MarkdownResponse
from utils.db import get_db_connection, get_db_cursor
from kairo.helper import natural_language_to_sql, system_prompt, groq_client
from datetime import datetime, date, time
import logging

router = APIRouter(tags=["Database Queries"])
logger = logging.getLogger(__name__)

@router.post("/query")
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
            markdown_content += "| " + \
                " | ".join(["---" for _ in headers]) + " |\n"

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
                        formatted_value = str(value).replace(
                            "|", "\\|")  # Escape pipe characters
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


@router.post("/generate_query_report")
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
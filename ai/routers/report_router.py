# from fastapi import APIRouter, Query, HTTPException
# from fastapi.responses import Response, HTMLResponse
# import markdown
# import logging
# import json
# from datetime import datetime
# from utils.responses import FormatType
# from utils.db import get_db_connection, get_db_cursor
# from utils.data import DecimalEncoder
# from utils.html_formatter import add_report_styling
# from report.llm_helpers import generate_employee_insights, generate_recruitment_insights

# router = APIRouter(tags=["Reports"], prefix="/api")
# logger = logging.getLogger(__name__)

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
        
#         # Current date and time for report
#         current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
#         # Build the markdown report
#         markdown_content = f"""
# # Employee Report

# <div class="report-date">Generated on {current_datetime}</div>

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

# <div class="ai-insights">

# # AI-Powered HR Insights

# {llm_insights}

# </div>
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
        
#         # Current date and time for report
#         current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
#         # Build the markdown report
#         markdown_content = f"""
# # Recruitment Report

# <div class="report-date">Generated on {current_datetime}</div>

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

# <div class="ai-insights">

# # AI-Powered Recruitment Insights

# {llm_insights}

# </div>
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

# @router.get("/employees")
# async def employees_report(format: FormatType = Query(FormatType.html, description="Output format (html or markdown)")):
#     try:
#         report_content = generate_employees_report()
        
#         if format == FormatType.markdown:
#             # Return raw markdown
#             return Response(content=report_content, media_type="text/markdown")
#         else:
#             # Convert to HTML with proper styling
#             html_basic = markdown.markdown(report_content, extensions=['tables'])
#             styled_html = add_report_styling(html_basic)
#             return HTMLResponse(content=styled_html)
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
#             html_basic = markdown.markdown(error_content, extensions=['tables'])
#             styled_html = add_report_styling(html_basic)
#             return HTMLResponse(content=styled_html)

# @router.get("/recruitment")
# async def recruitment_report(format: FormatType = Query(FormatType.html, description="Output format (html or markdown)")):
#     try:
#         report_content = generate_recruitment_report()
        
#         if format == FormatType.markdown:
#             # Return raw markdown
#             return Response(content=report_content, media_type="text/markdown")
#         else:
#             # Convert to HTML with proper styling
#             html_basic = markdown.markdown(report_content, extensions=['tables'])
#             styled_html = add_report_styling(html_basic)
#             return HTMLResponse(content=styled_html)
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
#             html_basic = markdown.markdown(error_content, extensions=['tables'])
#             styled_html = add_report_styling(html_basic)
#             return HTMLResponse(content=styled_html)

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response, HTMLResponse
import markdown
import logging
import json
from datetime import datetime
from utils.responses import FormatType
from utils.db import get_db_connection, get_db_cursor
from utils.data import DecimalEncoder
from utils.html_formatter import add_report_styling
from report.llm_helpers import generate_employee_insights, generate_recruitment_insights

router = APIRouter(tags=["Reports"], prefix="/api")
logger = logging.getLogger(__name__)

def generate_employees_report():
    """Generate a report for employees table"""
    try:
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        # Get summary data
        cursor.execute("""
            SELECT 
                COUNT(*) as total_employees,
                COUNT(*) FILTER (WHERE "endDate" IS NULL) as active_employees,
                COUNT(*) FILTER (WHERE "endDate" IS NOT NULL) as former_employees,
                AVG(EXTRACT(EPOCH FROM (CURRENT_DATE - "hireDate")) / 86400 / 365)::numeric(10,2) as avg_tenure_years,
                COUNT(DISTINCT "departmentId") as departments,
                AVG("vacationDaysBalance")::numeric(10,2) as avg_vacation_balance
            FROM employees
        """)
        summary = cursor.fetchone()
        
        # Get employee types
        cursor.execute("""
            SELECT "employeeType", COUNT(*) as count
            FROM employees
            GROUP BY "employeeType"
            ORDER BY count DESC
        """)
        employee_types = cursor.fetchall()
        
        # Get department distribution
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN d.name IS NULL THEN 'Not Assigned' 
                    ELSE d.name 
                END as department_name, 
                COUNT(e.*) as employee_count
            FROM employees e
            LEFT JOIN departments d ON e."departmentId" = d.id
            GROUP BY department_name
            ORDER BY employee_count DESC
        """)
        departments = cursor.fetchall()
        
        # Get recent hires
        cursor.execute("""
            SELECT "firstName", "lastName", "position", "hireDate"
            FROM employees
            WHERE "endDate" IS NULL
            ORDER BY "hireDate" DESC
            LIMIT 5
        """)
        recent_hires = cursor.fetchall()

        # Get skill distribution (for LLM analysis)
        cursor.execute("""
            SELECT "skills", COUNT(*) as count
            FROM employees
            WHERE "skills" IS NOT NULL
            GROUP BY "skills"
            ORDER BY count DESC
            LIMIT 10
        """)
        skills = cursor.fetchall()
        
        # Current date and time for report
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Build the markdown report
        markdown_content = f"""
# Employee Report

<div class="report-date">Generated on {current_datetime}</div>

## Summary
"""
        if summary:
            markdown_content += f"""
- **Total Employees:** {summary['total_employees']}
- **Active Employees:** {summary['active_employees']}
- **Former Employees:** {summary['former_employees']}
- **Average Tenure:** {summary['avg_tenure_years'] or 'N/A'} years
- **Departments:** {summary['departments']}
- **Average Vacation Balance:** {summary['avg_vacation_balance'] or 'N/A'} days
"""

        markdown_content += """
## Employee Type Distribution
| Type | Count |
|------|-------|
"""
        for et in employee_types:
            markdown_content += f"| {et['employeeType'] or 'Not Specified'} | {et['count']} |\n"

        markdown_content += """
## Department Distribution
| Department | Employee Count |
|------------|----------------|
"""
        for dept in departments:
            markdown_content += f"| {dept['department_name']} | {dept['employee_count']} |\n"

        markdown_content += """
## Recent Hires
| Name | Position | Hire Date |
|------|----------|-----------|
"""
        for hire in recent_hires:
            full_name = f"{hire['firstName'] or ''} {hire['lastName'] or ''}".strip()
            if not full_name:
                full_name = "Not Available"
            hire_date = hire['hireDate'].strftime('%Y-%m-%d') if hire['hireDate'] else 'Not Available'
            markdown_content += f"| {full_name} | {hire['position'] or 'Not Specified'} | {hire_date} |\n"

        # Prepare data for LLM analysis
        employee_data_for_llm = {
            "summary": dict(summary) if summary else {},
            "employee_types": [dict(et) for et in employee_types],
            "departments": [dict(dept) for dept in departments],
            "recent_hires": [dict(hire) for hire in recent_hires],
            "skills": [dict(skill) for skill in skills]
        }
        
        # Add LLM insights - Use the DecimalEncoder for JSON serialization
        llm_insights = generate_employee_insights(
            json.dumps(employee_data_for_llm, cls=DecimalEncoder)
        )
        
        # Format AI insights to ensure proper styling
        formatted_insights = llm_insights.replace("# ", "## ").replace("## Key", "### Key")
        
        markdown_content += f"""

---

<div class="ai-insights">

# AI-Powered HR Insights

{formatted_insights}

</div>
"""

        cursor.close()
        conn.close()
        
        return markdown_content
        
    except Exception as e:
        logger.error(f"Error generating employees report: {str(e)}")
        return f"""
# Error Generating Employee Report

An error occurred while generating the employee report: {str(e)}
"""

def generate_recruitment_report():
    """Generate a report for recruitments table"""
    try:
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        # First, let's check the values in the currentStatus field to understand the type
        cursor.execute("""
            SELECT DISTINCT "currentStatus"::text 
            FROM recruitments
            ORDER BY "currentStatus"::text
        """)
        available_statuses = cursor.fetchall()
        logger.info(f"Available status values: {[s['currentStatus'] for s in available_statuses]}")
        
        # Get summary data - Cast to text for comparison
        cursor.execute("""
            SELECT 
                COUNT(*) as total_candidates,
                COUNT(*) FILTER (WHERE "currentStatus"::text = 'HIRED') as hired_candidates,
                COUNT(*) FILTER (WHERE "currentStatus"::text = 'REJECTED') as rejected_candidates,
                COUNT(*) FILTER (WHERE "currentStatus"::text = 'IN_PROCESS') as in_process,
                COUNT(DISTINCT "position") as positions,
                COUNT(DISTINCT "source") as sources
            FROM recruitments
        """)
        summary = cursor.fetchone()
        
        # Get positions
        cursor.execute("""
            SELECT "position", COUNT(*) as count
            FROM recruitments
            GROUP BY "position"
            ORDER BY count DESC
            LIMIT 10
        """)
        positions = cursor.fetchall()
        
        # Get recruitment sources
        cursor.execute("""
            SELECT "source", COUNT(*) as count
            FROM recruitments
            GROUP BY "source"
            ORDER BY count DESC
        """)
        sources = cursor.fetchall()
        
        # Get recent applications
        cursor.execute("""
            SELECT "name", "position", "currentStatus"::text, "createdAt"
            FROM recruitments
            ORDER BY "createdAt" DESC
            LIMIT 5
        """)
        recent_applications = cursor.fetchall()
        
        # Get status distribution
        cursor.execute("""
            SELECT "currentStatus"::text, COUNT(*) as count
            FROM recruitments
            GROUP BY "currentStatus"::text
            ORDER BY count DESC
        """)
        status_distribution = cursor.fetchall()
        
        # Get time-to-hire data
        cursor.execute("""
            SELECT 
                AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 86400)::numeric(10,2) as avg_days_to_process
            FROM recruitments
            WHERE "currentStatus"::text = 'HIRED'
        """)
        time_to_hire = cursor.fetchone()
        
        # Get rejection reasons
        cursor.execute("""
            SELECT "failReason", COUNT(*) as count
            FROM recruitments
            WHERE "failReason" IS NOT NULL AND "currentStatus"::text = 'REJECTED'
            GROUP BY "failReason"
            ORDER BY count DESC
            LIMIT 5
        """)
        rejection_reasons = cursor.fetchall()
        
        # Current date and time for report
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Build the markdown report
        markdown_content = f"""
# Recruitment Report

<div class="report-date">Generated on {current_datetime}</div>

## Summary
"""
        if summary:
            markdown_content += f"""
- **Total Candidates:** {summary['total_candidates']}
- **Hired Candidates:** {summary['hired_candidates']}
- **Rejected Candidates:** {summary['rejected_candidates']}
- **In Process:** {summary['in_process']}
- **Open Positions:** {summary['positions']}
- **Recruitment Sources:** {summary['sources']}
"""

        if time_to_hire and time_to_hire['avg_days_to_process']:
            markdown_content += f"- **Average Days to Hire:** {time_to_hire['avg_days_to_process']} days\n"

        markdown_content += """
## Status Distribution
| Status | Count |
|--------|-------|
"""
        for status in status_distribution:
            markdown_content += f"| {status['currentStatus'] or 'Not Specified'} | {status['count']} |\n"

        markdown_content += """
## Top Positions
| Position | Candidate Count |
|----------|----------------|
"""
        for pos in positions:
            markdown_content += f"| {pos['position'] or 'Not Specified'} | {pos['count']} |\n"

        markdown_content += """
## Recruitment Sources
| Source | Candidate Count |
|--------|----------------|
"""
        for source in sources:
            markdown_content += f"| {source['source'] or 'Not Specified'} | {source['count']} |\n"

        if rejection_reasons:
            markdown_content += """
## Top Rejection Reasons
| Reason | Count |
|--------|-------|
"""
            for reason in rejection_reasons:
                markdown_content += f"| {reason['failReason'] or 'Not Specified'} | {reason['count']} |\n"

        markdown_content += """
## Recent Applications
| Name | Position | Status | Application Date |
|------|----------|--------|------------------|
"""
        for app in recent_applications:
            application_date = app['createdAt'].strftime('%Y-%m-%d') if app['createdAt'] else 'Not Available'
            markdown_content += f"| {app['name']} | {app['position'] or 'Not Specified'} | {app['currentStatus']} | {application_date} |\n"

        # Prepare data for LLM analysis
        recruitment_data_for_llm = {
            "summary": dict(summary) if summary else {},
            "time_to_hire": dict(time_to_hire) if time_to_hire else {},
            "status_distribution": [dict(status) for status in status_distribution],
            "positions": [dict(pos) for pos in positions],
            "sources": [dict(source) for source in sources],
            "rejection_reasons": [dict(reason) for reason in rejection_reasons] if rejection_reasons else [],
            "recent_applications": [dict(app) for app in recent_applications]
        }
        
        # Add LLM insights - Use the DecimalEncoder for JSON serialization
        llm_insights = generate_recruitment_insights(
            json.dumps(recruitment_data_for_llm, cls=DecimalEncoder)
        )
        
        # Format AI insights to ensure proper styling
        formatted_insights = llm_insights.replace("# ", "## ").replace("## Key", "### Key")
        
        markdown_content += f"""

---

<div class="ai-insights">

# AI-Powered Recruitment Insights

{formatted_insights}

</div>
"""

        cursor.close()
        conn.close()
        
        return markdown_content
        
    except Exception as e:
        logger.error(f"Error generating recruitment report: {str(e)}")
        return f"""
# Error Generating Recruitment Report

An error occurred while generating the recruitment report: {str(e)}
"""

@router.get("/employees")
async def employees_report(format: FormatType = Query(FormatType.html, description="Output format (html or markdown)")):
    try:
        report_content = generate_employees_report()
        
        if format == FormatType.markdown:
            # Return raw markdown
            return Response(content=report_content, media_type="text/markdown")
        else:
            # Convert to HTML with proper styling
            html_basic = markdown.markdown(report_content, extensions=['tables'])
            styled_html = add_report_styling(html_basic)
            return HTMLResponse(content=styled_html)
    except Exception as e:
        logger.error(f"Route error in employees_report: {str(e)}")
        error_content = f"""
# Error Generating Employee Report

An error occurred while generating the employee report: {str(e)}

Please check the server logs for more details.
"""
        if format == FormatType.markdown:
            return Response(content=error_content, media_type="text/markdown")
        else:
            html_basic = markdown.markdown(error_content, extensions=['tables'])
            styled_html = add_report_styling(html_basic)
            return HTMLResponse(content=styled_html)

@router.get("/recruitment")
async def recruitment_report(format: FormatType = Query(FormatType.html, description="Output format (html or markdown)")):
    try:
        report_content = generate_recruitment_report()
        
        if format == FormatType.markdown:
            # Return raw markdown
            return Response(content=report_content, media_type="text/markdown")
        else:
            # Convert to HTML with proper styling
            html_basic = markdown.markdown(report_content, extensions=['tables'])
            styled_html = add_report_styling(html_basic)
            return HTMLResponse(content=styled_html)
    except Exception as e:
        logger.error(f"Route error in recruitment_report: {str(e)}")
        error_content = f"""
# Error Generating Recruitment Report

An error occurred while generating the recruitment report: {str(e)}

Please check the server logs for more details.
"""
        if format == FormatType.markdown:
            return Response(content=error_content, media_type="text/markdown")
        else:
            html_basic = markdown.markdown(error_content, extensions=['tables'])
            styled_html = add_report_styling(html_basic)
            return HTMLResponse(content=styled_html)
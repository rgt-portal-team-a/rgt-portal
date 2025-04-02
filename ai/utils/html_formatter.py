# def add_report_styling(html_content):
#     """
#     Add CSS styling to the HTML report to make it look like the PDF.
    
#     Args:
#         html_content: The raw HTML content generated from markdown.
        
#     Returns:
#         Styled HTML content with proper CSS.
#     """
#     styled_html = f"""
#     <!DOCTYPE html>
#     <html lang="en">
#     <head>
#         <meta charset="UTF-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1.0">
#         <title>HR Report</title>
#         <style>
#             body {{
#                 font-family: Arial, sans-serif;
#                 line-height: 1.6;
#                 color: #333;
#                 max-width: 1000px;
#                 margin: 0 auto;
#                 padding: 20px;
#             }}
#             h1 {{
#                 font-size: 32px;
#                 margin-bottom: 10px;
#                 color: #222;
#             }}
#             h2 {{
#                 font-size: 24px;
#                 margin-top: 30px;
#                 margin-bottom: 15px;
#                 color: #222;
#             }}
#             hr {{
#                 border: none;
#                 border-top: 1px solid #ddd;
#                 margin: 30px 0;
#             }}
#             ul {{
#                 margin-bottom: 20px;
#             }}
#             li {{
#                 margin-bottom: 8px;
#             }}
#             table {{
#                 width: 100%;
#                 border-collapse: collapse;
#                 margin-bottom: 30px;
#             }}
#             th, td {{
#                 padding: 10px;
#                 text-align: left;
#                 border: 1px solid #ddd;
#             }}
#             th {{
#                 background-color: #f8f8f8;
#                 font-weight: bold;
#             }}
#             tr:nth-child(even) {{
#                 background-color: #f9f9f9;
#             }}
#             .report-date {{
#                 font-size: 16px;
#                 color: #555;
#                 margin-bottom: 30px;
#             }}
#             .summary-item {{
#                 font-weight: bold;
#             }}
#             .ai-insights {{
#                 background-color: #f0f7ff;
#                 padding: 20px;
#                 border-radius: 5px;
#                 margin-top: 30px;
#             }}
#         </style>
#     </head>
#     <body>
#         {html_content}
#     </body>
#     </html>
#     """
    
#     return styled_html

def add_report_styling(html_content):
    """
    Add CSS styling to the HTML report to make it look like the PDF.
    
    Args:
        html_content: The raw HTML content generated from markdown.
        
    Returns:
        Styled HTML content with proper CSS.
    """
    # Fix AI Insights section styling issues
    # Look for the div with ai-insights class containing h1, h2, etc.
    html_content = html_content.replace('<div class="ai-insights">\n<h1>AI-Powered', '<div class="ai-insights">\n<h2 class="insights-title">AI-Powered')
    html_content = html_content.replace('<div class="ai-insights">\n\n<h1>AI-Powered', '<div class="ai-insights">\n\n<h2 class="insights-title">AI-Powered')
    
    styled_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HR Report</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
            }}
            h1 {{
                font-size: 32px;
                margin-bottom: 10px;
                color: #222;
            }}
            h2 {{
                font-size: 24px;
                margin-top: 30px;
                margin-bottom: 15px;
                color: #222;
            }}
            hr {{
                border: none;
                border-top: 1px solid #ddd;
                margin: 30px 0;
            }}
            ul {{
                margin-bottom: 20px;
            }}
            li {{
                margin-bottom: 8px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }}
            th, td {{
                padding: 10px;
                text-align: left;
                border: 1px solid #ddd;
            }}
            th {{
                background-color: #f8f8f8;
                font-weight: bold;
            }}
            tr:nth-child(even) {{
                background-color: #f9f9f9;
            }}
            .report-date {{
                font-size: 16px;
                color: #555;
                margin-bottom: 30px;
            }}
            .summary-item {{
                font-weight: bold;
            }}
            .ai-insights {{
                background-color: #f0f7ff;
                padding: 20px;
                border-radius: 5px;
                margin-top: 30px;
            }}
            .ai-insights h2, .ai-insights h3, .ai-insights h4 {{
                color: #0056b3;
            }}
            .insights-title {{
                color: #003d7a !important;
                font-size: 28px !important;
                margin-top: 0 !important;
                border-bottom: 1px solid #cce3ff;
                padding-bottom: 10px;
            }}
            .ai-insights ul li {{
                margin-bottom: 10px;
            }}
            .ai-insights p {{
                margin-bottom: 15px;
            }}
            /* Additional styling to better match PDF */
            strong {{
                font-weight: bold;
                color: #000;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    return styled_html
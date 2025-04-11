from fastapi.responses import Response
from enum import Enum

class MarkdownResponse(Response):
    """Custom response class for Markdown content"""
    media_type = "text/markdown"

# Define format type enum for validation
class FormatType(str, Enum):
    html = "html"
    markdown = "markdown"
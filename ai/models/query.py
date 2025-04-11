from pydantic import BaseModel
from typing import Dict, Any

class QueryReport(BaseModel):
    query: str
    summary: Dict[str, Any]
    resultCount: int
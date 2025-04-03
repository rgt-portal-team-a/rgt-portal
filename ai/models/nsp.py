from pydantic import BaseModel, Field
from typing import List, Dict, Any

class NSPDataDirectInput(BaseModel):
    records: List[Dict[str, Any]] = Field(
        ...,
        example=[
            {"programOfStudy": "Computer Science", "currentStatus": "Hired"},
            {"programOfStudy": "Information Technology",
                "currentStatus": "Not Hired"}
        ]
    )
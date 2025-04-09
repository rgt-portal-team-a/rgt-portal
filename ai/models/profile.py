from pydantic import BaseModel
from typing import Optional

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


class CandidateProfile(BaseModel):
    currentTitle: str
    currentCompany: str
    totalYearsInTech: int
    highestDegree: str
    programOfStudy: str
    university: str
    graduationYear: str
    technicalSkills: str
    programmingLanguages: str
    toolsAndTechnologies: str
    softSkills: str
    industries: str
    certifications: str
    keyProjects: str
    recentAchievements: str


class JobRequest(BaseModel):
    profile: Profile
    applied_position: str


class CandidateRequest(BaseModel):
    profile: CandidateProfile
    applied_position: str
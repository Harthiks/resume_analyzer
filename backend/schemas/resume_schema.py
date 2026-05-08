"""
Pydantic schemas for Resume — request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""
    title: str = ""

class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""
    description: str = ""

class Experience(BaseModel):
    company: str = ""
    role: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    current: bool = False
    description: str = ""
    technologies: List[str] = []

class Project(BaseModel):
    name: str = ""
    description: str = ""
    technologies: List[str] = []
    github: str = ""
    live_url: str = ""
    start_date: str = ""
    end_date: str = ""

class Certification(BaseModel):
    name: str = ""
    issuer: str = ""
    date: str = ""
    url: str = ""
    credential_id: str = ""

class Skills(BaseModel):
    technical: List[str] = []
    soft: List[str] = []
    languages: List[str] = []
    tools: List[str] = []

class ResumeCreate(BaseModel):
    title: str = Field(default="My Resume", max_length=200)
    template: str = Field(default="modern")
    personal_info: PersonalInfo = PersonalInfo()
    summary: str = ""
    education: List[Education] = []
    experience: List[Experience] = []
    projects: List[Project] = []
    skills: Skills = Skills()
    certifications: List[Certification] = []
    achievements: List[str] = []

class ResumeUpdate(ResumeCreate):
    pass

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    template: str
    personal_info: PersonalInfo
    summary: str
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    skills: Skills
    certifications: List[Certification]
    achievements: List[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

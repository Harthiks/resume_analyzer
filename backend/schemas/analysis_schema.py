"""
Pydantic schemas for Analysis results.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None

class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str

class ATSCheckRequest(BaseModel):
    resume_text: str

class SuggestionRequest(BaseModel):
    resume_text: str
    section: Optional[str] = None
    context: Optional[str] = None

class SummaryRequest(BaseModel):
    personal_info: Optional[Dict[str, Any]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    skills: Optional[Dict[str, Any]] = None
    education: Optional[List[Dict[str, Any]]] = None
    target_role: Optional[str] = None

class InterviewRequest(BaseModel):
    skills: List[str] = []
    experience_level: str = "mid"
    job_role: str = ""
    technologies: List[str] = []
    num_questions: int = 10

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    ats_score: int = 0
    quality_score: int = 0
    completeness_score: int = 0
    overall_score: int = 0
    extracted_skills: List[str] = []
    missing_skills: List[str] = []
    suggestions: List[str] = []
    sections_found: Dict[str, bool] = {}
    keyword_density: Dict[str, int] = {}
    summary: str = ""
    created_at: Optional[datetime] = None

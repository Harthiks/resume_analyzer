"""
Interview question generator routes.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from middleware.auth_middleware import get_current_user
from services.ai_service import generate_interview_questions
from config.database import get_collection
from schemas.analysis_schema import InterviewRequest

router = APIRouter(prefix="/interview", tags=["Interview Generator"])

@router.post("/generate")
async def generate_questions(data: InterviewRequest, current_user: dict = Depends(get_current_user)):
    questions = await generate_interview_questions(data.model_dump())
    col = get_collection("interview_questions")
    doc = {
        "user_id": current_user["_id"],
        "job_role": data.job_role,
        "experience_level": data.experience_level,
        "skills": data.skills,
        "questions": questions,
        "created_at": datetime.now(timezone.utc),
    }
    result = await col.insert_one(doc)
    return {"success": True, "data": {"id": str(result.inserted_id), "questions": questions, "job_role": data.job_role, "experience_level": data.experience_level}}

@router.get("/history")
async def interview_history(current_user: dict = Depends(get_current_user)):
    col = get_collection("interview_questions")
    records = await col.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(10).to_list(10)
    for r in records:
        r["id"] = str(r.pop("_id"))
        r["user_id"] = str(r.get("user_id", ""))
        r["created_at"] = str(r.get("created_at", ""))
    return {"success": True, "data": records}

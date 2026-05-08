"""
Job description matching routes.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from middleware.auth_middleware import get_current_user
from services.ai_service import match_job_description
from config.database import get_collection

router = APIRouter(prefix="/jobs", tags=["Job Matching"])

@router.post("/match")
async def match_job(body: dict, current_user: dict = Depends(get_current_user)):
    resume_text = body.get("resume_text", "")
    job_description = body.get("job_description", "")
    if not resume_text or not job_description:
        return {"success": False, "message": "Both resume text and job description are required"}

    result = await match_job_description(resume_text, job_description)

    # Save to DB
    col = get_collection("job_descriptions")
    doc = {
        "user_id": current_user["_id"],
        "job_description": job_description[:2000],
        "match_result": result,
        "created_at": datetime.now(timezone.utc),
    }
    await col.insert_one(doc)

    return {"success": True, "data": result}

@router.get("/history")
async def job_match_history(current_user: dict = Depends(get_current_user)):
    col = get_collection("job_descriptions")
    records = await col.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(10).to_list(10)
    for r in records:
        r["id"] = str(r.pop("_id"))
        r["user_id"] = str(r.get("user_id", ""))
        r["created_at"] = str(r.get("created_at", ""))
    return {"success": True, "data": records}

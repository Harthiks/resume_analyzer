"""
Resume CRUD routes.
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from config.database import get_collection
from schemas.resume_schema import ResumeCreate, ResumeUpdate
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])

def serialize_resume(r: dict) -> dict:
    r["id"] = str(r.pop("_id"))
    r["user_id"] = str(r.get("user_id", ""))
    r["created_at"] = str(r.get("created_at", ""))
    r["updated_at"] = str(r.get("updated_at", ""))
    return r

@router.get("/")
async def list_resumes(current_user: dict = Depends(get_current_user)):
    col = get_collection("resumes")
    resumes = await col.find({"user_id": current_user["_id"]}).sort("updated_at", -1).to_list(100)
    return {"success": True, "data": [serialize_resume(r) for r in resumes]}

# IMPORTANT: Static routes MUST come before parameterized /{resume_id} routes
@router.get("/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    resumes_col = get_collection("resumes")
    analyses_col = get_collection("resume_analyses")
    uid = current_user["_id"]
    total_resumes = await resumes_col.count_documents({"user_id": uid})
    total_analyses = await analyses_col.count_documents({"user_id": uid})
    recent_analyses = await analyses_col.find({"user_id": uid}).sort("created_at", -1).limit(5).to_list(5)
    scores = [a.get("overall_score", 0) for a in recent_analyses]
    avg_score = int(sum(scores) / len(scores)) if scores else 0
    for a in recent_analyses:
        a["id"] = str(a.pop("_id"))
        a["user_id"] = str(a.get("user_id", ""))
        a["created_at"] = str(a.get("created_at", ""))
    return {
        "success": True,
        "data": {
            "total_resumes": total_resumes,
            "total_analyses": total_analyses,
            "avg_score": avg_score,
            "recent_analyses": recent_analyses
        }
    }

@router.post("/")
async def create_resume(data: ResumeCreate, current_user: dict = Depends(get_current_user)):
    col = get_collection("resumes")
    doc = data.model_dump()
    doc["user_id"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)
    result = await col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "message": "Resume created", "data": serialize_resume(doc)}

@router.get("/{resume_id}")
async def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    col = get_collection("resumes")
    try:
        r = await col.find_one({"_id": ObjectId(resume_id), "user_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"success": True, "data": serialize_resume(r)}

@router.put("/{resume_id}")
async def update_resume(resume_id: str, data: ResumeUpdate, current_user: dict = Depends(get_current_user)):
    col = get_collection("resumes")
    try:
        oid = ObjectId(resume_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await col.update_one({"_id": oid, "user_id": current_user["_id"]}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    r = await col.find_one({"_id": oid})
    return {"success": True, "message": "Resume updated", "data": serialize_resume(r)}

@router.delete("/{resume_id}")
async def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    col = get_collection("resumes")
    try:
        result = await col.delete_one({"_id": ObjectId(resume_id), "user_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"success": True, "message": "Resume deleted"}

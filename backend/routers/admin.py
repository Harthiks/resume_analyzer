"""
Admin panel routes — user management and platform analytics.
"""
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
from config.database import get_collection
from middleware.auth_middleware import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
async def list_users(page: int = 1, limit: int = 20, admin=Depends(get_current_admin)):
    col = get_collection("users")
    skip = (page - 1) * limit
    users = await col.find({}, {"password": 0}).skip(skip).limit(limit).to_list(limit)
    total = await col.count_documents({})
    for u in users:
        u["id"] = str(u.pop("_id"))
        u["created_at"] = str(u.get("created_at", ""))
    return {"success": True, "data": users, "total": total, "page": page, "limit": limit}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(get_current_admin)):
    col = get_collection("users")
    try:
        r = await col.delete_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User deleted"}

@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, body: dict, admin=Depends(get_current_admin)):
    role = body.get("role", "user")
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    col = get_collection("users")
    await col.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": role, "updated_at": datetime.now(timezone.utc)}})
    return {"success": True, "message": f"Role updated to {role}"}

@router.get("/analytics")
async def platform_analytics(admin=Depends(get_current_admin)):
    users_col = get_collection("users")
    resumes_col = get_collection("resumes")
    analyses_col = get_collection("resume_analyses")
    jobs_col = get_collection("job_descriptions")
    interviews_col = get_collection("interview_questions")

    total_users = await users_col.count_documents({})
    total_resumes = await resumes_col.count_documents({})
    total_analyses = await analyses_col.count_documents({})
    total_job_matches = await jobs_col.count_documents({})
    total_interviews = await interviews_col.count_documents({})

    # Recent users
    recent_users = await users_col.find({}, {"password": 0}).sort("created_at", -1).limit(5).to_list(5)
    for u in recent_users:
        u["id"] = str(u.pop("_id"))
        u["created_at"] = str(u.get("created_at", ""))

    return {"success": True, "data": {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "total_job_matches": total_job_matches,
        "total_interviews": total_interviews,
        "recent_users": recent_users,
    }}

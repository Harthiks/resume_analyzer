"""
Resume analyzer routes — upload PDF/DOCX and get AI analysis.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from config.database import get_collection
from middleware.auth_middleware import get_current_user
from services.file_parser import extract_text
from services.resume_scorer import calculate_resume_score
from services.ai_service import analyze_resume_with_ai, generate_ai_suggestions
from config.settings import settings

router = APIRouter(prefix="/analyze", tags=["Analyzer"])

@router.post("/upload")
async def analyze_uploaded_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file type
    allowed = [".pdf", ".docx", ".doc", ".txt"]
    if not any(file.filename.lower().endswith(ext) for ext in allowed):
        raise HTTPException(status_code=400, detail=f"File type not supported. Use: {', '.join(allowed)}")

    # Validate file size
    contents = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB")

    # Extract text
    text = await extract_text(contents, file.filename)
    if not text or len(text.strip()) < 50:
        raise HTTPException(status_code=422, detail="Could not extract text from file. Please ensure the file is not scanned or image-based.")

    # Rule-based scoring
    scores = calculate_resume_score(text)

    # AI-enhanced analysis
    if settings.gemini_enabled:
        ai_result = await analyze_resume_with_ai(text)
        scores.update({
            "ats_score": ai_result.get("ats_score", scores["ats_score"]),
            "quality_score": ai_result.get("quality_score", scores["quality_score"]),
            "overall_score": ai_result.get("overall_score", scores["overall_score"]),
            "suggestions": ai_result.get("suggestions", []),
            "missing_skills": ai_result.get("missing_skills", []),
            "summary": ai_result.get("summary", ""),
        })
    else:
        suggestions = await generate_ai_suggestions(text)
        scores["suggestions"] = suggestions
        scores["missing_skills"] = []
        scores["summary"] = "Analysis complete. Add Gemini API key for AI-powered insights."

    # Save to DB
    col = get_collection("resume_analyses")
    doc = {
        "user_id": current_user["_id"],
        "filename": file.filename,
        "raw_text": text[:5000],
        **scores,
        "created_at": datetime.now(timezone.utc),
    }
    result = await col.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["user_id"] = str(doc["user_id"])
    doc.pop("_id", None)
    doc["created_at"] = str(doc["created_at"])

    return {"success": True, "message": "Resume analyzed successfully", "data": doc}

@router.post("/text")
async def analyze_text(body: dict, current_user: dict = Depends(get_current_user)):
    """Analyze plain text resume."""
    text = body.get("text", "")
    if len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text too short")
    scores = calculate_resume_score(text)
    if settings.gemini_enabled:
        ai_result = await analyze_resume_with_ai(text)
        scores.update(ai_result)
    else:
        scores["suggestions"] = await generate_ai_suggestions(text)
        scores["missing_skills"] = []
        scores["summary"] = "Analysis complete."

    col = get_collection("resume_analyses")
    doc = {"user_id": current_user["_id"], "raw_text": text[:5000], **scores, "created_at": datetime.now(timezone.utc)}
    result = await col.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["user_id"] = str(doc["user_id"])
    doc.pop("_id", None)
    doc["created_at"] = str(doc["created_at"])
    return {"success": True, "data": doc}

@router.get("/history")
async def get_analysis_history(current_user: dict = Depends(get_current_user)):
    col = get_collection("resume_analyses")
    analyses = await col.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(20).to_list(20)
    for a in analyses:
        a["id"] = str(a.pop("_id"))
        a["user_id"] = str(a.get("user_id", ""))
        a["created_at"] = str(a.get("created_at", ""))
    return {"success": True, "data": analyses}

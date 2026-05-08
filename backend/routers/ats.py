"""
ATS checker routes.
"""
from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user
from services.ats_service import check_ats_formatting
from services.ai_service import check_ats_compatibility
from config.settings import settings

router = APIRouter(prefix="/ats", tags=["ATS Checker"])

@router.post("/check")
async def check_ats(body: dict, current_user: dict = Depends(get_current_user)):
    text = body.get("resume_text", "")
    if not text.strip():
        return {"success": False, "message": "Resume text is required"}
    rule_result = check_ats_formatting(text)
    if settings.gemini_enabled:
        ai_result = await check_ats_compatibility(text)
        rule_result.update(ai_result)
    return {"success": True, "data": rule_result}

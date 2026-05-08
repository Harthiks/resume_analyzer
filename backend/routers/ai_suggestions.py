"""
AI suggestions and resume summary routes.
"""
from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user
from services.ai_service import generate_ai_suggestions, generate_resume_summary

router = APIRouter(prefix="/ai", tags=["AI Features"])

@router.post("/suggest")
async def get_suggestions(body: dict, current_user: dict = Depends(get_current_user)):
    resume_text = body.get("resume_text", "")
    section = body.get("section", None)
    if not resume_text:
        return {"success": False, "message": "Resume text required"}
    suggestions = await generate_ai_suggestions(resume_text, section)
    return {"success": True, "data": {"suggestions": suggestions}}

@router.post("/generate-summary")
async def gen_summary(body: dict, current_user: dict = Depends(get_current_user)):
    summary = await generate_resume_summary(body)
    return {"success": True, "data": {"summary": summary}}

@router.post("/generate-achievements")
async def gen_achievements(body: dict, current_user: dict = Depends(get_current_user)):
    from services.ai_service import _call_gemini
    from config.settings import settings
    role = body.get("role", "Software Engineer")
    skills = body.get("skills", [])
    if settings.gemini_enabled:
        prompt = f"""Generate 5 impressive, quantified achievements for a {role} with skills: {', '.join(skills[:8])}.
Return ONLY a JSON array of strings: ["achievement 1", "achievement 2", ...]
Each should start with an action verb and include metrics."""
        import json, re
        text = await _call_gemini(prompt)
        try:
            m = re.search(r'\[.*\]', text, re.DOTALL)
            if m:
                return {"success": True, "data": {"achievements": json.loads(m.group())}}
        except Exception:
            pass
    return {"success": True, "data": {"achievements": [
        "Developed and deployed 3 production applications serving 500+ users",
        "Reduced API response time by 40% through optimization and caching",
        "Led a team of 4 engineers to deliver project 2 weeks ahead of schedule",
        "Implemented CI/CD pipeline reducing deployment time by 60%",
        "Built automated testing suite achieving 95% code coverage"
    ]}}

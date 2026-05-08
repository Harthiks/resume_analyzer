"""
Export routes — PDF and DOCX resume download.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from bson import ObjectId
from config.database import get_collection
from middleware.auth_middleware import get_current_user
from services.export_service import generate_pdf_from_resume

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/pdf/{resume_id}")
async def export_pdf(resume_id: str, current_user: dict = Depends(get_current_user)):
    col = get_collection("resumes")
    try:
        resume = await col.find_one({"_id": ObjectId(resume_id), "user_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Convert ObjectId fields
    resume["id"] = str(resume.pop("_id"))
    resume["user_id"] = str(resume["user_id"])

    pdf_bytes = generate_pdf_from_resume(resume)
    filename = f"{resume.get('title', 'resume').replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/pdf")
async def export_pdf_from_data(body: dict, current_user: dict = Depends(get_current_user)):
    """Generate PDF from provided resume data (no save required)."""
    pdf_bytes = generate_pdf_from_resume(body)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="resume.pdf"'}
    )

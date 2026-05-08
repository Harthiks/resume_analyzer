"""
PDF/DOCX export service — generate downloadable resume files.
"""
import io
from typing import Dict, Any

def generate_pdf_from_resume(resume_data: Dict[str, Any]) -> bytes:
    """Generate a PDF resume using ReportLab."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, cm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.enums import TA_LEFT, TA_CENTER

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=1.5*cm, leftMargin=1.5*cm,
                            topMargin=1.5*cm, bottomMargin=1.5*cm)

    styles = getSampleStyleSheet()
    story = []

    # Custom styles
    name_style = ParagraphStyle("Name", parent=styles["Title"],
                                fontSize=22, spaceAfter=4, textColor=colors.HexColor("#1a1a2e"))
    title_style = ParagraphStyle("JobTitle", parent=styles["Normal"],
                                 fontSize=12, spaceAfter=8, textColor=colors.HexColor("#7c3aed"))
    section_style = ParagraphStyle("Section", parent=styles["Heading2"],
                                   fontSize=13, spaceBefore=10, spaceAfter=4,
                                   textColor=colors.HexColor("#1a1a2e"),
                                   borderPad=2)
    body_style = ParagraphStyle("Body", parent=styles["Normal"],
                                fontSize=10, spaceAfter=3, leading=14)
    contact_style = ParagraphStyle("Contact", parent=styles["Normal"],
                                   fontSize=9, spaceAfter=2,
                                   textColor=colors.HexColor("#64748b"), alignment=TA_CENTER)

    pi = resume_data.get("personal_info", {})
    name = pi.get("name", "Your Name")
    job_title = pi.get("title", "")

    # Name and title
    story.append(Paragraph(name, name_style))
    if job_title:
        story.append(Paragraph(job_title, title_style))

    # Contact line
    contact_parts = []
    for field in ["email", "phone", "location", "linkedin", "github"]:
        val = pi.get(field, "")
        if val:
            contact_parts.append(val)
    if contact_parts:
        story.append(Paragraph(" | ".join(contact_parts), contact_style))

    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#7c3aed")))
    story.append(Spacer(1, 8))

    # Summary
    summary = resume_data.get("summary", "")
    if summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
        story.append(Paragraph(summary, body_style))
        story.append(Spacer(1, 6))

    # Experience
    experience = resume_data.get("experience", [])
    if experience:
        story.append(Paragraph("WORK EXPERIENCE", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
        for exp in experience:
            role = exp.get("role", "")
            company = exp.get("company", "")
            start = exp.get("start_date", "")
            end = "Present" if exp.get("current") else exp.get("end_date", "")
            story.append(Paragraph(f"<b>{role}</b> — {company}", body_style))
            story.append(Paragraph(f"{start} – {end} | {exp.get('location', '')}", contact_style))
            desc = exp.get("description", "")
            if desc:
                for line in desc.split("\n"):
                    if line.strip():
                        story.append(Paragraph(f"• {line.strip()}", body_style))
            story.append(Spacer(1, 4))

    # Education
    education = resume_data.get("education", [])
    if education:
        story.append(Paragraph("EDUCATION", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
        for edu in education:
            story.append(Paragraph(f"<b>{edu.get('degree', '')} in {edu.get('field', '')}</b>", body_style))
            story.append(Paragraph(f"{edu.get('institution', '')} | {edu.get('start_date', '')} – {edu.get('end_date', '')}", contact_style))
            if edu.get("gpa"):
                story.append(Paragraph(f"GPA: {edu.get('gpa')}", body_style))
            story.append(Spacer(1, 4))

    # Skills
    skills = resume_data.get("skills", {})
    if any(skills.values()):
        story.append(Paragraph("TECHNICAL SKILLS", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
        if skills.get("technical"):
            story.append(Paragraph(f"<b>Technical:</b> {', '.join(skills['technical'])}", body_style))
        if skills.get("tools"):
            story.append(Paragraph(f"<b>Tools:</b> {', '.join(skills['tools'])}", body_style))
        if skills.get("soft"):
            story.append(Paragraph(f"<b>Soft Skills:</b> {', '.join(skills['soft'])}", body_style))
        story.append(Spacer(1, 4))

    # Projects
    projects = resume_data.get("projects", [])
    if projects:
        story.append(Paragraph("PROJECTS", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
        for proj in projects:
            tech = ", ".join(proj.get("technologies", []))
            story.append(Paragraph(f"<b>{proj.get('name', '')}</b>{' | ' + tech if tech else ''}", body_style))
            if proj.get("description"):
                story.append(Paragraph(proj["description"], body_style))
            story.append(Spacer(1, 4))

    # Certifications
    certs = resume_data.get("certifications", [])
    if certs:
        story.append(Paragraph("CERTIFICATIONS", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
        for cert in certs:
            story.append(Paragraph(f"• {cert.get('name', '')} — {cert.get('issuer', '')} ({cert.get('date', '')})", body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()

"""
Resume quality scoring service — multi-dimensional scoring.
"""
import re
from typing import Dict, Any
from services.ats_service import check_ats_formatting, extract_skills_from_text

def calculate_resume_score(text: str) -> Dict[str, Any]:
    """Calculate comprehensive resume quality scores."""
    ats_data = check_ats_formatting(text)
    text_lower = text.lower()
    word_count = len(text.split())

    completeness_items = {
        "contact_info": any(k in text_lower for k in ["email", "@"]),
        "phone": bool(re.search(r'[\+]?[0-9]{10,}', text)),
        "education": any(k in text_lower for k in ["education", "university", "degree", "b.tech"]),
        "experience": any(k in text_lower for k in ["experience", "work", "internship"]),
        "skills": any(k in text_lower for k in ["skills", "technologies"]),
        "summary": any(k in text_lower for k in ["summary", "objective", "profile"]),
        "projects": any(k in text_lower for k in ["project"]),
        "linkedin": "linkedin" in text_lower,
        "github": "github" in text_lower,
        "certifications": any(k in text_lower for k in ["certification", "certified"]),
    }
    completeness_score = int(sum(completeness_items.values()) / len(completeness_items) * 100)

    quality_factors = {
        "has_numbers": bool(re.search(r'\d+', text)),
        "has_percentages": bool(re.search(r'\d+%', text)),
        "good_length": 200 <= word_count <= 900,
        "has_action_verbs": len([w for w in ["built","developed","led","managed","achieved"] if w in text_lower]) >= 3,
        "has_links": bool(re.search(r'https?://', text)),
        "no_pronouns": not bool(re.search(r'\b(i am|i have|my |i \'ve)\b', text_lower)),
    }
    quality_score = min(int(sum(quality_factors.values()) / len(quality_factors) * 100) + 20, 95)
    ats_score = ats_data["ats_score"]
    overall_score = int((ats_score + quality_score + completeness_score) / 3)
    skills = extract_skills_from_text(text)

    return {
        "ats_score": ats_score,
        "quality_score": quality_score,
        "completeness_score": completeness_score,
        "overall_score": overall_score,
        "extracted_skills": skills,
        "sections_found": ats_data.get("sections_found", {}),
        "word_count": word_count,
        "completeness_breakdown": completeness_items,
    }

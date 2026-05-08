"""
Gemini AI Service — wraps Google Generative AI for all AI features.
Falls back to rule-based responses when API key is not configured.
"""
import json
import re
from typing import List, Dict, Any, Optional
from config.settings import settings

# Lazily import Gemini
_gemini_model = None

def _get_gemini():
    global _gemini_model
    if _gemini_model is None and settings.gemini_enabled:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            print(f"⚠️ Gemini init failed: {e}")
    return _gemini_model

async def _call_gemini(prompt: str) -> str:
    """Call Gemini API with a prompt. Returns text response."""
    model = _get_gemini()
    if model is None:
        return ""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"⚠️ Gemini call failed: {e}")
        return ""

async def analyze_resume_with_ai(resume_text: str) -> Dict[str, Any]:
    """Use Gemini to analyze resume and return structured feedback."""
    if not settings.gemini_enabled:
        return _fallback_resume_analysis(resume_text)

    prompt = f"""
Analyze the following resume and provide a detailed JSON response.

Resume Text:
{resume_text[:4000]}

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{{
  "ats_score": <integer 0-100>,
  "quality_score": <integer 0-100>,
  "completeness_score": <integer 0-100>,
  "overall_score": <integer 0-100>,
  "extracted_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "sections_found": {{
    "contact": <bool>,
    "summary": <bool>,
    "education": <bool>,
    "experience": <bool>,
    "skills": <bool>,
    "projects": <bool>,
    "certifications": <bool>
  }},
  "suggestions": ["suggestion1", "suggestion2", ...],
  "summary": "<2 sentence analysis summary>"
}}
"""
    text = await _call_gemini(prompt)
    try:
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception:
        pass
    return _fallback_resume_analysis(resume_text)

async def check_ats_compatibility(resume_text: str) -> Dict[str, Any]:
    """Analyze ATS compatibility of a resume."""
    if not settings.gemini_enabled:
        return _fallback_ats_analysis(resume_text)

    prompt = f"""
Analyze this resume for ATS (Applicant Tracking System) compatibility.

Resume:
{resume_text[:4000]}

Return ONLY valid JSON:
{{
  "ats_score": <integer 0-100>,
  "formatting_score": <integer 0-100>,
  "keyword_score": <integer 0-100>,
  "structure_score": <integer 0-100>,
  "issues": ["issue1", "issue2", ...],
  "improvements": ["improvement1", ...],
  "keyword_density": {{"keyword": count}},
  "passed_checks": ["check1", "check2", ...],
  "failed_checks": ["check1", "check2", ...]
}}
"""
    text = await _call_gemini(prompt)
    try:
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception:
        pass
    return _fallback_ats_analysis(resume_text)

async def match_job_description(resume_text: str, job_description: str) -> Dict[str, Any]:
    """Match resume against a job description."""
    if not settings.gemini_enabled:
        return _fallback_job_match(resume_text, job_description)

    prompt = f"""
Compare this resume against the job description and return a match analysis.

Resume:
{resume_text[:2000]}

Job Description:
{job_description[:2000]}

Return ONLY valid JSON:
{{
  "match_percentage": <integer 0-100>,
  "matched_skills": ["skill1", ...],
  "missing_skills": ["skill1", ...],
  "matched_keywords": ["kw1", ...],
  "missing_keywords": ["kw1", ...],
  "experience_match": <integer 0-100>,
  "suggestions": ["suggestion1", ...],
  "overall_assessment": "<2-3 sentence assessment>"
}}
"""
    text = await _call_gemini(prompt)
    try:
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception:
        pass
    return _fallback_job_match(resume_text, job_description)

async def generate_resume_summary(data: Dict[str, Any]) -> str:
    """Generate a professional resume summary using AI."""
    if not settings.gemini_enabled:
        return _fallback_summary(data)

    name = data.get("personal_info", {}).get("name", "the candidate")
    title = data.get("personal_info", {}).get("title", "professional")
    exp = data.get("experience", [])
    skills = data.get("skills", {})
    target = data.get("target_role", title)

    prompt = f"""
Write a professional resume summary (3-4 sentences, 80-120 words) for:
Name: {name}
Target Role: {target}
Experience: {len(exp)} positions
Key Skills: {', '.join(skills.get('technical', [])[:10])}

Make it ATS-friendly, results-oriented, and impactful. Return ONLY the summary text.
"""
    text = await _call_gemini(prompt)
    return text.strip() if text else _fallback_summary(data)

async def generate_ai_suggestions(resume_text: str, section: str = None) -> List[str]:
    """Generate targeted AI improvement suggestions."""
    if not settings.gemini_enabled:
        return _fallback_suggestions()

    section_context = f"Focus on the {section} section." if section else "Cover all sections."

    prompt = f"""
Provide 8-10 specific, actionable suggestions to improve this resume.
{section_context}

Resume:
{resume_text[:3000]}

Return ONLY a JSON array of strings:
["suggestion 1", "suggestion 2", ...]
"""
    text = await _call_gemini(prompt)
    try:
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception:
        pass
    return _fallback_suggestions()

async def generate_interview_questions(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """Generate categorized interview questions."""
    if not settings.gemini_enabled:
        return _fallback_interview_questions(data)

    role = data.get("job_role", "Software Engineer")
    skills = ", ".join(data.get("skills", [])[:10])
    level = data.get("experience_level", "mid")
    n = data.get("num_questions", 10)

    prompt = f"""
Generate interview questions for a {level}-level {role} with skills: {skills}

Return ONLY valid JSON:
{{
  "hr_questions": ["q1", "q2", "q3"],
  "technical_questions": ["q1", "q2", "q3"],
  "project_questions": ["q1", "q2", "q3"],
  "behavioral_questions": ["q1", "q2"]
}}
Generate approximately {n} total questions across all categories.
"""
    text = await _call_gemini(prompt)
    try:
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception:
        pass
    return _fallback_interview_questions(data)

async def chat_with_assistant(message: str, history: List[Dict] = None) -> str:
    """AI career assistant chatbot response."""
    if not settings.gemini_enabled:
        return "AI assistant is not configured yet. Please add your Gemini API key to the .env file to enable AI features."

    history_text = ""
    if history:
        for h in history[-5:]:
            role = "User" if h.get("role") == "user" else "Assistant"
            history_text += f"{role}: {h.get('content', '')}\n"

    prompt = f"""You are an expert AI career assistant specializing in resume writing, career advice, and interview preparation.
Be helpful, specific, and professional. Keep responses concise (2-4 sentences max unless detailed explanation needed).

Previous conversation:
{history_text}

User: {message}
Assistant:"""

    text = await _call_gemini(prompt)
    return text.strip() if text else "I'm here to help with your career questions. Please ask anything about resumes, interviews, or career paths!"

# ──────────────────────────────────────────────
# Fallback (rule-based) responses when Gemini is off
# ──────────────────────────────────────────────

def _fallback_resume_analysis(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    sections = {
        "contact": any(k in text_lower for k in ["email", "phone", "linkedin"]),
        "summary": any(k in text_lower for k in ["summary", "objective", "profile"]),
        "education": any(k in text_lower for k in ["education", "university", "degree", "bachelor", "master"]),
        "experience": any(k in text_lower for k in ["experience", "work", "employment", "job"]),
        "skills": any(k in text_lower for k in ["skills", "technologies", "tools"]),
        "projects": any(k in text_lower for k in ["project", "built", "developed"]),
        "certifications": any(k in text_lower for k in ["certification", "certified", "certificate"]),
    }
    score = sum(sections.values()) * 14
    common_skills = ["Python", "JavaScript", "React", "Node.js", "SQL", "Git", "Docker", "AWS", "Java", "TypeScript"]
    found = [s for s in common_skills if s.lower() in text_lower]
    return {
        "ats_score": min(score + 10, 85),
        "quality_score": min(score + 5, 80),
        "completeness_score": score,
        "overall_score": min(score + 8, 82),
        "extracted_skills": found,
        "missing_skills": [s for s in common_skills if s.lower() not in text_lower][:5],
        "sections_found": sections,
        "suggestions": _fallback_suggestions(),
        "summary": "Resume analysis complete. Add your Gemini API key for detailed AI-powered insights."
    }

def _fallback_ats_analysis(text: str) -> Dict[str, Any]:
    return {
        "ats_score": 72,
        "formatting_score": 75,
        "keyword_score": 68,
        "structure_score": 78,
        "issues": ["Add more industry-specific keywords", "Quantify achievements with numbers"],
        "improvements": ["Use bullet points for experience", "Add a professional summary", "Include relevant certifications"],
        "keyword_density": {},
        "passed_checks": ["Contact info present", "Education section found", "Skills section present"],
        "failed_checks": ["Missing measurable achievements", "Low keyword density"]
    }

def _fallback_job_match(resume: str, jd: str) -> Dict[str, Any]:
    resume_words = set(resume.lower().split())
    jd_words = set(jd.lower().split())
    common = resume_words & jd_words
    match_pct = min(int(len(common) / max(len(jd_words), 1) * 200), 85)
    return {
        "match_percentage": match_pct,
        "matched_skills": list(common)[:10],
        "missing_skills": [],
        "matched_keywords": list(common)[:8],
        "missing_keywords": [],
        "experience_match": match_pct,
        "suggestions": ["Add Gemini API key for detailed analysis", "Tailor your resume keywords to the job description"],
        "overall_assessment": "Basic keyword matching performed. Enable Gemini API for semantic analysis."
    }

def _fallback_summary(data: Dict) -> str:
    name = data.get("personal_info", {}).get("name", "")
    title = data.get("personal_info", {}).get("title", "professional")
    return f"{'Results-driven ' + title if title else 'Dedicated professional'} with a strong background in technology and problem-solving. Passionate about delivering high-quality solutions and continuous learning. Add your Gemini API key to generate a personalized AI-powered summary."

def _fallback_suggestions() -> List[str]:
    return [
        "Add quantifiable achievements (e.g., 'Increased performance by 30%')",
        "Include relevant keywords from job descriptions",
        "Use strong action verbs to start bullet points",
        "Ensure contact information is complete and professional",
        "Add a compelling professional summary at the top",
        "List technical skills in a dedicated section",
        "Include GitHub/portfolio links for technical roles",
        "Keep resume to 1-2 pages maximum",
        "Use consistent date formatting throughout",
        "Proofread for grammar and spelling errors"
    ]

def _fallback_interview_questions(data: Dict) -> Dict[str, List[str]]:
    role = data.get("job_role", "Software Engineer")
    return {
        "hr_questions": [
            "Tell me about yourself and your career journey.",
            "Why are you interested in this position?",
            f"Where do you see yourself in 5 years as a {role}?",
            "What is your greatest professional achievement?",
            "How do you handle tight deadlines and pressure?"
        ],
        "technical_questions": [
            f"Describe your experience with the core technologies required for this {role} role.",
            "How do you approach debugging a complex issue?",
            "Explain a challenging technical problem you solved recently.",
            "How do you stay updated with new technologies?",
            "Describe your experience with version control and CI/CD pipelines."
        ],
        "project_questions": [
            "Walk me through your most impactful project.",
            "How did you handle technical challenges in your projects?",
            "Describe your role in a team project.",
            "How do you prioritize features in a project?"
        ],
        "behavioral_questions": [
            "Tell me about a time you had a conflict with a team member.",
            "Describe a situation where you had to learn something quickly."
        ]
    }

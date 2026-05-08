"""
ATS compatibility scoring service — rule-based analysis.
"""
import re
from typing import Dict, Any, List

# Common ATS-friendly keywords by category
POWER_WORDS = [
    "achieved", "built", "created", "delivered", "developed", "engineered",
    "improved", "increased", "launched", "led", "managed", "optimized",
    "reduced", "scaled", "shipped", "solved", "transformed"
]

REQUIRED_SECTIONS = ["education", "experience", "skills", "contact"]
OPTIONAL_SECTIONS = ["summary", "projects", "certifications", "achievements"]

def check_ats_formatting(text: str) -> Dict[str, Any]:
    """Run rule-based ATS checks on resume text."""
    text_lower = text.lower()
    issues = []
    improvements = []
    passed_checks = []
    failed_checks = []

    # Section presence checks
    sections = {
        "contact info": any(k in text_lower for k in ["email", "@", "phone", "linkedin"]),
        "education section": any(k in text_lower for k in ["education", "university", "college", "bachelor", "master", "degree", "b.tech", "b.e", "b.sc"]),
        "experience section": any(k in text_lower for k in ["experience", "work", "employment", "internship", "job"]),
        "skills section": any(k in text_lower for k in ["skills", "technologies", "tools", "proficiencies", "competencies"]),
        "professional summary": any(k in text_lower for k in ["summary", "objective", "profile", "about"]),
        "projects section": any(k in text_lower for k in ["project", "built", "developed", "created"]),
    }

    for section, present in sections.items():
        if present:
            passed_checks.append(f"✅ {section.title()} found")
        else:
            failed_checks.append(f"❌ {section.title()} missing")
            improvements.append(f"Add a dedicated '{section}' section")

    # Quantified achievements check
    has_numbers = bool(re.search(r'\d+%|\d+\s*(users|customers|clients|revenue|performance|speed|time)', text_lower))
    if has_numbers:
        passed_checks.append("✅ Quantified achievements present")
    else:
        failed_checks.append("❌ No quantified achievements")
        improvements.append("Add metrics like '30% performance improvement' or '500+ users'")

    # Action verbs check
    found_power_words = [w for w in POWER_WORDS if w in text_lower]
    if len(found_power_words) >= 5:
        passed_checks.append(f"✅ Strong action verbs ({len(found_power_words)} found)")
    else:
        failed_checks.append("❌ Limited action verbs")
        improvements.append("Use strong action verbs: built, delivered, optimized, led, scaled")

    # Length check
    word_count = len(text.split())
    if 200 <= word_count <= 900:
        passed_checks.append(f"✅ Good length ({word_count} words)")
    elif word_count < 200:
        failed_checks.append(f"❌ Too short ({word_count} words)")
        improvements.append("Expand your resume with more details")
    else:
        failed_checks.append(f"⚠️ Very long ({word_count} words)")
        improvements.append("Consider condensing to 1-2 pages")

    # Email format check
    has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
    if has_email:
        passed_checks.append("✅ Valid email format")
    else:
        failed_checks.append("❌ No valid email found")
        improvements.append("Include a professional email address")

    # Phone check
    has_phone = bool(re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', text))
    if has_phone:
        passed_checks.append("✅ Phone number present")
    else:
        failed_checks.append("❌ No phone number found")
        improvements.append("Add a contact phone number")

    # Calculate scores
    total_checks = len(sections) + 5
    passed_count = len(passed_checks)
    ats_score = min(int((passed_count / total_checks) * 100), 95)

    # Keyword density
    keyword_density = {}
    tech_keywords = [
        "python", "javascript", "react", "node", "sql", "git", "docker",
        "aws", "java", "typescript", "api", "database", "machine learning",
        "data", "agile", "scrum", "kubernetes", "devops"
    ]
    for kw in tech_keywords:
        count = text_lower.count(kw)
        if count > 0:
            keyword_density[kw] = count

    return {
        "ats_score": ats_score,
        "formatting_score": min(ats_score + 5, 95),
        "keyword_score": min(len(keyword_density) * 8, 90),
        "structure_score": min(int(len(passed_checks) / max(len(sections), 1) * 100), 95),
        "issues": issues,
        "improvements": improvements,
        "keyword_density": keyword_density,
        "passed_checks": passed_checks,
        "failed_checks": failed_checks,
        "sections_found": sections,
        "action_verbs_found": found_power_words,
        "word_count": word_count,
    }

def extract_skills_from_text(text: str) -> List[str]:
    """Extract technical skills mentioned in resume text."""
    text_lower = text.lower()
    skill_list = [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
        "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "FastAPI",
        "Django", "Flask", "Spring Boot", "Laravel",
        "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
        "Git", "GitHub", "CI/CD", "Jenkins", "GitHub Actions",
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
        "Pandas", "NumPy", "Scikit-learn",
        "HTML", "CSS", "Tailwind", "Bootstrap", "SASS",
        "REST API", "GraphQL", "gRPC", "Microservices",
        "Agile", "Scrum", "JIRA", "Linux", "Bash",
    ]
    return [skill for skill in skill_list if skill.lower() in text_lower]

import re
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List

from app.models.schemas import ParsedJob
from app.nlp.preprocessor import clean_text, extract_years_of_experience, extract_bullet_points
from app.nlp.taxonomy import extract_skills_from_text, normalize_skill

router = APIRouter(prefix="/job", tags=["Job Description"])

class AnalyzeJobRequest(BaseModel):
    text: str
    title: Optional[str] = None

def extract_job_details(text: str, custom_title: Optional[str] = None) -> ParsedJob:
    """
    Parses raw job description text into structured requirements.
    Distinguishes required skills vs preferred / nice-to-have skills.
    """
    cleaned = clean_text(text)
    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]

    # 1. Job Title Extraction
    title = custom_title
    if not title:
        for line in lines[:4]:
            # If line contains common job title words or is short
            if re.search(r'\b(engineer|developer|analyst|architect|scientist|lead|manager|specialist)\b', line, re.IGNORECASE):
                title = re.sub(r'^(job\s+title|role|position)[:\s-]+', '', line, flags=re.IGNORECASE).strip()
                break
        if not title and lines:
            title = lines[0][:60]
        if not title:
            title = "Target Job Role"

    # 2. Section segmentation for Required vs Preferred
    required_text = []
    preferred_text = []
    responsibilities_text = []
    qualifications_text = []

    current_section = "general"
    for line in lines:
        lower = line.lower()
        if any(kw in lower for kw in ["preferred", "nice to have", "good to have", "bonus", "plus", "desired"]):
            current_section = "preferred"
        elif any(kw in lower for kw in ["required", "minimum requirements", "must have", "what you need", "qualifications"]):
            current_section = "required"
        elif any(kw in lower for kw in ["responsibilities", "what you will do", "duties", "day to day"]):
            current_section = "responsibilities"

        if current_section == "preferred":
            preferred_text.append(line)
        elif current_section == "required":
            required_text.append(line)
        elif current_section == "responsibilities":
            responsibilities_text.append(line)
        else:
            required_text.append(line)

    all_found_skills = extract_skills_from_text(cleaned)
    pref_found_skills = extract_skills_from_text("\n".join(preferred_text)) if preferred_text else []
    
    # Categorize skills into required and preferred
    required_skills = [s for s in all_found_skills if s not in pref_found_skills]
    preferred_skills = pref_found_skills

    # If all ended up as preferred, balance them
    if not required_skills and preferred_skills:
        required_skills = preferred_skills[:len(preferred_skills)//2]
        preferred_skills = preferred_skills[len(preferred_skills)//2:]

    # Qualifications & Degrees
    qualifications = []
    for line in lines:
        if re.search(r'\b(degree|bachelor|master|phd|b\.?tech|computer\s+science|engineering)\b', line, re.IGNORECASE):
            qualifications.append(line)
    qualifications = qualifications[:3]

    # Years of experience
    exp_years = extract_years_of_experience(cleaned)

    # Responsibilities bullets
    resp_bullets = extract_bullet_points("\n".join(responsibilities_text))
    if not resp_bullets:
        resp_bullets = extract_bullet_points(cleaned)[:5]

    return ParsedJob(
        title=title,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        qualifications=qualifications,
        years_of_experience=exp_years,
        responsibilities=resp_bullets[:6],
        raw_text=cleaned
    )

@router.post("/analyze", response_model=ParsedJob)
async def analyze_job_text(req: AnalyzeJobRequest):
    """
    Parses and extracts structured requirements from job description text.
    """
    if not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )
    return extract_job_details(req.text, req.title)

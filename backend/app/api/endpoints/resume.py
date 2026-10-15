import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
from app.models.schemas import ParsedResume, ResumeImprovementResult
from app.nlp.extractor import parse_resume_document
from app.nlp.resume_improver import analyze_resume_quality

router = APIRouter(prefix="/resume", tags=["Resume"])

class AnalyzeTextRequest(BaseModel):
    text: str
    file_name: str = "pasted_resume.txt"

@router.post("/upload", response_model=ParsedResume)
async def upload_resume(file: UploadFile = File(...)):
    """
    Uploads a resume in PDF or DOCX format.
    Validates file format and size, extracts structured entities and text.
    """
    # 1. Format validation
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only {', '.join(settings.ALLOWED_EXTENSIONS)} documents are accepted."
        )

    # 2. Size validation & safe temp write
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        temp_path = temp_file.name
        content = await file.read()
        if len(content) > max_bytes:
            os.remove(temp_path)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
            )
        if len(content) == 0:
            os.remove(temp_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty (0 bytes)."
            )
        temp_file.write(content)

    try:
        parsed_resume = parse_resume_document(temp_path, file.filename or "resume")
        return parsed_resume
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/analyze", response_model=ParsedResume)
async def analyze_raw_resume_text(req: AnalyzeTextRequest):
    """
    Parses pasted resume text into structured fields.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode="w", encoding="utf-8") as temp_file:
        temp_path = temp_file.name
        temp_file.write(req.text)

    try:
        from app.nlp.preprocessor import clean_text, segment_resume_sections, extract_years_of_experience
        from app.nlp.taxonomy import extract_skills_from_text
        from app.nlp.extractor import (
            extract_candidate_name,
            extract_education,
            extract_work_experience,
            extract_projects,
            EMAIL_REGEX,
            PHONE_REGEX
        )

        raw = clean_text(req.text)
        sections = segment_resume_sections(raw)
        emails = EMAIL_REGEX.findall(raw)
        phones = PHONE_REGEX.findall(raw)
        name = extract_candidate_name(sections.get("header", ""), raw)
        skills = extract_skills_from_text(raw)
        edu = extract_education(sections.get("education", ""), raw)
        work = extract_work_experience(sections.get("experience", ""))
        proj = extract_projects(sections.get("projects", ""))

        return ParsedResume(
            candidate_name=name,
            email=emails[0] if emails else None,
            phone=phones[0] if phones else None,
            skills=skills,
            education=edu,
            work_experience=work,
            projects=proj,
            certifications=[],
            raw_text=raw,
            file_name=req.file_name,
            is_scanned_pdf=False
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/improve", response_model=ResumeImprovementResult)
async def improve_resume(resume: ParsedResume):
    """
    Evaluates resume bullet points and provides actionable before-and-after suggestions.
    """
    return analyze_resume_quality(resume)

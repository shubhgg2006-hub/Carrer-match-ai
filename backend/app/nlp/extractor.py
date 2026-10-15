import os
import re
from typing import Tuple, List, Optional
import pymupdf  # PyMuPDF
from docx import Document

from app.nlp.preprocessor import clean_text, segment_resume_sections, extract_years_of_experience, extract_bullet_points
from app.nlp.taxonomy import extract_skills_from_text
from app.models.schemas import ParsedResume, EducationItem, WorkExperienceItem, ProjectItem

EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
PHONE_REGEX = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')

DEGREE_PATTERNS = [
    r'\b(?:B\.?Tech|B\.?E\.?|B\.?S\.?|B\.?Sc|Bachelor(?:\'s)?(?:\s+of\s+[A-Za-z\s]+)?)\b',
    r'\b(?:M\.?Tech|M\.?E\.?|M\.?S\.?|M\.?Sc|Master(?:\'s)?(?:\s+of\s+[A-Za-z\s]+)?)\b',
    r'\b(?:Ph\.?D|Doctorate)\b',
    r'\b(?:Computer\s+Science|Information\s+Technology|Data\s+Science|Software\s+Engineering|Electrical\s+Engineering)\b'
]

def extract_text_from_pdf(file_path: str) -> Tuple[str, bool, Optional[str]]:
    """
    Extracts text from PDF file.
    Returns (cleaned_text, is_scanned_pdf, warning_message).
    """
    doc = None
    try:
        doc = pymupdf.open(file_path)
        total_pages = len(doc)
        if total_pages == 0:
            return "", False, "The uploaded PDF document has no pages."
            
        full_text = []
        has_images = False
        
        for page_num in range(total_pages):
            page = doc[page_num]
            text = page.get_text("text")
            full_text.append(text)
            
            # Check for images if text is very low
            if len(page.get_images()) > 0:
                has_images = True
                
        extracted_content = "\n".join(full_text).strip()
        cleaned = clean_text(extracted_content)
        
        # Scanned PDF check
        if len(cleaned) < 50 and has_images:
            return (
                cleaned,
                True,
                "Scanned document detected. This PDF consists of images without extractable text layers, and OCR is not configured. Please upload a text-based PDF or DOCX."
            )
            
        if not cleaned:
            return "", False, "No extractable text found in this document. It may be empty or corrupted."
            
        return cleaned, False, None
    except Exception as e:
        return "", False, f"Failed to parse PDF document: {str(e)}"
    finally:
        if doc:
            doc.close()

def extract_text_from_docx(file_path: str) -> Tuple[str, bool, Optional[str]]:
    """
    Extracts text from DOCX file.
    """
    try:
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text.strip())
                        
        extracted = "\n".join(paragraphs).strip()
        cleaned = clean_text(extracted)
        if not cleaned:
            return "", False, "The DOCX file appears to be empty."
        return cleaned, False, None
    except Exception as e:
        return "", False, f"Failed to parse DOCX document: {str(e)}"

def extract_candidate_name(header_text: str, full_text: str) -> str:
    """
    Heuristically extracts candidate name from header or top lines.
    Excludes emails, phones, URLs, and labels like 'Resume', 'CV'.
    """
    lines = header_text.splitlines() if header_text else full_text.splitlines()
    for line in lines[:8]:
        line_clean = line.strip()
        if not line_clean:
            continue
        # Skip if contains email or phone or url
        if EMAIL_REGEX.search(line_clean) or PHONE_REGEX.search(line_clean) or "http" in line_clean.lower() or "github" in line_clean.lower():
            continue
        # Skip standard resume headers
        if re.search(r'\b(curriculum\s+vitae|resume|portfolio|page\s+\d+)\b', line_clean, re.IGNORECASE):
            continue
        # Candidate name typically has 2 to 4 words, alphabetic
        words = line_clean.split()
        if 1 <= len(words) <= 4 and all(re.match(r'^[A-Za-z\.\'-]+$', w) for w in words):
            return line_clean.title()
            
    return "Candidate"

def extract_education(edu_text: str, full_text: str) -> List[EducationItem]:
    """
    Extracts education qualifications from education section and full text.
    """
    target_text = edu_text if len(edu_text) > 20 else full_text
    items = []
    lines = target_text.splitlines()
    
    current_degree = ""
    current_inst = ""
    current_year = ""
    
    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue
            
        matched_degree = None
        for pat in DEGREE_PATTERNS:
            match = re.search(pat, cleaned, re.IGNORECASE)
            if match:
                matched_degree = match.group(0)
                break
                
        # Check for year
        year_match = re.search(r'\b(19\d{2}|20\d{2})\b', cleaned)
        year_str = year_match.group(0) if year_match else ""
        
        if matched_degree:
            items.append(EducationItem(
                degree=matched_degree.strip(),
                institution=cleaned,
                year=year_str,
                details=cleaned
            ))
            
    if not items and ("bachelor" in target_text.lower() or "b.tech" in target_text.lower() or "degree" in target_text.lower()):
        items.append(EducationItem(
            degree="Bachelor's Degree in Computer Science / Engineering",
            institution="University / College",
            year="",
            details="Detected in resume qualifications"
        ))
        
    return items

def extract_work_experience(exp_text: str) -> List[WorkExperienceItem]:
    """
    Extracts work experience roles and bullet points.
    """
    if not exp_text:
        return []
        
    bullets = extract_bullet_points(exp_text)
    # Group bullets under experience
    if bullets:
        return [
            WorkExperienceItem(
                title="Professional Experience",
                company="",
                duration="",
                bullets=bullets
            )
        ]
    return []

def extract_projects(proj_text: str) -> List[ProjectItem]:
    """
    Extracts projects and their tech stacks.
    """
    if not proj_text:
        return []
        
    bullets = extract_bullet_points(proj_text)
    projects = []
    
    if bullets:
        for idx, bullet in enumerate(bullets[:5]):
            skills = extract_skills_from_text(bullet)
            projects.append(ProjectItem(
                name=f"Project {idx+1}",
                tech_stack=skills,
                description=bullet,
                bullets=[bullet]
            ))
            
    return projects

def parse_resume_document(file_path: str, file_name: str) -> ParsedResume:
    """
    Complete pipeline to parse PDF or DOCX resume document.
    """
    ext = os.path.splitext(file_name)[1].lower()
    
    if ext == ".pdf":
        raw_text, is_scanned, warning = extract_text_from_pdf(file_path)
    elif ext == ".docx":
        raw_text, is_scanned, warning = extract_text_from_docx(file_path)
    else:
        return ParsedResume(
            file_name=file_name,
            extraction_warning=f"Unsupported format '{ext}'. Only PDF and DOCX files are supported."
        )
        
    if is_scanned or not raw_text:
        return ParsedResume(
            file_name=file_name,
            raw_text=raw_text,
            is_scanned_pdf=is_scanned,
            extraction_warning=warning
        )
        
    # Segment sections
    sections = segment_resume_sections(raw_text)
    
    # Extract entities
    emails = EMAIL_REGEX.findall(raw_text)
    phones = PHONE_REGEX.findall(raw_text)
    candidate_name = extract_candidate_name(sections.get("header", ""), raw_text)
    
    skills = extract_skills_from_text(raw_text)
    education = extract_education(sections.get("education", ""), raw_text)
    work_exp = extract_work_experience(sections.get("experience", ""))
    projects = extract_projects(sections.get("projects", ""))
    
    # Certifications
    cert_text = sections.get("certifications", "")
    certs = [c.strip() for c in cert_text.splitlines() if len(c.strip()) > 5][:5]
    
    return ParsedResume(
        candidate_name=candidate_name,
        email=emails[0] if emails else None,
        phone=phones[0] if phones else None,
        skills=skills,
        education=education,
        work_experience=work_exp,
        projects=projects,
        certifications=certs,
        raw_text=raw_text,
        file_name=file_name,
        is_scanned_pdf=False,
        extraction_warning=warning
    )

import re
from typing import Dict, List, Optional

SECTION_HEADERS = {
    "education": [
        "education", "academic background", "academic qualification", "qualifications", "academics"
    ],
    "skills": [
        "skills", "technical skills", "skills & tools", "core competencies", "technologies", "tech stack", "expertise"
    ],
    "experience": [
        "experience", "work experience", "professional experience", "employment history", "work history", "career history"
    ],
    "projects": [
        "projects", "academic projects", "personal projects", "key projects", "notable projects"
    ],
    "certifications": [
        "certifications", "licenses & certifications", "certificates", "courses & certifications"
    ]
}

def clean_text(text: str) -> str:
    """
    Cleans raw document text without destroying technical markers like C++, C#, .NET, CI/CD.
    """
    if not text:
        return ""
    # Normalize unicode spaces and quotes
    text = text.replace('\xa0', ' ').replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
    # Replace non-printable characters except newlines/tabs
    text = re.sub(r'[^\x20-\x7E\n\t]', ' ', text)
    # Collapse multiple spaces (but keep line breaks for structural parsing)
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.splitlines()]
    return '\n'.join(lines)

def segment_resume_sections(text: str) -> Dict[str, str]:
    """
    Segments a resume into common sections (skills, experience, education, projects, certifications).
    """
    lines = text.splitlines()
    sections: Dict[str, List[str]] = {
        "header": [],
        "education": [],
        "skills": [],
        "experience": [],
        "projects": [],
        "certifications": [],
        "other": []
    }
    
    current_section = "header"
    
    for line in lines:
        cleaned_line = line.strip().lower()
        if not cleaned_line:
            continue
            
        # Check if line looks like a section header (short line matching header keywords)
        header_matched = False
        if len(cleaned_line.split()) <= 4:
            for sec_name, keywords in SECTION_HEADERS.items():
                for kw in keywords:
                    if cleaned_line == kw or cleaned_line.startswith(kw + ":") or cleaned_line == f"## {kw}":
                        current_section = sec_name
                        header_matched = True
                        break
                if header_matched:
                    break
                    
        if not header_matched:
            sections[current_section].append(line)
            
    return {k: '\n'.join(v).strip() for k, v in sections.items()}

def extract_years_of_experience(text: str) -> Optional[float]:
    """
    Extracts explicit years of experience mentioned in text (e.g., '3+ years', '5 years of experience').
    """
    if not text:
        return None
        
    patterns = [
        r'(\d+(?:\.\d+)?)\s*\+?\s*(?:to\s*\d+\s*)?years?(?:\s+of)?(?:\s+experience)?',
        r'experience\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*\+?\s*years?'
    ]
    
    max_years: float = 0.0
    found = False
    
    for pat in patterns:
        for match in re.finditer(pat, text, re.IGNORECASE):
            try:
                val = float(match.group(1))
                if 0 < val <= 40: # sensible bounds
                    if val > max_years:
                        max_years = val
                        found = True
            except (ValueError, IndexError):
                continue
                
    return max_years if found else None

def extract_bullet_points(text: str) -> List[str]:
    """
    Splits text into separate actionable bullet points.
    """
    if not text:
        return []
    raw_bullets = re.split(r'\n(?=[•\-\*\u2022\u2023\u25E6]|\d+\.|\s{2,}[•\-\*])|\n{2,}', text)
    cleaned = []
    for b in raw_bullets:
        clean_b = re.sub(r'^[•\-\*\u2022\u2023\u25E6\d\.\s]+', '', b).strip()
        # Keep meaningful bullet points
        if len(clean_b) > 15:
            cleaned.append(clean_b)
    return cleaned

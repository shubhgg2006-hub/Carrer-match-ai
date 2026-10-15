from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class WorkExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    duration: str = ""
    bullets: List[str] = []

class ProjectItem(BaseModel):
    name: str = ""
    tech_stack: List[str] = []
    description: str = ""
    bullets: List[str] = []

class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""
    details: str = ""

class ParsedResume(BaseModel):
    candidate_name: str = "Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: List[EducationItem] = []
    work_experience: List[WorkExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[str] = []
    raw_text: str = ""
    file_name: str = "resume.pdf"
    is_scanned_pdf: bool = False
    extraction_warning: Optional[str] = None

class ParsedJob(BaseModel):
    title: str = "Target Job Role"
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    qualifications: List[str] = []
    years_of_experience: Optional[float] = None
    responsibilities: List[str] = []
    raw_text: str = ""

class MatchWeights(BaseModel):
    semantic_similarity: float = 0.35
    required_skills: float = 0.30
    preferred_skills: float = 0.15
    experience: float = 0.10
    education: float = 0.10

class RequirementEvidence(BaseModel):
    requirement: str
    resume_evidence: str
    status: str # "Matched", "Partially Matched", "Missing", "Unassessed"
    explanation: str

class SkillAnalysisResult(BaseModel):
    matching_skills: List[str] = []
    missing_required: List[str] = []
    missing_preferred: List[str] = []
    candidate_extra_skills: List[str] = []
    skill_coverage_pct: float = 0.0
    required_coverage_pct: float = 0.0
    preferred_coverage_pct: float = 0.0

class ScoringBreakdown(BaseModel):
    semantic_score: float = 0.0
    required_skill_score: float = 0.0
    preferred_skill_score: float = 0.0
    experience_score: float = 0.0
    education_score: float = 0.0
    weights_used: Dict[str, float] = {}
    category_status: Dict[str, str] = {} # e.g. "Evaluated", "Unavailable / Normalized"

class LearningResource(BaseModel):
    title: str
    url: str

class SkillGapItem(BaseModel):
    skill: str
    priority: str # "High", "Medium", "Optional"
    is_required: bool = True
    why_it_matters: str
    missing_evidence: str
    suggested_project: str
    learning_resources: List[LearningResource] = []

class BulletImprovementItem(BaseModel):
    original_bullet: str
    improved_bullet: str
    rationale: str
    detected_issues: List[str] = []
    weak_verbs_found: List[str] = []
    missing_metric: bool = True

class ResumeImprovementResult(BaseModel):
    bullet_suggestions: List[BulletImprovementItem] = []
    strong_action_verbs_recommended: List[str] = []
    formatting_critique: List[str] = []
    metrics_detected_count: int = 0
    weak_verbs_detected_count: int = 0

class MatchRequest(BaseModel):
    resume_data: ParsedResume
    job_data: ParsedJob
    weights: Optional[MatchWeights] = None

class MatchResponse(BaseModel):
    id: str
    created_at: str
    resume_filename: str
    candidate_name: str
    target_job_title: str
    overall_score: float
    compatibility_category: str
    summary_explanation: str
    key_strengths: List[str] = []
    key_gaps: List[str] = []
    scoring_breakdown: ScoringBreakdown
    skills_analysis: SkillAnalysisResult
    requirements_analysis: List[RequirementEvidence] = []
    skill_gaps: List[SkillGapItem] = []
    improvement_suggestions: ResumeImprovementResult
    engine_mode: str = "TF-IDF + Cosine"

class CareerRoleTemplate(BaseModel):
    id: str
    title: str
    category: str
    description: str
    core_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience_years: float = 0.0

class CareerMatchItem(BaseModel):
    role: CareerRoleTemplate
    match_score: float
    matching_skills: List[str] = []
    skills_to_develop: List[str] = []
    fit_rationale: str

class SystemHealthResponse(BaseModel):
    status: str
    spacy_loaded: bool
    transformer_loaded: bool
    active_nlp_mode: str
    models_info: Dict[str, Any]

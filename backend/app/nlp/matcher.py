import uuid
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional
import re

from app.models.schemas import (
    ParsedResume,
    ParsedJob,
    MatchWeights,
    MatchResponse,
    ScoringBreakdown,
    SkillAnalysisResult,
    RequirementEvidence,
    SkillGapItem,
    ResumeImprovementResult,
    LearningResource
)
from app.nlp.similarity import similarity_engine
from app.nlp.taxonomy import extract_skills_from_text, normalize_skill, get_skill_category
from app.nlp.preprocessor import extract_years_of_experience

DEFAULT_RESOURCES = {
    "Python": [
        {"title": "Official Python Docs", "url": "https://docs.python.org/3/"},
        {"title": "Real Python Tutorials", "url": "https://realpython.com/"}
    ],
    "JavaScript": [
        {"title": "MDN Web Docs - JavaScript", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"},
        {"title": "javascript.info", "url": "https://javascript.info/"}
    ],
    "TypeScript": [
        {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/"}
    ],
    "React": [
        {"title": "React Official Documentation", "url": "https://react.dev/"}
    ],
    "FastAPI": [
        {"title": "FastAPI Official Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/"}
    ],
    "Docker": [
        {"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/"}
    ],
    "Kubernetes": [
        {"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"}
    ],
    "Machine Learning": [
        {"title": "Coursera Machine Learning Specialization", "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
        {"title": "Scikit-Learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"}
    ],
    "Natural Language Processing (NLP)": [
        {"title": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course/chapter1/1"},
        {"title": "Stanford CS224N: NLP with Deep Learning", "url": "https://web.stanford.edu/class/cs224n/"}
    ],
    "PyTorch": [
        {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/"}
    ],
    "TensorFlow": [
        {"title": "TensorFlow Core Tutorials", "url": "https://www.tensorflow.org/tutorials"}
    ],
    "PostgreSQL": [
        {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/"}
    ],
    "SQL": [
        {"title": "SQL Tutorial - Mode Analytics", "url": "https://mode.com/sql-tutorial/"}
    ],
    "Amazon Web Services (AWS)": [
        {"title": "AWS Skill Builder", "url": "https://explore.skillbuilder.aws/"}
    ],
    "Git & GitHub": [
        {"title": "Pro Git Book", "url": "https://git-scm.com/book/en/v2"}
    ]
}

def analyze_skills_overlap(candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str]) -> SkillAnalysisResult:
    """
    Compares candidate skills against job requirements.
    Normalizes all terms and computes coverage percentages.
    """
    candidate_norm = {normalize_skill(s) for s in candidate_skills if s.strip()}
    req_norm = {normalize_skill(s) for s in required_skills if s.strip()}
    pref_norm = {normalize_skill(s) for s in preferred_skills if s.strip()}

    matched_skills = sorted(list(candidate_norm.intersection(req_norm.union(pref_norm))))
    missing_required = sorted(list(req_norm - candidate_norm))
    missing_preferred = sorted(list(pref_norm - candidate_norm))
    candidate_extra = sorted(list(candidate_norm - (req_norm.union(pref_norm))))

    total_job_skills = len(req_norm) + len(pref_norm)
    all_matched = len(matched_skills)
    skill_coverage_pct = (all_matched / total_job_skills * 100.0) if total_job_skills > 0 else 100.0
    req_coverage_pct = ((len(req_norm) - len(missing_required)) / len(req_norm) * 100.0) if len(req_norm) > 0 else 100.0
    pref_coverage_pct = ((len(pref_norm) - len(missing_preferred)) / len(pref_norm) * 100.0) if len(pref_norm) > 0 else 100.0

    return SkillAnalysisResult(
        matching_skills=matched_skills,
        missing_required=missing_required,
        missing_preferred=missing_preferred,
        candidate_extra_skills=candidate_extra,
        skill_coverage_pct=round(skill_coverage_pct, 1),
        required_coverage_pct=round(req_coverage_pct, 1),
        preferred_coverage_pct=round(pref_coverage_pct, 1)
    )

def evaluate_requirements(resume: ParsedResume, job: ParsedJob) -> List[RequirementEvidence]:
    """
    Generates explainable evidence for each required skill or specification.
    """
    evidence_list = []
    resume_text_lower = resume.raw_text.lower()
    candidate_skills = {normalize_skill(s).lower() for s in resume.skills}

    all_reqs = list(dict.fromkeys(job.required_skills + job.preferred_skills))
    
    for req in all_reqs:
        clean_req = req.strip()
        canonical = normalize_skill(clean_req)
        is_pref = clean_req in job.preferred_skills and clean_req not in job.required_skills
        prefix = "[Preferred] " if is_pref else "[Required] "

        # Check in candidate skills
        if canonical.lower() in candidate_skills or clean_req.lower() in candidate_skills:
            # Find evidence in text or bullet points
            found_bullet = ""
            for exp in resume.work_experience:
                for b in exp.bullets:
                    if clean_req.lower() in b.lower() or canonical.lower() in b.lower():
                        found_bullet = b
                        break
                if found_bullet:
                    break
                    
            if not found_bullet:
                for proj in resume.projects:
                    for b in proj.bullets:
                        if clean_req.lower() in b.lower() or canonical.lower() in b.lower():
                            found_bullet = b
                            break
                    if found_bullet:
                        break

            evidence_text = found_bullet if found_bullet else f"Identified in technical skills section as '{canonical}'."
            evidence_list.append(RequirementEvidence(
                requirement=f"{prefix}{canonical}",
                resume_evidence=evidence_text,
                status="Matched",
                explanation=f"Candidate explicitly demonstrates proficiency in {canonical}."
            ))
        elif clean_req.lower() in resume_text_lower:
            evidence_list.append(RequirementEvidence(
                requirement=f"{prefix}{canonical}",
                resume_evidence=f"Mentioned in resume context: '{clean_req}'.",
                status="Partially Matched",
                explanation=f"Keyword '{clean_req}' appears in resume context but is not highlighted under verified skills or projects."
            ))
        else:
            evidence_list.append(RequirementEvidence(
                requirement=f"{prefix}{canonical}",
                resume_evidence="No direct evidence found in the resume.",
                status="Missing",
                explanation=f"{canonical} is expected for this role but not documented in the resume."
            ))

    return evidence_list

def generate_skill_gaps(skills_analysis: SkillAnalysisResult, target_job_title: str) -> List[SkillGapItem]:
    """
    Generates prioritized gap recommendations with practical practice tasks and curated learning links.
    """
    gaps: List[SkillGapItem] = []

    # High Priority: Missing required skills
    for skill in skills_analysis.missing_required:
        category = get_skill_category(skill)
        resources = [
            LearningResource(**r) for r in DEFAULT_RESOURCES.get(skill, [
                {"title": f"{skill} Official Documentation & Guides", "url": f"https://www.google.com/search?q={skill}+tutorial+documentation"}
            ])
        ]
        gaps.append(SkillGapItem(
            skill=skill,
            priority="High",
            is_required=True,
            why_it_matters=f"Core competency required for {target_job_title}. Essential for passing technical screenings.",
            missing_evidence=f"No mentions of '{skill}' found in technical skills, work history, or project descriptions.",
            suggested_project=f"Build an end-to-end mini project integrating {skill} (e.g. an API, module, or data pipeline) and host it on GitHub.",
            learning_resources=resources
        ))

    # Medium Priority: Missing preferred skills
    for skill in skills_analysis.missing_preferred:
        resources = [
            LearningResource(**r) for r in DEFAULT_RESOURCES.get(skill, [
                {"title": f"{skill} Overview & Docs", "url": f"https://www.google.com/search?q={skill}+tutorial"}
            ])
        ]
        gaps.append(SkillGapItem(
            skill=skill,
            priority="Medium",
            is_required=False,
            why_it_matters=f"Frequently preferred for {target_job_title}. Gives candidates a competitive advantage in evaluations.",
            missing_evidence=f"'{skill}' is not explicitly listed in candidate qualifications.",
            suggested_project=f"Incorporate {skill} into an existing project or implement a practical workflow demonstration.",
            learning_resources=resources
        ))

    # Optional Improvements
    if not gaps and skills_analysis.matching_skills:
        gaps.append(SkillGapItem(
            skill="System Architecture & Scaling",
            priority="Optional",
            is_required=False,
            why_it_matters="Deepening architectural knowledge enhances senior engineering readiness.",
            missing_evidence="Candidate meets primary requirements; advanced architectural patterns can further strengthen profile.",
            suggested_project="Design a distributed architecture blueprint or benchmark query performance under simulated load.",
            learning_resources=[
                LearningResource(title="System Design Primer", url="https://github.com/donnemartin/system-design-primer")
            ]
        ))

    return gaps

def compute_compatibility_score(
    resume: ParsedResume,
    job: ParsedJob,
    weights: Optional[MatchWeights] = None
) -> MatchResponse:
    """
    Complete matching pipeline:
    1. Text extraction & normalization
    2. Skills analysis (required vs preferred)
    3. Semantic similarity calculation
    4. Experience & education alignment
    5. Weight normalization for unavailable categories
    6. Explainability breakdown
    """
    if weights is None:
        weights = MatchWeights()

    # 1. Skill overlap
    skills_result = analyze_skills_overlap(resume.skills, job.required_skills, job.preferred_skills)

    # 2. Semantic similarity
    semantic_sim, engine_mode = similarity_engine.compute_semantic_similarity(resume.raw_text, job.raw_text)
    semantic_score = semantic_sim * 100.0

    # 3. Required & Preferred Skill Scores
    req_score = skills_result.required_coverage_pct
    pref_score = skills_result.preferred_coverage_pct

    # 4. Experience alignment
    candidate_exp = extract_years_of_experience(resume.raw_text)
    job_exp = job.years_of_experience or extract_years_of_experience(job.raw_text)

    category_status: Dict[str, str] = {
        "semantic_similarity": "Evaluated",
        "required_skills": "Evaluated",
        "preferred_skills": "Evaluated" if len(job.preferred_skills) > 0 else "Unavailable / Normalized",
        "experience": "Evaluated" if (job_exp is not None and candidate_exp is not None) else "Unavailable / Normalized",
        "education": "Evaluated" if (len(resume.education) > 0 and len(job.qualifications) > 0) else "Unavailable / Normalized"
    }

    if category_status["experience"] == "Evaluated":
        exp_score = min(100.0, (candidate_exp / job_exp) * 100.0) if job_exp > 0 else 100.0
    else:
        exp_score = 0.0

    # 5. Education alignment
    if category_status["education"] == "Evaluated":
        edu_score = 100.0 if any(any(q.lower() in edu.degree.lower() for q in job.qualifications) for edu in resume.education) else 75.0
    else:
        edu_score = 0.0

    # 6. Weight re-normalization
    active_weights: Dict[str, float] = {}
    raw_weights = {
        "semantic_similarity": weights.semantic_similarity,
        "required_skills": weights.required_skills,
        "preferred_skills": weights.preferred_skills if category_status["preferred_skills"] == "Evaluated" else 0.0,
        "experience": weights.experience if category_status["experience"] == "Evaluated" else 0.0,
        "education": weights.education if category_status["education"] == "Evaluated" else 0.0
    }
    total_raw = sum(raw_weights.values())
    if total_raw <= 0:
        total_raw = 1.0

    for k, v in raw_weights.items():
        active_weights[k] = v / total_raw

    # 7. Final Weighted Match Score (0 - 100)
    final_score = (
        (semantic_score * active_weights["semantic_similarity"]) +
        (req_score * active_weights["required_skills"]) +
        (pref_score * active_weights["preferred_skills"]) +
        (exp_score * active_weights["experience"]) +
        (edu_score * active_weights["education"])
    )
    final_score = max(0.0, min(100.0, round(final_score, 1)))

    # 8. Category & Explanation
    if final_score >= 85:
        category = "Strong Match"
        summary = f"Candidate shows strong alignment with {job.title}, covering key required technical competencies and domain semantics."
    elif final_score >= 70:
        category = "Good Match"
        summary = f"Candidate is well-qualified for {job.title} with solid skill coverage, though bridging a few missing areas will further strengthen candidacy."
    elif final_score >= 50:
        category = "Moderate Match"
        summary = f"Candidate possesses foundational skills relevant to {job.title}, but requires additional project work in specific core requirements."
    else:
        category = "Low Match"
        summary = f"Noticeable divergence between candidate profile and required core qualifications for {job.title}."

    # 9. Strengths and Gaps
    key_strengths = []
    if skills_result.matching_skills:
        key_strengths.append(f"Demonstrated core skills: {', '.join(skills_result.matching_skills[:4])}")
    if semantic_score >= 70:
        key_strengths.append("High semantic alignment between resume experience and job requirements")
    if candidate_exp and job_exp and candidate_exp >= job_exp:
        key_strengths.append(f"Meets or exceeds required experience ({candidate_exp:g} yrs documented vs {job_exp:g} yrs required)")

    key_gaps = []
    if skills_result.missing_required:
        key_gaps.append(f"Missing required competencies: {', '.join(skills_result.missing_required[:3])}")
    if skills_result.missing_preferred:
        key_gaps.append(f"Missing preferred skills: {', '.join(skills_result.missing_preferred[:2])}")
    if not key_gaps:
        key_gaps.append("No critical skill gaps identified for the evaluated criteria.")

    breakdown = ScoringBreakdown(
        semantic_score=round(semantic_score, 1),
        required_skill_score=round(req_score, 1),
        preferred_skill_score=round(pref_score, 1),
        experience_score=round(exp_score, 1),
        education_score=round(edu_score, 1),
        weights_used={k: round(v, 3) for k, v in active_weights.items()},
        category_status=category_status
    )

    requirements_analysis = evaluate_requirements(resume, job)
    skill_gaps = generate_skill_gaps(skills_result, job.title)

    # Empty improvement result (generated on demand or in router)
    improvement = ResumeImprovementResult()

    return MatchResponse(
        id=str(uuid.uuid4()),
        created_at=datetime.now(timezone.utc).isoformat(),
        resume_filename=resume.file_name,
        candidate_name=resume.candidate_name,
        target_job_title=job.title,
        overall_score=final_score,
        compatibility_category=category,
        summary_explanation=summary,
        key_strengths=key_strengths,
        key_gaps=key_gaps,
        scoring_breakdown=breakdown,
        skills_analysis=skills_result,
        requirements_analysis=requirements_analysis,
        skill_gaps=skill_gaps,
        improvement_suggestions=improvement,
        engine_mode=engine_mode
    )

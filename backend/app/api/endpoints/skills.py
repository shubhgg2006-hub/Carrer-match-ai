from typing import List
from fastapi import APIRouter
from app.models.schemas import MatchRequest, SkillGapItem
from app.nlp.matcher import analyze_skills_overlap, generate_skill_gaps

router = APIRouter(prefix="/skills", tags=["Skills Gap Analysis"])

@router.post("/gap-analysis", response_model=List[SkillGapItem])
async def get_skill_gaps(req: MatchRequest):
    """
    Returns prioritized skill gaps, rationale, practice tasks, and learning resources.
    """
    overlap = analyze_skills_overlap(
        req.resume_data.skills,
        req.job_data.required_skills,
        req.job_data.preferred_skills
    )
    return generate_skill_gaps(overlap, req.job_data.title)

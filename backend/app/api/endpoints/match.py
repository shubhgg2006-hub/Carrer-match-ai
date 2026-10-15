import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.database_models import AnalysisRecord
from app.models.schemas import MatchRequest, MatchResponse
from app.nlp.matcher import compute_compatibility_score
from app.nlp.resume_improver import analyze_resume_quality

router = APIRouter(prefix="/match", tags=["Match Engine"])

@router.post("", response_model=MatchResponse)
async def match_resume_to_job(req: MatchRequest, db: Session = Depends(get_db)):
    """
    Executes the intelligent NLP matching pipeline:
    - Text normalization
    - Skill taxonomy comparison
    - Semantic similarity via SentenceTransformers / TF-IDF projection
    - Experience and education alignment
    - Explainable breakdown and evidence logging
    - Automatic persistence to SQLite
    """
    if not req.resume_data.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is empty. Please upload or input a valid resume first."
        )
    if not req.job_data.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text is empty. Please provide job requirements."
        )

    # 1. Run matching pipeline
    match_result = compute_compatibility_score(req.resume_data, req.job_data, req.weights)

    # 2. Add resume improvement suggestions
    improvement = analyze_resume_quality(req.resume_data)
    match_result.improvement_suggestions = improvement

    # 3. Persist analysis record to SQLite
    try:
        record = AnalysisRecord(
            id=match_result.id,
            resume_filename=match_result.resume_filename,
            candidate_name=match_result.candidate_name,
            target_job_title=match_result.target_job_title,
            overall_score=match_result.overall_score,
            compatibility_category=match_result.compatibility_category,
            summary_explanation=match_result.summary_explanation,
            scoring_breakdown=json.dumps(match_result.scoring_breakdown.model_dump()),
            skills_analysis=json.dumps(match_result.skills_analysis.model_dump()),
            requirements_analysis=json.dumps([r.model_dump() for r in match_result.requirements_analysis]),
            improvement_suggestions=json.dumps(match_result.improvement_suggestions.model_dump()),
            skill_gaps=json.dumps([g.model_dump() for g in match_result.skill_gaps]),
            engine_mode=match_result.engine_mode
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()
        # Keep response intact even if logging encounters a minor db write issue
        print(f"Error persisting analysis to db: {e}")

    return match_result

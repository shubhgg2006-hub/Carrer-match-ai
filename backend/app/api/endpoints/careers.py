from typing import List
from fastapi import APIRouter
from app.models.schemas import CareerRoleTemplate, CareerMatchItem, ParsedResume
from app.nlp.career_engine import load_career_roles, evaluate_career_matches

router = APIRouter(prefix="/careers", tags=["Career Explorer"])

@router.get("", response_model=List[CareerRoleTemplate])
async def list_career_roles():
    """Returns catalog of sample demonstration career roles."""
    return load_career_roles()

@router.post("/match", response_model=List[CareerMatchItem])
async def match_career_roles(resume: ParsedResume):
    """
    Evaluates candidate's extracted skills against available career role templates.
    """
    return evaluate_career_matches(resume)

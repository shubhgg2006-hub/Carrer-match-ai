import json
import os
from typing import List
from app.models.schemas import CareerRoleTemplate, CareerMatchItem, ParsedResume
from app.nlp.taxonomy import normalize_skill

CAREER_ROLES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "career_roles.json")

def load_career_roles() -> List[CareerRoleTemplate]:
    """Loads default career role catalog from disk."""
    if os.path.exists(CAREER_ROLES_PATH):
        try:
            with open(CAREER_ROLES_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [CareerRoleTemplate(**item) for item in data]
        except Exception as e:
            pass
    return []

def evaluate_career_matches(resume: ParsedResume) -> List[CareerMatchItem]:
    """
    Evaluates candidate's extracted skills against the catalog of career roles.
    Calculates match scores and identifies existing vs missing skills.
    """
    roles = load_career_roles()
    candidate_skills = {normalize_skill(s).lower() for s in resume.skills if s.strip()}
    
    results: List[CareerMatchItem] = []
    
    for role in roles:
        core_set = {normalize_skill(s).lower() for s in role.core_skills}
        pref_set = {normalize_skill(s).lower() for s in role.preferred_skills}
        all_role_skills = core_set.union(pref_set)
        
        matched_core = [s for s in role.core_skills if normalize_skill(s).lower() in candidate_skills]
        matched_pref = [s for s in role.preferred_skills if normalize_skill(s).lower() in candidate_skills]
        matching_skills = matched_core + matched_pref
        
        missing_core = [s for s in role.core_skills if normalize_skill(s).lower() not in candidate_skills]
        missing_pref = [s for s in role.preferred_skills if normalize_skill(s).lower() not in candidate_skills]
        skills_to_develop = missing_core + missing_pref
        
        # Weighted role score: core skills 70%, preferred skills 30%
        core_pct = (len(matched_core) / len(role.core_skills)) if role.core_skills else 1.0
        pref_pct = (len(matched_pref) / len(role.preferred_skills)) if role.preferred_skills else 1.0
        score = round((0.70 * core_pct + 0.30 * pref_pct) * 100.0, 1)
        
        # Fit rationale
        if score >= 75:
            rationale = f"Strong baseline! You already possess {len(matching_skills)} of {len(all_role_skills)} skills required for a {role.title}."
        elif score >= 50:
            rationale = f"Promising transition path. You meet several core foundations ({', '.join(matched_core[:3]) if matched_core else 'general technical'}), but need to develop {', '.join(missing_core[:2]) if missing_core else 'specialized skills'}."
        else:
            rationale = f"Significant skill development needed in core competencies like {', '.join(missing_core[:3]) if missing_core else 'specialized tools'}."
            
        results.append(CareerMatchItem(
            role=role,
            match_score=score,
            matching_skills=matching_skills,
            skills_to_develop=skills_to_develop,
            fit_rationale=rationale
        ))
        
    # Sort descending by match score
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results

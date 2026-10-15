import pytest
from app.models.schemas import ParsedResume, ParsedJob, MatchWeights, EducationItem
from app.nlp.matcher import compute_compatibility_score, analyze_skills_overlap

def test_skills_overlap_calculation():
    candidate_skills = ["Python", "JavaScript", "React", "Docker"]
    required_skills = ["Python", "FastAPI", "Docker"]
    preferred_skills = ["React", "Kubernetes"]

    result = analyze_skills_overlap(candidate_skills, required_skills, preferred_skills)

    assert "Python" in result.matching_skills
    assert "Docker" in result.matching_skills
    assert "React" in result.matching_skills
    assert "FastAPI" in result.missing_required
    assert "Kubernetes" in result.missing_preferred
    assert "JavaScript" in result.candidate_extra_skills

    # 2 matched out of 3 required (66.7%)
    assert abs(result.required_coverage_pct - 66.7) < 0.5
    # 1 matched out of 2 preferred (50%)
    assert result.preferred_coverage_pct == 50.0

def test_matching_score_with_unavailable_category_normalization():
    """
    Verifies that when categories like experience or education are unavailable,
    the scoring engine does not give zero-penalty or fabricated points, but
    accurately normalizes the remaining weights to sum to 1.0.
    """
    resume = ParsedResume(
        candidate_name="Alex",
        skills=["Python", "FastAPI", "SQL"],
        raw_text="Experienced in building Python and FastAPI REST services."
    )
    job = ParsedJob(
        title="Python Engineer",
        required_skills=["Python", "FastAPI"],
        preferred_skills=[], # preferred skills unavailable
        qualifications=[], # education unavailable
        years_of_experience=None, # experience unavailable
        raw_text="Looking for a Python Engineer skilled in FastAPI."
    )

    response = compute_compatibility_score(resume, job)

    assert response.overall_score > 70.0
    status = response.scoring_breakdown.category_status
    assert status["preferred_skills"] == "Unavailable / Normalized"
    assert status["experience"] == "Unavailable / Normalized"
    assert status["education"] == "Unavailable / Normalized"
    
    # Active weights should sum to 1.0
    active_weights_sum = sum(response.scoring_breakdown.weights_used.values())
    assert abs(active_weights_sum - 1.0) < 0.01

def test_skill_gap_prioritization():
    resume = ParsedResume(
        candidate_name="Alex",
        skills=["Python"],
        raw_text="Python developer"
    )
    job = ParsedJob(
        title="Full Stack Dev",
        required_skills=["Python", "React"],
        preferred_skills=["Docker"],
        raw_text="Full stack job"
    )

    response = compute_compatibility_score(resume, job)
    gaps = response.skill_gaps

    high_prio = [g.skill for g in gaps if g.priority == "High"]
    med_prio = [g.skill for g in gaps if g.priority == "Medium"]

    assert "React" in high_prio
    assert "Docker" in med_prio

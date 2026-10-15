import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime
from app.core.database import Base

class AnalysisRecord(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resume_filename = Column(String(255), nullable=False)
    candidate_name = Column(String(255), default="Candidate")
    target_job_title = Column(String(255), nullable=False)
    
    # Final Compatibility Metric (0 - 100)
    overall_score = Column(Float, nullable=False)
    compatibility_category = Column(String(50), nullable=False) # e.g. "Strong Match", "Good Match", etc.
    summary_explanation = Column(Text, nullable=False)
    
    # Serialized JSON objects for full explainability
    scoring_breakdown = Column(Text, nullable=False) # semantic, req_skills, pref_skills, experience, education, weights
    skills_analysis = Column(Text, nullable=False) # matched, missing_req, missing_pref, candidate_extra, coverage_pct
    requirements_analysis = Column(Text, nullable=False) # list of { requirement, evidence, status, explanation }
    improvement_suggestions = Column(Text, nullable=False) # bullet improvements, action verbs, etc.
    skill_gaps = Column(Text, nullable=False) # high, medium, optional priority items
    engine_mode = Column(String(100), default="Standard")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resume_filename": self.resume_filename,
            "candidate_name": self.candidate_name,
            "target_job_title": self.target_job_title,
            "overall_score": round(self.overall_score, 1),
            "compatibility_category": self.compatibility_category,
            "summary_explanation": self.summary_explanation,
            "scoring_breakdown": json.loads(self.scoring_breakdown) if self.scoring_breakdown else {},
            "skills_analysis": json.loads(self.skills_analysis) if self.skills_analysis else {},
            "requirements_analysis": json.loads(self.requirements_analysis) if self.requirements_analysis else [],
            "improvement_suggestions": json.loads(self.improvement_suggestions) if self.improvement_suggestions else {},
            "skill_gaps": json.loads(self.skill_gaps) if self.skill_gaps else [],
            "engine_mode": self.engine_mode,
        }

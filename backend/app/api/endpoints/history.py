from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.database_models import AnalysisRecord
from app.reports.pdf_generator import generate_pdf_report

router = APIRouter(prefix="/history", tags=["Analysis History"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_all_analyses(db: Session = Depends(get_db)):
    """
    Returns list of all saved analysis summaries sorted by most recent first.
    """
    records = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).all()
    return [r.to_dict() for r in records]

@router.get("/{analysis_id}", response_model=Dict[str, Any])
async def get_analysis_by_id(analysis_id: str, db: Session = Depends(get_db)):
    """
    Returns full analysis details for a specific record.
    """
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID '{analysis_id}' not found."
        )
    return record.to_dict()

@router.delete("/{analysis_id}")
async def delete_analysis_by_id(analysis_id: str, db: Session = Depends(get_db)):
    """
    Deletes a specific analysis record from SQLite.
    """
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID '{analysis_id}' not found."
        )
    db.delete(record)
    db.commit()
    return {"message": f"Analysis '{analysis_id}' deleted successfully.", "deleted_id": analysis_id}

@router.delete("")
async def clear_all_history(db: Session = Depends(get_db)):
    """
    Deletes all saved analysis records from SQLite.
    """
    count = db.query(AnalysisRecord).delete()
    db.commit()
    return {"message": f"Successfully deleted {count} analysis records."}

@router.get("/{analysis_id}/pdf")
async def export_analysis_pdf(analysis_id: str, db: Session = Depends(get_db)):
    """
    Generates and downloads a professional PDF match report for the selected analysis.
    """
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID '{analysis_id}' not found."
        )
    
    pdf_bytes = generate_pdf_report(record.to_dict())
    clean_title = "".join(c for c in record.target_job_title if c.isalnum() or c in " _-").strip().replace(" ", "_")
    filename = f"CareerMatch_Report_{clean_title}_{analysis_id[:8]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

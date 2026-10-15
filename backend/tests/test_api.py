import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "CareerMatch AI" in response.json()["message"]

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "active_nlp_mode" in data

def test_resume_analyze_and_improve():
    resume_text = (
        "Alex Morgan\nalex.morgan@example.com | 555-0199\n\n"
        "Technical Skills: Python, FastAPI, Docker, SQL\n\n"
        "Experience:\n"
        "- Worked on backend APIs using FastAPI and Docker to handle user signups.\n"
    )
    res = client.post("/api/resume/analyze", json={"text": resume_text})
    assert res.status_code == 200
    data = res.json()
    assert data["candidate_name"] == "Alex Morgan"
    assert "Python" in data["skills"]
    assert "FastAPI" in data["skills"]

    # Test improvement endpoint
    imp_res = client.post("/api/resume/improve", json=data)
    assert imp_res.status_code == 200
    imp_data = imp_res.json()
    assert len(imp_data["bullet_suggestions"]) > 0

def test_job_analyze():
    jd_text = (
        "Job Title: Python Software Engineer\n"
        "Requirements:\n"
        "- 3+ years experience with Python and SQL\n"
        "- Experience with Docker and REST APIs\n"
        "Preferred:\n"
        "- Experience with Kubernetes and Redis\n"
    )
    res = client.post("/api/job/analyze", json={"text": jd_text})
    assert res.status_code == 200
    data = res.json()
    assert "Python" in data["required_skills"]
    assert data["years_of_experience"] == 3.0

def test_full_match_and_history_lifecycle():
    resume_payload = {
        "candidate_name": "Priya Sharma",
        "email": "priya@example.com",
        "skills": ["Python", "Machine Learning", "PyTorch", "Natural Language Processing (NLP)"],
        "education": [{"degree": "Master of Science in Computer Science", "institution": "Univ", "year": "2022", "details": ""}],
        "work_experience": [{"title": "ML Engineer", "company": "AI Labs", "duration": "2 years", "bullets": ["Engineered NLP models with PyTorch."]}],
        "projects": [],
        "certifications": [],
        "raw_text": "NLP Engineer with 2 years experience in PyTorch and Machine Learning.",
        "file_name": "priya_resume.pdf",
        "is_scanned_pdf": False
    }

    job_payload = {
        "title": "NLP Engineer",
        "required_skills": ["Python", "Natural Language Processing (NLP)", "PyTorch"],
        "preferred_skills": ["Docker", "Kubernetes"],
        "qualifications": ["Computer Science"],
        "years_of_experience": 2.0,
        "responsibilities": ["Train transformer models."],
        "raw_text": "Seeking an NLP Engineer with 2 years experience in Python and PyTorch."
    }

    # 1. Run Match
    match_res = client.post("/api/match", json={
        "resume_data": resume_payload,
        "job_data": job_payload
    })
    assert match_res.status_code == 200
    match_data = match_res.json()
    analysis_id = match_data["id"]
    assert match_data["overall_score"] > 60.0
    assert "Python" in match_data["skills_analysis"]["matching_skills"]

    # 2. Verify in History list
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    history_items = hist_res.json()
    assert any(item["id"] == analysis_id for item in history_items)

    # 3. Retrieve single record
    single_res = client.get(f"/api/history/{analysis_id}")
    assert single_res.status_code == 200
    assert single_res.json()["candidate_name"] == "Priya Sharma"

    # 4. Export PDF Report
    pdf_res = client.get(f"/api/history/{analysis_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000 # Valid non-empty PDF binary

    # 5. Delete from History
    del_res = client.delete(f"/api/history/{analysis_id}")
    assert del_res.status_code == 200

    # 6. Verify 404 after deletion
    del_check = client.get(f"/api/history/{analysis_id}")
    assert del_check.status_code == 404

def test_career_explorer_endpoints():
    res = client.get("/api/careers")
    assert res.status_code == 200
    roles = res.json()
    assert len(roles) >= 5
    assert any(r["title"] == "Python Developer" for r in roles)

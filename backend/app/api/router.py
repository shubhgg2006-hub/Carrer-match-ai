from fastapi import APIRouter
from app.api.endpoints import resume, job, match, skills, careers, history, health

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(resume.router)
api_router.include_router(job.router)
api_router.include_router(match.router)
api_router.include_router(skills.router)
api_router.include_router(careers.router)
api_router.include_router(history.router)

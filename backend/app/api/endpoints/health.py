from fastapi import APIRouter
from app.models.schemas import SystemHealthResponse
from app.nlp.similarity import similarity_engine

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=SystemHealthResponse)
async def get_system_health():
    """
    Returns system status, active NLP model, and whether transformer embeddings
    are running or if the engine is utilizing the TF-IDF/N-gram fallback mode.
    """
    active_mode = "SentenceTransformer (all-MiniLM-L6-v2)" if similarity_engine.transformer_loaded else "TF-IDF & N-gram Semantic Projection (Fallback Mode)"
    
    return SystemHealthResponse(
        status="healthy",
        spacy_loaded=True,
        transformer_loaded=similarity_engine.transformer_loaded,
        active_nlp_mode=active_mode,
        models_info={
            "transformer_error": similarity_engine.transformer_error,
            "spacy_pipeline": "en_core_web_sm / regex heuristic fallback",
            "tfidf_features": "character & sublinear word n-grams",
            "skill_taxonomy_count": 45,
            "offline_mode_capable": True
        }
    )

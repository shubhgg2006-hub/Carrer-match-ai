import pytest
from app.nlp.similarity import similarity_engine

def test_tfidf_identical_texts():
    text = "Machine learning and natural language processing with python and pytorch"
    score = similarity_engine.compute_tfidf_similarity(text, text)
    assert score >= 0.99

def test_tfidf_disjoint_texts():
    text_a = "Botanical research in tropical rainforest flora and orchid taxonomy"
    text_b = "Kubernetes cluster configuration with terraform and aws cloud formation"
    score = similarity_engine.compute_tfidf_similarity(text_a, text_b)
    assert score < 0.15

def test_semantic_similarity_range():
    text_a = "Building web APIs and backend microservices using FastAPI and PostgreSQL"
    text_b = "Developing RESTful server architecture with Python database endpoints"
    score, mode = similarity_engine.compute_semantic_similarity(text_a, text_b)
    assert 0.0 <= score <= 1.0
    assert score > 0.35 # Semantic relatedness between FastAPI/Postgres and RESTful server/Python
    assert mode is not None

def test_empty_inputs():
    assert similarity_engine.compute_tfidf_similarity("", "Sample text") == 0.0
    score, _ = similarity_engine.compute_semantic_similarity("", "")
    assert score == 0.0

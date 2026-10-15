import pytest
from app.nlp.taxonomy import normalize_skill, extract_skills_from_text, get_skill_category

def test_java_vs_javascript_distinction():
    """Verifies that Java and JavaScript are strictly distinguished and never conflated."""
    java_text = "Experienced backend developer specializing in Java and Spring Boot microservices."
    js_text = "Frontend specialist skilled in JavaScript, React, and ECMAScript features."
    both_text = "Full-stack programmer fluent in both Java enterprise backends and JavaScript frontends."

    java_skills = extract_skills_from_text(java_text)
    assert "Java" in java_skills
    assert "JavaScript" not in java_skills

    js_skills = extract_skills_from_text(js_text)
    assert "JavaScript" in js_skills
    assert "Java" not in js_skills

    both_skills = extract_skills_from_text(both_text)
    assert "Java" in both_skills
    assert "JavaScript" in both_skills

def test_c_cpp_csharp_distinction():
    """Verifies that C, C++, and C# do not collide or trigger false positives."""
    text_c = "Embedded developer programming microcontrollers in C language."
    text_cpp = "High frequency trading developer writing low-latency systems in C++."
    text_csharp = "Game developer creating Unity mechanics in C#."

    skills_c = extract_skills_from_text(text_c)
    assert "C" in skills_c
    assert "C++" not in skills_c
    assert "C#" not in skills_c

    skills_cpp = extract_skills_from_text(text_cpp)
    assert "C++" in skills_cpp
    assert "C#" not in skills_cpp

    skills_csharp = extract_skills_from_text(text_csharp)
    assert "C#" in skills_csharp
    assert "C++" not in skills_csharp

def test_skill_normalization():
    """Verifies canonical normalization of aliases and variants."""
    assert normalize_skill("js") == "JavaScript"
    assert normalize_skill("ECMAScript") == "JavaScript"
    assert normalize_skill("react.js") == "React"
    assert normalize_skill("reactjs") == "React"
    assert normalize_skill("python3") == "Python"
    assert normalize_skill("golang") == "Go"
    assert normalize_skill("k8s") == "Kubernetes"
    assert normalize_skill("aws") == "Amazon Web Services (AWS)"
    assert normalize_skill("nlp") == "Natural Language Processing (NLP)"
    assert normalize_skill("tf") == "TensorFlow"
    assert normalize_skill("sklearn") == "Scikit-Learn"

def test_skill_categories():
    """Verifies correct taxonomy category lookup."""
    assert get_skill_category("Python") == "Programming Languages"
    assert get_skill_category("React") == "Web & Backend"
    assert get_skill_category("PyTorch") == "AI, Machine Learning & NLP"
    assert get_skill_category("Docker") == "Cloud, DevOps & Databases"
    assert get_skill_category("Problem Solving") == "Soft Skills"

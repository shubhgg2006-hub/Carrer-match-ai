import re
from typing import Dict, List, Set, Tuple

# Canonical Skill Taxonomy with categories, aliases/synonyms, and regex patterns
SKILL_TAXONOMY: Dict[str, Dict] = {
    # Programming Languages
    "Python": {
        "category": "Programming Languages",
        "aliases": ["python", "python3", "py"],
        "regex": r"\b(python|python3|py)\b"
    },
    "Java": {
        "category": "Programming Languages",
        # Strictly ensure Java is NOT followed by Script
        "aliases": ["java", "core java"],
        "regex": r"\b(java|core\s+java)\b(?!\s*script)"
    },
    "JavaScript": {
        "category": "Programming Languages",
        "aliases": ["javascript", "js", "ecmascript"],
        "regex": r"\b(javascript|js|ecmascript)\b"
    },
    "TypeScript": {
        "category": "Programming Languages",
        "aliases": ["typescript", "ts"],
        "regex": r"\b(typescript|ts)\b"
    },
    "C++": {
        "category": "Programming Languages",
        "aliases": ["c++", "cpp"],
        "regex": r"(?:\bc\+\+(?![a-zA-Z0-9+#])|\bcpp\b)"
    },
    "C#": {
        "category": "Programming Languages",
        "aliases": ["c#", "csharp", "c-sharp"],
        "regex": r"(?:\bc#(?![a-zA-Z0-9+#])|\bcsharp\b|\bc-sharp\b)"
    },
    "C": {
        "category": "Programming Languages",
        "aliases": ["c language", "c programming"],
        "case_sensitive": True,
        # C must not be followed by + or # or alphanumeric
        "regex": r"(?:\b[cC]\s+language\b|\b[cC]\s+programming\b|\bC(?![a-zA-Z0-9+#]))"
    },
    "Go": {
        "category": "Programming Languages",
        "aliases": ["golang", "go language"],
        "regex": r"\b(golang|go\s+language)\b"
    },
    "Rust": {
        "category": "Programming Languages",
        "aliases": ["rust", "rust-lang"],
        "regex": r"\b(rust|rust-lang)\b"
    },
    "SQL": {
        "category": "Programming Languages",
        "aliases": ["sql", "structured query language"],
        "regex": r"\b(sql|structured\s+query\s+language)\b"
    },
    "R": {
        "category": "Programming Languages",
        "aliases": ["r language", "r programming"],
        "regex": r"\b(r\s+language|r\s+programming)\b"
    },
    "Kotlin": {
        "category": "Programming Languages",
        "aliases": ["kotlin"],
        "regex": r"\b(kotlin)\b"
    },
    "Swift": {
        "category": "Programming Languages",
        "aliases": ["swift"],
        "regex": r"\b(swift)\b"
    },

    # AI, Machine Learning & NLP
    "Machine Learning": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["machine learning", "ml"],
        "regex": r"\b(machine\s+learning|ml)\b"
    },
    "Deep Learning": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["deep learning", "dl"],
        "regex": r"\b(deep\s+learning|dl)\b"
    },
    "Natural Language Processing (NLP)": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["nlp", "natural language processing"],
        "regex": r"\b(natural\s+language\s+processing|nlp)\b"
    },
    "Large Language Models (LLMs)": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["llm", "llms", "large language models", "generative ai", "genai"],
        "regex": r"\b(large\s+language\s+models?|llms?|generative\s+ai|genai)\b"
    },
    "Computer Vision": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["computer vision", "cv", "opencv"],
        "regex": r"\b(computer\s+vision|opencv)\b"
    },
    "PyTorch": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["pytorch", "torch"],
        "regex": r"\b(pytorch|torch)\b"
    },
    "TensorFlow": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["tensorflow", "tf"],
        "regex": r"\b(tensorflow|tf)\b"
    },
    "Scikit-Learn": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["scikit-learn", "sklearn"],
        "regex": r"\b(scikit-learn|sklearn)\b"
    },
    "Pandas": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["pandas"],
        "regex": r"\b(pandas)\b"
    },
    "NumPy": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["numpy"],
        "regex": r"\b(numpy)\b"
    },
    "spaCy": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["spacy"],
        "regex": r"\b(spacy)\b"
    },
    "Hugging Face": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["hugging face", "huggingface", "transformers"],
        "regex": r"\b(hugging\s*face|transformers)\b"
    },
    "LangChain": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["langchain"],
        "regex": r"\b(langchain)\b"
    },
    "LlamaIndex": {
        "category": "AI, Machine Learning & NLP",
        "aliases": ["llamaindex", "llama-index"],
        "regex": r"\b(llamaindex|llama-index)\b"
    },

    # Web & Backend Frameworks
    "React": {
        "category": "Web & Backend",
        "aliases": ["react", "react.js", "reactjs"],
        "regex": r"\b(react|react\.?js)\b"
    },
    "Node.js": {
        "category": "Web & Backend",
        "aliases": ["node", "node.js", "nodejs"],
        "regex": r"\b(node|node\.?js)\b"
    },
    "FastAPI": {
        "category": "Web & Backend",
        "aliases": ["fastapi", "fast-api"],
        "regex": r"\b(fastapi|fast-api)\b"
    },
    "Flask": {
        "category": "Web & Backend",
        "aliases": ["flask"],
        "regex": r"\b(flask)\b"
    },
    "Django": {
        "category": "Web & Backend",
        "aliases": ["django"],
        "regex": r"\b(django)\b"
    },
    "Express.js": {
        "category": "Web & Backend",
        "aliases": ["express", "express.js", "expressjs"],
        "regex": r"\b(express|express\.?js)\b"
    },
    "Next.js": {
        "category": "Web & Backend",
        "aliases": ["next.js", "nextjs"],
        "regex": r"\b(next\.?js)\b"
    },
    "Vue.js": {
        "category": "Web & Backend",
        "aliases": ["vue", "vue.js", "vuejs"],
        "regex": r"\b(vue|vue\.?js)\b"
    },
    "Angular": {
        "category": "Web & Backend",
        "aliases": ["angular", "angularjs"],
        "regex": r"\b(angular|angularjs)\b"
    },
    "Spring Boot": {
        "category": "Web & Backend",
        "aliases": ["spring boot", "springboot", "spring framework"],
        "regex": r"\b(spring\s+boot|springboot|spring\s+framework)\b"
    },
    "REST APIs": {
        "category": "Web & Backend",
        "aliases": ["rest", "rest api", "restful api", "restful", "rest apis"],
        "regex": r"\b(rest\s+apis?|restful\s+apis?|restful)\b"
    },
    "GraphQL": {
        "category": "Web & Backend",
        "aliases": ["graphql"],
        "regex": r"\b(graphql)\b"
    },
    "HTML/CSS": {
        "category": "Web & Backend",
        "aliases": ["html", "css", "html5", "css3"],
        "regex": r"\b(html5?|css3?)\b"
    },
    "Tailwind CSS": {
        "category": "Web & Backend",
        "aliases": ["tailwind", "tailwindcss"],
        "regex": r"\b(tailwind|tailwindcss)\b"
    },

    # Cloud, DevOps & Databases
    "Docker": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["docker", "containerization"],
        "regex": r"\b(docker|containerization)\b"
    },
    "Kubernetes": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["kubernetes", "k8s"],
        "regex": r"\b(kubernetes|k8s)\b"
    },
    "Amazon Web Services (AWS)": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["aws", "amazon web services", "ec2", "s3", "lambda"],
        "regex": r"\b(aws|amazon\s+web\s+services)\b"
    },
    "Google Cloud Platform (GCP)": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["gcp", "google cloud", "google cloud platform"],
        "regex": r"\b(gcp|google\s+cloud(\s+platform)?)\b"
    },
    "Microsoft Azure": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["azure", "microsoft azure"],
        "regex": r"\b(azure|microsoft\s+azure)\b"
    },
    "PostgreSQL": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["postgresql", "postgres"],
        "regex": r"\b(postgresql|postgres)\b"
    },
    "MySQL": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["mysql"],
        "regex": r"\b(mysql)\b"
    },
    "MongoDB": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["mongodb", "mongo"],
        "regex": r"\b(mongodb|mongo)\b"
    },
    "Redis": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["redis"],
        "regex": r"\b(redis)\b"
    },
    "Apache Kafka": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["kafka", "apache kafka"],
        "regex": r"\b(kafka|apache\s+kafka)\b"
    },
    "Elasticsearch": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["elasticsearch", "elastic search"],
        "regex": r"\b(elasticsearch|elastic\s+search)\b"
    },
    "CI/CD": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["ci/cd", "continuous integration", "github actions", "jenkins"],
        "regex": r"\b(ci/cd|ci-cd|continuous\s+integration|github\s+actions|jenkins)\b"
    },
    "Git & GitHub": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["git", "github", "gitlab"],
        "regex": r"\b(git|github|gitlab)\b"
    },
    "Linux": {
        "category": "Cloud, DevOps & Databases",
        "aliases": ["linux", "ubuntu", "bash", "shell scripting"],
        "regex": r"\b(linux|ubuntu|bash|shell\s+scripting)\b"
    },

    # Tools, Testing & Methodologies
    "Agile / Scrum": {
        "category": "Tools & Methodologies",
        "aliases": ["agile", "scrum", "kanban"],
        "regex": r"\b(agile|scrum|kanban)\b"
    },
    "JIRA": {
        "category": "Tools & Methodologies",
        "aliases": ["jira"],
        "regex": r"\b(jira)\b"
    },
    "Unit Testing": {
        "category": "Tools & Methodologies",
        "aliases": ["unit testing", "pytest", "jest", "junit", "tdd"],
        "regex": r"\b(unit\s+testing|pytest|jest|junit|tdd)\b"
    },
    "Data Structures & Algorithms": {
        "category": "Tools & Methodologies",
        "aliases": ["dsa", "data structures", "algorithms"],
        "regex": r"\b(dsa|data\s+structures(\s+and\s+algorithms)?)\b"
    },

    # Soft Skills
    "Problem Solving": {
        "category": "Soft Skills",
        "aliases": ["problem solving", "analytical thinking", "critical thinking"],
        "regex": r"\b(problem\s+solving|analytical\s+thinking|critical\s+thinking)\b"
    },
    "Team Collaboration": {
        "category": "Soft Skills",
        "aliases": ["collaboration", "teamwork", "team player", "cross-functional"],
        "regex": r"\b(collaboration|teamwork|team\s+player|cross-functional)\b"
    },
    "Communication Skills": {
        "category": "Soft Skills",
        "aliases": ["communication", "verbal communication", "written communication"],
        "regex": r"\b(communication(\s+skills)?)\b"
    },
    "Leadership": {
        "category": "Soft Skills",
        "aliases": ["leadership", "mentorship", "team lead"],
        "regex": r"\b(leadership|mentorship|team\s+lead)\b"
    }
}

# Compiled regex cache for high performance
COMPILED_PATTERNS = {
    canonical: re.compile(meta["regex"], 0 if meta.get("case_sensitive") else re.IGNORECASE)
    for canonical, meta in SKILL_TAXONOMY.items()
}

def normalize_skill(raw_skill: str) -> str:
    """
    Normalizes a skill name to its canonical taxonomy form.
    E.g. 'js' -> 'JavaScript', 'react.js' -> 'React', 'c++' -> 'C++'
    """
    cleaned = raw_skill.strip()
    if not cleaned:
        return ""
    
    # Check exact canonical first
    for canonical, meta in SKILL_TAXONOMY.items():
        if cleaned.lower() == canonical.lower():
            return canonical
        for alias in meta["aliases"]:
            if cleaned.lower() == alias.lower():
                return canonical
    
    # Try regex matching
    for canonical, pattern in COMPILED_PATTERNS.items():
        if pattern.search(cleaned):
            return canonical
            
    # If not in taxonomy, return title-cased trimmed version
    return cleaned.title()

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extracts all canonical skills found in the text using exact regex matching.
    Ensures 'Java' does not match 'JavaScript', 'C' does not match 'C++', etc.
    """
    if not text:
        return []
        
    found_skills: Set[str] = set()
    for canonical, pattern in COMPILED_PATTERNS.items():
        if pattern.search(text):
            found_skills.add(canonical)
            
    # Sort deterministically
    return sorted(list(found_skills))

def get_skill_category(skill_name: str) -> str:
    """Returns the taxonomy category for a canonical skill."""
    if skill_name in SKILL_TAXONOMY:
        return SKILL_TAXONOMY[skill_name]["category"]
    return "Other Technical Skills"

import logging
from typing import Tuple, Dict, Any, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class SimilarityEngine:
    def __init__(self):
        self.transformer_model = None
        self.transformer_loaded = False
        self.transformer_error = None
        self._init_sentence_transformer()

    def _init_sentence_transformer(self):
        try:
            from sentence_transformers import SentenceTransformer
            # Try loading or initializing all-MiniLM-L6-v2
            self.transformer_model = SentenceTransformer("all-MiniLM-L6-v2")
            self.transformer_loaded = True
            logger.info("SentenceTransformer (all-MiniLM-L6-v2) loaded successfully.")
        except Exception as e:
            self.transformer_loaded = False
            self.transformer_error = str(e)
            logger.warning(f"SentenceTransformer not loaded, falling back to TF-IDF semantic projection: {e}")

    def compute_tfidf_similarity(self, text_a: str, text_b: str) -> float:
        """
        Calculates TF-IDF Cosine Similarity between two texts.
        Token pattern preserves C++, C#, .NET, Node.js.
        """
        if not text_a.strip() or not text_b.strip():
            return 0.0

        try:
            # Custom token pattern to preserve technical tokens
            vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                stop_words="english",
                token_pattern=r"(?u)\b[a-zA-Z0-9+#\.]+\b"
            )
            tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
            sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            score = float(sim_matrix[0][0])
            return max(0.0, min(1.0, score))
        except Exception as e:
            logger.error(f"Error computing TF-IDF similarity: {e}")
            return 0.0

    def compute_semantic_similarity(self, text_a: str, text_b: str) -> Tuple[float, str]:
        """
        Calculates semantic similarity using Sentence Transformers if available,
        or TF-IDF n-gram sublinear semantic projection in fallback mode.
        Returns (similarity_score_0_to_1, engine_mode_description).
        """
        if not text_a.strip() or not text_b.strip():
            return 0.0, "Empty Input"

        if self.transformer_loaded and self.transformer_model is not None:
            try:
                embeddings = self.transformer_model.encode([text_a, text_b], convert_to_numpy=True)
                norm_a = np.linalg.norm(embeddings[0])
                norm_b = np.linalg.norm(embeddings[1])
                if norm_a > 0 and norm_b > 0:
                    cos_sim = float(np.dot(embeddings[0], embeddings[1]) / (norm_a * norm_b))
                    # Rescale slightly from [-1, 1] to [0, 1]
                    normalized_score = max(0.0, min(1.0, (cos_sim + 1.0) / 2.0))
                    return normalized_score, "SentenceTransformer (all-MiniLM-L6-v2)"
            except Exception as e:
                logger.warning(f"Error during SentenceTransformer inference, falling back: {e}")

        # High-quality fallback using character and word n-gram TF-IDF projection
        try:
            vec_word = TfidfVectorizer(ngram_range=(1, 3), sublinear_tf=True, stop_words="english")
            mat_word = vec_word.fit_transform([text_a, text_b])
            sim_word = float(cosine_similarity(mat_word[0:1], mat_word[1:2])[0][0])

            vec_char = TfidfVectorizer(ngram_range=(3, 5), analyzer="char_wb")
            mat_char = vec_char.fit_transform([text_a, text_b])
            sim_char = float(cosine_similarity(mat_char[0:1], mat_char[1:2])[0][0])

            # Blended sublinear similarity score
            score = 0.65 * sim_word + 0.35 * sim_char
            return max(0.0, min(1.0, score)), "TF-IDF & Sublinear N-gram Projection (Fallback Mode)"
        except Exception as e:
            logger.error(f"Fallback similarity error: {e}")
            return self.compute_tfidf_similarity(text_a, text_b), "Basic TF-IDF Cosine"

# Global singleton similarity engine
similarity_engine = SimilarityEngine()

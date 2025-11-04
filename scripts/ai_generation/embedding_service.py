from sentence_transformers import SentenceTransformer
import numpy as np

class EmbeddingService:
    def __init__(self):
        print("🔄 Chargement du modèle d'embeddings médical...")
        # Options de modèles médicaux (essayer dans l'ordre)
        medical_models = [
            'dmis-lab/biobert-base-cased-v1.2',  # BioBERT médical
            'microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext',  # PubMedBERT
            'allenai/scibert_scivocab_uncased',  # SciBERT
            'all-MiniLM-L6-v2'  # Fallback générique
        ]
        
        for model_name in medical_models:
            try:
                print(f"  Essai: {model_name}...")
                self.model = SentenceTransformer(model_name)
                print(f"✅ Modèle chargé: {model_name}")
                break
            except Exception as e:
                print(f"  ⚠️ Échec {model_name}: {str(e)[:50]}")
                continue
    
    def embed(self, text: str) -> np.ndarray:
        """Calcule l'embedding d'un texte"""
        return self.model.encode(text, normalize_embeddings=True)
    
    def cosine_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Calcule la similarité cosinus entre deux embeddings"""
        return float(np.dot(emb1, emb2))
    
    def validate_similarity(self, question: str, context: str, threshold: float = 0.60) -> dict:
        """Valide qu'une question est similaire au contexte source (seuil ajusté à 0.60)"""
        emb_question = self.embed(question)
        emb_context = self.embed(context)
        
        similarity = self.cosine_similarity(emb_question, emb_context)
        
        return {
            "valid": similarity >= threshold,
            "score": similarity,
            "threshold": threshold
        }


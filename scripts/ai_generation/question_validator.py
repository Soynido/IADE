import json
from embedding_service import EmbeddingService

class QuestionValidator:
    def __init__(self):
        self.embedding_service = EmbeddingService()
    
    def validate_question(self, question: dict, concept: dict, with_answers: bool = False) -> dict:
        """
        Valide une question générée
        
        Args:
            question: Dictionnaire contenant la question générée
            concept: Dictionnaire contenant le concept de référence
            with_answers: Si True, valide aussi la cohérence de la réponse/explication
        
        Returns:
            Dictionnaire de validation avec scores et issues
        """
        
        issues = []
        scores = {}
        
        # 1. Similarité sémantique avec le concept (Question)
        sim_result = self.embedding_service.validate_similarity(
            question["question"],
            concept["context"]
        )
        scores["semantic_similarity_q"] = sim_result["score"]
        
        if not sim_result["valid"]:
            issues.append(f"Similarité Q trop faible: {sim_result['score']:.2f} < 0.60")
        
        # 2. Similarité sémantique de la réponse/explication (si with_answers activé)
        if with_answers and "explanation" in question and question["explanation"]:
            # Vérifier la cohérence de l'explication avec le concept
            explanation_sim = self.embedding_service.validate_similarity(
                question["explanation"],
                concept["context"],
                threshold=0.55  # Seuil légèrement plus bas pour l'explication
            )
            scores["semantic_similarity_a"] = explanation_sim["score"]
            
            if not explanation_sim["valid"]:
                issues.append(f"Similarité réponse trop faible: {explanation_sim['score']:.2f} < 0.55")
            
            # Vérifier aussi la cohérence entre la question et l'explication
            q_to_a_sim = self.embedding_service.validate_similarity(
                question["question"],
                question["explanation"],
                threshold=0.50
            )
            scores["q_to_a_coherence"] = q_to_a_sim["score"]
            
            if not q_to_a_sim["valid"]:
                issues.append(f"Cohérence Q↔A faible: {q_to_a_sim['score']:.2f} < 0.50")
        else:
            scores["semantic_similarity_a"] = 0.0
            scores["q_to_a_coherence"] = 0.0
        
        # 3. Présence des keywords
        keywords_found = sum(
            1 for kw in concept["keywords"]
            if kw.lower() in question["question"].lower() or
               kw.lower() in question.get("explanation", "").lower()
        )
        scores["keywords_coverage"] = keywords_found / len(concept["keywords"]) if len(concept["keywords"]) > 0 else 0
        
        if keywords_found == 0:
            issues.append("Aucun keyword du concept présent")
        
        # 4. Validation des choix
        choices_validation = self.validate_choices(question)
        scores["choices_quality"] = 1.0 if choices_validation["valid"] else 0.5
        
        if not choices_validation["valid"]:
            issues.extend(choices_validation["issues"])
        
        # 5. Validation format
        format_validation = self.validate_format(question)
        scores["format_quality"] = 1.0 if format_validation["valid"] else 0.5
        
        if not format_validation["valid"]:
            issues.extend(format_validation["issues"])
        
        # Score global pondéré (ajusté si with_answers activé)
        if with_answers and scores["semantic_similarity_a"] > 0:
            overall_score = (
                scores["semantic_similarity_q"] * 0.25 +
                scores["semantic_similarity_a"] * 0.25 +
                scores["q_to_a_coherence"] * 0.15 +
                scores["keywords_coverage"] * 0.15 +
                scores["choices_quality"] * 0.10 +
                scores["format_quality"] * 0.10
            )
        else:
        overall_score = (
                scores["semantic_similarity_q"] * 0.40 +
            scores["keywords_coverage"] * 0.25 +
            scores["choices_quality"] * 0.20 +
            scores["format_quality"] * 0.15
        )
        
        return {
            "valid": overall_score >= 0.75 and len(issues) == 0,
            "overall_score": overall_score,
            "scores": scores,
            "issues": issues,
            "threshold_met": overall_score >= 0.75
        }
    
    def validate_choices(self, question: dict) -> dict:
        """Valide la qualité des choix"""
        issues = []
        
        choices = question.get("choices", [])
        correct = question.get("correct", "")
        
        # Nombre de choix
        if len(choices) != 4:
            issues.append(f"Nombre de choix incorrect: {len(choices)} au lieu de 4")
        
        # Une seule bonne réponse
        correct_count = sum(1 for c in choices if c == correct)
        if correct_count != 1:
            issues.append(f"Nombre de bonnes réponses incorrect: {correct_count}")
        
        # Pas de doublons
        if len(set(choices)) != len(choices):
            issues.append("Choix dupliqués détectés")
        
        # Longueurs cohérentes
        if len(choices) > 0:
            lengths = [len(c) for c in choices]
            avg_length = sum(lengths) / len(lengths)
            if max(lengths) > avg_length * 2.5:
                issues.append("Longueurs de choix trop inégales")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }
    
    def validate_format(self, question: dict) -> dict:
        """Valide le format de la question"""
        issues = []
        
        q_text = question.get("question", "")
        explanation = question.get("explanation", "")
        
        # Question se termine par ?
        if not q_text.endswith("?"):
            issues.append("Question ne se termine pas par ?")
        
        # Longueur minimale
        if len(q_text) < 20:
            issues.append("Question trop courte")
        
        # Explication présente
        if len(explanation) < 30:
            issues.append("Explication trop courte ou absente")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }


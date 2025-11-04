import json
import sys
import argparse
from question_validator import QuestionValidator

def validate_batch(generated_path: str, ground_truth_path: str, output_path: str, with_answers: bool = False):
    """
    Valide un batch de questions générées
    
    Args:
        generated_path: Chemin vers le fichier de questions générées
        ground_truth_path: Chemin vers le fichier groundTruth.json
        output_path: Chemin de sortie pour les questions validées
        with_answers: Si True, active la validation sémantique bilatérale Q+R
    """
    
    mode_str = "avec validation Q+R" if with_answers else "questions uniquement"
    print(f"🔄 Validation des questions générées ({mode_str})...\n")
    
    # Charger
    with open(generated_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    with open(ground_truth_path, 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    
    # Créer index des concepts
    concepts_index = {c["id"]: c for c in concepts}
    
    # Valider
    validator = QuestionValidator()
    validated_questions = []
    
    stats = {
        "total": len(questions),
        "accepted": 0,
        "rejected": 0,
        "avg_score": 0,
        "avg_q_similarity": 0,
        "avg_a_similarity": 0,
        "avg_qa_coherence": 0
    }
    
    scores_sum = 0
    q_sim_sum = 0
    a_sim_sum = 0
    qa_coh_sum = 0
    
    for i, question in enumerate(questions):
        concept = concepts_index.get(question.get("concept_id"))
        
        if not concept:
            print(f"[{i+1}] ⚠️ Concept non trouvé")
            stats["rejected"] += 1
            continue
        
        validation = validator.validate_question(question, concept, with_answers=with_answers)
        
        # Affichage détaillé si with_answers
        if with_answers:
            q_sim = validation['scores'].get('semantic_similarity_q', 0)
            a_sim = validation['scores'].get('semantic_similarity_a', 0)
            qa_coh = validation['scores'].get('q_to_a_coherence', 0)
            print(f"[{i+1}] {'✅' if validation['valid'] else '❌'} Score: {validation['overall_score']:.2f} | Q:{q_sim:.2f} A:{a_sim:.2f} Q↔A:{qa_coh:.2f}")
            q_sim_sum += q_sim
            a_sim_sum += a_sim
            qa_coh_sum += qa_coh
        else:
            print(f"[{i+1}] {'✅' if validation['valid'] else '❌'} Score: {validation['overall_score']:.2f}")
        
        if validation["issues"]:
            for issue in validation["issues"]:
                print(f"      ⚠️ {issue}")
        
        if validation["valid"]:
            question["validation"] = validation
            validated_questions.append(question)
            stats["accepted"] += 1
        else:
            stats["rejected"] += 1
        
        scores_sum += validation["overall_score"]
    
    stats["avg_score"] = scores_sum / stats["total"] if stats["total"] > 0 else 0
    
    if with_answers and stats["total"] > 0:
        stats["avg_q_similarity"] = q_sim_sum / stats["total"]
        stats["avg_a_similarity"] = a_sim_sum / stats["total"]
        stats["avg_qa_coherence"] = qa_coh_sum / stats["total"]
    
    # Sauvegarder
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(validated_questions, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 RÉSULTATS VALIDATION ({mode_str})")
    print(f"  Total: {stats['total']}")
    print(f"  Acceptées: {stats['accepted']} ({stats['accepted']/stats['total']*100:.1f}%)")
    print(f"  Rejetées: {stats['rejected']} ({stats['rejected']/stats['total']*100:.1f}%)")
    print(f"  Score moyen: {stats['avg_score']:.2f}")
    
    if with_answers and stats["total"] > 0:
        print(f"\n  📈 SCORES DÉTAILLÉS (avec --with-answers)")
        print(f"  Similarité Q moyenne: {stats['avg_q_similarity']:.2f}")
        print(f"  Similarité A moyenne: {stats['avg_a_similarity']:.2f}")
        print(f"  Cohérence Q↔A moyenne: {stats['avg_qa_coherence']:.2f}")
    
    print(f"\n  💾 Fichier: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Valide un batch de questions générées avec scores sémantiques"
    )
    parser.add_argument(
        "--generated",
        default="src/data/questions-generated.json",
        help="Chemin vers le fichier de questions générées"
    )
    parser.add_argument(
        "--ground-truth",
        default="src/data/groundTruth.json",
        help="Chemin vers le fichier groundTruth.json"
    )
    parser.add_argument(
        "--output",
        default="src/data/questions-validated.json",
        help="Chemin de sortie pour les questions validées"
    )
    parser.add_argument(
        "--with-answers",
        action="store_true",
        help="Active la validation sémantique bilatérale Q+R (question + réponse/explication)"
    )
    
    args = parser.parse_args()
    
    validate_batch(
        args.generated,
        args.ground_truth,
        args.output,
        with_answers=args.with_answers
    )


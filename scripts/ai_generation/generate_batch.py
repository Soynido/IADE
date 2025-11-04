import json
import sys
from ollama_client import OllamaClient
from prompt_builder import build_qcm_prompt, build_clinical_case_prompt

def generate_batch(ground_truth_path: str, output_path: str, count: int = 50):
    """Génère un batch de questions via Ollama"""
    
    print(f"🔄 Génération de {count} questions via Ollama...")
    
    # Charger le ground truth
    with open(ground_truth_path, 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    
    # Initialiser Ollama
    client = OllamaClient(model="mistral")
    
    generated_questions = []
    stats = {
        "total": 0,
        "success": 0,
        "failed": 0
    }
    
    for i, concept in enumerate(concepts[:count]):
        print(f"\n[{i+1}/{count}] 🧠 {concept['concept']} ({concept['domain']})")
        
        # Type de question (70% QCM, 30% Cas Clinique)
        question_type = "qcm" if i % 10 < 7 else "clinical_case"
        
        prompt = build_qcm_prompt(concept) if question_type == "qcm" else build_clinical_case_prompt(concept)
        
        # Générer
        response = client.generate(prompt)
        
        stats["total"] += 1
        
        if "error" in response:
            print(f"  ❌ Échec: {response.get('error')}")
            stats["failed"] += 1
            continue
        
        # Valider le format
        if not all(k in response for k in ["question", "choices", "correct", "explanation"]):
            print(f"  ⚠️ Format incomplet")
            stats["failed"] += 1
            continue
        
        # Ajouter métadonnées
        response["id"] = f"ai_gen_{i+1}"
        response["source"] = "ai-generated"
        response["generator"] = "ollama-meditron"
        response["domain"] = concept["domain"]
        response["concept_id"] = concept["id"]
        response["type"] = question_type
        
        generated_questions.append(response)
        stats["success"] += 1
        
        print(f"  ✅ Question générée")
    
    # Sauvegarder
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(generated_questions, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 RÉSULTATS")
    print(f"  Total: {stats['total']}")
    print(f"  Succès: {stats['success']} ({stats['success']/stats['total']*100:.1f}%)")
    print(f"  Échecs: {stats['failed']}")
    print(f"  Fichier: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        count = 50
    else:
        count = int(sys.argv[1])
    
    generate_batch(
        "src/data/groundTruth.json",
        "src/data/questions-generated.json",
        count
    )


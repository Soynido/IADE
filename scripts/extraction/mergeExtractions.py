import json
import sys

def merge_extractions(semantic_path: str, layout_path: str, output_path: str):
    """Fusionne les extractions sémantique et layout"""
    print("🔄 Fusion des extractions...")
    
    with open(semantic_path, 'r', encoding='utf-8') as f:
        semantic = json.load(f)
    
    with open(layout_path, 'r', encoding='utf-8') as f:
        layout = json.load(f)
    
    # Construction de la structure enrichie
    enriched = {
        "source": semantic["source"],
        "chapters": []
    }
    
    current_chapter = None
    
    # Utiliser les titres détectés pour structurer
    for title_info in semantic["content"]["titles"]:
        if title_info["level"] == 1:
            # Nouveau chapitre
            if current_chapter:
                enriched["chapters"].append(current_chapter)
            
            current_chapter = {
                "title": title_info["text"],
                "sections": []
            }
        elif title_info["level"] == 2 and current_chapter:
            # Nouvelle section
            current_chapter["sections"].append({
                "title": title_info["text"],
                "content": []
            })
    
    # Ajouter le dernier chapitre
    if current_chapter:
        enriched["chapters"].append(current_chapter)
    
    # Ajouter le contenu (paragraphes, listes)
    for chapter in enriched["chapters"]:
        for section in chapter["sections"]:
            # Trouver les paragraphes pertinents
            relevant_paragraphs = [
                p for p in semantic["content"]["paragraphs"]
                if len(p) > 50  # Filtrer les fragments
            ]
            section["content"] = relevant_paragraphs[:5]  # Limiter pour perf
    
    # Ajouter les listes
    enriched["lists"] = semantic["content"]["lists"]
    enriched["tables"] = semantic["content"]["tables"]
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Fusion terminée : {output_path}")
    print(f"   Chapitres: {len(enriched['chapters'])}")
    return enriched

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python mergeExtractions.py <semantic.json> <layout.json> <output.json>")
        sys.exit(1)
    
    merge_extractions(sys.argv[1], sys.argv[2], sys.argv[3])


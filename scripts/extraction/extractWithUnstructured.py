from unstructured.partition.pdf import partition_pdf
import json
import sys

def extract_semantic_structure(pdf_path: str, output_path: str):
    """Extrait la structure hiérarchique (titres, paragraphes, listes, tableaux)"""
    print(f"🔄 Extraction sémantique de {pdf_path}...")
    
    elements = partition_pdf(pdf_path)
    
    result = {
        "source": pdf_path,
        "type": "semantic",
        "content": {
            "titles": [],
            "paragraphs": [],
            "lists": [],
            "tables": []
        }
    }
    
    for element in elements:
        if element.category == "Title":
            result["content"]["titles"].append({
                "text": element.text,
                "level": detect_title_level(element.text)
            })
        elif element.category == "NarrativeText":
            result["content"]["paragraphs"].append(element.text)
        elif element.category == "ListItem":
            result["content"]["lists"].append(element.text)
        elif element.category == "Table":
            result["content"]["tables"].append(element.text)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Extraction terminée : {output_path}")
    return result

def detect_title_level(text: str) -> int:
    """Détecte le niveau de titre (1-3)"""
    if text.isupper() and len(text) < 50:
        return 1
    elif text[0].isupper() and len(text) < 100:
        return 2
    return 3

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extractWithUnstructured.py <input.pdf> <output.json>")
        sys.exit(1)
    
    extract_semantic_structure(sys.argv[1], sys.argv[2])


import fitz  # PyMuPDF
import json
import sys

def extract_layout_structure(pdf_path: str, output_path: str):
    """Extrait les blocs de texte avec leurs positions spatiales"""
    print(f"🔄 Extraction layout de {pdf_path}...")
    
    doc = fitz.open(pdf_path)
    
    result = {
        "source": pdf_path,
        "type": "layout",
        "pages": []
    }
    
    for page_num, page in enumerate(doc):
        blocks = page.get_text("blocks")
        
        page_data = {
            "page_num": page_num + 1,
            "blocks": [],
            "detected_titles": []
        }
        
        for block in blocks:
            x0, y0, x1, y1, text, block_no, block_type = block
            
            block_info = {
                "text": text.strip(),
                "x": x0,
                "y": y0,
                "width": x1 - x0,
                "height": y1 - y0
            }
            
            page_data["blocks"].append(block_info)
            
            # Détection de titres (heuristique)
            if is_likely_title(block_info):
                page_data["detected_titles"].append(text.strip())
        
        result["pages"].append(page_data)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Extraction terminée : {output_path}")
    return result

def is_likely_title(block_info: dict) -> bool:
    """Détecte si un bloc est probablement un titre"""
    text = block_info["text"]
    # Heuristiques : court, majuscules, position haute
    return (
        len(text) < 100 and
        (text.isupper() or text[0].isupper()) and
        block_info["y"] < 200
    )

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extractWithPyMuPDF.py <input.pdf> <output.json>")
        sys.exit(1)
    
    extract_layout_structure(sys.argv[1], sys.argv[2])


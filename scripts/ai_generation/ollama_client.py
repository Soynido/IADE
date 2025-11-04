import subprocess
import json
import time

class OllamaClient:
    def __init__(self, model="mistral"):
        """
        Modèles disponibles:
        - mistral (généraliste FR - INSTALLÉ)
        - meditron (recommandé médical - nécessite installation custom)
        - biomistral (alternative FR pharma)
        """
        self.model = model
    
    def generate(self, prompt: str, max_retries: int = 2) -> dict:
        """Génère du contenu via Ollama avec retry automatique"""
        for attempt in range(max_retries):
            try:
                result = subprocess.run(
                    ["ollama", "run", self.model, prompt],
                    capture_output=True,
                    text=True,
                    timeout=90  # Augmenté à 90s
                )
                
                if result.returncode == 0:
                    response = result.stdout.strip()
                    parsed = self._parse_json_response(response)
                    
                    # Vérifier que le JSON est valide
                    if "error" not in parsed:
                        # Validation supplémentaire
                        if self._is_valid_question(parsed):
                            return parsed
                        else:
                            print(f"  ⚠️ JSON incomplet (tentative {attempt + 1})")
                    else:
                        print(f"  ⚠️ JSON invalide (tentative {attempt + 1})")
                else:
                    print(f"  ❌ Erreur Ollama (tentative {attempt + 1})")
            
            except subprocess.TimeoutExpired:
                print(f"  ⏱️ Timeout 90s (tentative {attempt + 1})")
            except Exception as e:
                print(f"  ⚠️ Erreur: {e} (tentative {attempt + 1})")
            
            # Sleep entre tentatives pour éviter surcharge CPU
            if attempt < max_retries - 1:
                time.sleep(0.5)
        
        return {"error": "Max retries exceeded"}
    
    def _parse_json_response(self, response: str) -> dict:
        """Parse la réponse JSON du modèle avec nettoyage agressif"""
        try:
            # Nettoyer les marqueurs markdown
            response = response.replace('```json', '').replace('```', '').strip()
            
            # Extraire le JSON (parfois entouré de texte)
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = response[start:end]
                parsed = json.loads(json_str)
                return parsed
            else:
                return {"error": "No JSON found"}
        
        except json.JSONDecodeError as e:
            return {"error": f"Invalid JSON: {str(e)}"}
        except Exception as e:
            return {"error": f"Parse error: {str(e)}"}
    
    def _is_valid_question(self, data: dict) -> bool:
        """Vérifie que la question générée est complète"""
        required_fields = ["question", "choices", "correct", "explanation"]
        
        # Vérifier présence des champs
        if not all(field in data for field in required_fields):
            return False
        
        # Vérifier que choices est une liste de 4 éléments
        if not isinstance(data["choices"], list) or len(data["choices"]) != 4:
            return False
        
        # Vérifier que correct est dans choices
        if data["correct"] not in data["choices"]:
            return False
        
        # Vérifier longueurs minimales
        if len(data["question"]) < 20 or len(data["explanation"]) < 30:
            return False
        
        return True


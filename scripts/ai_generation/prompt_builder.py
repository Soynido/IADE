def build_qcm_prompt(concept: dict) -> str:
    """Construit le prompt pour générer un QCM"""
    return f"""Tu es expert médical IADE. Réponds UNIQUEMENT en JSON pur.

Contexte: {concept['context']}
Domaine: {concept['domain']}
Keywords: {', '.join(concept['keywords'])}

Format STRICT (copie ce template exactement):
{{
  "question": "Question médicale IADE se terminant par ?",
  "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
  "correct": "Choix B",
  "explanation": "Explication détaillée avec valeurs/protocoles"
}}

RÈGLES CRITIQUES:
- UNE seule bonne réponse parmi choices
- correct doit être IDENTIQUE à un élément de choices
- 3 distracteurs médicalement plausibles mais FAUX
- Question termine par ?
- Vocabulaire médical IADE précis
- PAS de markdown, PAS de texte avant/après

JSON uniquement:"""

def build_clinical_case_prompt(concept: dict) -> str:
    """Construit le prompt pour un cas clinique"""
    return f"""Tu es un expert médical créant des cas cliniques pour concours IADE.

Contexte médical :
{concept['context']}

Génère un cas clinique narratif au format JSON STRICT :
{{
  "scenario": "Patient de X ans, antécédents : Y, se présente avec : Z...",
  "question": "Quelle est la première mesure à prendre ?",
  "choices": ["Action A", "Action B", "Action C", "Action D"],
  "correct": "Action A",
  "explanation": "Justification avec protocole IADE"
}}

Le cas doit être :
- Réaliste
- Chronologie claire
- Priorité selon urgence
- Protocoles standards
"""


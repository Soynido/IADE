# 🎯 AMÉLIORATION QUESTIONS IADE - Batch 3

**Mission**: Tu es un expert en pédagogie médicale spécialisé dans les concours IADE (Infirmier Anesthésiste Diplômé d'État).

**Objectif**: Transformer ces 10 questions brutes en questions **brillantes** de concours.

═══════════════════════════════════════════════════════════
## CRITÈRES D'UNE QUESTION BRILLANTE
═══════════════════════════════════════════════════════════

### 1. TEXTE (Question)
- ✅ Clair, précis, sans artefacts OCR
- ✅ Contexte médical complet
- ✅ Question bien formulée avec point d'interrogation
- ✅ Longueur: 30-200 caractères

### 2. OPTIONS (Réponses)
- ✅ 4 options distinctes et non ambiguës
- ✅ 1 seule réponse correcte évidente
- ✅ 3 distracteurs plausibles mais incorrects
- ❌ Pas de "Toutes les réponses" ou "Aucune réponse"

### 3. EXPLICATION
- ✅ Détaillée: **150-300 caractères minimum**
- ✅ Contexte clinique précis
- ✅ Références physiologiques/pharmacologiques
- ✅ Valeur pédagogique élevée
- ❌ **JAMAIS** générique ("Cette notion est essentielle...")

### 4. MÉTADONNÉES
- ✅ Thème précis: Pharmacologie, Neurologie, Réanimation, Urgences, etc.
- ✅ Difficulté réaliste: base, intermediate, advanced

═══════════════════════════════════════════════════════════
## EXEMPLE DE TRANSFORMATION
═══════════════════════════════════════════════════════════

### AVANT (Brut) ❌
```json
{
  "text": "Quelle est la définition correcte de Somatosensitif\" ?",
  "options": [
    "A alpha (I) et A gamma (II)",
    "Mécanisme d'inhibition",
    "A alpha (I), A beta ( II)",
    "Processus d'activation"
  ],
  "correctAnswer": 0,
  "explanation": "La réponse correcte est: A alpha (I) et A gamma (II). Cette notion est essentielle.",
  "theme": "Général"
}
```

### APRÈS (Brillant) ✅
```json
{
  "text": "Quelles sont les fibres nerveuses impliquées dans la transmission somatosensorielle ?",
  "options": [
    "Fibres A alpha (groupe I) et A gamma (groupe II) - transmission proprioceptive rapide",
    "Fibres A delta et C uniquement - transmission nociceptive lente",
    "Fibres B - transmission autonome du système nerveux végétatif",
    "Fibres motrices efférentes uniquement - innervation musculaire"
  ],
  "correctAnswer": 0,
  "explanation": "Les fibres somatosensorielles comprennent les fibres A alpha (groupe I, diamètre 12-20µm, vitesse 70-120 m/s) qui transmettent la proprioception et le toucher discriminatif, et les fibres A gamma (groupe II, diamètre 4-12µm, vitesse 30-70 m/s) qui innervent les fuseaux neuromusculaires. En anesthésie locorégionale, leur bloc différentiel explique la perte progressive de sensibilités lors d'une rachianesthésie.",
  "theme": "Neurologie",
  "difficulty": "intermediate",
  "themes": ["Neurologie", "Physiologie", "Anesthésie"]
}
```

**Améliorations** :
- ✅ Texte reformulé clairement
- ✅ Options complètes et contextualisées
- ✅ Explication détaillée (250+ chars) avec valeurs précises
- ✅ Thème précis + difficulté adaptée

═══════════════════════════════════════════════════════════
## QUESTIONS À AMÉLIORER (Batch 3)
═══════════════════════════════════════════════════════════

[
  {
    "num": 1,
    "text": "Vous êtes infirmier en salle de réveil et recevez M. M. opéré d'une thyroïdectomie. Quels sont les principaux risques encourus ?",
    "options": [
      "Hématome compressif, lésion nerf récurrent (aphonie), atteinte bilatérale (difficulté respiratoire), lésions nerfs phrénique/laryngé",
      "Seulement douleur",
      "Pas de risque",
      "Complications bénignes"
    ],
    "correctAnswer": 0,
    "explanation": "Risque hématome compressif (urgence vitale). Lésion nerf récurrent (aphonie). Atteinte bilatérale (difficulté respiratoire). Lésion nerf phrénique (paralysie diaphragme). Lésion nerf laryngé (troubles déglutition). Risque douleur et infectieux.",
    "theme": "Chirurgie",
    "difficulty": "medium"
  },
  {
    "num": 2,
    "text": "Quels sont les moyens de l'organisme pour réguler la tension ? Citez-en un à court, moyen et long terme.",
    "options": [
      "Court : barorécepteurs | Moyen : facteur natriurétique | Long : système rénine-angiotensine-aldostérone",
      "Seulement rénine",
      "Pas de régulation",
      "Variables"
    ],
    "correctAnswer": 0,
    "explanation": "Court terme : barorécepteurs (sinus carotidien, crosse aortique, oreillette droite). Moyen : facteur natriurétique. Long terme : système rénine-angiotensine-aldostérone.",
    "theme": "Hémodynamique",
    "difficulty": "hard"
  },
  {
    "num": 3,
    "text": "Quel est le mécanisme d'action de la morphine ?",
    "options": [
      "Agoniste des récepteurs opioïdes mu",
      "Antagoniste des récepteurs GABA",
      "Inhibiteur de la COX-2",
      "Bloqueur des canaux calciques"
    ],
    "correctAnswer": 0,
    "explanation": "La morphine est un agoniste des récepteurs opioïdes mu, entraînant analgésie, sédation et dépression respiratoire.",
    "theme": "Pharmacologie",
    "difficulty": "medium"
  },
  {
    "num": 4,
    "text": "Quelle est la classe thérapeutique du paracétamol ?",
    "options": [
      "Antalgique de palier 1 (non opioïde)",
      "Anti-inflammatoire stéroïdien",
      "Antalgique de palier 3 (opioïde fort)",
      "Antibiotique"
    ],
    "correctAnswer": 0,
    "explanation": "Le paracétamol est un antalgique de palier 1 selon l'OMS. Antipyrétique mais pas anti-inflammatoire.",
    "theme": "Pharmacologie",
    "difficulty": "medium"
  },
  {
    "num": 5,
    "text": "Quelle est la norme de la créatininémie chez l'adulte ?",
    "options": [
      "Homme: 60-110 µmol/L | Femme: 45-90 µmol/L",
      "Homme: 200-300 µmol/L | Femme: 150-250 µmol/L",
      "Identique pour tous: 100 µmol/L",
      "Variable selon l'heure de prélèvement"
    ],
    "correctAnswer": 0,
    "explanation": "Créatininémie normale: Homme 60-110 µmol/L, Femme 45-90 µmol/L. Marqueur de la fonction rénale.",
    "theme": "Normes biologiques",
    "difficulty": "easy"
  },
  {
    "num": 6,
    "text": "Quelle est la norme de la glycémie à jeun ?",
    "options": [
      "0,7-1,1 g/L (3,9-6,1 mmol/L)",
      "1,5-2,0 g/L",
      "0,3-0,5 g/L",
      "Variable sans limite"
    ],
    "correctAnswer": 0,
    "explanation": "Glycémie à jeun normale: 0,7-1,1 g/L. Diabète si ≥ 1,26 g/L à 2 reprises.",
    "theme": "Normes biologiques",
    "difficulty": "easy"
  },
  {
    "num": 7,
    "text": "En cas d'arrêt cardiaque, quelle est la séquence RCP selon les recommandations ERC 2021 ?",
    "options": [
      "30 compressions thoraciques : 2 insufflations",
      "15 compressions thoraciques : 2 insufflations",
      "5 compressions thoraciques : 1 insufflation",
      "Compressions continues sans insufflations"
    ],
    "correctAnswer": 0,
    "explanation": "RCP adulte: 30:2 (30 compressions thoraciques pour 2 insufflations). Fréquence 100-120/min, profondeur 5-6 cm.",
    "theme": "Urgences",
    "difficulty": "hard"
  },
  {
    "num": 8,
    "text": "Quelle est la dose initiale d'adrénaline en arrêt cardiaque ?",
    "options": [
      "1 mg IV/IO toutes les 3-5 minutes",
      "0,1 mg IV unique",
      "10 mg IV toutes les 10 minutes",
      "0,5 mg IM"
    ],
    "correctAnswer": 0,
    "explanation": "Adrénaline en ACR: 1 mg IV/IO toutes les 3-5 minutes. Première dose dès que possible après le 3ème choc.",
    "theme": "Urgences",
    "difficulty": "hard"
  },
  {
    "num": 9,
    "text": "Précisez le mécanisme d'action de la morphine ?",
    "options": [
      "Agoniste des récepteurs opioïdes mu",
      "Antagoniste des récepteurs GABA",
      "Inhibiteur de la COX-2",
      "Bloqueur des canaux calciques"
    ],
    "correctAnswer": 0,
    "explanation": "La morphine est un agoniste des récepteurs opioïdes mu, entraînant analgésie, sédation et dépression respiratoire.",
    "theme": "Pharmacologie",
    "difficulty": "medium"
  },
  {
    "num": 10,
    "text": "Indiquez la classe thérapeutique du paracétamol ?",
    "options": [
      "Antalgique de palier 1 (non opioïde)",
      "Anti-inflammatoire stéroïdien",
      "Antalgique de palier 3 (opioïde fort)",
      "Antibiotique"
    ],
    "correctAnswer": 0,
    "explanation": "Le paracétamol est un antalgique de palier 1 selon l'OMS. Antipyrétique mais pas anti-inflammatoire.",
    "theme": "Pharmacologie",
    "difficulty": "medium"
  }
]

═══════════════════════════════════════════════════════════
## FORMAT DE RÉPONSE
═══════════════════════════════════════════════════════════

Réponds avec un JSON valide contenant les 10 questions améliorées :

```json
[
  {
    "num": 1,
    "text": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "...",
    "theme": "...",
    "difficulty": "base|intermediate|advanced",
    "themes": ["...", "..."]
  },
  ...
]
```

═══════════════════════════════════════════════════════════
## RÈGLES IMPORTANTES
═══════════════════════════════════════════════════════════

✅ **FAIRE** :
- Reformuler pour clarté maximale
- Ajouter contexte clinique pertinent
- Expliquer le "pourquoi" médical
- Utiliser terminologie IADE précise
- Donner valeurs/normes si pertinent
- Explication minimum 150 caractères

❌ **NE PAS FAIRE** :
- Garder artefacts OCR
- Laisser texte vague/incomplet
- Utiliser explications génériques
- Créer options ambiguës
- Oublier le contexte clinique

═══════════════════════════════════════════════════════════

🎯 **À TOI ! Transforme ces 10 questions en questions brillantes !**

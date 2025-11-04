# 🎯 AMÉLIORATION QUESTIONS IADE - Batch 2

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
## QUESTIONS À AMÉLIORER (Batch 2)
═══════════════════════════════════════════════════════════

[
  {
    "num": 1,
    "text": "À la lecture de l'ECG, le médecin voit un sus-décalage du segment ST. De quoi semble souffrir le patient ? Citez les médicaments utilisés.",
    "options": [
      "Syndrome coronarien aigu | Aspegic, clopidogrel, métalyse, morphine",
      "Bronchite, antibiotiques",
      "Gastrite, antiacides",
      "Pas de traitement"
    ],
    "correctAnswer": 0,
    "explanation": "Sus-décalage ST évoque syndrome coronarien aigu. Traitements : antiagrégant plaquettaire (aspegic), bloqueur récepteur ADP (clopidogrel), fibrinolytique (métalyse), paracétamol, morphine.",
    "theme": "Cardiologie",
    "difficulty": "hard"
  },
  {
    "num": 2,
    "text": "Donnez le volume sanguin moyen d'un adulte.",
    "options": [
      "5 à 6 litres",
      "3 à 4 litres",
      "10 à 12 litres",
      "Pas de volume standard"
    ],
    "correctAnswer": 0,
    "explanation": "Le volume sanguin moyen d'un adulte est d'environ 5L à 6L.",
    "theme": "Hématologie",
    "difficulty": "easy"
  },
  {
    "num": 3,
    "text": "Citez les éléments figurés du sang et donnez leurs normes.",
    "options": [
      "Hématies: 4-5.5M/mm³ | Leucocytes: 4000-10000/mm³ | Plaquettes: 150000-400000/mm³",
      "Tous identiques",
      "Pas de normes",
      "Variables selon l'humeur"
    ],
    "correctAnswer": 0,
    "explanation": "Hématies : 4,0 à 5,5 millions/mm³. Leucocytes : 4000 à 10000/mm³. Plaquettes : 150000 à 400000/mm³.",
    "theme": "Hématologie",
    "difficulty": "easy"
  },
  {
    "num": 4,
    "text": "Vous êtes infirmière en service de pneumologie et vous avez en charge Mr G., patient BPCO. À l'arrivée dans la chambre, vous voyez qu'il a une saturation à 94% sous O₂ 2L/min. L'étudiant que vous encadrez vous propose d'augmenter à 6L/min pour améliorer sa saturation. Que lui répondez-vous ?",
    "options": [
      "Accepter l'augmentation du débit",
      "Refuser car le risque d'hypoventilation existe chez le BPCO",
      "Surveiller sans modifier",
      "Proposer une intubation préventive"
    ],
    "correctAnswer": 1,
    "explanation": "Chez le patient BPCO, la capnie est élevée. Un patient BPCO ne réagit qu'à l'hypoxie. Si on met trop d'oxygène, les récepteurs stimulent moins les centres respiratoires. Le patient respire moins vite, sa bradypnée entraîne augmentation PCO₂ et aggrave acidose.",
    "theme": "Pneumologie",
    "difficulty": "medium"
  },
  {
    "num": 5,
    "text": "Un patient doit recevoir 24 000 UI/24h d'héparine à l'aide d'un pousse-seringue électrique. Vous disposez de seringues de 50 ml renouvelées toutes les 6h et de flacons de 5 ml d'héparine (25 000 UI). Indiquez le débit horaire.",
    "options": [
      "1 ml/h",
      "8 ml/h",
      "16,7 ml/h",
      "24 ml/h"
    ],
    "correctAnswer": 1,
    "explanation": "24 000 UI/24h = 1000 UI/h = 6000 UI/6h. Avec 1 ml = 5000 UI, on a 6000 UI = 1,2 ml d'héparine dans 48 ml de sérum physiologique (46,8 ml + 1,2 ml). 48 ml en 6h = 8 ml/h.",
    "theme": "Calcul de dose",
    "difficulty": "hard"
  },
  {
    "num": 6,
    "text": "Donnez la définition des termes suivants : transfusion homologue et transfusion autologue.",
    "options": [
      "Homologue : donneur différent receveur | Autologue : patient reçoit son propre sang",
      "Les deux sont identiques",
      "Homologue : même groupe | Autologue : autre groupe",
      "Pas de différence"
    ],
    "correctAnswer": 0,
    "explanation": "Transfusion homologue = transfusion d'un donneur à un receveur autre. Transfusion autologue = transfusion du patient avec son propre sang prélevé en amont.",
    "theme": "Transfusion",
    "difficulty": "medium"
  },
  {
    "num": 7,
    "text": "Où se trouvent les anticorps et les antigènes ?",
    "options": [
      "Anticorps dans le plasma | Antigènes dans les globules rouges",
      "Tous dans le plasma",
      "Tous dans les globules rouges",
      "Pas de localisation précise"
    ],
    "correctAnswer": 0,
    "explanation": "Les anticorps sont dans le plasma et les antigènes dans les globules rouges.",
    "theme": "Immunologie",
    "difficulty": "easy"
  },
  {
    "num": 8,
    "text": "Quels sont les déterminants du débit cardiaque ?",
    "options": [
      "Volume d'éjection systolique (déterminé par précharge, postcharge, contractilité) et fréquence cardiaque",
      "Seulement la tension",
      "Seulement l'âge",
      "Pas de facteurs identifiés"
    ],
    "correctAnswer": 0,
    "explanation": "Déterminants : volume d'éjection systolique (précharge, postcharge, contractilité cœur) et fréquence cardiaque.",
    "theme": "Cardiologie",
    "difficulty": "medium"
  },
  {
    "num": 9,
    "text": "Expliquez l'effet du premier passage hépatique. Quelles voies permettent de l'éviter ?",
    "options": [
      "Métabolisation hépatique avant circulation générale | Voies : sublinguale, transdermique, inhalée, nasale",
      "Pas d'effet",
      "Seulement voie orale",
      "Toutes les voies sont identiques"
    ],
    "correctAnswer": 0,
    "explanation": "Premier passage hépatique : après résorption gastro-intestinale, médicament va au foie via circulation porte où il peut être métabolisé avant arrivée circulation générale. Voies pour l'éviter : sublinguale, transdermique, inhalée, nasale.",
    "theme": "Pharmacologie",
    "difficulty": "hard"
  },
  {
    "num": 10,
    "text": "Définissez les volumes respiratoires mobilisables, citez-les et décrivez-les.",
    "options": [
      "Volume courant (500ml), VRI (2500-3000ml), VRE (1000ml), CV totale (4500ml)",
      "Seulement inspiration/expiration",
      "Pas de volumes",
      "Variables"
    ],
    "correctAnswer": 0,
    "explanation": "Volume courant VT : 500ml. VRI : 2500-3000ml (au-delà inspiration normale). VRE : 1000ml (au-delà expiration normale). Capacité vitale CV : VT+VRI+VRE = 4500ml totale.",
    "theme": "Pneumologie",
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

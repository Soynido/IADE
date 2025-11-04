# 🎯 AMÉLIORATION QUESTIONS IADE - Batch 1

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
## QUESTIONS À AMÉLIORER (Batch 1)
═══════════════════════════════════════════════════════════

[
  {
    "num": 1,
    "text": "Définissez le score de Glasgow. Indiquez ses 3 items d'évaluation, le score minimum et maximum.",
    "options": [
      "Score de 3 à 15 : ouverture des yeux (1-4), réponse verbale (1-5), réponse motrice (1-6)",
      "Score de 10 à 20 : pression artérielle, fréquence cardiaque, saturation",
      "Score de 0 à 30 : âge, antécédents, bilan biologique",
      "Le score de Glasgow n'existe pas"
    ],
    "correctAnswer": 0,
    "explanation": "Le score de Glasgow évalue l'état de conscience selon 3 paramètres : l'ouverture des yeux (1-4), la réponse verbale (1-5) et la réponse motrice (1-6). Le score va de 3 (coma profond) à 15 (conscience normale). Une intubation est possible si le score est inférieur à 8.",
    "theme": "Neurologie",
    "difficulty": "easy"
  },
  {
    "num": 2,
    "text": "Citez les différentes fonctions du rein.",
    "options": [
      "Excrétion des déchets uniquement",
      "Fonctions exocrines : maintien volémie, élimination déchets, équilibre acido-basique | Endocrines : rénine, EPO, vitamine D",
      "Seulement régulation tension artérielle",
      "Aucune fonction métabolique"
    ],
    "correctAnswer": 1,
    "explanation": "Fonctions exocrines : maintien de la volémie, élimination des déchets du métabolisme, maintien équilibre acido-basique et électrolytique. Fonctions endocrines : régulation pression artérielle (rénine), sécrétion EPO, transformation vitamine D en forme active.",
    "theme": "Néphrologie",
    "difficulty": "easy"
  },
  {
    "num": 3,
    "text": "Donnez la norme du PH et le sens de variation du PH, de la PCO₂ et des HCO₃⁻ en cas d'acidose métabolique.",
    "options": [
      "PH < 7,38 | PCO₂ diminue | HCO₃⁻ diminue",
      "PH > 7,42 | PCO₂ augmente | HCO₃⁻ augmente",
      "PH normal 6,5-7,5 | Pas de variation",
      "PH toujours stable"
    ],
    "correctAnswer": 0,
    "explanation": "Norme PH : 7,38 à 7,42. Acidose métabolique : PH < 7,38 (diminue), PCO₂ diminue (compensation), HCO₃⁻ diminue.",
    "theme": "Acidose-Base",
    "difficulty": "medium"
  },
  {
    "num": 4,
    "text": "Quels sont les signes de surdosage en morphinique et la conduite à tenir ?",
    "options": [
      "Tachycardie, hypertension, agitation",
      "Somnolence, bradypnée, dépression respiratoire, myosis extrême",
      "Diarrhée, crampes abdominales, hyperthermie",
      "Aucun signe clinique"
    ],
    "correctAnswer": 1,
    "explanation": "Signes : somnolence, bradypnée voire dépression respiratoire, hypotension, myosis extrême. Conduite : surveillance multiparamétrique, arrêt morphine, prévenir médecin, stimuler patient, O₂ si besoin, antagonisation avec naloxone.",
    "theme": "Pharmacologie",
    "difficulty": "easy"
  },
  {
    "num": 5,
    "text": "Définir muscles lisses et muscles striés. Donnez un exemple pour chacun.",
    "options": [
      "Muscles striés : contraction volontaire (myocarde) | Muscles lisses : contraction involontaire (viscères)",
      "Tous les muscles sont identiques",
      "Striés = colonne vertébrale | Lisses = côtes",
      "Pas de différence"
    ],
    "correctAnswer": 0,
    "explanation": "Muscles striés : innervés par système nerveux cérébro-spinal, contraction soumise à volonté (ex: myocarde). Muscles lisses : contraction involontaire, soumis au système nerveux végétatif, dans viscères creux (tube digestif, voies biliaires, voies urinaires).",
    "theme": "Anatomie",
    "difficulty": "easy"
  },
  {
    "num": 6,
    "text": "Donnez le principe du don du sang. Quel est le volume prélevé, le délai entre deux dons, et la fréquence des dons autorisés par an ?",
    "options": [
      "420-480ml, délai 8 semaines, femme 4x/an, homme 6x/an",
      "500ml, délai 4 semaines, illimité",
      "250ml, délai 1 semaine, 10x/an",
      "Le don de sang est interdit"
    ],
    "correctAnswer": 0,
    "explanation": "Volume : 420 à 480 ml selon poids. Délai minimum 8 semaines entre 2 dons. Fréquence : femme maximum 4 fois/an, homme 6 fois/an.",
    "theme": "Transfusion",
    "difficulty": "easy"
  },
  {
    "num": 7,
    "text": "Combien de temps sont valables les RAI (Recherche d'Agglutinines Irrégulières) ?",
    "options": [
      "3 jours (6 mois si attestation médicale)",
      "1 an sans limite",
      "30 jours maximum",
      "Pas de délai de validité"
    ],
    "correctAnswer": 0,
    "explanation": "Délai validité RAI : 3 jours sauf en l'absence de transfusion ou événement immunisant dans les 6 mois avec attestation médicale signée : 21 jours.",
    "theme": "Transfusion",
    "difficulty": "medium"
  },
  {
    "num": 8,
    "text": "Quels éléments du sang peut-on transfuser ?",
    "options": [
      "Globules rouges, plaquettes, plasma",
      "Uniquement le sang total",
      "Pas de transfusion possible",
      "Seulement les globules blancs"
    ],
    "correctAnswer": 0,
    "explanation": "On peut transfuser des globules rouges, des plaquettes ou du plasma.",
    "theme": "Transfusion",
    "difficulty": "easy"
  },
  {
    "num": 9,
    "text": "Que sont les médicaments dérivés du sang ? Citez-en 3.",
    "options": [
      "Albumine, facteurs de coagulation, immunoglobulines",
      "Aspirine, paracétamol, ibuprofène",
      "Peptides artificiels uniquement",
      "Aucun médicament"
    ],
    "correctAnswer": 0,
    "explanation": "Médicaments dérivés du sang : médicaments à base de sang ou composants de sang préparés industriellement. Exemples : albumine, facteurs de coagulation, immunoglobulines d'origine humaine.",
    "theme": "Hématologie",
    "difficulty": "easy"
  },
  {
    "num": 10,
    "text": "Vous êtes infirmier au SAMU et vous êtes appelé pour une douleur thoracique. À quoi pouvez-vous vous attendre ?",
    "options": [
      "Pneumothorax, infarctus myocarde, embolie pulmonaire, dissection aortique",
      "Seulement infarctus",
      "Problème bénin",
      "Pas de diagnostic possible"
    ],
    "correctAnswer": 0,
    "explanation": "Mnémonique PIED : P=Pneumothorax/péricardite, I=Infarctus myocarde, E=Embolie pulmonaire, D=Dissection aortique.",
    "theme": "Cardiologie",
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

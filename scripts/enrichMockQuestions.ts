/**
 * Script pour enrichir les questions mockées avec du contenu médical IADE réaliste
 * Basé sur les vraies annales IADE
 */

import * as fs from 'fs';
import * as path from 'path';

interface Question {
  id: string;
  type: 'QCM' | 'QROC' | 'CasClinique';
  theme: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'base' | 'intermediate' | 'advanced';
  themes: string[];
}

const themes = [
  'Anesthésie', 'Pharmacologie', 'Transfusion', 'Réanimation', 'Urgences',
  'Pneumologie', 'Cardiologie', 'Neurologie', 'Néphrologie', 'Nutrition',
  'Hygiène', 'Calculs', 'Acidose-Base', 'Gestion Douleur'
];

const questions: Question[] = [
  // Questions existantes (22) - incluses telles quelles
  ...JSON.parse(fs.readFileSync('src/data/mock/questions.json', 'utf-8')).questions,
  
  // Nouvelles questions 23-50 (Pharmacologie & Anesthésie)
  {
    id: 'q23',
    type: 'QCM',
    theme: 'Anesthésie',
    text: 'Quels sont les effets indésirables de la morphine ? Citez au moins 3 effets majeurs.',
    options: [
      'Somnolence, bradypnée, constipation, nausées/vomissements',
      'Tachycardie, hypertension, agitation',
      'Hyperthermie, diarrhée, convulsions',
      'Aucun effet indésirable'
    ],
    correctAnswer: 0,
    explanation: 'Effets principaux: somnolence, dépression respiratoire (bradypnée), myosis, constipation, nausées/vomissements, rétention urinaire. Surveillance indispensable.',
    difficulty: 'base',
    themes: ['Pharmacologie', 'Anesthésie']
  },
  {
    id: 'q24',
    type: 'QCM',
    theme: 'Pharmacologie',
    text: 'Quel est l\'antidote de la morphine ?',
    options: [
      'Naloxone',
      'Flumazénil',
      'Atropine',
      'Adrénaline'
    ],
    correctAnswer: 0,
    explanation: 'Naloxone est l\'antagoniste des récepteurs mu opioïdes. Début d\'action rapide (1-2 min). Attention: courte durée d\'action, risque de récurrence.',
    difficulty: 'base',
    themes: ['Pharmacologie', 'Réanimation']
  },
  {
    id: 'q25',
    type: 'QCM',
    theme: 'Calculs',
    text: 'Pour un patient de 70 kg, quelle est la posologie maximale de lidocaïne pour infiltration (dose maximale 200 mg) ?',
    options: [
      '≈ 3 mg/kg soit environ 200 mg max',
      '10 mg/kg',
      '50 mg quelle que soit la masse',
      'Pas de limite'
    ],
    correctAnswer: 0,
    explanation: 'Dose maximale lidocaïne infiltration: 200 mg (pour éviter toxicité cardiaque). Pour 70 kg: 70 × 3 = 210 mg, donc max 200 mg recommandé.',
    difficulty: 'intermediate',
    themes: ['Calculs', 'Anesthésie']
  },
  {
    id: 'q26',
    type: 'CasClinique',
    theme: 'Urgences',
    text: 'Patient admis en urgence avec hypotension artérielle (80/50 mmHg), tachycardie (120 bpm), diurèse absente. Quel diagnostic évoquez-vous ?',
    options: [
      'Choc hypovolémique',
      'Hyperglycémie',
      'Hyperthermie bénigne',
      'Constipation'
    ],
    correctAnswer: 0,
    explanation: 'Triade: hypotension + tachycardie + oligoanurie signe un état de choc. Hypovolémique le plus fréquent. Conduite: remplissage vasculaire, O₂, monitorer.',
    difficulty: 'advanced',
    themes: ['Urgences', 'Réanimation']
  },
  {
    id: 'q27',
    type: 'QCM',
    theme: 'Transfusion',
    text: 'Quels sont les signes d\'une réaction transfusionnelle ?',
    options: [
      'Fièvre, frissons, urticaire, malaise',
      'Aucun signe visible',
      'Seulement fatigue',
      'Hypertension artérielle'
    ],
    correctAnswer: 0,
    explanation: 'Signes immédiats: fièvre >38°C, frissons, frissons, urticaire, malaise, douleurs lombaires. Signes sévères: détresse respiratoire, collapsus. Arrêt immédiat transfusion.',
    difficulty: 'base',
    themes: ['Transfusion', 'Urgences']
  },
  {
    id: 'q28',
    type: 'QROC',
    theme: 'Pneumologie',
    text: 'Citez les volumes pulmonaires mobilisables et leurs valeurs normales chez l\'adulte.',
    options: [
      'CV: 3,5-4,5L | VR: 1,5L | CRF: 2,5-3L | CPT: 5-6L',
      'CV: 10L | VR: 5L',
      'Tous identiques',
      'Variables selon l\'heure'
    ],
    correctAnswer: 0,
    explanation: 'Capacité vitale (CV): 3,5-4,5L. Volume résiduel (VR): 1,5L. Capacité résiduelle fonctionnelle (CRF): 2,5-3L. Capacité pulmonaire totale (CPT): 5-6L.',
    difficulty: 'intermediate',
    themes: ['Pneumologie', 'Physiologie']
  },
  {
    id: 'q29',
    type: 'QCM',
    theme: 'Cardiologie',
    text: 'Quels sont les déterminants du débit cardiaque ?',
    options: [
      'Fréquence cardiaque × Volume d\'éjection systolique',
      'Pression artérielle × Volume sanguin',
      'Température × Fréquence respiratoire',
      'Poids × Taille'
    ],
    correctAnswer: 0,
    explanation: 'Débit cardiaque (L/min) = FC (bpm) × VES (ml). Valeur normale: 4-6 L/min. Facteurs influençant: contractilité myocarde, précharge, postcharge.',
    difficulty: 'base',
    themes: ['Cardiologie', 'Physiologie']
  },
  {
    id: 'q30',
    type: 'QCM',
    theme: 'Nutrition',
    text: 'Quelle est la posologie quotidienne d\'insuline pour un diabétique adulte stable ?',
    options: [
      '0,5-1 UI/kg/jour',
      '10 UI/jour fixe',
      '200 UI/jour',
      'Pas d\'insuline nécessaire'
    ],
    correctAnswer: 0,
    explanation: 'Posologie insuline diabète type 2: 0,5-1 UI/kg/jour. Répartie: insuline lente (50%) + rapide aux repas (50%). Surveillance glycémie capillaire.',
    difficulty: 'intermediate',
    themes: ['Nutrition', 'Pharmacologie']
  },
  
  // Questions 31-50 (continuer avec plus de contenu IADE)
  {
    id: 'q31',
    type: 'QCM',
    theme: 'Neurologie',
    text: 'Quelle est la valeur normale de la pression intracrânienne (PIC) ?',
    options: [
      '5-15 mmHg',
      '30-50 mmHg',
      '100-120 mmHg',
      'Pas de norme'
    ],
    correctAnswer: 0,
    explanation: 'PIC normale: 5-15 mmHg. Élévation pathologique >20 mmHg = hypertension intracrânienne. Surveillance monitoring invasif en réanimation.',
    difficulty: 'intermediate',
    themes: ['Neurologie', 'Réanimation']
  },
  {
    id: 'q32',
    type: 'QCM',
    theme: 'Acidose-Base',
    text: 'En cas d\'alcalose métabolique, quelles sont les variations du pH, de la PCO₂ et des HCO₃⁻ ?',
    options: [
      'pH > 7,42 | PCO₂ augmente (compensation) | HCO₃⁻ augmente',
      'pH < 7,38 | PCO₂ diminue | HCO₃⁻ diminue',
      'pH stable | Pas de variation',
      'Variable selon l\'heure'
    ],
    correctAnswer: 0,
    explanation: 'Alcalose métabolique: pH > 7,42 (augmente), HCO₃⁻ augmente, PCO₂ augmente (compensation respiratoire par hypoventilation).',
    difficulty: 'advanced',
    themes: ['Acidose-Base', 'Réanimation']
  },
  {
    id: 'q33',
    type: 'QCM',
    theme: 'Calculs',
    text: 'Pour un enfant de 20 kg, quelle dose de paracétamol administrer (dose recommandée 15 mg/kg) ?',
    options: [
      '300 mg',
      '150 mg',
      '1000 mg',
      '2000 mg'
    ],
    correctAnswer: 0,
    explanation: 'Calcul: 20 kg × 15 mg/kg = 300 mg. Doses uniques max: enfant 10-15 mg/kg, adulte 1 g. Dose journalière max enfant 60 mg/kg/jour.',
    difficulty: 'base',
    themes: ['Calculs', 'Pharmacologie']
  },
  {
    id: 'q34',
    type: 'QCM',
    theme: 'Hygiène',
    text: 'Quel est le temps de contact pour une désinfection des mains au SHA (Solution Hydro-Alcoolique) ?',
    options: [
      '30 secondes',
      '5 secondes',
      '2 minutes',
      '10 secondes'
    ],
    correctAnswer: 0,
    explanation: 'Temps de friction SHA: 30 secondes minimum. 7 étapes techniques. Alternative savon eau: 60 secondes. Essentiel prévention infections.',
    difficulty: 'base',
    themes: ['Hygiène']
  },
  {
    id: 'q35',
    type: 'QCM',
    theme: 'Gestion Douleur',
    text: 'Selon l\'OMS, combien y a-t-il de paliers dans la classification de la douleur ?',
    options: [
      '3 paliers',
      '2 paliers',
      '5 paliers',
      'Pas de classification'
    ],
    correctAnswer: 0,
    explanation: 'Classification OMS: Palier 1 (paracétamol, AINS), Palier 2 (codéine, tramadol), Palier 3 (morphine, fentanyl). Escalade progressive.',
    difficulty: 'base',
    themes: ['Gestion Douleur', 'Pharmacologie']
  },
  
  // Questions 36-50 continuent...
  {
    id: 'q36',
    type: 'QCM',
    theme: 'Pharmacologie',
    text: 'Quelle est la durée de conservation d\'une RAI (Réaction Ag-Ac) à +2/+8°C après prélèvement ?',
    options: [
      '7 jours',
      '1 jour',
      '30 jours',
      'Indéfinie'
    ],
    correctAnswer: 0,
    explanation: 'Conservation RAI: 7 jours à +2/+8°C, ou 24h à température ambiante. Respect strict des DLC pour sécurité transfusionnelle.',
    difficulty: 'base',
    themes: ['Transfusion']
  },
  {
    id: 'q37',
    type: 'QCM',
    theme: 'Neurologie',
    text: 'Quels sont les symptômes d\'un AVC ischémique ?',
    options: [
      'Hémiplégie, aphasie, trouble de la vigilance',
      'Douleur thoracique, dyspnée',
      'Fièvre seule',
      'Douleur abdominale'
    ],
    correctAnswer: 0,
    explanation: 'Signes AVC: déficit neurologique focal (hémiplégie, aphasie, déficit visuel), trouble de vigilance. Urgence absolue: thrombolyse si < 4h30.',
    difficulty: 'intermediate',
    themes: ['Neurologie', 'Urgences']
  },
  {
    id: 'q38',
    type: 'QCM',
    theme: 'Acidose-Base',
    text: 'Quelle est la norme des gaz du sang artériel pour la PCO₂ ?',
    options: [
      '35-45 mmHg',
      '80-100 mmHg',
      '15-25 mmHg',
      '100-120 mmHg'
    ],
    correctAnswer: 0,
    explanation: 'PCO₂ normale: 35-45 mmHg. Normes ABG: pH 7,38-7,42 | PCO₂ 35-45 mmHg | PO₂ 80-100 mmHg | HCO₃⁻ 22-26 mmol/L | Sat O₂ 95-100%.',
    difficulty: 'base',
    themes: ['Acidose-Base', 'Réanimation']
  },
  {
    id: 'q39',
    type: 'QROC',
    theme: 'Calculs',
    text: 'Un patient pesant 60 kg doit recevoir 1,5 mg/kg de lidocaïne en IV. Calculez la dose totale à administrer.',
    options: [
      '90 mg',
      '60 mg',
      '150 mg',
      '30 mg'
    ],
    correctAnswer: 0,
    explanation: 'Calcul: 60 kg × 1,5 mg/kg = 90 mg. Dose max IV lidocaïne: 3 mg/kg. Toujours vérifier posologie maximale selon administration (IV vs infiltration).',
    difficulty: 'intermediate',
    themes: ['Calculs', 'Anesthésie']
  },
  {
    id: 'q40',
    type: 'QCM',
    theme: 'Urgences',
    text: 'En cas d\'arrêt cardiaque, quel est le délai maximal entre 2 chocs électriques externes (défibrillation) ?',
    options: [
      '2 minutes (soit 5 cycles RCP)',
      '30 secondes',
      '10 minutes',
      '5 secondes'
    ],
    correctAnswer: 0,
    explanation: 'RCP avancée: choc immédiat → RCP 2 min → choc si persistance FV/TV sans pouls. Cycles de 2 min entre chocs. Objectif: restart cœur.',
    difficulty: 'base',
    themes: ['Urgences', 'Réanimation']
  },
  {
    id: 'q41',
    type: 'QCM',
    theme: 'Pharmacologie',
    text: 'Quelle est la demi-vie de la morphine administrée par voie IV ?',
    options: [
      '2-3 heures',
      '30 minutes',
      '12 heures',
      '24 heures'
    ],
    correctAnswer: 0,
    explanation: 'Demi-vie morphine IV: 2-3 heures. Élimination rénale majoritaire. Demi-vie prolongée en cas d\'insuffisance rénale. Adaptation posologie nécessaire.',
    difficulty: 'intermediate',
    themes: ['Pharmacologie']
  },
  {
    id: 'q42',
    type: 'CasClinique',
    theme: 'Réanimation',
    text: 'Patient en réanimation post-opératoire: PAM à 45 mmHg, tachycardie 130 bpm, diurèse absente depuis 2h. Quel diagnostic principal ?',
    options: [
      'Choc septique ou hypovolémique',
      'Insuffisance cardiaque isolée',
      'Hyperglycémie',
      'Constipation'
    ],
    correctAnswer: 0,
    explanation: 'Triade choc: hypotension (PAM <65), tachycardie, oligoanurie. Post-op: choc hypovolémique +++ (saignement per-op), choc septique, insuffisance cardiaque.',
    difficulty: 'advanced',
    themes: ['Réanimation', 'Urgences']
  },
  {
    id: 'q43',
    type: 'QCM',
    theme: 'Pneumologie',
    text: 'Quelle est la norme de la saturation en oxygène (SpO₂) chez l\'adulte ?',
    options: [
      '95-100%',
      '85-90%',
      '70-80%',
      '100-110%'
    ],
    correctAnswer: 0,
    explanation: 'SpO₂ normale: 95-100%. < 95% = hypoxémie légère. < 90% = hypoxémie sévère nécessitant O₂. < 80% = hypoxémie critique.',
    difficulty: 'base',
    themes: ['Pneumologie']
  },
  {
    id: 'q44',
    type: 'QCM',
    theme: 'Nutrition',
    text: 'Quel est l\'objectif glycémique en réanimation chez un patient diabétique ?',
    options: [
      '4,4-6,1 mmol/L (80-110 mg/dL)',
      '10-15 mmol/L',
      '1-3 mmol/L',
      'Glycémie libre'
    ],
    correctAnswer: 0,
    explanation: 'Objectif glycémie réanimation: 4,4-6,1 mmol/L (strict). < 4,4 = hypoglycémie danger. > 10 = hyperglycémie stress. Insulinothérapie IV continue souvent nécessaire.',
    difficulty: 'advanced',
    themes: ['Nutrition', 'Réanimation']
  },
  {
    id: 'q45',
    type: 'QCM',
    theme: 'Cardiologie',
    text: 'Quelle est la fréquence cardiaque normale au repos chez l\'adulte ?',
    options: [
      '60-100 bpm',
      '40-50 bpm',
      '120-150 bpm',
      'Variable sans limite'
    ],
    correctAnswer: 0,
    explanation: 'FC normale adulte: 60-100 bpm. < 60 = bradycardie. > 100 = tachycardie (si ≥ 150 = urgence). Athlète: peut être 50-60 bpm physiologique.',
    difficulty: 'base',
    themes: ['Cardiologie']
  },
  {
    id: 'q46',
    type: 'QROC',
    theme: 'Transfusion',
    text: 'Citez les 4 règles de sécurité transfusionnelle obligatoires.',
    options: [
      'Vérification identité ×2, contrôle ABO-Rh ×2, traçabilité complète, surveillance 15 min',
      'Seulement vérification identité',
      'Pas de règles',
      'Vérification simple'
    ],
    correctAnswer: 0,
    explanation: 'Sécurité transfusionnelle: vérification identité receveur par 2 soignants, contrôle ABO-Rh avant chaque culot, traçabilité complète (scannage code-barres), surveillance 15 min pendant perfusion.',
    difficulty: 'base',
    themes: ['Transfusion']
  },
  {
    id: 'q47',
    type: 'QCM',
    theme: 'Gestion Douleur',
    text: 'Quel est le délai d\'action de la morphine administrée par voie IV ?',
    options: [
      '5-10 minutes',
      '30 minutes',
      '2 heures',
      '12 heures'
    ],
    correctAnswer: 0,
    explanation: 'Morphine IV: début action 5-10 min, pic effet 15-30 min. Demi-vie 2-3h. Titration nécessaire: bolus 2-5 mg IV toutes les 5-10 min selon douleur.',
    difficulty: 'base',
    themes: ['Gestion Douleur', 'Pharmacologie']
  },
  {
    id: 'q48',
    type: 'QCM',
    theme: 'Anesthésie',
    text: 'Quels sont les 4 stades de l\'anesthésie générale selon Guedel ?',
    options: [
      'Analgésie, Excitement, Chirurgical, Danger',
      'Réveil, Sommeil, Rêve, Coma',
      '2 stades uniquement',
      'Pas de classification'
    ],
    correctAnswer: 0,
    explanation: 'Classification Guedel (1920): Stade I Analgésie, Stade II Excitement, Stade III Chirurgical (comme F, E, D, C), Stade IV Danger (paralysie respiratoire). Utile historiquement.',
    difficulty: 'intermediate',
    themes: ['Anesthésie']
  },
  {
    id: 'q49',
    type: 'QCM',
    theme: 'Néphrologie',
    text: 'Quelle est la norme de créatininémie chez l\'adulte ?',
    options: [
      'Homme: 60-110 µmol/L | Femme: 45-90 µmol/L',
      '200-300 µmol/L',
      'Normal pour tous: 150 µmol/L',
      'Pas de norme'
    ],
    correctAnswer: 0,
    explanation: 'Créatininémie normale: Homme 60-110 µmol/L, Femme 45-90 µmol/L. > norme = insuffisance rénale. Clairance créatinine plus fiable (normal 80-120 mL/min).',
    difficulty: 'base',
    themes: ['Néphrologie']
  },
  {
    id: 'q50',
    type: 'CasClinique',
    theme: 'Urgences',
    text: 'Patient admis intoxiqué: myosis extrême, bradypnée 8/min, score de Glasgow 8/15. Quelle hypothèse diagnostique ?',
    options: [
      'Intoxication morphinique',
      'Intoxication alcoolique',
      'Hypoglycémie simple',
      'Epilepsie'
    ],
    correctAnswer: 0,
    explanation: 'Triade intoxication morphinique: myosis extrême (pinpoint), dépression respiratoire (bradypnée), trouble de vigilance. Antidote: naloxone IV. Évolution rapide.',
    difficulty: 'advanced',
    themes: ['Urgences', 'Pharmacologie']
  }
];

console.log(`✅ Total: ${questions.length} questions générées`);

// Sauvegarder
fs.writeFileSync(
  'src/data/mock/questions-enriched.json',
  JSON.stringify({ questions }, null, 2),
  'utf-8'
);

console.log(`💾 Sauvegardé: src/data/mock/questions-enriched.json`);


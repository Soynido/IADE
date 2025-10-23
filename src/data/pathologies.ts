import { Pathology } from '../types/pathology';

export const pathologies: Pathology[] = [
  // Anesthésie
  {
    id: 'choc_anaphylactique',
    name: 'Choc anaphylactique',
    category: 'Anesthésie',
    symptoms: [
      'Urticaire généralisé',
      'Œdème de Quincke',
      'Détresse respiratoire',
      'Hypotension artérielle sévère',
      'Tachycardie',
      'Prurit',
      'Érythème cutané'
    ],
    diagnostics: [
      'Tryptasémie sérique',
      'Dosage IgE spécifiques',
      'Tests cutanés',
      'Hémogramme',
      'Gazométrie artérielle'
    ],
    nursingCare: [
      'Arrêter immédiatement l\'administration du produit',
      'Maintenir les voies aériennes',
      'Positionner en Trendelenburg',
      'Administrer l\'adrénaline IM',
      'Oxygénothérapie à haut débit',
      'Monitorer PA, FC, SpO2',
      'Préparer intubation si nécessaire'
    ],
    emergencyTreatment: [
      'Adrénaline IM 0.3-0.5mg',
      'Oxygénothérapie 6-15 L/min',
      'Corticoïdes IV (méthylprednisolone)',
      'Antihistaminiques IV',
      'Remplissage vasculaire',
      'Adrénaline IV si choc persistant'
    ],
    severitySigns: [
      'Détresse respiratoire',
      'Hypotension < 70 mmHg',
      'Œdème laryngé',
      'Bradycardie ou tachyarythmie',
      'Perte de conscience'
    ]
  },

  {
    id: 'arrêt_cardiaque',
    name: 'Arrêt cardiaque',
    category: 'Anesthésie',
    symptoms: [
      'Perte de conscience brutale',
      'Absence de ventilation spontanée',
      'Absence de pouls carotidiens',
      'Inconscience',
      'Cyanose',
      'Mydriase aréactive'
    ],
    diagnostics: [
      'Monitorage ECG',
      'Oxymétrie de pouls',
      'Capnographie',
      'Hémogazométrie',
      'Échocardiographie'
    ],
    nursingCare: [
      'Appel SAMU immédiat',
      'Débuter RCP compressions thoraciques',
      'Ventilation bouche-à-bouche',
      'Défibrillation si FV',
      'Administration adrénaline',
      'Intubation trachéale',
      'Monitorage continu'
    ],
    emergencyTreatment: [
      'RCP qualité (100-120/min)',
      'Adrénaline 1mg IV/IO',
      'Amiodarone si FV/TV sans pouls',
      'Atropine si asystole',
      'Bicarbonate si acidose sévère',
      'Défibrillation précoce'
    ],
    severitySigns: [
      'Fibrillation ventriculaire',
      'Asystole',
      'Activité électrique sans pouls',
      'Hypoxie sévère',
      'Acidose métabolique'
    ]
  },

  // Réanimation
  {
    id: 'sdra',
    name: 'SDRA (Syndrome de Détresse Respiratoire Aiguë)',
    category: 'Réanimation',
    symptoms: [
      'Dyspnée sévère',
      'Cyanose réfractaire à l\'O2',
      'Tachypnée > 30/min',
      'Tachycardie',
      'Sibilances',
      'Utilisation muscles accessoires',
      'Bruit de craquement à l\'auscultation'
    ],
    diagnostics: [
      'Radiographie thoracique',
      'Gazométrie artérielle',
      'ECG',
      'Bilan hépatique',
      'Bilan rénal',
      'BILAN infectieux'
    ],
    nursingCare: [
      'Ventilation mécanique invasive',
      'Positionnement décubitus ventral',
      'Sédation-adaptation',
      'Prévention escarres',
      'Aspiration trachéale stérile',
      'Monitorage hémodynamique',
      'Restriction hydrique'
    ],
    emergencyTreatment: [
      'Ventilation protectrice (VT 6ml/kg)',
      'PEP optimale',
      'FiO2 adaptée (SpO2 92-96%)',
      'Décubitus ventral précoce',
      'Sédation-analgésie',
      'Corticothérapie',
      'Traitements étiologiques'
    ],
    severitySigns: [
      'PaO2/FiO2 < 100',
      'Need PEEP > 10 cmH2O',
      'PICS trachéo-bronchique',
      'Barotraumatisme',
      'Défaillance multiviscérale'
    ]
  },

  // Urgences
  {
    id: 'avc',
    name: 'AVC (Accident Vasculaire Cérébral)',
    category: 'Urgences',
    symptoms: [
      'Déficit neurologique brutal',
      'Hémiplégie',
      'Aphasie',
      'Troubles visuels',
      'Céphalées violentes',
      'Vomissements',
      'Troubles de conscience',
      'Vertiges'
    ],
    diagnostics: [
      'IRM cérébrale en urgence',
      'TDM cérébrale',
      'Angio-IRM/TDM',
      'Échographie-Doppler cervical',
      'Hémogramme',
      'Bilan de coagulation'
    ],
    nursingCare: [
      'Score NIHSS',
      'Positionnement demi-assis',
      'Glycémie capillaire',
      'Maintien voies aériennes',
      'Monitoring PA, FC, SpO2',
      'Prévention complications',
      'Information famille'
    ],
    emergencyTreatment: [
      'Thrombolyse IV (rt-PA)',
      'Thrombectomie mécanique',
      'Antiagrégants plaquettaires',
      'Statines',
      'Contrôle tensionnel',
      'Traitement étiologique'
    ],
    severitySigns: [
      'Déficit massif',
      'Troubles conscience sévères',
      'Hémorragie cérébrale',
      'Œdème cérébral',
      'Engagement cérébral'
    ]
  },

  // Cardiovasculaire
  {
    id: 'oap',
    name: 'OAP (Œdème Aigu du Poumon)',
    category: 'Cardiovasculaire',
    symptoms: [
      'Dyspnée paroxystique nocturne',
      'Orthopnée',
      'Toux productive',
      'Expectoration mousseuse rosée',
      'Tachycardie',
      'Galop B3',
      'Crépitants bilatéraux'
    ],
    diagnostics: [
      'Radiographie thoracique',
      'Échocardiographie',
      'BNP/NT-proBNP',
      'Gazométrie artérielle',
      'Bilan rénal',
      'ECG'
    ],
    nursingCare: [
      'Position semi-assis',
      'Oxygénothérapie',
      'Diurétiques IV',
      'Monitoring strict',
      'Restriction hydrique',
      'Surveillance diurèse',
      'Traitement douleur'
    ],
    emergencyTreatment: [
      'Furosémide IV bolus',
      'Dérivés nitrés',
      'Morphine IV',
      'Oxygénothérapie nasale',
      'Vasodilatateurs',
      'Digitaliques si FA',
      'CPAP/BiPAP'
    ],
    severitySigns: [
      'Détresse respiratoire',
      'Œdème pulmonaire massif',
      'Hypotension',
      'Insuffisance rénale',
      'Troubles du rythme'
    ]
  },

  // Respiratoire
  {
    id: 'asthme_aigu',
    name: 'Asthme aigu grave',
    category: 'Respiratoire',
    symptoms: [
      'Dyspnée intense',
      'Sibilances audibles',
      'Tachypnée > 25/min',
      'Tachycardie > 120/min',
      'PEP > 10 cmH2O',
      'Paralysie respiratoire',
      'Cyanose',
      'Confusion/somnolence'
    ],
    diagnostics: [
      'DEP (Débit expiratoire de pointe)',
      'Gazométrie artérielle',
      'Radiographie thoracique',
      'ECG',
      'Bilan allergique',
      'Hémogramme'
    ],
    nursingCare: [
      'Nébulisation β2-mimétiques',
      'Oxygénothérapie humidifiée',
      'Position demi-assis',
      'Monitoring continu',
      'Corticothérapie IV',
      'Anxiolytiques',
      'Surveillance intubation'
    ],
    emergencyTreatment: [
      'Salbutamol nébulisation',
      'Corticoïdes IV',
      'Oxygénothérapie haute concentration',
      'Magnésium IV',
      'Adrénaline nébulisation',
      'Intubation trachéale'
    ],
    severitySigns: [
      'DEP < 150 L/min',
      'SpO2 < 92%',
      'Troubles conscience',
      'Silence thoracique',
      'Cyanose sévère'
    ]
  },

  // Métabolique
  {
    id: 'acidose_severe',
    name: 'Acidose métabolique sévère',
    category: 'Métabolique',
    symptoms: [
      'Polypnée ample (Kussmaul)',
      'Troubles de conscience',
      'Nausées et vomissements',
      'Faiblesse musculaire',
      'Céphalées',
      'Thirst intense',
      'Odeur acétonique de l\'haleine'
    ],
    diagnostics: [
      'Gazométrie artérielle',
      'Bilan hydroélectrolytique',
      'Bilan hépatique',
      'Hémogramme',
      'Échographie rénale',
      'Dosage lactates'
    ],
    nursingCare: [
      'Monitorage continu PA, FC, SpO2',
      'Surveillance diurèse horaire',
      'Pose voie veineuse périphérique',
      'Surveillance conscience Glasgow',
      'Position demi-assis',
      'Surveillance température'
    ],
    emergencyTreatment: [
      'Correction cause sous-jacente',
      'Bicarbonate de sodium IV',
      'Remplissage vasculaire',
      'Insulinothérapie si diabète',
      'Dialyse en urgence',
      'Oxygénothérapie si hypoxie'
    ],
    severitySigns: [
      'pH < 7.1',
      'Troubles conscience sévères',
      'Défaillance hémodynamique',
      'Hyperkaliémie > 6.5 mmol/L',
      'Insuffisance rénale aiguë'
    ]
  },

  // Neurologie
  {
    id: 'traumatisme_cranien',
    name: 'Traumatisme cranien grave',
    category: 'Neurologie',
    symptoms: [
      'Perte de conscience initiale',
      'Céphalées violentes',
      'Vomissements en jet',
      'Amnésie post-traumatique',
      'Vertiges',
      'Troubles visuels',
      'Convulsions'
    ],
    diagnostics: [
      'TDM cérébrale en urgence',
      'IRM cérébrale',
      'Radiographie cervicale',
      'Échographie transcrânienne',
      'Monitorage pression intracrânienne',
      'Bilan de coagulation'
    ],
    nursingCare: [
      'Maintien voies aériennes',
      'Immobilisation rachis cervical',
      'Surveillance neurologique horaire',
      'Position demi-assis 30°',
      'Monitoring pression intracrânienne',
      'Prévention convulsions'
    ],
    emergencyTreatment: [
      'Osmothérapie (mannitol)',
      'Sédation-analgésie',
      'Hypocapnie contrôlée',
      'Traitement chirurgical si hématome',
      'Antiépileptiques prophylactiques',
      'Contrôle pression artérielle'
    ],
    severitySigns: [
      'Score Glasgow < 8',
      'Mydriase aréactive unilatérale',
      'Hypertension intracrânienne',
      'Engagement cérébral',
      'Convulsions réfractaires'
    ]
  },

  // Infectieux
  {
    id: 'choc_septique',
    name: 'Choc septique',
    category: 'Infectieux',
    symptoms: [
      'Fièvre ou hypothermie',
      'Frissons intenses',
      'Tachycardie > 90/min',
      'Tachypnée > 20/min',
      'Hypotension artérielle',
      'Troubles conscience',
      'Oligurie'
    ],
    diagnostics: [
      'Hémocultures multiples',
      'Bilan infectieux complet',
      'Procalcitonine',
      'CRP quantitative',
      'Lactates artériels',
      'Imagerie focale (TDM/échographie)'
    ],
    nursingCare: [
      'Surveillance hémodynamique continue',
      'Cathétérisme veineux central',
      'Surveillance diurèse horaire',
      'Prélèvements bactériologiques',
      'Isolement septique',
      'Surveillance température centrale'
    ],
    emergencyTreatment: [
      'Antibiothérapie probabiliste IV',
      'Remplissage vasculaire',
      'Catécholamines (noradrénaline)',
      'Oxygénothérapie',
      'Contrôle source infectieuse',
      'Corticothérapie si choc réfractaire'
    ],
    severitySigns: [
      'Lactates > 4 mmol/L',
      'PAS < 90 mmHg malgré remplissage',
      'Oligurie < 0.5 mL/kg/h',
      'Troubles conscience sévères',
      'Défaillance multiviscérale'
    ]
  },

  // Digestif
  {
    id: 'hemorragie_digestive',
    name: 'Hémorragie digestive haute',
    category: 'Digestif',
    symptoms: [
      'Méléna',
      'Hématémèse',
      'Douleur épigastrique',
      'Pâleur intense',
      'Vertiges',
      'Syncope',
      'Tachycardie'
    ],
    diagnostics: [
      'Endoscopie digestive haute en urgence',
      'Hémogramme complet',
      'Bilan de coagulation',
      'Gazométrie artérielle',
      'Groupage sanguin RAI',
      'TDM abdominale'
    ],
    nursingCare: [
      'Pose 2 voies veineuses périphériques',
      'Surveillance hémodynamique',
      'Surveillance rythme cardiaque',
      'Position demi-assis',
      'Surveillance diurèse',
      'Préparation transfusion'
    ],
    emergencyTreatment: [
      'Remplissage vasculaire massif',
      'Transfusion sanguine',
      'Inhibiteurs de la pompe à protons IV',
      'Sonde gastrique aspirative',
      'Traitement endoscopique hémostase',
      'Sondage urinaire surveillance'
    ],
    severitySigns: [
      'Hémoglobine < 7 g/dL',
      'Instabilité hémodynamique',
      'Tachycardie > 120/min',
      'Reprise massive du saignement',
      'Nécessité transfusion massive'
    ]
  },

  // Obstétrique
  {
    id: 'hemorragie_obstetricale',
    name: 'Hémorragie obstétricale du post-partum',
    category: 'Obstétrique',
    symptoms: [
      'Saignement vaginal abondant',
      'Hypotension artérielle',
      'Tachycardie',
      'Pâleur cutanéomuqueuse',
      'Utérus atone mou',
      'Troubles conscience',
      'Oligurie'
    ],
    diagnostics: [
      'Hémogramme en urgence',
      'Bilan de coagulation',
      'Gazométrie artérielle',
      'Groupage sanguin RAI',
      'Échographie utérine',
      'Monitoring fetal si nécessaire'
    ],
    nursingCare: [
      'Massage utérin externe',
      'Surveillance pertes sanguines',
      'Monitorage hémodynamique',
      'Cathétérisme veineux',
      'Surveillance diurèse',
      'Palpation utérine régulière'
    ],
    emergencyTreatment: [
      'Ocytociques IV (oxytocine)',
      'Utotoniques (sulprostone)',
      'Remplissage vasculaire',
      'Transfusion sanguine',
      'Révision utérine',
      'Chirurgie hémostase si échec'
    ],
    severitySigns: [
      'Perte sanguine > 1000 mL',
      'Instabilité hémodynamique',
      'Coagulopathie de consommation',
      'Insuffisance rénale aiguë',
      'Nécessité transfusion massive'
    ]
  }
];

export const pathologiesByCategory = pathologies.reduce((acc, pathology) => {
  if (!acc[pathology.category]) {
    acc[pathology.category] = [];
  }
  acc[pathology.category].push(pathology);
  return acc;
}, {} as Record<string, Pathology[]>);

export const getPathologyById = (id: string): Pathology | undefined => {
  return pathologies.find(p => p.id === id);
};

export const getPathologiesByCategory = (category: string): Pathology[] => {
  return pathologies.filter(p => p.category === category);
};
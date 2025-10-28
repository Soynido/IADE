/**
 * Générateur de cas cliniques
 * Crée des questions basées sur des scénarios cliniques réalistes
 */

import { BaseQuestionGenerator, GeneratedQuestion, GeneratorConfig, GeneratorUtils } from './baseGenerator.js';

interface ClinicalCase {
  title: string;
  context: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  theme: string;
  difficulty: 'base' | 'intermediate' | 'advanced';
}

export class CasCliniqueGenerator extends BaseQuestionGenerator {
  private cases: ClinicalCase[] = [
    {
      title: 'Patient en détresse respiratoire',
      context: 'Patient de 65 ans, tabagique, présente une dyspnée aiguë avec SpO₂ à 85%, FR 32/min, polypnée, tirage intercostal. Auscultation: râles crépitants bilatéraux.',
      question: 'Quelle est la prise en charge prioritaire?',
      options: [
        'Oxygénothérapie à haut débit + position demi-assise + diurétiques',
        'Attendre les résultats de la radiographie',
        'Administration d\'antibiotiques uniquement',
        'Ventilation mécanique immédiate systématique'
      ],
      correctIndex: 0,
      explanation: 'Tableau d\'OAP (œdème aigu du poumon). Prise en charge: O₂ haut débit, position assise, diurétiques (furosémide), +/- VNI si échec.',
      theme: 'Urgences respiratoires',
      difficulty: 'intermediate'
    },
    {
      title: 'Choc hémorragique post-traumatique',
      context: 'Polytraumatisé 30 ans, accident de voiture. PA 80/50, FC 130/min, conscience altérée, hémorragie active membre inférieur. Hb 6 g/dL.',
      question: 'Quelle est la stratégie transfusionnelle?',
      options: [
        'Protocole de transfusion massive: CGR + PFC + plaquettes (ratio 1:1:1)',
        'Attendre bilan complet avant transfusion',
        'Transfusion de CGR uniquement',
        'Pas de transfusion si patient conscient'
      ],
      correctIndex: 0,
      explanation: 'Choc hémorragique sévère: protocole de transfusion massive avec ratio 1:1:1 (CGR:PFC:plaquettes) + acide tranexamique.',
      theme: 'Urgences traumatologie',
      difficulty: 'advanced'
    },
    {
      title: 'Hypoglycémie sévère',
      context: 'Patient diabétique type 1, confusion, sueurs, tremblements, glycémie capillaire 0,3 g/L, voie veineuse présente.',
      question: 'Quelle est la conduite à tenir immédiate?',
      options: [
        'G30% 60 mL IV (resucrage) + surveillance glycémie',
        'Glucagon IM uniquement',
        'Attendre médecin',
        'Alimentation orale sucrée'
      ],
      correctIndex: 0,
      explanation: 'Hypoglycémie sévère avec voie veineuse: G30% 60 mL IV (= 20g glucose), puis surveillance glycémique rapprochée.',
      theme: 'Urgences métaboliques',
      difficulty: 'intermediate'
    },
    {
      title: 'Anaphylaxie per-opératoire',
      context: 'Patient en cours d\'anesthésie générale, développe brutalement: érythème, hypotension 60/30, tachycardie 140/min, bronchospasme.',
      question: 'Quel est le traitement de première intention?',
      options: [
        'Adrénaline 0,1-0,5 mg IV titré + remplissage vasculaire',
        'Antihistaminiques H1 uniquement',
        'Corticoïdes IV haute dose',
        'Arrêt anesthésie et attendre'
      ],
      correctIndex: 0,
      explanation: 'Anaphylaxie grade III-IV: adrénaline IV titrée (0,1-0,5 mg) + remplissage + oxygénation. Antihistaminiques et corticoïdes en 2ème intention.',
      theme: 'Anesthésie urgences',
      difficulty: 'advanced'
    },
    {
      title: 'Suspicion d\'AVC ischémique',
      context: 'Patient 70 ans, hémiplégie droite brutale + aphasie depuis 2h. PA 180/100, glycémie 1,2 g/L, pas d\'antécédent hémorragique.',
      question: 'Quelle est l\'indication?',
      options: [
        'Thrombolyse IV (rt-PA) si scanner cérébral normal',
        'Aspirine per os immédiate',
        'Attendre 24h avant traitement',
        'IRM obligatoire avant tout traitement'
      ],
      correctIndex: 0,
      explanation: 'AVC ischémique < 4h30: thrombolyse IV (rt-PA 0,9 mg/kg) si scanner sans hémorragie et absence de contre-indications.',
      theme: 'Neurologie urgences',
      difficulty: 'advanced'
    },
    {
      title: 'Douleur thoracique aiguë',
      context: 'Homme 55 ans, douleur rétrosternale constrictive depuis 30 min, irradiation bras gauche, sueurs. ECG: sus-décalage ST en antérieur.',
      question: 'Quel est le diagnostic et la prise en charge?',
      options: [
        'Infarctus du myocarde STEMI + coronarographie en urgence',
        'Angor stable, traitement médical',
        'Attendre troponines avant décision',
        'Embolie pulmonaire'
      ],
      correctIndex: 0,
      explanation: 'IDM STEMI (sus-décalage ST): coronarographie en urgence < 90 min (angioplastie), aspirine, anticoagulants, antalgiques.',
      theme: 'Cardiologie urgences',
      difficulty: 'advanced'
    },
    {
      title: 'Acidocétose diabétique',
      context: 'Patient diabétique type 1, vomissements, polypnée, glycémie 4 g/L, pH 7,1, HCO₃⁻ 8 mmol/L, cétonémie ++.',
      question: 'Quelle est la prise en charge initiale?',
      options: [
        'Réhydratation (NaCl 0,9%) + insuline IV + apport potassium',
        'Insuline sous-cutanée uniquement',
        'Bicarbonates IV systématiques',
        'Attendre pH > 7,3 avant insuline'
      ],
      correctIndex: 0,
      explanation: 'Acidocétose diabétique: réhydratation (NaCl 0,9% 1L/h), insuline IV continue (0,1 UI/kg/h), surveillance kaliémie (apport K+ si < 5 mmol/L).',
      theme: 'Urgences endocriniennes',
      difficulty: 'advanced'
    },
    {
      title: 'Crise d\'asthme sévère',
      context: 'Patient 25 ans, asthme connu, dyspnée sévère, orthopnée, impossibilité de parler, FR 35/min, SpO₂ 88%, silence auscultatoire.',
      question: 'Quelle est la prise en charge?',
      options: [
        'Oxygène + β2-mimétiques nébulisés + corticoïdes IV + surveillance rapprochée',
        'β2-mimétiques seuls',
        'Anxiolytiques uniquement',
        'Ventilation mécanique immédiate systématique'
      ],
      correctIndex: 0,
      explanation: 'Asthme aigu grave: O₂ pour SpO₂ > 94%, β2-mimétiques nébulisés répétés, corticoïdes IV (méthylprednisolone), +/- sulfate de magnésium si échec.',
      theme: 'Urgences respiratoires',
      difficulty: 'advanced'
    }
  ];

  constructor(config?: GeneratorConfig) {
    super(config);
  }

  async generate(context: { existingQuestions?: GeneratedQuestion[] } = {}): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];

    // Sélectionner des cas aléatoires
    const selectedCases = GeneratorUtils.sample(
      this.cases,
      this.config.maxQuestionsPerRun || 5
    );

    for (const clinicalCase of selectedCases) {
      const question = this.createQuestionFromCase(clinicalCase);
      if (question) {
        questions.push(question);
      }
    }

    return this.filterQuestions(questions);
  }

  private createQuestionFromCase(clinicalCase: ClinicalCase): GeneratedQuestion | null {
    const fullText = `${clinicalCase.title}\n\n${clinicalCase.context}\n\n${clinicalCase.question}`;

    const question: GeneratedQuestion = {
      id: this.generateQuestionId('cas'),
      type: 'CasClinique',
      theme: clinicalCase.theme,
      text: fullText,
      options: clinicalCase.options,
      correctAnswer: clinicalCase.correctIndex,
      explanation: clinicalCase.explanation,
      difficulty: clinicalCase.difficulty,
      themes: [clinicalCase.theme],
      confidence: 0.92,
      source: 'cas-clinique-generator'
    };

    return question;
  }
}


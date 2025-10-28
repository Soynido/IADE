/**
 * Générateur de QCM basé sur des templates et des données médicales
 */

import { BaseQuestionGenerator, GeneratedQuestion, GeneratorConfig, GeneratorUtils } from './baseGenerator';

interface QCMTemplate {
  pattern: string;
  theme: string;
  difficulty: 'base' | 'intermediate' | 'advanced';
  data: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export class QCMGenerator extends BaseQuestionGenerator {
  private templates: QCMTemplate[] = [
    {
      pattern: 'normes_biologiques',
      theme: 'Normes biologiques',
      difficulty: 'base',
      data: [
        {
          question: 'Quelle est la norme de la créatininémie chez l\'adulte ?',
          options: [
            'Homme: 60-110 µmol/L | Femme: 45-90 µmol/L',
            'Homme: 200-300 µmol/L | Femme: 150-250 µmol/L',
            'Identique pour tous: 100 µmol/L',
            'Variable selon l\'heure de prélèvement'
          ],
          correctIndex: 0,
          explanation: 'Créatininémie normale: Homme 60-110 µmol/L, Femme 45-90 µmol/L. Marqueur de la fonction rénale.'
        },
        {
          question: 'Quelle est la norme de la glycémie à jeun ?',
          options: [
            '0,7-1,1 g/L (3,9-6,1 mmol/L)',
            '1,5-2,0 g/L',
            '0,3-0,5 g/L',
            'Variable sans limite'
          ],
          correctIndex: 0,
          explanation: 'Glycémie à jeun normale: 0,7-1,1 g/L. Diabète si ≥ 1,26 g/L à 2 reprises.'
        }
      ]
    },
    {
      pattern: 'pharmacologie',
      theme: 'Pharmacologie',
      difficulty: 'intermediate',
      data: [
        {
          question: 'Quel est le mécanisme d\'action de la morphine ?',
          options: [
            'Agoniste des récepteurs opioïdes mu',
            'Antagoniste des récepteurs GABA',
            'Inhibiteur de la COX-2',
            'Bloqueur des canaux calciques'
          ],
          correctIndex: 0,
          explanation: 'La morphine est un agoniste des récepteurs opioïdes mu, entraînant analgésie, sédation et dépression respiratoire.'
        },
        {
          question: 'Quelle est la classe thérapeutique du paracétamol ?',
          options: [
            'Antalgique de palier 1 (non opioïde)',
            'Anti-inflammatoire stéroïdien',
            'Antalgique de palier 3 (opioïde fort)',
            'Antibiotique'
          ],
          correctIndex: 0,
          explanation: 'Le paracétamol est un antalgique de palier 1 selon l\'OMS. Antipyrétique mais pas anti-inflammatoire.'
        }
      ]
    },
    {
      pattern: 'urgences',
      theme: 'Urgences',
      difficulty: 'advanced',
      data: [
        {
          question: 'En cas d\'arrêt cardiaque, quelle est la séquence RCP selon les recommandations ERC 2021 ?',
          options: [
            '30 compressions thoraciques : 2 insufflations',
            '15 compressions thoraciques : 2 insufflations',
            '5 compressions thoraciques : 1 insufflation',
            'Compressions continues sans insufflations'
          ],
          correctIndex: 0,
          explanation: 'RCP adulte: 30:2 (30 compressions thoraciques pour 2 insufflations). Fréquence 100-120/min, profondeur 5-6 cm.'
        },
        {
          question: 'Quelle est la dose initiale d\'adrénaline en arrêt cardiaque ?',
          options: [
            '1 mg IV/IO toutes les 3-5 minutes',
            '0,1 mg IV unique',
            '10 mg IV toutes les 10 minutes',
            '0,5 mg IM'
          ],
          correctIndex: 0,
          explanation: 'Adrénaline en ACR: 1 mg IV/IO toutes les 3-5 minutes. Première dose dès que possible après le 3ème choc.'
        }
      ]
    }
  ];

  constructor(config?: GeneratorConfig) {
    super(config);
  }

  async generate(context: { existingQuestions?: GeneratedQuestion[] } = {}): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];

    // Sélectionner des templates aléatoires
    const selectedTemplates = GeneratorUtils.sample(
      this.templates,
      Math.min(this.templates.length, this.config.maxQuestionsPerRun || 5)
    );

    for (const template of selectedTemplates) {
      // Générer 1-2 questions par template
      const questionsPerTemplate = Math.min(2, template.data.length);
      const selectedData = GeneratorUtils.sample(template.data, questionsPerTemplate);

      for (const data of selectedData) {
        const question = this.createQuestionFromTemplate(template, data);
        if (question) {
          questions.push(question);
        }
      }
    }

    return this.filterQuestions(questions);
  }

  private createQuestionFromTemplate(
    template: QCMTemplate,
    data: QCMTemplate['data'][0]
  ): GeneratedQuestion | null {
    const question: GeneratedQuestion = {
      id: this.generateQuestionId('qcm'),
      type: 'QCM',
      theme: template.theme,
      text: data.question,
      options: data.options,
      correctAnswer: data.correctIndex,
      explanation: data.explanation,
      difficulty: template.difficulty,
      themes: [template.theme],
      confidence: 0.95,
      source: 'qcm-generator'
    };

    return question;
  }
}


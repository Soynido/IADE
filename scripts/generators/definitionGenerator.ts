/**
 * Générateur de questions de type "Définition"
 * Crée des QCM basés sur des définitions de concepts médicaux
 */

import { BaseQuestionGenerator, GeneratedQuestion, GeneratorConfig, GeneratorUtils } from './baseGenerator';

interface ConceptDefinition {
  term: string;
  definition: string;
  theme: string;
  examples?: string[];
}

export class DefinitionGenerator extends BaseQuestionGenerator {
  private concepts: ConceptDefinition[] = [
    {
      term: 'Score de Glasgow',
      definition: 'Score universel évaluant l\'état de conscience selon 3 paramètres : ouverture des yeux (1-4), réponse verbale (1-5), réponse motrice (1-6). Score de 3 (coma profond) à 15 (conscience normale).',
      theme: 'Neurologie',
      examples: ['Intubation si score < 8']
    },
    {
      term: 'Acidose métabolique',
      definition: 'Trouble acido-basique caractérisé par un pH < 7,38, une diminution des HCO₃⁻ et une compensation respiratoire (diminution PCO₂).',
      theme: 'Acidose-Base',
      examples: ['Causes: diabète, insuffisance rénale, diarrhée']
    },
    {
      term: 'Débit cardiaque',
      definition: 'Volume de sang éjecté par le cœur par minute. Calculé par: DC = Fréquence cardiaque × Volume d\'éjection systolique. Valeur normale: 4-6 L/min.',
      theme: 'Cardiologie',
      examples: ['Facteurs: contractilité, précharge, postcharge']
    },
    {
      term: 'Spaced Repetition',
      definition: 'Technique d\'apprentissage basée sur la révision espacée dans le temps selon la courbe d\'Ebbinghaus. Optimise la mémorisation à long terme.',
      theme: 'Pédagogie',
      examples: ['Intervalles: 1h, 1j, 3j, 7j, 14j, 30j, 60j, 90j']
    },
    {
      term: 'Naloxone',
      definition: 'Antagoniste des récepteurs opioïdes mu. Antidote de la morphine et des opiacés. Début d\'action rapide (1-2 min) mais courte durée.',
      theme: 'Pharmacologie',
      examples: ['Indication: surdosage morphinique']
    },
    {
      term: 'Transfusion autologue',
      definition: 'Transfusion où le donneur et le receveur sont la même personne. Prélèvement avant intervention programmée.',
      theme: 'Transfusion',
      examples: ['Avantage: pas de risque immunologique']
    },
    {
      term: 'Choc hypovolémique',
      definition: 'État de choc dû à une diminution importante du volume sanguin circulant. Triade: hypotension, tachycardie, oligoanurie.',
      theme: 'Urgences',
      examples: ['Causes: hémorragie, déshydratation sévère']
    },
    {
      term: 'Curares',
      definition: 'Myorelaxants bloquant la transmission neuromusculaire au niveau de la plaque motrice. Utilisés en anesthésie pour faciliter l\'intubation.',
      theme: 'Anesthésie',
      examples: ['Types: dépolarisants (succinylcholine), non-dépolarisants (rocuronium)']
    }
  ];

  constructor(config?: GeneratorConfig) {
    super(config);
  }

  async generate(context: { existingQuestions?: GeneratedQuestion[] } = {}): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];

    // Sélectionner des concepts aléatoires
    const selectedConcepts = GeneratorUtils.sample(
      this.concepts,
      this.config.maxQuestionsPerRun || 5
    );

    for (const concept of selectedConcepts) {
      const question = this.generateDefinitionQuestion(concept);
      if (question) {
        questions.push(question);
      }
    }

    return this.filterQuestions(questions);
  }

  private generateDefinitionQuestion(concept: ConceptDefinition): GeneratedQuestion | null {
    // Générer la question
    const questionText = `Définissez le terme "${concept.term}".`;

    // Générer les options (1 correcte + 3 distracteurs)
    const correctOption = concept.definition;
    const distractors = this.generateDistractors(concept);

    const allOptions = GeneratorUtils.shuffle([correctOption, ...distractors]);
    const correctAnswer = allOptions.indexOf(correctOption);

    // Générer l'explication
    let explanation = concept.definition;
    if (concept.examples && concept.examples.length > 0) {
      explanation += ` Exemple: ${concept.examples[0]}.`;
    }

    const question: GeneratedQuestion = {
      id: this.generateQuestionId('def'),
      type: 'QCM',
      theme: concept.theme,
      text: questionText,
      options: allOptions,
      correctAnswer,
      explanation,
      difficulty: 'base',
      themes: [concept.theme],
      confidence: 0.9,
      source: 'definition-generator'
    };

    return question;
  }

  private generateDistractors(concept: ConceptDefinition): string[] {
    // Générer des distracteurs plausibles mais incorrects
    const distractors: string[] = [];

    // Distracteur 1: Définition vague
    distractors.push(`Concept médical lié à ${concept.theme.toLowerCase()}`);

    // Distracteur 2: Définition partiellement correcte
    const words = concept.definition.split(' ');
    const partial = words.slice(0, Math.floor(words.length / 2)).join(' ') + ' (définition incomplète)';
    distractors.push(partial);

    // Distracteur 3: Définition incorrecte
    distractors.push(`Le terme "${concept.term}" n'est pas utilisé en pratique médicale`);

    return distractors;
  }
}


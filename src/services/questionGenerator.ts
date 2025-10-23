import { Pathology, Question, UserStats } from '../types/pathology';
import { pathologies, getPathologiesByCategory } from '../data/pathologies';

export class QuestionGenerator {
  // Génère des options incorrectes pertinentes par catégorie
  private static getWrongOptionsForCategory(
    correctAnswer: string,
    correctOptions: string[],
    category: string,
    type: string
  ): string[] {
    const wrongOptionsMap: Record<string, Record<string, string[]>> = {
      'Anesthésie': {
        'symptomatologie': ['Fièvre modérée', 'Toux productive', 'Douleur thoracique atypique', 'Éruption cutanée localisée'],
        'diagnostic': ['Radiographie dentaire', 'Échographie mammaire', 'Fibroscopie gastrique', 'Urographie intraveineuse'],
        'prise_en_charge': ['Surveiller uniquement les constantes vitales', 'Administrer des antalgiques sans ordonnance', 'Effectuer des pansements de routine'],
        'traitement_urgence': ['Antibiothérapie prophylactique', 'Antispasmodiques IV', 'Antalgiques de palier II'],
        'signes_gravite': ['Érythème cutané localisé', 'Prurit modéré', 'Urticaire légère', 'Toux légère']
      },
      'Métabolique': {
        'symptomatologie': ['Toux légère', 'Douleur articulaire modérée', 'Fatigue légère', 'Céphalées bénignes'],
        'diagnostic': ['Radiographie pulmonaire', 'Échographie cardiaque', 'Fibroscopie bronchique', 'Scanner des sinus'],
        'prise_en_charge': ['Surveiller uniquement la glycémie', 'Administrer des vitamines', 'Effectuer des pansements simples'],
        'traitement_urgence': ['Antalgiques per os', 'Antiémétiques systématiques', 'Antipyrétiques prophylactiques'],
        'signes_gravite': ['Glycémie légèrement élevée', 'Fatigue modérée', 'Céphalées légères', 'Nausées occasionnelles']
      },
      'Neurologie': {
        'symptomatologie': ['Céphalées de tension', 'Vertiges bénins', 'Troubles visuels légers', 'Fourmillements intermittents'],
        'diagnostic': ['Radiographie dentaire', 'Auditionmétrie', 'Électrocardiogramme', 'Échographie abdominale'],
        'prise_en_charge': ['Surveiller uniquement la conscience', 'Administrer des antalgiques légers', 'Effectuer des mobilisations passives'],
        'traitement_urgence': ['Antalgiques de palier I', 'Anti-inflammatoires per os', 'Anxiolytiques légers'],
        'signes_gravite': ['Céphalées modérées', 'Vertiges occasionnels', 'Troubles sommeil', 'Fatigue légère']
      },
      'Infectieux': {
        'symptomatologie': ['Toux légère', 'Fièvre modérée', 'Fatigue légère', 'Douleurs musculaires diffuses'],
        'diagnostic': ['Radiographie des sinus', 'Test grossesse', 'Échographie thyroïdienne', 'Fibroscopie gastrique'],
        'prise_en_charge': ['Surveiller uniquement la température', 'Administrer des antipyrétiques', 'Effectuer des soins d\'hygiène'],
        'traitement_urgence': ['Antalgiques systématiques', 'Anti-inflammatoires per os', 'Antipyrétiques prophylactiques'],
        'signes_gravite': ['Fièvre légère', 'Toux modérée', 'Fatigue légère', 'Douleurs modérées']
      },
      'Digestif': {
        'symptomatologie': ['Brûlures d\'estomac', 'Ballonnements modérés', 'Nausées légères', 'Constipation occasionnelle'],
        'diagnostic': ['Fibroscopie gastrique programmée', 'Échographie hépatique', 'Coloscopie', 'Scanner abdominal sans contraste'],
        'prise_en_charge': ['Surveiller uniquement l\'abdomen', 'Administrer des pansements gastriques', 'Effectuer des massages abdominaux'],
        'traitement_urgence': ['Antiacides systématiques', 'Antispasmodiques per os', 'Antiémétiques légers'],
        'signes_gravite': ['Douleur abdominale modérée', 'Nausées occasionnelles', 'Ballonnements légers', 'Reflux modéré']
      },
      'Obstétrique': {
        'symptomatologie': ['Contractions légères', 'Douleurs pelviennes modérées', 'Légère fatigue', 'Troubles du sommeil'],
        'diagnostic': ['Échographie de routine', 'Test urine', 'Prise de sang routine', 'Examen gynécologique standard'],
        'prise_en_charge': ['Surveiller uniquement les contractions', 'Administrer des antalgiques légers', 'Effectuer des soins de confort'],
        'traitement_urgence': ['Antispasmodiques per os', 'Antalgiques de palier I', 'Anxiolytiques légers'],
        'signes_gravite': ['Contractions modérées', 'Douleur pelvienne supportable', 'Fatigue légère', 'Anxiété modérée']
      },
      'Réanimation': {
        'symptomatologie': ['Hypertension modérée', 'Fréquence respiratoire normale', 'Température stable', 'Douleur abdominale diffuse'],
        'diagnostic': ['Électroencéphalogramme', 'Radiographie des sinus', 'Échographie thyroïdienne', 'Audiogramme'],
        'prise_en_charge': ['Surveiller la tension artérielle uniquement', 'Appliquer des compresses chaudes', 'Effectuer des massages de confort'],
        'traitement_urgence': ['Diurétiques de l\'anse systématiques', 'Bêtabloquants en première ligne', 'Anticoagulants préventifs'],
        'signes_gravite': ['Tachycardie modérée (90-110/min)', 'Hypotension légère (PAS 90-100 mmHg)', 'Oligurie modérée (0.5-1 mL/kg/h)']
      },
      'Urgences': {
        'symptomatologie': ['Lombalgie chronique', 'Céphalée de tension', 'Constipation fonctionnelle', 'Insomnie occasionnelle'],
        'diagnostic': ['Panoramique dentaire', 'Mammographie', 'Fond d\'œil', 'Épreuve d\'effort'],
        'prise_en_charge': ['Laisser le patient au repos complet sans surveillance', 'Administrer des anti-inflammatoires systématiques', 'Effectuer des soins d\'hygiène uniquement'],
        'traitement_urgence': ['Antibiothérapie sans indication', 'Anti-inflammatoires per os', 'Antipyrétiques systématiques'],
        'signes_gravite': ['Céphalées modérées', 'Douleur contrôlée par antalgiques', 'Nausées occasionnelles', 'Anxiété légère']
      },
      'Cardiovasculaire': {
        'symptomatologie': ['Hypertension bien contrôlée', 'Palpitations occasionnelles', 'Œdème des chevilles bilatéral', 'Intolérance à l\'effort'],
        'diagnostic': ['Fibroscopie bronchique', 'Scanner abdominal', 'IRM cérébrale', 'Échographie pelvienne'],
        'prise_en_charge': ['Surveiller uniquement le pouls', 'Mettre le patient en décubitus dorsal strict', 'Administrer des diurétiques sans surveillance'],
        'traitement_urgence': ['Antalgiques morphiniques systématiques', 'Diurétiques sans indication', 'Bêtabloquants non sélectifs'],
        'signes_gravite': ['Palpitations occasionnelles', 'Légers œdèmes des chevilles', 'Fatigue d\'effort', 'Dyspnée modérée']
      },
      'Respiratoire': {
        'symptomatologie': ['Toux sèche chronique', 'Expectoration blanche', 'Dysphonie d\'effort', 'Asthme intermittent'],
        'diagnostic': ['Échographie rénale', 'Fibroscopie gastrique', 'IRM abdominale', 'Radiographie des sinus'],
        'prise_en_charge': ['Surveiller uniquement la saturation', 'Mettre le patient en position couchée', 'Administrer des mucolytiques systématiquement'],
        'traitement_urgence': ['Antibiothérapie large spectre sans preuve', 'Mucolytiques systématiques', 'Corticoïdes inhalés en urgence'],
        'signes_gravite': ['Toux productive modérée', 'Expectoration blanche', 'Dyspnée d\'effort', 'Sibilances intermittentes']
      }
    };

    const wrongOptions = wrongOptionsMap[category]?.[type] || ['Option non pertinente', 'Symptôme mineur', 'Signe bénin', 'Manifestation chronique'];
    const filteredWrong = wrongOptions.filter(opt => !correctOptions.includes(opt) && opt !== correctAnswer);

    return [correctAnswer, ...filteredWrong.slice(0, 3)];
  }

  // Mélange un tableau
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Génère une question à partir d'une pathologie
  private static generateQuestionFromPathology(
    pathology: Pathology,
    difficulty: number,
    index: number
  ): Question {
    const questionTypes = ['symptoms', 'diagnostics', 'nursingCare', 'emergencyTreatment', 'severitySigns'];
    const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let question: string;
    let correctAnswer: string;
    let options: string[];
    let explanation: string;

    switch (selectedType) {
      case 'symptoms':
        correctAnswer = pathology.symptoms[Math.floor(Math.random() * pathology.symptoms.length)];
        question = `Parmi les signes cliniques suivants, lequel est LE PLUS caractéristique du ${pathology.name} ?`;
        options = this.getWrongOptionsForCategory(correctAnswer, pathology.symptoms, pathology.category, 'symptomatologie');
        explanation = this.getDetailedExplanation(pathology, selectedType, correctAnswer);
        break;

      case 'diagnostics':
        correctAnswer = pathology.diagnostics[Math.floor(Math.random() * pathology.diagnostics.length)];
        question = `Quel examen est LE PLUS utile pour confirmer le diagnostic de ${pathology.name} ?`;
        options = this.getWrongOptionsForCategory(correctAnswer, pathology.diagnostics, pathology.category, 'diagnostic');
        explanation = this.getDetailedExplanation(pathology, selectedType, correctAnswer);
        break;

      case 'nursingCare':
        correctAnswer = pathology.nursingCare[Math.floor(Math.random() * pathology.nursingCare.length)];
        question = `Quelle est la PRIORITÉ dans la prise en charge infirmière immédiate de ${pathology.name} ?`;
        options = this.getWrongOptionsForCategory(correctAnswer, pathology.nursingCare, pathology.category, 'prise_en_charge');
        explanation = this.getDetailedExplanation(pathology, selectedType, correctAnswer);
        break;

      case 'emergencyTreatment':
        correctAnswer = pathology.emergencyTreatment[Math.floor(Math.random() * pathology.emergencyTreatment.length)];
        question = `Quel est LE TRAITEMENT de première ligne en urgence pour ${pathology.name} ?`;
        options = this.getWrongOptionsForCategory(correctAnswer, pathology.emergencyTreatment, pathology.category, 'traitement_urgence');
        explanation = this.getDetailedExplanation(pathology, selectedType, correctAnswer);
        break;

      case 'severitySigns':
        correctAnswer = pathology.severitySigns[Math.floor(Math.random() * pathology.severitySigns.length)];
        question = `Parmi les signes suivants, lequel indique une forme GRAVE de ${pathology.name} nécessitant une intervention immédiate ?`;
        options = this.getWrongOptionsForCategory(correctAnswer, pathology.severitySigns, pathology.category, 'signes_gravite');
        explanation = this.getDetailedExplanation(pathology, selectedType, correctAnswer);
        break;

      default:
        correctAnswer = pathology.symptoms[0];
        question = `Question sur ${pathology.name}`;
        options = [correctAnswer, 'Option B', 'Option C', 'Option D'];
        explanation = `Explication sur ${pathology.name}`;
    }

    return {
      id: `q_${index + 1}`,
      question,
      options: this.shuffleArray(options),
      correct: correctAnswer,
      explanation,
      points: difficulty,
      theme: pathology.category,
      difficulty: ['Facile', 'Moyen', 'Difficile'][difficulty - 1],
      pathology: pathology.name
    };
  }

  // Génère des explications médicales détaillées et spécifiques
  private static getDetailedExplanation(
    pathology: Pathology,
    type: string,
    correctAnswer: string
  ): string {
    const explanations: Record<string, string> = {
      'choc_anaphylactique_symptoms': `L'urticaire généralisé et l'œdème de Quincke sont des signes cutanés spécifiques de la réaction d'hypersensibilité immédiate (type I). La libération massive d'histamine provoque une augmentation de la perméabilité vasculaire et une constriction bronchique.`,
      'choc_anaphylactique_diagnostics': `La tryptasémie sérique est le marqueur gold standard pour confirmer l'anaphylaxie. Elle doit être prélevée entre 30 minutes et 3 heures après le début des symptômes pour être interprétable.`,
      'choc_anaphylactique_nursingCare': `L'arrêt immédiat de l'administration du produit allergisant est la priorité absolue pour stopper la source d'exposition. Chaque minute compte pour limiter la progression de la réaction.`,
      'choc_anaphylactique_emergencyTreatment': `L'adrénaline intramusculaire est le traitement de première ligne. Elle permet de contrer l'hypotension, la bronchoconstriction et l'œdème par son action alpha et bêta-adrénergique.`,
      'arrêt_cardiaque_symptoms': `L'absence de pouls carotidiens est le signe clinique fondamental qui définit l'arrêt cardiaque. Tous les autres signes (inconscience, apnée) en découlent par manque de perfusion cérébrale.`,
      'arrêt_cardiaque_diagnostics': `La capnographie (EtCO2) est l'outil le plus fiable pour confirmer la bonne position de la sonde d'intubation et monitorer l'efficacité des compressions thoraciques.`,
      'arrêt_cardiaque_nursingCare': `Les compressions thoraciques de qualité (100-120/min, profondeur 5-6 cm) maintiennent une perfusion minimale aux organes vitaux. C'est la base de la survie.`,
      'arrêt_cardiaque_emergencyTreatment': `L'adrénaline 1mg IV/IO toutes les 3-5 minutes améliore la pression de perfusion coronaire et les chances de récupération d'un rythme spontané.`,
      'sdra_symptoms': `La dyspnée sévère et la cyanose réfractaire à l'oxygène traduisent l'inadéquation sévère entre les apports et les besoins en oxygène malgré une ventilation conventionnelle.`,
      'sdra_diagnostics': `La radiographie thoracique montre des opacités alvéolaires bilatérales diffuses non spécifiques de l'œdème pulmonaire lésionnel, essentiel pour le diagnostic.`,
      'sdra_nursingCare': `La ventilation mécanique protectrice (volume courant 6ml/kg de poids idéal théorique) prévient le barotraumatisme et le volotraumatisme pulmonaire.`,
      'sdra_emergencyTreatment': `La PEP optimale recrute les alvéoles collapsées et améliore l'oxygénation sans provoquer de barotraumatisme excessif.`,
      'avc_symptoms': `Le déficit neurologique brutal et unilatéral est typique de l'occlusion artérielle focale. La soudainé discrimine l'AVC des autres causes neurologiques.`,
      'avc_diagnostics': `L'IRM cérébrale en urgence (séquence diffusion) est l'examen le plus sensible pour détecter précocement l'ischémie cérébrale et guider la thrombolyse.`,
      'avc_nursingCare': `Le score NIHSS évalue objectivement la sévérité du déficit neurologique et guide les décisions thérapeutiques (thrombolyse, thrombectomie).`,
      'avc_emergencyTreatment': `La thrombolyse IV par rt-PA administrée dans les 4h30 réduit significativement le handicap à 3 mois si les critères sont respectés.`,
      'oap_symptoms': `L'orthopnée (dyspnée en décubitus) et les crépitants bilatéraux traduisent la surcharge hydrostatique pulmonaire typique de l'insuffisance cardiaque gauche.`,
      'oap_diagnostics': `Le BNP/NT-proBNP est un marqueur spécifique de la surcharge de pression des cavités cardiaques gauches, distinguant l'OAP cardiaque des autres dyspnées.`,
      'oap_nursingCare': `La position semi-assis diminue le retour veineux et la précharge, soulageant immédiatement la dyspnée par redistribution pulmonaire.`,
      'oap_emergencyTreatment': `Le furosémide IV en bolus rapide produit une diurèse immédiate réduisant la précharge et la congestion pulmonaire.`,
      'asthme_aigu_symptoms': `Le DEP < 150 L/min et la sibilance audible sans stéthoscope indiquent un obstruction sévère des voies aériennes supérieures menaçant le pronostic vital.`,
      'asthme_aigu_diagnostics': `La gazométrie artérielle montre l'hypoxie et l'hypercapnie, traduisant l'épuisement respiratoire et l'indication d'intubation imminente.`,
      'asthme_aigu_nursingCare': `Les nébulisations répétées de β2-mimétiques sont le traitement de première ligne pour bronchodilater les voies aériennes obstructives.`,
      'asthme_aigu_emergencyTreatment': `L'intubation trachéale et la ventilation mécanique sont indiquées devant l'épuisement respiratoire ou l'agitation confusionnelle.`
    };

    const key = `${pathology.id}_${type}`;
    return explanations[key] ||
      `${correctAnswer} est essentiel(le) dans la prise en charge du ${pathology.name}. Cette action/item est fondamental(e) pour améliorer le pronostic du patient.`;
  }

  // Analyse intelligente des performances pour adapter la difficulté
  private static calculateAdaptiveDifficulty(
    userStats: UserStats,
    selectedCategory: string
  ): { level: number; text: string; reasoning: string } {
    const baseScore = userStats.averageScore || 50;
    const recentProgression = userStats.progression10percent || 0;
    const sessionsCount = userStats.totalSessions || 0;

    // Facteurs d'adaptation
    let difficultyAdjustment = 0;
    let reasoning = "Difficulté de base";

    // Adapter selon le score moyen
    if (baseScore > 85) {
      difficultyAdjustment += 2;
      reasoning += " - Excellent score moyen";
    } else if (baseScore > 70) {
      difficultyAdjustment += 1;
      reasoning += " - Bon score moyen";
    } else if (baseScore < 40) {
      difficultyAdjustment -= 1;
      reasoning += " - Score moyen à améliorer";
    }

    // Adapter selon la progression récente
    if (recentProgression >= 15) {
      difficultyAdjustment += 1;
      reasoning += " - Progression excellente";
    } else if (recentProgression >= 10) {
      reasoning += " - Progression positive";
    } else if (recentProgression < -5) {
      difficultyAdjustment -= 1;
      reasoning += " - Difficultés récentes";
    }

    // Adapter selon l'expérience
    if (sessionsCount > 20) {
      difficultyAdjustment += 1;
      reasoning += " - Utilisateur expérimenté";
    } else if (sessionsCount < 5) {
      difficultyAdjustment -= 1;
      reasoning += " - Utilisateur débutant";
    }

    // Ajuster pour les zones de faiblesse
    if (userStats.weakAreas?.includes(selectedCategory)) {
      difficultyAdjustment -= 1;
      reasoning += " - Renforcement nécessaire";
    }

    // Calculer le niveau final (entre 1 et 3)
    const finalLevel = Math.max(1, Math.min(3, 2 + difficultyAdjustment));
    const difficultyText = finalLevel === 3 ? 'Difficile' : (finalLevel === 2 ? 'Moyen' : 'Facile');

    return {
      level: finalLevel,
      text: difficultyText,
      reasoning
    };
  }

  // Démarre une session d'apprentissage avec adaptation intelligente
  static startLearningSession(
    userStats: UserStats,
    questionCount: number = 10
  ): {
    questions: Question[];
    theme: string;
    difficulty: string;
    adaptiveReasoning: string;
  } {
    const categories = Object.keys(pathologies.reduce((acc, p) => ({...acc, [p.category]: []}), {}));

    // Sélection stratégique de la catégorie
    let selectedCategory: string;
    let selectionReasoning: string;

    if (userStats.weakAreas && userStats.weakAreas.length > 0) {
      // Prioriser les zones de faiblesse
      selectedCategory = userStats.weakAreas[0];
      selectionReasoning = `Focus sur la zone à renforcer: ${selectedCategory}`;
    } else if (userStats.recentScores && userStats.recentScores.length >= 3) {
      // Choisir une catégorie variée si performances stables
      const lastThreeCategories = userStats.recentScores.slice(-3).map(s => s.theme);
      const availableCategories = categories.filter(cat => !lastThreeCategories.includes(cat));
      selectedCategory = availableCategories.length > 0
        ? availableCategories[Math.floor(Math.random() * availableCategories.length)]
        : categories[Math.floor(Math.random() * categories.length)];
      selectionReasoning = `Diversification des thèmes étudiés`;
    } else {
      // Sélection aléatoire pour débutants
      selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      selectionReasoning = `Découverte de nouveaux thèmes`;
    }

    const pathologiesInCategory = getPathologiesByCategory(selectedCategory);

    // Calcul intelligent de la difficulté
    const adaptiveDifficulty = this.calculateAdaptiveDifficulty(userStats, selectedCategory);

    // Générer des questions avec variation de complexité
    const questions: Question[] = [];
    const complexityDistribution = this.getComplexityDistribution(adaptiveDifficulty.level, questionCount);

    for (let i = 0; i < questionCount; i++) {
      const pathology = pathologiesInCategory[Math.floor(Math.random() * pathologiesInCategory.length)];
      const questionComplexity = complexityDistribution[i];
      const question = this.generateQuestionFromPathology(pathology, questionComplexity, i);
      questions.push(question);
    }

    const fullReasoning = `${selectionReasoning} | ${adaptiveDifficulty.reasoning}`;

    console.log('🎯 Session adaptative générée:', {
      theme: selectedCategory,
      difficulty: adaptiveDifficulty.text,
      level: adaptiveDifficulty.level,
      reasoning: fullReasoning,
      questionCount: questions.length,
      pathologiesCount: pathologiesInCategory.length
    });

    return {
      questions,
      theme: selectedCategory,
      difficulty: adaptiveDifficulty.text,
      adaptiveReasoning: fullReasoning
    };
  }

  // Distribute la complexité des questions selon le niveau global
  private static getComplexityDistribution(targetLevel: number, questionCount: number): number[] {
    const distribution: number[] = [];

    switch (targetLevel) {
      case 1: // Facile - focus sur questions simples
        const easyCount = Math.ceil(questionCount * 0.7);
        const mediumCount = questionCount - easyCount;
        for (let i = 0; i < easyCount; i++) distribution.push(1);
        for (let i = 0; i < mediumCount; i++) distribution.push(2);
        break;

      case 2: // Moyen - équilibre
        const easyCount2 = Math.ceil(questionCount * 0.2);
        const mediumCount2 = Math.ceil(questionCount * 0.6);
        const hardCount2 = questionCount - easyCount2 - mediumCount2;
        for (let i = 0; i < easyCount2; i++) distribution.push(1);
        for (let i = 0; i < mediumCount2; i++) distribution.push(2);
        for (let i = 0; i < hardCount2; i++) distribution.push(3);
        break;

      case 3: // Difficile - focus sur questions complexes
        const mediumCount3 = Math.ceil(questionCount * 0.3);
        const hardCount3 = questionCount - mediumCount3;
        for (let i = 0; i < mediumCount3; i++) distribution.push(2);
        for (let i = 0; i < hardCount3; i++) distribution.push(3);
        break;
    }

    // Mélanger la distribution
    return this.shuffleArray(distribution);
  }
}
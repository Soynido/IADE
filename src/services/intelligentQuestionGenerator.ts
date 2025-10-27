/**
 * Générateur Intelligent de Questions IADE
 * 
 * Analyse les patterns des concours IADE et génère automatiquement
 * des questions variées depuis le contenu des modules de cours.
 * 
 * Patterns typiques identifiés dans les concours IADE :
 * - QCM simples (définitions, mécanismes d'action)
 * - QCM cliniques (cas patient, diagnostic, conduite à tenir)
 * - QROC (réponse courte : posologie, délai d'action, contre-indications)
 * - Questions de calcul (dosages, dilutions, débit perfusion)
 * - Questions d'association (molécule-classe, symptôme-pathologie)
 * - Questions de priorité (ordre des gestes, urgences)
 */

import type { ParsedQuestion } from './contentParser';

export interface ModuleContent {
  id: string;
  title: string;
  rawText: string;
  sections: ModuleSection[];
}

export interface ModuleSection {
  title: string;
  content: string;
  type: 'definition' | 'list' | 'classification' | 'mechanism' | 'clinical' | 'doses';
}

export interface QuestionPattern {
  type: 'qcm' | 'qroc' | 'calculation' | 'association' | 'priority';
  difficulty: 'easy' | 'medium' | 'hard';
  template: string;
  extractionRules: (section: ModuleSection) => boolean;
  generator: (section: ModuleSection, moduleId: string) => ParsedQuestion[];
}

/**
 * Patterns de questions typiques des concours IADE
 */
export class IntelligentQuestionGenerator {
  
  /**
   * Patterns de questions QCM - Définitions et mécanismes
   */
  private static PATTERN_DEFINITION: QuestionPattern = {
    type: 'qcm',
    difficulty: 'easy',
    template: 'Quelle est la définition correcte de {concept} ?',
    extractionRules: (section) => 
      section.type === 'definition' && section.content.length > 50,
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      
      // Extraire les concepts clés (lignes avec ":" ou "=")
      const lines = section.content.split('\n');
      const conceptLines = lines.filter(line => 
        (line.includes(':') || line.includes('=')) && 
        line.length > 20 && line.length < 200
      );

      conceptLines.forEach((line, index) => {
        const [concept, definition] = line.split(/[:=]/);
        if (concept && definition && definition.trim().length > 10) {
          // Générer des distracteurs plausibles
          const distractors = this.generateDistractors(definition.trim(), conceptLines);
          
          questions.push({
            id: `${moduleId}_def_${index}`,
            text: `Quelle est la définition correcte de "${concept.trim()}" ?`,
            options: this.shuffleOptions([
              definition.trim(),
              ...distractors.slice(0, 3)
            ]),
            correctAnswer: 0, // Sera recalculé après shuffle
            category: section.title.toLowerCase().includes('neuro') ? 'Neurologie' :
                     section.title.toLowerCase().includes('respir') ? 'Respiratoire' :
                     section.title.toLowerCase().includes('pharmaco') ? 'Pharmacologie' : 'Général',
            difficulty: 'easy',
            points: 1,
            sourceModule: moduleId,
            tags: [concept.trim().toLowerCase()]
          });
        }
      });

      return questions;
    }
  };

  /**
   * Pattern QCM - Classifications (AINS, antalgiques paliers, etc.)
   */
  private static PATTERN_CLASSIFICATION: QuestionPattern = {
    type: 'qcm',
    difficulty: 'medium',
    template: 'À quelle classe appartient {element} ?',
    extractionRules: (section) => 
      section.type === 'classification' || 
      section.content.toLowerCase().includes('classe') ||
      section.content.toLowerCase().includes('palier'),
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      
      // Détecter les listes de classes/catégories
      const lines = section.content.split('\n').filter(l => l.trim());
      
      // Pattern "Palier I : ..." ou "Classe A : ..."
      const classificationPattern = /^[•\-\*]?\s*(Palier|Classe|Type|Catégorie)\s+([IVX\d]+|[A-Z])\s*[:]/i;
      
      let currentClass = '';
      let currentElements: string[] = [];
      const classifications: {class: string, elements: string[]}[] = [];

      lines.forEach(line => {
        const match = line.match(classificationPattern);
        if (match) {
          if (currentClass && currentElements.length > 0) {
            classifications.push({ class: currentClass, elements: currentElements });
          }
          currentClass = `${match[1]} ${match[2]}`;
          currentElements = [];
        } else if (currentClass && line.trim().length > 5) {
          // Ligne décrivant un élément de la classe
          const element = line.replace(/^[•\-\*]\s*/, '').trim();
          if (element.length < 100) {
            currentElements.push(element);
          }
        }
      });

      if (currentClass && currentElements.length > 0) {
        classifications.push({ class: currentClass, elements: currentElements });
      }

      // Générer questions pour chaque classification
      classifications.forEach((classif, idx) => {
        classif.elements.forEach((element, elemIdx) => {
          // Créer des distracteurs depuis les autres classes
          const otherClasses = classifications
            .filter(c => c.class !== classif.class)
            .map(c => c.class);

          if (otherClasses.length >= 2) {
            questions.push({
              id: `${moduleId}_classif_${idx}_${elemIdx}`,
              text: `À quelle catégorie appartient : "${element}" ?`,
              options: this.shuffleOptions([
                classif.class,
                ...otherClasses.slice(0, 3)
              ]),
              correctAnswer: 0,
              category: 'Pharmacologie',
              difficulty: 'medium',
              points: 2,
              sourceModule: moduleId,
              tags: ['classification', classif.class.toLowerCase()]
            });
          }
        });
      });

      return questions.slice(0, 10); // Limiter à 10 questions par section
    }
  };

  /**
   * Pattern QROC - Contre-indications, effets indésirables
   */
  private static PATTERN_CONTRAINDICATION: QuestionPattern = {
    type: 'qcm',
    difficulty: 'medium',
    template: 'Quelle est une contre-indication de {medicament} ?',
    extractionRules: (section) => 
      section.content.toLowerCase().includes('contre-indication') ||
      section.content.toLowerCase().includes('effet indésirable') ||
      section.content.toLowerCase().includes('précaution'),
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      const lines = section.content.split('\n').filter(l => l.trim());

      // Extraire les contre-indications (lignes avec bullets ou numéros)
      const contraindicationLines = lines.filter(line => 
        /^[•\-\*\d]/.test(line.trim()) && 
        line.length > 15 && 
        line.length < 150
      );

      contraindicationLines.forEach((ci, index) => {
        const cleanCI = ci.replace(/^[•\-\*\d\.\)]\s*/, '').trim();
        
        // Générer distracteurs depuis autres lignes ou inventés
        const otherCIs = contraindicationLines
          .filter((_, i) => i !== index)
          .map(l => l.replace(/^[•\-\*\d\.\)]\s*/, '').trim())
          .slice(0, 3);

        if (otherCIs.length >= 2) {
          questions.push({
            id: `${moduleId}_ci_${index}`,
            text: section.title.includes('AINS') 
              ? `Parmi les propositions suivantes, laquelle est une contre-indication des AINS ?`
              : `Parmi les propositions suivantes, laquelle est une contre-indication ?`,
            options: this.shuffleOptions([cleanCI, ...otherCIs]),
            correctAnswer: 0,
            category: 'Pharmacologie',
            difficulty: 'medium',
            points: 2,
            sourceModule: moduleId,
            tags: ['contre-indication', 'sécurité']
          });
        }
      });

      return questions.slice(0, 8);
    }
  };

  /**
   * Pattern QCM - Mécanisme d'action
   */
  private static PATTERN_MECHANISM: QuestionPattern = {
    type: 'qcm',
    difficulty: 'hard',
    template: 'Quel est le mécanisme d\'action de {substance} ?',
    extractionRules: (section) => 
      section.content.toLowerCase().includes('mécanisme') ||
      section.content.toLowerCase().includes('action') ||
      section.content.toLowerCase().includes('récepteur'),
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      const lines = section.content.split('\n');

      // Chercher les phrases explicatives de mécanisme
      const mechanismLines = lines.filter(line => 
        (line.toLowerCase().includes('inhib') ||
         line.toLowerCase().includes('activ') ||
         line.toLowerCase().includes('bloque') ||
         line.toLowerCase().includes('stimule')) &&
        line.length > 30 && line.length < 200
      );

      mechanismLines.forEach((mech, index) => {
        const cleanMech = mech.replace(/^[•\-\*\d\.\)]\s*/, '').trim();
        
        // Créer des distracteurs inversés ou altérés
        const distractors = [
          cleanMech.replace('inhib', 'activ').replace('bloque', 'stimule'),
          cleanMech.replace('central', 'périphérique').replace('périphérique', 'central'),
          "Action directe sur les récepteurs NMDA du système nerveux central"
        ];

        questions.push({
          id: `${moduleId}_mech_${index}`,
          text: `Quel est le mécanisme d'action principal ?`,
          options: this.shuffleOptions([cleanMech, ...distractors.slice(0, 3)]),
          correctAnswer: 0,
          category: 'Pharmacologie',
          difficulty: 'hard',
          points: 3,
          sourceModule: moduleId,
          tags: ['mécanisme', 'pharmacodynamie']
        });
      });

      return questions.slice(0, 5);
    }
  };

  /**
   * Pattern QCM - Anatomie et structures
   */
  private static PATTERN_ANATOMY: QuestionPattern = {
    type: 'qcm',
    difficulty: 'medium',
    template: 'Quelle structure est responsable de {fonction} ?',
    extractionRules: (section) => 
      section.content.toLowerCase().includes('anatomie') ||
      section.content.toLowerCase().includes('structure') ||
      section.content.toLowerCase().includes('nerf') ||
      section.content.toLowerCase().includes('vertèbre'),
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      const lines = section.content.split('\n').filter(l => l.trim());

      // Extraire associations structure-fonction
      const structurePattern = /([A-Za-zéèêàâîôùû\s]+)\s*[:=]\s*([^\.]{20,150})/;
      
      lines.forEach((line, index) => {
        const match = line.match(structurePattern);
        if (match) {
          const structure = match[1].trim();
          const fonction = match[2].trim();

          // Créer distracteurs depuis autres structures
          const otherStructures = lines
            .filter((_, i) => i !== index)
            .map(l => {
              const m = l.match(/^[•\-\*]?\s*([A-Za-zéèêàâîôùû\s]+)\s*[:=]/);
              return m ? m[1].trim() : null;
            })
            .filter(s => s && s.length < 50)
            .slice(0, 3);

          if (otherStructures.length >= 2) {
            questions.push({
              id: `${moduleId}_anat_${index}`,
              text: `Quelle structure est responsable de : "${fonction}" ?`,
              options: this.shuffleOptions([structure, ...otherStructures as string[]]),
              correctAnswer: 0,
              category: 'Anatomie',
              difficulty: 'medium',
              points: 2,
              sourceModule: moduleId,
              tags: ['anatomie', 'fonction']
            });
          }
        }
      });

      return questions.slice(0, 10);
    }
  };

  /**
   * Pattern QCM - Molécules et indications (pharmacologie)
   */
  private static PATTERN_MOLECULES: QuestionPattern = {
    type: 'qcm',
    difficulty: 'medium',
    template: 'Quelle molécule est indiquée pour {indication} ?',
    extractionRules: (section) => 
      section.content.toLowerCase().includes('indication') ||
      section.content.toLowerCase().includes('dci') ||
      /[A-Z][a-z]+\s*\([A-Z]+\)/.test(section.content), // Pattern Molecule (NOM_COMMERCIAL)
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      const lines = section.content.split('\n').filter(l => l.trim());

      // Pattern: Molécule (NOM_COMMERCIAL) + indication
      const moleculePattern = /([A-Za-zéèêàâîôùû]+)\s*\(([A-Z\s]+)\)/g;
      const molecules: {name: string, commercial: string, indication?: string}[] = [];
      
      lines.forEach((line, idx) => {
        let match;
        while ((match = moleculePattern.exec(line)) !== null) {
          const molecule = {
            name: match[1].trim(),
            commercial: match[2].trim(),
            indication: idx < lines.length - 1 ? lines[idx + 1] : undefined
          };
          molecules.push(molecule);
        }
      });

      // Créer des questions pour chaque molécule
      molecules.forEach((mol, index) => {
        if (molecules.length >= 4) {
          const otherMolecules = molecules
            .filter((_, i) => i !== index)
            .map(m => `${m.name} (${m.commercial})`)
            .slice(0, 3);

          questions.push({
            id: `${moduleId}_mol_${index}`,
            text: `Quelle est la DCI (Dénomination Commune Internationale) de ${mol.commercial} ?`,
            options: this.shuffleOptions([
              mol.name,
              ...molecules.filter((_, i) => i !== index).map(m => m.name).slice(0, 3)
            ]),
            correctAnswer: 0,
            category: 'Pharmacologie',
            difficulty: 'medium',
            points: 2,
            sourceModule: moduleId,
            tags: ['molécule', 'dci', mol.commercial.toLowerCase()]
          });
        }
      });

      return questions.slice(0, 15);
    }
  };

  /**
   * Pattern QCM - Valeurs normales (normes biologiques)
   */
  private static PATTERN_NORMAL_VALUES: QuestionPattern = {
    type: 'qcm',
    difficulty: 'hard',
    template: 'Quelle est la valeur normale de {parametre} ?',
    extractionRules: (section) => 
      /\d+[–\-]\d+/.test(section.content) && // Pattern de plage de valeurs
      (section.content.includes('mmol') || 
       section.content.includes('g/dL') ||
       section.content.includes('µmol') ||
       section.content.includes('%')),
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      const lines = section.content.split('\n').filter(l => l.trim());

      // Pattern: Paramètre  Valeur  Unité
      const valuePattern = /([A-Za-zéèêàâîôùû²\s\(\)]+)\s+([HF]?\s*:?\s*[\d,\.]+[–\-][\d,\.]+\s*[a-zA-Zµ\/\s%]+)/g;
      
      const parameters: {name: string, value: string}[] = [];
      lines.forEach(line => {
        let match;
        while ((match = valuePattern.exec(line)) !== null) {
          parameters.push({
            name: match[1].trim(),
            value: match[2].trim()
          });
        }
      });

      // Générer questions
      parameters.forEach((param, index) => {
        if (parameters.length >= 4) {
          const otherValues = parameters
            .filter((_, i) => i !== index)
            .map(p => p.value)
            .slice(0, 3);

          questions.push({
            id: `${moduleId}_norm_${index}`,
            text: `Quelle est la valeur normale de ${param.name} ?`,
            options: this.shuffleOptions([param.value, ...otherValues]),
            correctAnswer: 0,
            category: 'Biologie',
            difficulty: 'hard',
            points: 3,
            sourceModule: moduleId,
            tags: ['norme', 'biologie', param.name.toLowerCase()]
          });
        }
      });

      return questions.slice(0, 20);
    }
  };

  /**
   * Pattern QCM - Protocoles et dosages
   */
  private static PATTERN_PROTOCOLS: QuestionPattern = {
    type: 'qcm',
    difficulty: 'hard',
    template: 'Quelle est la posologie de {medicament} ?',
    extractionRules: (section) => 
      section.content.toLowerCase().includes('administration') ||
      section.content.toLowerCase().includes('posologie') ||
      section.content.toLowerCase().includes('ampoule') ||
      /\d+\s*mg/.test(section.content),
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      const lines = section.content.split('\n').filter(l => l.trim());

      // Pattern: Molécule + dosage (ex: "Ampoules de 5mg/5 ml")
      const dosagePattern = /Ampoules?\s+de\s+([\d,\.]+\s*[a-zµg]+\/[\d,\.]+\s*[a-zµg]+)/gi;
      const administrationPattern = /([\d,\.]+\s*[a-zµg]+)\s+(IV|IM|SC|per os|PO)/gi;

      const dosages: {text: string, line: string}[] = [];
      lines.forEach(line => {
        let match;
        while ((match = dosagePattern.exec(line)) !== null) {
          dosages.push({ text: match[1], line: line.substring(0, 80) });
        }
        while ((match = administrationPattern.exec(line)) !== null) {
          dosages.push({ text: `${match[1]} ${match[2]}`, line: line.substring(0, 80) });
        }
      });

      // Créer questions sur les dosages
      dosages.forEach((dosage, index) => {
        if (dosages.length >= 3) {
          const otherDosages = dosages
            .filter((_, i) => i !== index)
            .map(d => d.text)
            .slice(0, 3);

          questions.push({
            id: `${moduleId}_dose_${index}`,
            text: `Quelle est la présentation correcte ? (${dosage.line.substring(0, 60)}...)`,
            options: this.shuffleOptions([dosage.text, ...otherDosages]),
            correctAnswer: 0,
            category: 'Pharmacologie',
            difficulty: 'hard',
            points: 3,
            sourceModule: moduleId,
            tags: ['posologie', 'administration']
          });
        }
      });

      return questions.slice(0, 10);
    }
  };

  /**
   * Pattern QCM - Effets et propriétés multiples
   */
  private static PATTERN_PROPERTIES_LIST: QuestionPattern = {
    type: 'qcm',
    difficulty: 'easy',
    template: 'Parmi ces propositions, laquelle est une propriété de {substance} ?',
    extractionRules: (section) => 
      section.content.toLowerCase().includes('propriété') ||
      section.content.toLowerCase().includes('effet') ||
      /^[•\-\*]\s*[a-zéèêà]{5,}/.test(section.content), // Listes avec bullets
    generator: (section, moduleId) => {
      const questions: ParsedQuestion[] = [];
      const lines = section.content.split('\n').filter(l => l.trim());

      // Extraire toutes les propriétés listées
      const properties: string[] = [];
      lines.forEach(line => {
        if (/^[•\-\*]/.test(line.trim())) {
          const prop = line.replace(/^[•\-\*]\s*/, '').trim();
          if (prop.length > 10 && prop.length < 80) {
            properties.push(prop);
          }
        }
      });

      // Créer des questions "laquelle est correcte ?"
      if (properties.length >= 4) {
        // Trouver le titre/sujet de la section
        const titleLine = lines.find(l => 
          !l.startsWith('•') && !l.startsWith('-') && !l.startsWith('*') && l.length > 5
        );
        const subject = titleLine ? titleLine.substring(0, 50) : 'cette substance';

        properties.forEach((correctProp, index) => {
          if (index < 10) { // Limiter le nombre de questions
            const wrongProps = properties
              .filter((_, i) => i !== index)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);

            questions.push({
              id: `${moduleId}_prop_${index}`,
              text: `Parmi les propositions suivantes, laquelle concerne ${subject} ?`,
              options: this.shuffleOptions([correctProp, ...wrongProps]),
              correctAnswer: 0,
              category: 'Pharmacologie',
              difficulty: 'easy',
              points: 1,
              sourceModule: moduleId,
              tags: ['propriété', 'effet']
            });
          }
        });
      }

      return questions.slice(0, 15);
    }
  };

  /**
   * Tous les patterns disponibles
   */
  private static ALL_PATTERNS: QuestionPattern[] = [
    this.PATTERN_DEFINITION,
    this.PATTERN_CLASSIFICATION,
    this.PATTERN_CONTRAINDICATION,
    this.PATTERN_MECHANISM,
    this.PATTERN_ANATOMY,
    this.PATTERN_MOLECULES,
    this.PATTERN_NORMAL_VALUES,
    this.PATTERN_PROTOCOLS,
    this.PATTERN_PROPERTIES_LIST
  ];

  /**
   * Génère des questions intelligentes depuis un contenu de module
   */
  static generateQuestionsFromModule(moduleContent: string, moduleId: string, moduleName: string): ParsedQuestion[] {
    const allQuestions: ParsedQuestion[] = [];

    // Découper le module en sections
    const sections = this.parseModuleIntoSections(moduleContent, moduleName);

    // Appliquer chaque pattern sur les sections appropriées
    this.ALL_PATTERNS.forEach(pattern => {
      sections
        .filter(section => pattern.extractionRules(section))
        .forEach(section => {
          try {
            const questions = pattern.generator(section, moduleId);
            allQuestions.push(...questions);
          } catch (error) {
            console.warn(`Erreur pattern ${pattern.type} sur section ${section.title}:`, error);
          }
        });
    });

    // Dédupliquer et limiter
    return this.deduplicateQuestions(allQuestions).slice(0, 50);
  }

  /**
   * Parse un module en sections thématiques
   */
  private static parseModuleIntoSections(content: string, moduleName: string): ModuleSection[] {
    const sections: ModuleSection[] = [];
    const lines = content.split('\n');
    
    let currentSection: ModuleSection | null = null;
    let currentContent: string[] = [];

    lines.forEach(line => {
      // Détecter un nouveau titre de section (## Page X ou ### Titre)
      if (line.startsWith('##') || line.startsWith('###')) {
        // Sauvegarder section précédente
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent.join('\n');
          currentSection.type = this.detectSectionType(currentSection.content);
          sections.push(currentSection);
        }

        // Nouvelle section
        currentSection = {
          title: line.replace(/^#+\s*/, '').trim(),
          content: '',
          type: 'definition'
        };
        currentContent = [];
      } else if (currentSection && line.trim()) {
        currentContent.push(line);
      }
    });

    // Dernière section
    if (currentSection && currentContent.length > 0) {
      currentSection.content = currentContent.join('\n');
      currentSection.type = this.detectSectionType(currentSection.content);
      sections.push(currentSection);
    }

    return sections.filter(s => s.content.length > 100);
  }

  /**
   * Détecte le type d'une section selon son contenu
   */
  private static detectSectionType(content: string): ModuleSection['type'] {
    const lower = content.toLowerCase();
    
    if (lower.includes('palier') || lower.includes('classe') || lower.includes('catégorie')) {
      return 'classification';
    }
    if (lower.includes('mécanisme') || lower.includes('pharmacodynamie')) {
      return 'mechanism';
    }
    if (lower.includes('posologie') || lower.includes('dose') || lower.includes('mg/kg')) {
      return 'doses';
    }
    if (lower.includes('cas clinique') || lower.includes('patient')) {
      return 'clinical';
    }
    if (content.split('\n').filter(l => /^[•\-\*]/.test(l.trim())).length > 3) {
      return 'list';
    }
    
    return 'definition';
  }

  /**
   * Génère des distracteurs plausibles
   */
  private static generateDistractors(correct: string, pool: string[]): string[] {
    const distractors: string[] = [];
    
    // Prendre d'autres définitions du pool
    pool.forEach(line => {
      const parts = line.split(/[:=]/);
      if (parts[1] && parts[1].trim() !== correct && parts[1].trim().length > 10) {
        distractors.push(parts[1].trim());
      }
    });

    // Ajouter distracteurs génériques si besoin
    if (distractors.length < 3) {
      distractors.push(
        "Processus d'activation des récepteurs périphériques",
        "Mécanisme d'inhibition de la transmission synaptique",
        "Régulation de l'homéostasie cellulaire"
      );
    }

    return distractors;
  }

  /**
   * Mélange les options et recalcule l'index de la réponse correcte
   */
  private static shuffleOptions(options: string[]): string[] {
    const shuffled = [...options];
    const correctAnswer = shuffled[0];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * Déduplique les questions similaires
   */
  private static deduplicateQuestions(questions: ParsedQuestion[]): ParsedQuestion[] {
    const seen = new Set<string>();
    const unique: ParsedQuestion[] = [];

    questions.forEach(q => {
      const signature = `${q.text.substring(0, 50)}_${q.options[0].substring(0, 20)}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        unique.push(q);
      }
    });

    return unique;
  }

  /**
   * Recalcule l'index de la réponse correcte après shuffle
   */
  static recalculateCorrectAnswer(question: ParsedQuestion, correctText: string): ParsedQuestion {
    const correctIndex = question.options.findIndex(opt => opt === correctText);
    return {
      ...question,
      correctAnswer: correctIndex !== -1 ? correctIndex : 0
    };
  }
}


/**
 * Analyseur intelligent de contenu OCR
 * Extrait les concepts, listes, définitions et mécanismes pour générer des questions
 */

export interface ContentConcept {
  type: 'list' | 'definition' | 'mechanism' | 'table' | 'clinical_case';
  title: string;
  content: string;
  items?: string[];
  context: string;
  lineNumber: number;
}

export interface AnalysisResult {
  concepts: ContentConcept[];
  sections: string[];
  hasStructuredQuestions: boolean;
  contentType: 'cours' | 'concours' | 'mixte';
}

export class ContentAnalyzer {
  /**
   * Analyse un fichier Markdown et extrait les concepts
   */
  static analyzeContent(content: string, moduleId: string): AnalysisResult {
    const concepts: ContentConcept[] = [];
    const sections: string[] = [];
    
    // Détecter le type de contenu
    const contentType = this.detectContentType(content, moduleId);
    
    // Extraire les sections
    const sectionMatches = content.matchAll(/^##\s+(.+?)$/gm);
    for (const match of sectionMatches) {
      sections.push(match[1].trim());
    }

    // Extraire les listes (potentiel pour QCM)
    concepts.push(...this.extractLists(content));
    
    // Extraire les définitions (potentiel pour QROC)
    concepts.push(...this.extractDefinitions(content));
    
    // Extraire les mécanismes (potentiel pour questions de compréhension)
    concepts.push(...this.extractMechanisms(content));
    
    // Extraire les tableaux (potentiel pour questions de comparaison)
    concepts.push(...this.extractTables(content));
    
    // Extraire les cas cliniques
    concepts.push(...this.extractClinicalCases(content));
    
    // Vérifier s'il y a des questions structurées
    const hasStructuredQuestions = this.hasStructuredQuestions(content);

    return {
      concepts,
      sections,
      hasStructuredQuestions,
      contentType,
    };
  }

  /**
   * Détecte le type de contenu (cours, concours, mixte)
   */
  private static detectContentType(content: string, moduleId: string): 'cours' | 'concours' | 'mixte' {
    const hasQCM = /qcm|question\s+\d+|choix\s+multiple/i.test(content);
    const hasClinicalCase = /cas\s+clinique|patient\s+présente|anamnèse/i.test(content);
    const hasLists = (content.match(/^[-•]\s+/gm) || []).length > 5;
    const hasDefinitions = (content.match(/définition|qu'est-ce|c'est\s+quoi/gi) || []).length > 3;
    
    if (moduleId.includes('sujet_') || moduleId.includes('concours')) {
      return 'concours';
    }
    
    if ((hasQCM || hasClinicalCase) && (hasLists || hasDefinitions)) {
      return 'mixte';
    }
    
    if (hasLists || hasDefinitions) {
      return 'cours';
    }
    
    return 'cours';
  }

  /**
   * Vérifie si le contenu a des questions déjà structurées
   */
  private static hasStructuredQuestions(content: string): boolean {
    const patterns = [
      /Question\s+\d+/i,
      /\d+[.)]\s+.+?\n[A-D][.)]/,
      /QCM/i,
      /QROC/i,
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Extrait les listes structurées (pour générer des QCM)
   */
  private static extractLists(content: string): ContentConcept[] {
    const concepts: ContentConcept[] = [];
    const lines = content.split('\n');
    
    let currentList: string[] = [];
    let listTitle = '';
    let listStartLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Détection début de liste
      if (trimmed.match(/^[-•*]\s+/)) {
        if (currentList.length === 0) {
          // Chercher le titre (ligne précédente non vide)
          for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
            const prevLine = lines[j].trim();
            if (prevLine && !prevLine.match(/^[-•*#]/)) {
              listTitle = prevLine.replace(/^##\s*/, '').replace(/[:：]\s*$/, '');
              break;
            }
          }
          listStartLine = i;
        }
        
        const item = trimmed.replace(/^[-•*]\s+/, '').trim();
        if (item.length > 5) {
          currentList.push(item);
        }
      } else if (currentList.length > 0 && trimmed) {
        // Fin de liste
        if (currentList.length >= 3) {
          concepts.push({
            type: 'list',
            title: listTitle || 'Liste',
            content: currentList.join('\n'),
            items: [...currentList],
            context: this.getContext(lines, listStartLine),
            lineNumber: listStartLine,
          });
        }
        currentList = [];
        listTitle = '';
      }
    }
    
    // Traiter la dernière liste
    if (currentList.length >= 3) {
      concepts.push({
        type: 'list',
        title: listTitle || 'Liste',
        content: currentList.join('\n'),
        items: [...currentList],
        context: this.getContext(lines, listStartLine),
        lineNumber: listStartLine,
      });
    }
    
    return concepts;
  }

  /**
   * Extrait les définitions (pour générer des QROC)
   */
  private static extractDefinitions(content: string): ContentConcept[] {
    const concepts: ContentConcept[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      
      // Patterns de définition améliorés
      const definitionKeywords = [
        'définition',
        'qu\'est-ce',
        'c\'est quoi',
        'désigne',
        'correspond à',
        'se caractérise',
        'représente',
        'signifie',
      ];
      
      const hasKeyword = definitionKeywords.some(kw => lower.includes(kw));
      const hasColonOrEqual = /^(.+?)\s*[:=]\s*(.{20,})/.test(line);
      
      const isDefinition = hasKeyword || hasColonOrEqual;
      
      if (isDefinition && line.trim().length > 20) {
        // Extraire le terme et la définition
        let term = '';
        let definition = '';
        
        // Pattern "TERME = définition" ou "TERME : définition"
        const match = line.match(/^(.+?)\s*[:=]\s*(.+)/);
        if (match) {
          term = match[1].trim().replace(/^##\s*/, '');
          definition = match[2].trim();
          
          // Continuer sur les lignes suivantes si courte
          if (definition.length < 50) {
            for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
              if (lines[j].trim() && !lines[j].match(/^#/) && !lines[j].match(/^[-•*]/)) {
                definition += ' ' + lines[j].trim();
              }
            }
          }
        } 
        // Pattern "Définition de TERME" ou "TERME désigne..."
        else if (hasKeyword) {
          // Extraire le terme
          const termMatch = line.match(/(?:définition|qu'est-ce)\s+(?:de\s+|que\s+)?(.+?)(?:\?|$)/i);
          if (termMatch) {
            term = termMatch[1].trim();
          } else {
            const designMatch = line.match(/^(.+?)\s+(?:désigne|correspond|représente|signifie)/i);
            term = designMatch ? designMatch[1].trim() : line.substring(0, 50);
          }
          
          // La définition est sur les lignes suivantes
          for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            if (lines[j].trim() && !lines[j].match(/^#/)) {
              definition += lines[j].trim() + ' ';
            }
          }
        }
        
        if (term && definition && definition.length > 30) {
          concepts.push({
            type: 'definition',
            title: term,
            content: definition.trim(),
            context: this.getContext(lines, i),
            lineNumber: i,
          });
        }
      }
    }
    
    return concepts;
  }

  /**
   * Extrait les mécanismes physiologiques (pour questions de compréhension)
   */
  private static extractMechanisms(content: string): ContentConcept[] {
    const concepts: ContentConcept[] = [];
    const lines = content.split('\n');
    
    const mechanismKeywords = [
      'mécanisme',
      'physiologie',
      'pharmacologie',
      'action',
      'permet',
      'induit',
      'provoque',
      'entraîne',
      'déclenche',
      'processus',
      'cascade',
      'voie',
      'séquence',
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      
      const hasMechanismKeyword = mechanismKeywords.some(kw => lower.includes(kw));
      const hasArrows = /→|⇒|->|=>/.test(line);
      const hasNumberedSteps = /^\d+[.)]/.test(line.trim());
      
      if ((hasMechanismKeyword || hasArrows || hasNumberedSteps) && line.trim().length > 20) {
        // Si étapes numérotées, récupérer toute la séquence
        if (hasNumberedSteps) {
          const sequence: string[] = [line.trim()];
          
          // Continuer à lire les étapes suivantes
          for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
            const nextLine = lines[j].trim();
            if (/^\d+[.)]/.test(nextLine)) {
              sequence.push(nextLine);
            } else if (nextLine && !nextLine.match(/^#/)) {
              // Ligne de continuation
              if (sequence.length > 0) {
                sequence[sequence.length - 1] += ' ' + nextLine;
              }
            } else if (nextLine.match(/^#/) || j - i > 5) {
              break;
            }
          }
          
          if (sequence.length >= 2) {
            const title = this.findTitle(lines, i) || 'Mécanisme en étapes';
            
            concepts.push({
              type: 'mechanism',
              title,
              content: sequence.join('\n'),
              items: sequence,
              context: this.getContext(lines, i),
              lineNumber: i,
            });
          }
        }
        // Sinon, récupérer le contexte normal
        else {
          const contextLines: string[] = [];
          for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 5); j++) {
            if (lines[j].trim()) {
              contextLines.push(lines[j].trim());
            }
          }
          
          if (contextLines.length >= 2) {
            const title = this.findTitle(lines, i) || lines[i].trim().substring(0, 100);
            
            concepts.push({
              type: 'mechanism',
              title,
              content: contextLines.join('\n'),
              context: this.getContext(lines, i),
              lineNumber: i,
            });
          }
        }
      }
    }
    
    return concepts;
  }

  /**
   * Trouve le titre de section le plus proche
   */
  private static findTitle(lines: string[], currentLine: number): string | null {
    for (let i = currentLine - 1; i >= Math.max(0, currentLine - 5); i--) {
      const line = lines[i].trim();
      if (line.match(/^##\s+/)) {
        return line.replace(/^##\s+/, '');
      }
    }
    return null;
  }

  /**
   * Extrait les tableaux (pour questions de comparaison)
   */
  private static extractTables(content: string): ContentConcept[] {
    const concepts: ContentConcept[] = [];
    const lines = content.split('\n');
    
    let inTable = false;
    let tableLines: string[] = [];
    let tableStartLine = 0;
    let tableTitle = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableLine = line.includes('|') && line.split('|').length >= 3;
      
      if (isTableLine) {
        if (!inTable) {
          inTable = true;
          tableStartLine = i;
          // Chercher le titre
          for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
            const prevLine = lines[j].trim();
            if (prevLine && !prevLine.includes('|') && !prevLine.match(/^[-=]+$/)) {
              tableTitle = prevLine.replace(/^##\s*/, '');
              break;
            }
          }
        }
        tableLines.push(line);
      } else if (inTable && line.trim()) {
        // Fin du tableau
        if (tableLines.length >= 3) {
          concepts.push({
            type: 'table',
            title: tableTitle || 'Tableau',
            content: tableLines.join('\n'),
            context: this.getContext(lines, tableStartLine),
            lineNumber: tableStartLine,
          });
        }
        inTable = false;
        tableLines = [];
        tableTitle = '';
      }
    }
    
    // Traiter le dernier tableau
    if (tableLines.length >= 3) {
      concepts.push({
        type: 'table',
        title: tableTitle || 'Tableau',
        content: tableLines.join('\n'),
        context: this.getContext(lines, tableStartLine),
        lineNumber: tableStartLine,
      });
    }
    
    return concepts;
  }

  /**
   * Extrait les cas cliniques
   */
  private static extractClinicalCases(content: string): ContentConcept[] {
    const concepts: ContentConcept[] = [];
    const lines = content.split('\n');
    
    const clinicalKeywords = [
      'cas clinique',
      'patient présente',
      'patient de',
      'anamnèse',
      'antécédents',
      'tableau clinique',
      'diagnostic',
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      
      const hasClinicalKeyword = clinicalKeywords.some(kw => lower.includes(kw));
      
      if (hasClinicalKeyword) {
        // Récupérer le cas complet (±5 lignes)
        const caseLines: string[] = [];
        for (let j = i; j < Math.min(lines.length, i + 10); j++) {
          if (lines[j].trim()) {
            caseLines.push(lines[j].trim());
            
            // Arrêter à la première question ou nouveau titre
            if (lines[j].match(/^##/) && j > i) break;
            if (lines[j].includes('?') && j > i + 2) {
              caseLines.push(lines[j].trim());
              break;
            }
          }
        }
        
        if (caseLines.length >= 3) {
          concepts.push({
            type: 'clinical_case',
            title: 'Cas clinique',
            content: caseLines.join('\n'),
            context: caseLines.slice(0, 5).join('\n'),
            lineNumber: i,
          });
        }
      }
    }
    
    return concepts;
  }

  /**
   * Récupère le contexte autour d'une ligne
   */
  private static getContext(lines: string[], lineNumber: number, contextSize = 3): string {
    const start = Math.max(0, lineNumber - contextSize);
    const end = Math.min(lines.length, lineNumber + contextSize + 1);
    
    return lines
      .slice(start, end)
      .filter(l => l.trim())
      .join('\n');
  }

  /**
   * Évalue la qualité d'un concept pour la génération de questions
   */
  static evaluateConceptQuality(concept: ContentConcept): number {
    let score = 50; // Base
    
    // Longueur appropriée
    if (concept.content.length > 100 && concept.content.length < 500) {
      score += 20;
    }
    
    // Type de concept
    switch (concept.type) {
      case 'list':
        if (concept.items && concept.items.length >= 4) score += 30;
        break;
      case 'definition':
        if (concept.content.length > 50) score += 25;
        break;
      case 'mechanism':
        score += 20;
        break;
      case 'table':
        score += 15;
        break;
      case 'clinical_case':
        score += 35; // Très pertinent pour concours
        break;
    }
    
    // Titre significatif
    if (concept.title && concept.title.length > 5 && concept.title.length < 100) {
      score += 10;
    }
    
    // Contenu médical (mots-clés)
    const medicalKeywords = [
      'patient', 'traitement', 'diagnostic', 'symptôme', 'signe',
      'urgence', 'grave', 'risque', 'contre-indication', 'indication',
      'médicament', 'dose', 'voie', 'administration', 'surveillance',
    ];
    
    const keywordCount = medicalKeywords.filter(kw =>
      concept.content.toLowerCase().includes(kw)
    ).length;
    
    score += Math.min(20, keywordCount * 3);
    
    return Math.min(100, score);
  }

  /**
   * Filtre les concepts de haute qualité
   */
  static getHighQualityConcepts(concepts: ContentConcept[], minScore = 60): ContentConcept[] {
    return concepts
      .map(c => ({ concept: c, score: this.evaluateConceptQuality(c) }))
      .filter(item => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .map(item => item.concept);
  }
}


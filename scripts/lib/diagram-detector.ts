import inquirer from 'inquirer';

export interface DiagramDetection {
  lineNumber: number;
  content: string;
  type: 'flowchart' | 'sequence' | 'graph' | 'unknown';
  confidence: number;
}

export interface MermaidDiagram {
  type: string;
  code: string;
  description: string;
}

/**
 * Détecteur de schémas et générateur de diagrammes Mermaid
 */
export class DiagramDetector {
  private interactiveMode: boolean;

  constructor(interactiveMode = true) {
    this.interactiveMode = interactiveMode;
  }

  /**
   * Détecte les schémas potentiels dans le texte
   */
  detectDiagrams(text: string): DiagramDetection[] {
    const lines = text.split('\n');
    const detections: DiagramDetection[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Détection par mots-clés
      const keywordMatches = [
        'figure',
        'schéma',
        'diagramme',
        'graphique',
        'organigramme',
        'tableau',
        'illustration',
      ].some(keyword => line.includes(keyword));

      if (keywordMatches) {
        // Récupérer le contexte (3 lignes avant et après)
        const start = Math.max(0, i - 3);
        const end = Math.min(lines.length, i + 4);
        const context = lines.slice(start, end).join('\n');

        detections.push({
          lineNumber: i + 1,
          content: context,
          type: this.guessType(context),
          confidence: 0.7,
        });
      }

      // Détection de flèches ASCII
      const hasArrows = /[→←↑↓⇒⇐⇑⇓➔➜➡⟶]/g.test(line) || 
                       /->|<-|=>|<=|\|/g.test(line);

      if (hasArrows) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        const context = lines.slice(start, end).join('\n');

        // Vérifier si ce n'est pas déjà détecté
        const alreadyDetected = detections.some(
          d => Math.abs(d.lineNumber - (i + 1)) < 3
        );

        if (!alreadyDetected) {
          detections.push({
            lineNumber: i + 1,
            content: context,
            type: 'flowchart',
            confidence: 0.6,
          });
        }
      }

      // Détection de structures hiérarchiques
      const hasHierarchy = /^\s*[-•]\s+/g.test(line) && 
                           lines[i + 1]?.match(/^\s{2,}[-•]\s+/);

      if (hasHierarchy) {
        const start = i;
        let end = i + 1;
        
        // Trouver la fin de la hiérarchie
        while (end < lines.length && /^\s*[-•]\s+/g.test(lines[end])) {
          end++;
        }

        const context = lines.slice(start, end).join('\n');

        const alreadyDetected = detections.some(
          d => Math.abs(d.lineNumber - (i + 1)) < 5
        );

        if (!alreadyDetected && end - start >= 3) {
          detections.push({
            lineNumber: i + 1,
            content: context,
            type: 'graph',
            confidence: 0.5,
          });
        }
      }
    }

    return detections;
  }

  /**
   * Devine le type de diagramme
   */
  private guessType(content: string): DiagramDetection['type'] {
    const lower = content.toLowerCase();

    if (lower.includes('séquence') || lower.includes('étape')) {
      return 'sequence';
    }

    if (lower.includes('organigramme') || lower.includes('processus')) {
      return 'flowchart';
    }

    if (lower.includes('relation') || lower.includes('lien')) {
      return 'graph';
    }

    return 'unknown';
  }

  /**
   * Demande confirmation à l'utilisateur pour un schéma
   */
  async confirmDiagram(detection: DiagramDetection): Promise<boolean> {
    if (!this.interactiveMode) {
      return false; // Mode non-interactif, on skip
    }

    console.log('\n📊 Schéma potentiel détecté:');
    console.log('─'.repeat(60));
    console.log(detection.content.substring(0, 200));
    if (detection.content.length > 200) {
      console.log('...');
    }
    console.log('─'.repeat(60));

    const { shouldConvert } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldConvert',
        message: `Générer un diagramme Mermaid pour cette section ? (ligne ${detection.lineNumber})`,
        default: false,
      },
    ]);

    return shouldConvert;
  }

  /**
   * Demande le type de diagramme à l'utilisateur
   */
  async selectDiagramType(
    suggestedType: string
  ): Promise<string | null> {
    const { diagramType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'diagramType',
        message: 'Quel type de diagramme voulez-vous créer ?',
        choices: [
          { name: '📊 Flowchart (organigramme)', value: 'flowchart' },
          { name: '🔗 Graph (graphe relationnel)', value: 'graph' },
          { name: '📝 Sequence (diagramme de séquence)', value: 'sequence' },
          { name: '⏭️  Ignorer ce schéma', value: 'skip' },
        ],
        default: suggestedType === 'unknown' ? 'flowchart' : suggestedType,
      },
    ]);

    return diagramType === 'skip' ? null : diagramType;
  }

  /**
   * Génère un template Mermaid basique
   */
  generateMermaidTemplate(
    type: string,
    content: string
  ): MermaidDiagram {
    const description = content.split('\n')[0].substring(0, 100);

    switch (type) {
      case 'flowchart':
        return {
          type: 'flowchart',
          description,
          code: `\`\`\`mermaid
flowchart TD
    A[Début] --> B[Étape 1]
    B --> C[Étape 2]
    C --> D[Fin]
\`\`\`

> ⚠️ **Note**: Ce diagramme est un template à ajuster manuellement.`,
        };

      case 'graph':
        return {
          type: 'graph',
          description,
          code: `\`\`\`mermaid
graph LR
    A[Concept A] --> B[Concept B]
    A --> C[Concept C]
    B --> D[Résultat]
    C --> D
\`\`\`

> ⚠️ **Note**: Ce diagramme est un template à ajuster manuellement.`,
        };

      case 'sequence':
        return {
          type: 'sequence',
          description,
          code: `\`\`\`mermaid
sequenceDiagram
    participant A as Acteur A
    participant B as Acteur B
    A->>B: Action 1
    B->>A: Réponse 1
    A->>B: Action 2
\`\`\`

> ⚠️ **Note**: Ce diagramme est un template à ajuster manuellement.`,
        };

      default:
        return {
          type: 'graph',
          description,
          code: `\`\`\`mermaid
graph TD
    A[Élément A] --> B[Élément B]
\`\`\`

> ⚠️ **Note**: Ce diagramme est un template à ajuster manuellement.`,
        };
    }
  }

  /**
   * Traite tous les schémas détectés de manière interactive
   */
  async processDetections(
    text: string
  ): Promise<{ text: string; diagramsAdded: number }> {
    const detections = this.detectDiagrams(text);

    if (detections.length === 0) {
      return { text, diagramsAdded: 0 };
    }

    console.log(`\n🔍 ${detections.length} schéma(s) potentiel(s) détecté(s)\n`);

    let modifiedText = text;
    let diagramsAdded = 0;

    for (const detection of detections) {
      const shouldConvert = await this.confirmDiagram(detection);

      if (shouldConvert) {
        const diagramType = await this.selectDiagramType(detection.type);

        if (diagramType) {
          const diagram = this.generateMermaidTemplate(
            diagramType,
            detection.content
          );

          // Insérer le diagramme après le contexte détecté
          const lines = modifiedText.split('\n');
          const insertPosition = detection.lineNumber + 2;

          lines.splice(
            insertPosition,
            0,
            '',
            diagram.code,
            ''
          );

          modifiedText = lines.join('\n');
          diagramsAdded++;

          console.log(`✅ Diagramme ${diagramType} ajouté à la ligne ${insertPosition}\n`);
        }
      }
    }

    return { text: modifiedText, diagramsAdded };
  }
}


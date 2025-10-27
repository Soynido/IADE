import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interface pour le Knowledge Graph
 */
interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    generatedAt: string;
    source: string[];
    totalNodes: number;
    totalEdges: number;
  };
}

interface GraphNode {
  id: string;
  type: 'Concept' | 'Question' | 'Section' | 'Theme';
  label: string;
  properties: {
    [key: string]: any;
  };
  embedding?: number[] | null;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  properties?: {
    [key: string]: any;
  };
}

/**
 * Construit le Knowledge Graph à partir des données extraites
 */
export class KnowledgeGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private conceptFrequency: Map<string, number> = new Map();

  /**
   * Traite les annales et construit le graphe
   */
  async build(source: 'ocr' | 'native' = 'ocr'): Promise<KnowledgeGraph> {
    console.log('\n🧠 CONSTRUCTION DU KNOWLEDGE GRAPH\n');
    console.log('════════════════════════════════════════════════════════════════\n');

    const concoursDir = path.join(__dirname, '../src/data/concours');
    
    // Charger les données
    const annalesV1 = this.loadAnnales(path.join(concoursDir, 'annales-volume-1.json'));
    const annalesV2 = this.loadAnnales(path.join(concoursDir, 'annales-volume-2.json'));
    const cours = this.loadCours(path.join(concoursDir, 'cours-complet.json'));

    console.log(`📚 Sources chargées :`);
    console.log(`   - Annales V1 : ${annalesV1.examSets.length} série(s)`);
    console.log(`   - Annales V2 : ${annalesV2.examSets.length} série(s)`);
    console.log(`   - Cours : ${cours.chapters.length} chapitre(s)\n`);

    // Construire les noeuds
    this.buildQuestionNodes(annalesV1);
    this.buildQuestionNodes(annalesV2);
    this.buildConceptNodes(annalesV1, annalesV2);
    this.buildSectionNodes(cours);

    // Construire les liens
    this.buildQuestionToConceptEdges(annalesV1);
    this.buildQuestionToConceptEdges(annalesV2);
    this.buildConceptToSectionEdges(cours);

    console.log(`\n✅ Graphe construit :`);
    console.log(`   - ${this.nodes.size} noeud(s)`);
    console.log(`   - ${this.edges.length} lien(s)\n`);

    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: ['ocr'],
        totalNodes: this.nodes.size,
        totalEdges: this.edges.length
      }
    };
  }

  /**
   * Charge les annales
   */
  private loadAnnales(filePath: string): any {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier introuvable: ${path.basename(filePath)}`);
      return { examSets: [] };
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  /**
   * Charge le cours
   */
  private loadCours(filePath: string): any {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier introuvable: ${path.basename(filePath)}`);
      return { chapters: [] };
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  /**
   * Construit les noeuds Question
   */
  private buildQuestionNodes(annales: any): void {
    for (const examSet of annales.examSets) {
      for (const question of examSet.questions) {
        const nodeId = `question_${question.id}`;
        
        if (!this.nodes.has(nodeId)) {
          this.nodes.set(nodeId, {
            id: nodeId,
            type: 'Question',
              label: (question.text || '').substring(0, 100) + '...',
            properties: {
              originalText: question.text,
              type: question.type,
              difficulty: question.difficultyLevel,
              themes: question.themes,
              source: annales.source
            },
            embedding: question.embedding
          });
        }
      }
    }
  }

  /**
   * Construit les noeuds Concept (mots-clés extraits des questions)
   */
  private buildConceptNodes(annales1: any, annales2: any): void {
    const medicalKeywords = this.extractMedicalKeywords(annales1, annales2);
    
    for (const [keyword, frequency] of medicalKeywords) {
      const nodeId = `concept_${keyword.toLowerCase().replace(/\s+/g, '_')}`;
      
      this.nodes.set(nodeId, {
        id: nodeId,
        type: 'Concept',
        label: keyword,
        properties: {
          frequency,
          category: this.categorizeKeyword(keyword)
        }
      });
    }
  }

  /**
   * Construit les noeuds Section
   */
  private buildSectionNodes(cours: any): void {
    for (const chapter of cours.chapters) {
      const chapterNodeId = `section_${chapter.id}`;
      
      this.nodes.set(chapterNodeId, {
        id: chapterNodeId,
        type: 'Section',
        label: chapter.title,
        properties: {
          themes: chapter.themes,
          sectionCount: chapter.sections?.length || 0
        }
      });

      for (const section of chapter.sections || []) {
        const sectionNodeId = `section_${section.id}`;
        
        this.nodes.set(sectionNodeId, {
          id: sectionNodeId,
          type: 'Section',
          label: section.title,
          properties: {
            conceptsCount: section.concepts?.length || 0,
            parentChapter: chapter.title
          }
        });
      }
    }
  }

  /**
   * Extrait les mots-clés médicaux des annales
   */
  private extractMedicalKeywords(annales1: any, annales2: any): Map<string, number> {
    const keywords = new Map<string, number>();
    
    const medicalTerms = [
      'perfusion', 'transfusion', 'gaz du sang', 'diabète', 'insuline',
      'injection', 'intraveineuse', 'sous-cutané', 'intramusculaire',
      'pression', 'tension', 'pouls', 'fréquence', 'respiration',
      'antibiotique', 'antalgique', 'anticoagulant', 'diurétique',
      'choc', 'sepsis', 'douleur', 'fièvre', 'hyperthermie',
      'hypotension', 'hypertension', 'bradycardie', 'tachycardie',
      'asphyxie', 'O2', 'oxygène', 'ventilation', 'intubation',
      'calcul', 'dose', 'posologie', 'dilution', 'mg/kg', 'µg/kg'
    ];

    for (const annales of [annales1, annales2]) {
      for (const examSet of annales.examSets) {
        for (const question of examSet.questions) {
          const text = (question.text + ' ' + (question.correction?.explanation || '')).toLowerCase();
          
          for (const term of medicalTerms) {
            if (text.includes(term.toLowerCase())) {
              keywords.set(term, (keywords.get(term) || 0) + 1);
            }
          }
        }
      }
    }

    // Garder seulement les termes apparaissant au moins 2 fois
    return new Map([...keywords.entries()].filter(([_, freq]) => freq >= 2));
  }

  /**
   * Catégorise un mot-clé
   */
  private categorizeKeyword(keyword: string): string {
    const lower = keyword.toLowerCase();
    
    if (lower.includes('perfusion') || lower.includes('injection')) return 'Technique';
    if (lower.includes('calcul') || lower.includes('dose')) return 'Calcul';
    if (lower.includes('antibiotique') || lower.includes('médicament')) return 'Médicament';
    if (lower.includes('pression') || lower.includes('pouls')) return 'Signe vital';
    
    return 'Autre';
  }

  /**
   * Construit les liens Question → Concept
   */
  private buildQuestionToConceptEdges(annales: any): void {
    for (const examSet of annales.examSets) {
      for (const question of examSet.questions) {
        const questionNodeId = `question_${question.id}`;
        const text = (question.text + ' ' + (question.correction?.explanation || '')).toLowerCase();
        
        for (const [conceptId] of this.nodes) {
          if (conceptId.startsWith('concept_')) {
            const concept = this.nodes.get(conceptId)!;
            if (text.includes(concept.properties.frequency)) {
              this.edges.push({
                source: questionNodeId,
                target: conceptId,
                relation: 'mentions',
                weight: 1
              });
            }
          }
        }
      }
    }
  }

  /**
   * Construit les liens Concept → Section
   */
  private buildConceptToSectionEdges(cours: any): void {
    // Placeholder pour matching futur
    // Pour l'instant, on crée quelques liens basés sur les titres
  }

  /**
   * Sauvegarde le Knowledge Graph
   */
  async save(graph: KnowledgeGraph): Promise<void> {
    const outputPath = path.join(__dirname, '../src/data/concours/knowledge-graph.json');
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(graph, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Graphe sauvegardé: ${outputPath}`);
    console.log(`   📊 Taille: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);
  }
}

// Exécution si appelé directement
async function main() {
  const builder = new KnowledgeGraphBuilder();
  
  const source = (process.argv[2] === '--source' && process.argv[3]) || 'ocr';
  
  const graph = await builder.build(source as any);
  await builder.save(graph);
  
  // Health check
  if (graph.nodes.length < 10 || graph.edges.length < 20) {
    console.log('⚠️  AVERTISSEMENT: Graphe trop petit, parsers nécessitent affinage');
  } else {
    console.log('✅ Graphe validé (taille suffisante)');
  }
}

if (import.meta.url.includes('buildKnowledgeGraph.ts')) {
  main().catch(console.error);
}


/**
 * Script simplifié pour générer un Knowledge Graph à partir des questions mockées
 * Version rapide pour MVP
 */

import * as fs from 'fs';
import * as path from 'path';

interface Question {
  id: string;
  type: string;
  theme: string;
  text: string;
  themes: string[];
  difficulty: string;
}

interface GraphNode {
  id: string;
  type: 'Concept' | 'Question' | 'Theme';
  label: string;
  properties: any;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    generatedAt: string;
    totalNodes: number;
    totalEdges: number;
    source: string;
  };
}

async function buildKnowledgeGraph() {
  console.log('\n🧠 CONSTRUCTION DU KNOWLEDGE GRAPH SIMPLIFIÉ\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Charger les questions mockées
  const questionsPath = path.join(process.cwd(), 'src/data/mock/questions.json');
  const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  const questions: Question[] = questionsData.questions;

  console.log(`📚 ${questions.length} questions chargées\n`);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const themeFrequency = new Map<string, number>();
  const conceptsByTheme = new Map<string, Set<string>>();

  // 1. Créer les noeuds de thèmes
  questions.forEach(q => {
    q.themes.forEach(theme => {
      themeFrequency.set(theme, (themeFrequency.get(theme) || 0) + 1);
      
      if (!conceptsByTheme.has(theme)) {
        conceptsByTheme.set(theme, new Set());
      }
    });
  });

  themeFrequency.forEach((count, theme) => {
    nodes.push({
      id: `theme_${theme.toLowerCase().replace(/\s+/g, '_')}`,
      type: 'Theme',
      label: theme,
      properties: {
        questionCount: count,
        importance: count > 5 ? 'high' : count > 2 ? 'medium' : 'low'
      }
    });
  });

  console.log(`✅ ${themeFrequency.size} thèmes identifiés`);

  // 2. Créer les noeuds de questions
  questions.forEach(q => {
    nodes.push({
      id: q.id,
      type: 'Question',
      label: q.text.substring(0, 80) + '...',
      properties: {
        fullText: q.text,
        type: q.type,
        difficulty: q.difficulty,
        themes: q.themes
      }
    });

    // Créer les liens question → thème
    q.themes.forEach(theme => {
      edges.push({
        source: q.id,
        target: `theme_${theme.toLowerCase().replace(/\s+/g, '_')}`,
        relation: 'BELONGS_TO',
        weight: 1.0
      });
    });
  });

  console.log(`✅ ${questions.length} questions ajoutées`);

  // 3. Extraire des concepts clés depuis les questions
  const conceptKeywords = new Map<string, { themes: Set<string>; count: number }>();
  
  const medicalTerms = [
    'Glasgow', 'morphine', 'rein', 'pH', 'acidose', 'alcalose', 'transfusion',
    'ECG', 'débit cardiaque', 'BPCO', 'héparine', 'thyroïdectomie', 'AINS',
    'saturation', 'PCO₂', 'HCO₃', 'naloxone', 'lidocaïne', 'AVC', 'choc',
    'SpO₂', 'glycémie', 'créatinine', 'anesthésie', 'intubation', 'RCP',
    'défibrillation', 'EPO', 'rénine', 'vitamine D', 'insuline', 'paracétamol',
    'SHA', 'OMS', 'RAI', 'culot globulaire', 'plasma', 'plaquettes'
  ];

  questions.forEach(q => {
    const textLower = q.text.toLowerCase();
    medicalTerms.forEach(term => {
      if (textLower.includes(term.toLowerCase())) {
        if (!conceptKeywords.has(term)) {
          conceptKeywords.set(term, { themes: new Set(), count: 0 });
        }
        const concept = conceptKeywords.get(term)!;
        concept.count++;
        q.themes.forEach(theme => concept.themes.add(theme));
      }
    });
  });

  // Créer les noeuds de concepts (seulement ceux qui apparaissent 2+ fois)
  conceptKeywords.forEach((data, concept) => {
    if (data.count >= 2) {
      const conceptId = `concept_${concept.toLowerCase().replace(/\s+/g, '_')}`;
      nodes.push({
        id: conceptId,
        type: 'Concept',
        label: concept,
        properties: {
          frequency: data.count,
          themes: Array.from(data.themes),
          importance: data.count > 5 ? 'high' : data.count > 3 ? 'medium' : 'low'
        }
      });

      // Lier concepts aux thèmes
      data.themes.forEach(theme => {
        edges.push({
          source: conceptId,
          target: `theme_${theme.toLowerCase().replace(/\s+/g, '_')}`,
          relation: 'RELATED_TO',
          weight: data.count / 10
        });
      });
    }
  });

  console.log(`✅ ${Array.from(conceptKeywords.values()).filter(d => d.count >= 2).length} concepts extraits`);

  // 4. Créer des liens entre questions du même thème
  const questionsByTheme = new Map<string, string[]>();
  questions.forEach(q => {
    q.themes.forEach(theme => {
      if (!questionsByTheme.has(theme)) {
        questionsByTheme.set(theme, []);
      }
      questionsByTheme.get(theme)!.push(q.id);
    });
  });

  let relatedCount = 0;
  questionsByTheme.forEach((qIds, theme) => {
    if (qIds.length > 1) {
      // Lier les questions entre elles (max 3 liens par question)
      qIds.forEach((qId, i) => {
        const related = qIds.slice(i + 1, i + 4);
        related.forEach(relatedId => {
          edges.push({
            source: qId,
            target: relatedId,
            relation: 'SIMILAR_THEME',
            weight: 0.5
          });
          relatedCount++;
        });
      });
    }
  });

  console.log(`✅ ${relatedCount} liens de similarité créés`);

  // 5. Construire le graphe final
  const graph: KnowledgeGraph = {
    nodes,
    edges,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalNodes: nodes.length,
      totalEdges: edges.length,
      source: 'mock-questions'
    }
  };

  // Sauvegarder
  const outputPath = path.join(process.cwd(), 'src/data/concours/knowledge-graph.json');
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2), 'utf-8');

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ KNOWLEDGE GRAPH GÉNÉRÉ AVEC SUCCÈS');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`📊 Statistiques :`);
  console.log(`   - Noeuds totaux : ${nodes.length}`);
  console.log(`   - Thèmes : ${themeFrequency.size}`);
  console.log(`   - Questions : ${questions.length}`);
  console.log(`   - Concepts : ${nodes.filter(n => n.type === 'Concept').length}`);
  console.log(`   - Liens totaux : ${edges.length}`);
  console.log(`\n💾 Sauvegardé : ${outputPath}\n`);

  return graph;
}

// Exécution
buildKnowledgeGraph().catch(console.error);


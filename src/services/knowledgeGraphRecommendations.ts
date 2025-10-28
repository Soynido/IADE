/**
 * Moteur de recommandations basé sur le Knowledge Graph
 * Utilise les relations sémantiques pour suggérer les prochains concepts à étudier
 * Cycle IADE-2, Tâche 3
 */

import knowledgeGraphData from '../data/concours/knowledge-graph.json';
import { StorageService } from './storageService';

interface KGNode {
  id: string;
  type: string;
  label: string;
  properties: any;
}

interface KGEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

interface ConceptRecommendation {
  conceptId: string;
  conceptLabel: string;
  score: number;
  reason: string;
  relatedQuestions: string[];
  difficulty: 'facile' | 'moyen' | 'difficile';
}

export class KnowledgeGraphRecommendations {
  private kg: { nodes: KGNode[]; edges: KGEdge[] };

  constructor() {
    this.kg = knowledgeGraphData as any;
  }

  /**
   * Obtenir les prochains concepts recommandés pour un utilisateur
   */
  getNextConcepts(userId: string, limit: number = 5): ConceptRecommendation[] {
    const userProfile = StorageService.getUserProfile();
    
    // 1. Analyser les concepts maîtrisés
    const masteredConcepts = this.getMasteredConcepts(userProfile);
    
    // 2. Analyser les concepts faibles
    const weakConcepts = this.getWeakConcepts(userProfile);
    
    // 3. Obtenir les concepts adjacents dans le KG
    const adjacentConcepts = this.getAdjacentConcepts(masteredConcepts, weakConcepts);
    
    // 4. Scorer les concepts selon plusieurs critères
    const scoredConcepts = adjacentConcepts.map(concept => {
      const score = this.calculateRecommendationScore(concept, userProfile, masteredConcepts, weakConcepts);
      return { ...concept, score };
    });
    
    // 5. Trier par score et retourner top N
    return scoredConcepts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Obtenir les concepts adjacents dans le graphe
   */
  private getAdjacentConcepts(
    masteredConcepts: Set<string>,
    weakConcepts: Set<string>
  ): ConceptRecommendation[] {
    const recommendations: Map<string, ConceptRecommendation> = new Map();

    // Parcourir les edges pour trouver les concepts connectés
    for (const edge of this.kg.edges) {
      // Si le concept source est maîtrisé, recommander la cible
      if (masteredConcepts.has(edge.source)) {
        const targetNode = this.kg.nodes.find(n => n.id === edge.target);
        if (targetNode && targetNode.type === 'Concept' && !masteredConcepts.has(targetNode.id)) {
          this.addRecommendation(recommendations, targetNode, edge, 'prerequisite_mastered');
        }
      }

      // Si le concept cible est maîtrisé, explorer les connexions
      if (masteredConcepts.has(edge.target)) {
        const sourceNode = this.kg.nodes.find(n => n.id === edge.source);
        if (sourceNode && sourceNode.type === 'Concept' && !masteredConcepts.has(sourceNode.id)) {
          this.addRecommendation(recommendations, sourceNode, edge, 'related_to_mastered');
        }
      }
    }

    // Ajouter les concepts faibles avec priorité
    for (const weakId of weakConcepts) {
      const weakNode = this.kg.nodes.find(n => n.id === weakId);
      if (weakNode && !recommendations.has(weakId)) {
        recommendations.set(weakId, {
          conceptId: weakId,
          conceptLabel: weakNode.label,
          score: 0,
          reason: 'needs_review',
          relatedQuestions: this.getRelatedQuestions(weakId),
          difficulty: this.inferDifficulty(weakNode)
        });
      }
    }

    return Array.from(recommendations.values());
  }

  /**
   * Calculer le score de recommandation
   */
  private calculateRecommendationScore(
    concept: ConceptRecommendation,
    userProfile: any,
    masteredConcepts: Set<string>,
    weakConcepts: Set<string>
  ): number {
    let score = 50; // Base score

    // Facteur 1: Raison de la recommandation
    if (concept.reason === 'needs_review') score += 40; // Priorité aux concepts faibles
    if (concept.reason === 'prerequisite_mastered') score += 30; // Progresser logiquement
    if (concept.reason === 'related_to_mastered') score += 20; // Explorer connexions

    // Facteur 2: Nombre de questions liées
    score += Math.min(concept.relatedQuestions.length * 5, 20);

    // Facteur 3: Difficulté adaptée au niveau
    const avgScore = userProfile.totalXP / Math.max(userProfile.totalSessions, 1);
    if (avgScore > 80 && concept.difficulty === 'difficile') score += 15;
    if (avgScore >= 50 && avgScore <= 80 && concept.difficulty === 'moyen') score += 15;
    if (avgScore < 50 && concept.difficulty === 'facile') score += 15;

    // Facteur 4: Pénalité si déjà beaucoup de sessions sur ce concept
    const conceptSessions = this.getConceptSessions(concept.conceptId, userProfile);
    if (conceptSessions > 5) score -= 20;

    // Facteur 5: Bonus si concept lié à plusieurs concepts maîtrisés
    const connectedMasteredCount = this.countConnectedMastered(concept.conceptId, masteredConcepts);
    score += connectedMasteredCount * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Obtenir les concepts maîtrisés (score > 80%)
   */
  private getMasteredConcepts(userProfile: any): Set<string> {
    const mastered = new Set<string>();
    
    // Logique simplifiée: concepts avec bon score dans l'historique
    const themeStats = userProfile.themeStats || {};
    for (const [theme, stats] of Object.entries(themeStats) as any) {
      if (stats.accuracy && stats.accuracy > 80) {
        // Trouver le concept correspondant dans le KG
        const conceptNode = this.kg.nodes.find(n => 
          n.type === 'Concept' && n.label.toLowerCase().includes(theme.toLowerCase())
        );
        if (conceptNode) {
          mastered.add(conceptNode.id);
        }
      }
    }

    return mastered;
  }

  /**
   * Obtenir les concepts faibles (score < 60%)
   */
  private getWeakConcepts(userProfile: any): Set<string> {
    const weak = new Set<string>();
    
    const themeStats = userProfile.themeStats || {};
    for (const [theme, stats] of Object.entries(themeStats) as any) {
      if (stats.accuracy && stats.accuracy < 60) {
        const conceptNode = this.kg.nodes.find(n => 
          n.type === 'Concept' && n.label.toLowerCase().includes(theme.toLowerCase())
        );
        if (conceptNode) {
          weak.add(conceptNode.id);
        }
      }
    }

    // Ajouter des concepts aléatoires si pas assez de données
    if (weak.size === 0) {
      const conceptNodes = this.kg.nodes.filter(n => n.type === 'Concept');
      for (let i = 0; i < Math.min(3, conceptNodes.length); i++) {
        weak.add(conceptNodes[i].id);
      }
    }

    return weak;
  }

  /**
   * Obtenir les questions liées à un concept
   */
  private getRelatedQuestions(conceptId: string): string[] {
    const questions: string[] = [];
    
    for (const edge of this.kg.edges) {
      if (edge.target === conceptId && edge.relation === 'MENTIONS_CONCEPT') {
        const questionNode = this.kg.nodes.find(n => n.id === edge.source);
        if (questionNode && questionNode.type === 'Question') {
          questions.push(questionNode.id);
        }
      }
    }

    return questions;
  }

  /**
   * Inférer la difficulté d'un concept
   */
  private inferDifficulty(node: KGNode): 'facile' | 'moyen' | 'difficile' {
    // Inférer depuis les propriétés ou les connexions
    const relatedQuestionsCount = this.getRelatedQuestions(node.id).length;
    
    if (relatedQuestionsCount > 10) return 'difficile';
    if (relatedQuestionsCount > 5) return 'moyen';
    return 'facile';
  }

  /**
   * Compter le nombre de sessions sur un concept
   */
  private getConceptSessions(conceptId: string, userProfile: any): number {
    // Simuler pour l'instant
    return Math.floor(Math.random() * 8);
  }

  /**
   * Compter combien de concepts maîtrisés sont connectés
   */
  private countConnectedMastered(conceptId: string, masteredConcepts: Set<string>): number {
    let count = 0;
    
    for (const edge of this.kg.edges) {
      if (edge.source === conceptId && masteredConcepts.has(edge.target)) count++;
      if (edge.target === conceptId && masteredConcepts.has(edge.source)) count++;
    }

    return count;
  }

  /**
   * Ajouter une recommandation
   */
  private addRecommendation(
    recommendations: Map<string, ConceptRecommendation>,
    node: KGNode,
    edge: KGEdge,
    reason: string
  ): void {
    if (!recommendations.has(node.id)) {
      recommendations.set(node.id, {
        conceptId: node.id,
        conceptLabel: node.label,
        score: 0,
        reason,
        relatedQuestions: this.getRelatedQuestions(node.id),
        difficulty: this.inferDifficulty(node)
      });
    }
  }

  /**
   * Obtenir les thèmes recommandés (version simplifiée pour Dashboard)
   */
  getRecommendedThemes(limit: number = 5): Array<{ theme: string; reason: string; priority: 'high' | 'medium' | 'low' }> {
    const userProfile = StorageService.getUserProfile();
    const concepts = this.getNextConcepts('user', limit);

    return concepts.map(concept => ({
      theme: concept.conceptLabel,
      reason: this.getReasonText(concept.reason),
      priority: concept.score > 70 ? 'high' : concept.score > 50 ? 'medium' : 'low'
    }));
  }

  private getReasonText(reason: string): string {
    switch (reason) {
      case 'needs_review':
        return 'À revoir - score faible';
      case 'prerequisite_mastered':
        return 'Progression naturelle';
      case 'related_to_mastered':
        return 'Concepts connexes';
      default:
        return 'Recommandé';
    }
  }
}

// Export singleton
export const kgRecommendations = new KnowledgeGraphRecommendations();


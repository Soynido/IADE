/**
 * 🧭 Navigation Analyzer
 * 
 * Analyse les patterns de navigation, transitions et UX flow
 */

import { Page } from '@playwright/test';
import { NavigationStep, TransitionAnalysis } from '../types';

export class NavigationAnalyzer {
  private page: Page;
  private steps: NavigationStep[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async recordNavigation(action: string, url: string): Promise<void> {
    const timestamp = Date.now();
    const duration = this.steps.length > 0 
      ? timestamp - this.steps[this.steps.length - 1].timestamp 
      : 0;

    this.steps.push({
      url,
      action,
      timestamp,
      duration,
    });
  }

  async analyzeTransition(fromUrl: string, toUrl: string): Promise<TransitionAnalysis> {
    const startTime = Date.now();

    // Attendre que la page soit complètement chargée
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    const duration = Date.now() - startTime;

    // Vérifier s'il y a un indicateur de loading
    const hasLoadingIndicator = await this.page.evaluate(() => {
      const loadingSelectors = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[role="progressbar"]',
        '[aria-busy="true"]',
      ];
      return loadingSelectors.some(selector => document.querySelector(selector) !== null);
    });

    // Déterminer la fluidité
    const smooth = duration < 300; // <300ms = smooth

    // Déterminer le feedback
    let feedback: 'immediate' | 'delayed' | 'none' = 'none';
    if (hasLoadingIndicator) {
      feedback = 'immediate';
    } else if (duration < 100) {
      feedback = 'immediate';
    } else if (duration < 500) {
      feedback = 'delayed';
    }

    // Identifier les problèmes
    const issues: string[] = [];
    if (duration > 1000) {
      issues.push(`Transition lente: ${duration}ms`);
    }
    if (!hasLoadingIndicator && duration > 300) {
      issues.push('Pas d\'indicateur de chargement visible');
    }

    return {
      from: fromUrl,
      to: toUrl,
      duration,
      smooth,
      loading: hasLoadingIndicator,
      feedback,
      issues,
    };
  }

  analyzeNavigationPattern(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Analyser le nombre d'étapes
    if (this.steps.length === 0) {
      return { score: 0, issues: ['Aucune navigation enregistrée'], recommendations: [] };
    }

    // Analyser la durée moyenne des transitions
    const avgDuration = this.steps.reduce((sum, s) => sum + s.duration, 0) / this.steps.length;
    if (avgDuration > 500) {
      score -= 20;
      issues.push(`⚠️ Transitions lentes en moyenne: ${avgDuration.toFixed(0)}ms`);
      recommendations.push('Optimiser les transitions avec des skeletons ou du prefetching');
    }

    // Détecter les boucles (même URL visitée plusieurs fois)
    const urlCounts = new Map<string, number>();
    this.steps.forEach(step => {
      urlCounts.set(step.url, (urlCounts.get(step.url) || 0) + 1);
    });

    const loops = Array.from(urlCounts.entries()).filter(([, count]) => count > 2);
    if (loops.length > 0) {
      score -= 15;
      issues.push(`⚠️ Boucles de navigation détectées: ${loops.map(([url]) => url).join(', ')}`);
      recommendations.push('Revoir le flow utilisateur pour éviter les allers-retours');
    }

    // Détecter les dead-ends (pages sans CTA)
    // (Cette analyse nécessite une intégration avec CTAAnalyzer)

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  getSteps(): NavigationStep[] {
    return this.steps;
  }

  reset(): void {
    this.steps = [];
  }
}


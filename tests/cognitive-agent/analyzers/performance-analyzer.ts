/**
 * 🚀 Performance Analyzer
 * 
 * Mesure et analyse les métriques de performance Web Vitals
 */

import { Page } from '@playwright/test';
import { PerformanceMetrics } from '../types';

export class PerformanceAnalyzer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async collectMetrics(): Promise<PerformanceMetrics> {
    // Collecter Web Vitals et métriques custom
    const metrics = await this.page.evaluate(() => {
      return new Promise<PerformanceMetrics>((resolve) => {
        // Performance Observer pour LCP
        let lcp = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
          lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Performance Observer pour CLS
        let cls = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
              cls += (entry as PerformanceEntry & { value?: number }).value || 0;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // Attendre un peu pour collecter les métriques
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintEntries = performance.getEntriesByType('paint');
          const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;

          // Memory (si disponible)
          const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;

          // Compter les nœuds DOM
          const domNodes = document.querySelectorAll('*').length;

          // Analyser les requêtes réseau via Resource Timing
          const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
          const networkRequests = {
            total: resources.length,
            failed: resources.filter(r => r.transferSize === 0 && r.decodedBodySize === 0).length,
            totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            timing: {
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
              request: perfData.responseStart - perfData.requestStart,
              response: perfData.responseEnd - perfData.responseStart,
            },
          };

          resolve({
            fcp,
            lcp,
            tti: perfData.domInteractive - perfData.fetchStart,
            cls,
            memoryUsage: memory?.usedJSHeapSize,
            jsHeapSize: memory?.totalJSHeapSize,
            domNodes,
            networkRequests,
          });
        }, 2000);
      });
    });

    return metrics;
  }

  analyzePerformance(metrics: PerformanceMetrics): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Analyser FCP (First Contentful Paint)
    if (metrics.fcp > 3000) {
      score -= 15;
      issues.push(`❌ FCP trop élevé: ${metrics.fcp.toFixed(0)}ms (seuil: 3000ms)`);
      recommendations.push('Optimiser le CSS critique et réduire le JS bloquant');
    } else if (metrics.fcp > 1800) {
      score -= 5;
      issues.push(`⚠️ FCP élevé: ${metrics.fcp.toFixed(0)}ms (optimal: <1800ms)`);
    }

    // Analyser LCP (Largest Contentful Paint)
    if (metrics.lcp > 4000) {
      score -= 20;
      issues.push(`❌ LCP critique: ${metrics.lcp.toFixed(0)}ms (seuil: 4000ms)`);
      recommendations.push('Optimiser les images et implémenter lazy loading');
    } else if (metrics.lcp > 2500) {
      score -= 10;
      issues.push(`⚠️ LCP à améliorer: ${metrics.lcp.toFixed(0)}ms (optimal: <2500ms)`);
    }

    // Analyser TTI (Time to Interactive)
    if (metrics.tti > 5000) {
      score -= 15;
      issues.push(`❌ TTI trop long: ${metrics.tti.toFixed(0)}ms (seuil: 5000ms)`);
      recommendations.push('Réduire le JavaScript et utiliser code splitting');
    }

    // Analyser CLS (Cumulative Layout Shift)
    if (metrics.cls > 0.25) {
      score -= 20;
      issues.push(`❌ CLS élevé: ${metrics.cls.toFixed(3)} (seuil: 0.25)`);
      recommendations.push('Spécifier les dimensions des images et éviter les insertions dynamiques');
    } else if (metrics.cls > 0.1) {
      score -= 10;
      issues.push(`⚠️ CLS à surveiller: ${metrics.cls.toFixed(3)} (optimal: <0.1)`);
    }

    // Analyser DOM
    if (metrics.domNodes > 1500) {
      score -= 10;
      issues.push(`⚠️ DOM lourd: ${metrics.domNodes} nœuds (optimal: <1500)`);
      recommendations.push('Simplifier la structure DOM et utiliser la virtualisation pour les listes');
    }

    // Analyser Memory (si disponible)
    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      score -= 5;
      issues.push(`⚠️ Consommation mémoire: ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
      recommendations.push('Auditer les fuites mémoire et optimiser le garbage collection');
    }

    // Analyser Network
    if (metrics.networkRequests.failed > 0) {
      score -= 10;
      issues.push(`❌ ${metrics.networkRequests.failed} requêtes réseau échouées`);
      recommendations.push('Vérifier les endpoints et implémenter une gestion d\'erreur robuste');
    }

    if (metrics.networkRequests.totalSize > 3 * 1024 * 1024) { // 3MB
      score -= 10;
      issues.push(`⚠️ Poids total réseau: ${(metrics.networkRequests.totalSize / 1024 / 1024).toFixed(1)}MB`);
      recommendations.push('Compresser les assets et implémenter un cache HTTP');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }
}


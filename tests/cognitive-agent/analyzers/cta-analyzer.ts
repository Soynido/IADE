/**
 * 🎯 CTA (Call-to-Action) Analyzer
 * 
 * Analyse la hiérarchie, visibilité et efficacité des CTAs
 */

import { Page } from '@playwright/test';
import { CTAAnalysis } from '../types';

export class CTAAnalyzer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async analyzeCTAs(): Promise<CTAAnalysis[]> {
    // Sélecteurs pour identifier les CTAs potentiels
    const ctaSelectors = [
      'button',
      'a[role="button"]',
      '[class*="btn"]',
      '[class*="button"]',
      '[class*="cta"]',
      'input[type="submit"]',
    ];

    const ctas: CTAAnalysis[] = [];

    for (const selector of ctaSelectors) {
      const elements = await this.page.$$(selector);

      for (const element of elements) {
        try {
          const boundingBox = await element.boundingBox();
          if (!boundingBox) continue;

          const text = await element.textContent();
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();

          // Analyser le style pour déterminer la hiérarchie
          const styles = await this.page.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              backgroundColor: computed.backgroundColor,
              color: computed.color,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              padding: computed.padding,
              border: computed.border,
              zIndex: computed.zIndex,
            };
          }, element);

          // Calculer le contraste (simplifié)
          const contrast = this.calculateContrast(styles.backgroundColor, styles.color);

          // Déterminer la hiérarchie visuelle
          const hierarchy = this.determineHierarchy(styles);

          // Détecter les problèmes
          const issues: string[] = [];
          if (contrast < 4.5) {
            issues.push(`Contraste insuffisant (${contrast.toFixed(2)}:1, min: 4.5:1)`);
          }
          if (!isEnabled && isVisible) {
            issues.push('CTA désactivé mais visible sans feedback clair');
          }
          if (boundingBox.width < 44 || boundingBox.height < 44) {
            issues.push('Cible tactile trop petite (<44px, norme WCAG)');
          }
          if (!text || text.trim().length === 0) {
            issues.push('CTA sans texte (problème d\'accessibilité)');
          }

          ctas.push({
            text: text?.trim() || '',
            selector: await this.getUniqueSelector(element),
            position: { x: boundingBox.x, y: boundingBox.y },
            visibility: isVisible ? 1 : 0,
            contrast,
            size: { width: boundingBox.width, height: boundingBox.height },
            clickable: isEnabled,
            hierarchy,
            issues,
          });
        } catch (error) {
          // Ignorer les éléments qui ne sont plus dans le DOM
          continue;
        }
      }
    }

    return ctas;
  }

  private calculateContrast(bg: string, fg: string): number {
    // Calcul simplifié du contraste WCAG
    // En production, utiliser une librairie comme polished ou chroma.js
    const bgLum = this.getLuminance(bg);
    const fgLum = this.getLuminance(fg);

    const lighter = Math.max(bgLum, fgLum);
    const darker = Math.min(bgLum, fgLum);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(color: string): number {
    // Extraction RGB simplifiée (à améliorer en production)
    const match = color.match(/\d+/g);
    if (!match || match.length < 3) return 0.5;

    const [r, g, b] = match.map(Number).slice(0, 3);

    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  private determineHierarchy(styles: Record<string, string>): 'primary' | 'secondary' | 'tertiary' {
    const fontSize = parseInt(styles.fontSize);
    const fontWeight = parseInt(styles.fontWeight);
    const hasSolidBackground = !styles.backgroundColor.includes('transparent') &&
      styles.backgroundColor !== 'rgba(0, 0, 0, 0)';

    // Logique de hiérarchisation basée sur les styles
    if (hasSolidBackground && (fontSize >= 16 || fontWeight >= 600)) {
      return 'primary';
    } else if (styles.border && styles.border !== 'none') {
      return 'secondary';
    } else {
      return 'tertiary';
    }
  }

  private async getUniqueSelector(element: any): Promise<string> {
    return await this.page.evaluate((el) => {
      // Génération d'un sélecteur unique
      const id = el.id;
      if (id) return `#${id}`;

      const classes = Array.from(el.classList).join('.');
      if (classes) {
        const selector = `${el.tagName.toLowerCase()}.${classes}`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }

      // Fallback: nth-child
      let nth = 1;
      let sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === el.tagName) nth++;
        sibling = sibling.previousElementSibling;
      }

      return `${el.tagName.toLowerCase()}:nth-child(${nth})`;
    }, element);
  }

  analyzeCTAHierarchy(ctas: CTAAnalysis[]): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const primaryCTAs = ctas.filter(c => c.hierarchy === 'primary');
    const visibleCTAs = ctas.filter(c => c.visibility > 0.8);

    // Vérifier qu'il y a un CTA primaire
    if (primaryCTAs.length === 0) {
      score -= 30;
      issues.push('❌ Aucun CTA primaire détecté');
      recommendations.push('Ajouter un CTA principal clair pour guider l\'utilisateur');
    } else if (primaryCTAs.length > 3) {
      score -= 15;
      issues.push(`⚠️ Trop de CTAs primaires (${primaryCTAs.length}), dilue l'attention`);
      recommendations.push('Limiter à 1-2 CTAs primaires par écran');
    }

    // Analyser les problèmes d'accessibilité
    const ctasWithIssues = ctas.filter(c => c.issues.length > 0);
    if (ctasWithIssues.length > 0) {
      score -= ctasWithIssues.length * 5;
      issues.push(`⚠️ ${ctasWithIssues.length} CTAs avec problèmes d'accessibilité`);
      recommendations.push('Corriger les problèmes de contraste et de taille minimale');
    }

    // Vérifier la visibilité
    const invisibleCTAs = ctas.filter(c => c.visibility < 0.5);
    if (invisibleCTAs.length > 0) {
      score -= 10;
      issues.push(`⚠️ ${invisibleCTAs.length} CTAs peu visibles ou hors viewport`);
      recommendations.push('S\'assurer que les CTAs sont above the fold');
    }

    // Analyser les textes vides
    const emptyCTAs = ctas.filter(c => !c.text);
    if (emptyCTAs.length > 0) {
      score -= 20;
      issues.push(`❌ ${emptyCTAs.length} CTAs sans texte (problème critique d'accessibilité)`);
      recommendations.push('Ajouter des labels explicites à tous les CTAs');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }
}


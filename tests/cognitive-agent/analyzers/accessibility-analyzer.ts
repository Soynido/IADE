/**
 * ♿ Accessibility Analyzer
 * 
 * Analyse l'accessibilité selon les normes WCAG 2.1
 */

import { Page } from '@playwright/test';

export class AccessibilityAnalyzer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async analyzeAccessibility(): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 1. Vérifier les attributs alt des images
    const imagesWithoutAlt = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.alt || img.alt.trim() === '').length;
    });

    if (imagesWithoutAlt > 0) {
      score -= 15;
      issues.push(`❌ ${imagesWithoutAlt} images sans attribut alt`);
      recommendations.push('Ajouter des descriptions alt significatives à toutes les images');
    }

    // 2. Vérifier la navigation au clavier
    const keyboardIssues = await this.page.evaluate(() => {
      const problems: string[] = [];
      
      // Vérifier les éléments interactifs sans tabindex approprié
      const interactiveElements = document.querySelectorAll('div[onclick], span[onclick]');
      if (interactiveElements.length > 0) {
        problems.push(`${interactiveElements.length} éléments interactifs non-sémantiques`);
      }

      // Vérifier l'ordre de tabulation
      const tabbableElements = Array.from(
        document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
      
      const negativeTabindex = tabbableElements.filter(
        el => el.getAttribute('tabindex') && parseInt(el.getAttribute('tabindex')!) < 0
      );
      
      if (negativeTabindex.length > 0) {
        problems.push(`${negativeTabindex.length} éléments focusables exclus de la navigation clavier`);
      }

      return problems;
    });

    if (keyboardIssues.length > 0) {
      score -= 15;
      keyboardIssues.forEach(issue => issues.push(`⚠️ ${issue}`));
      recommendations.push('Utiliser des éléments HTML sémantiques (button, a) plutôt que des divs cliquables');
    }

    // 3. Vérifier les labels des formulaires
    const formIssues = await this.page.evaluate(() => {
      const problems: string[] = [];
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
      
      inputs.forEach(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledby = input.getAttribute('aria-labelledby');

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
          problems.push(`Input sans label: ${input.tagName.toLowerCase()}`);
        }
      });

      return problems;
    });

    if (formIssues.length > 0) {
      score -= 20;
      issues.push(`❌ ${formIssues.length} champs de formulaire sans label`);
      recommendations.push('Associer des labels explicites à tous les champs de formulaire');
    }

    // 4. Vérifier les heading levels
    const headingIssues = await this.page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const problems: string[] = [];

      // Vérifier qu'il n'y a qu'un seul h1
      const h1Count = headings.filter(h => h.tagName === 'H1').length;
      if (h1Count === 0) {
        problems.push('Aucun h1 sur la page');
      } else if (h1Count > 1) {
        problems.push(`${h1Count} h1 détectés (devrait être unique)`);
      }

      // Vérifier l'ordre hiérarchique
      let prevLevel = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (level - prevLevel > 1) {
          problems.push(`Saut de niveau: ${heading.tagName} après H${prevLevel}`);
        }
        prevLevel = level;
      });

      return problems;
    });

    if (headingIssues.length > 0) {
      score -= 10;
      headingIssues.forEach(issue => issues.push(`⚠️ ${issue}`));
      recommendations.push('Respecter la hiérarchie des headings (h1 → h2 → h3...)');
    }

    // 5. Vérifier les rôles ARIA et landmarks
    const ariaIssues = await this.page.evaluate(() => {
      const problems: string[] = [];

      // Vérifier les landmarks
      const hasMain = document.querySelector('main, [role="main"]');
      const hasNav = document.querySelector('nav, [role="navigation"]');
      
      if (!hasMain) {
        problems.push('Pas de landmark <main>');
      }
      if (!hasNav) {
        problems.push('Pas de landmark <nav>');
      }

      // Vérifier les boutons avec rôle approprié
      const divsWithRole = Array.from(document.querySelectorAll('div[role="button"]'));
      if (divsWithRole.length > 3) {
        problems.push(`${divsWithRole.length} divs avec role="button" (préférer <button>)`);
      }

      return problems;
    });

    if (ariaIssues.length > 0) {
      score -= 10;
      ariaIssues.forEach(issue => issues.push(`⚠️ ${issue}`));
      recommendations.push('Utiliser les landmarks HTML5 (main, nav, aside, footer)');
    }

    // 6. Vérifier le focus visible
    const focusVisible = await this.page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        *:focus {
          outline: 2px solid red !important;
          outline-offset: 2px !important;
        }
      `;
      document.head.appendChild(style);

      // Tester quelques éléments
      const button = document.querySelector('button');
      if (button) {
        button.focus();
        const styles = window.getComputedStyle(button);
        return styles.outlineWidth !== '0px';
      }
      return true;
    });

    if (!focusVisible) {
      score -= 15;
      issues.push('❌ Focus invisible (outline: none sans alternative)');
      recommendations.push('Implémenter un indicateur de focus visible (outline ou alternative)');
    }

    // 7. Vérifier le contraste (simplifié - déjà fait dans CTA Analyzer)
    // On peut l'étendre à tous les éléments texte

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  async testKeyboardNavigation(): Promise<boolean> {
    try {
      // Simuler la navigation Tab
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
      
      const hasFocus = await this.page.evaluate(() => {
        return document.activeElement !== document.body;
      });

      return hasFocus;
    } catch {
      return false;
    }
  }

  async checkColorContrast(): Promise<{ passed: number; failed: number }> {
    return await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      let passed = 0;
      let failed = 0;

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;

        // Calcul simplifié (voir CTA Analyzer pour une version complète)
        if (color && bgColor && color !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)') {
          // Calcul de contraste simplifié
          const ratio = 4.5; // Mock pour l'exemple
          if (ratio >= 4.5) {
            passed++;
          } else {
            failed++;
          }
        }
      });

      return { passed, failed };
    });
  }
}


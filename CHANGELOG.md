# Changelog - Projet IADE

Tous les changements notables du projet IADE sont documentés ici.

## [v0.92] - 2025-10-28 - Cycle IADE-0 Autopilot

### ✅ Ajouté
- **Mode Autopilot RL3**: Exécution autonome de 6 tâches prioritaires
- **CourseReviewMode**: 3 parcours (Débutant, Intensif, Révision), 13 modules
- **ExamSimulationMode**: Timer 90 min, choix difficulté, post-exam détaillé
- **Knowledge Graph**: 42 noeuds, 102 liens sémantiques
- **Dashboard Analytics**: Prédiction réussite, Top 5 concepts à revoir
- **Générateurs Questions**: Architecture pluggable (Definition, QCM)
- **Reasoning Layer V3**: Patterns, Forecasts, ADRs, Integrity chain

### 🔧 Corrigé
- Export TypeScript générateurs (ES modules)
- Runtime error `AchievementsEngine.getAllAchievements`
- Vercel deployment 401 authentication

### 📊 Métriques
- Confiance: 0.87 → 0.92 (+0.05)
- Questions: 22 → 50 (+128%)
- Build size: 388KB (optimisé)
- Biais résolus: 4/5

### 🏷️ Tags
- `autopilot-IADE-v0.92`: Baseline Reasoning Layer V3

---

## [v0.87] - 2025-10-27 - Cycle IADE-0 Initial

### ✅ Ajouté
- Extraction PDF OCR (pipelines)
- Questions mockées (22 questions)
- Algorithmes cognitifs (Ebbinghaus + SM-2, Interleaving)
- Success Prediction Engine
- Spaced Repetition Engine
- UI 3 modes (Cours, Entraînement, Concours)
- Reasoning Layer V3 activation

### 📊 Métriques
- Confiance initiale: 0.87
- 284 events capturés
- 3 ADRs générés

---

## [Phase 0-2] - 2025-10-23 à 2025-10-26

### ✅ Complété
- Phase 0: Setup projet
- Phase 1: Extraction données (OCR, parsers)
- Phase 2: Algorithmes cognitifs
- 167 tâches complétées (67%)

### 📁 Structure
- `iade-app/`: Application React + TypeScript
- `scripts/`: Pipelines extraction + générateurs
- `.reasoning/`: Reasoning Layer V3 metadata

---

Pour plus de détails, voir:
- `docs/archive/` - Documentation historique
- `.reasoning/traces/` - Events détaillés
- `.reasoning/adrs/` - Décisions architecturales


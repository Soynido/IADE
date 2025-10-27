# Tasks - Knowledge Learning Engine IADE

## Phase 0 : Setup & Documentation

- [x] 0.1 - Initialisation Git et GitHub repository
- [x] 0.2 - Création plan.md
- [x] 0.3 - Création tasks.md
- [x] 0.4 - Commit plan.md et tasks.md + push

## Phase 1 : Pipeline d'Extraction

### 1.1 Architecture Pipeline Modulaire
- [x] 1.1.1 - Créer baseExtractor.ts (OCREngine + PDFProcessor wrapper)
- [x] 1.1.2 - Créer courseParser.ts (extraction chapitres → sections → concepts)
- [x] 1.1.3 - Créer annalesParser.ts (extraction questions QCM/QROC/Cas)
- [x] 1.1.4 - Créer correctionParser.ts (explications + références)
- [x] 1.1.5 - Créer pipelineManager.ts (orchestration auto-dispatch)
- [x] 1.1.6 - Créer script runExtraction.sh

### 1.2 Extraction PDFs
- [ ] 1.2.1 - Extraire Prepaconcoursiade-Complet.pdf → cours-complet.json
- [ ] 1.2.2 - Extraire annalescorrigées-Volume-1.pdf → annales-volume-1.json
- [ ] 1.2.3 - Extraire annalescorrigées-Volume-2.pdf → annales-volume-2.json
- [ ] 1.2.4 - Tester et valider la qualité d'extraction

### 1.3 Enrichissement Sémantique (Optionnel - Phase 1B)
- [ ] 1.3.1 - Créer embeddingGenerator.ts
- [ ] 1.3.2 - Générer embeddings pour concepts.json
- [ ] 1.3.3 - Générer embeddings pour questions.json

## Phase 2 : Knowledge Graph & Indexation

- [ ] 2.1 - Créer buildKnowledgeGraph.ts
- [ ] 2.2 - Implémenter algorithme de matching concepts ↔ questions
- [ ] 2.3 - Calculer poids relationnels et métriques
- [ ] 2.4 - Générer knowledge-graph.json (format JSON-LD)
- [ ] 2.5 - Tester la cohérence du graphe

## Phase 3 : Générateur de Questions Intelligent v2

### 3.1 Architecture Pluggable
- [ ] 3.1.1 - Créer baseGenerator.ts (interface commune + utils)
- [ ] 3.1.2 - Créer definitionGenerator.ts
- [ ] 3.1.3 - Créer qcmGenerator.ts
- [ ] 3.1.4 - Créer qrocGenerator.ts
- [ ] 3.1.5 - Créer caseStudyGenerator.ts
- [ ] 3.1.6 - Créer calculationGenerator.ts
- [ ] 3.1.7 - Créer synthesisGenerator.ts

### 3.2 Validation Automatique
- [ ] 3.2.1 - Créer generateIntelligentQuestions-v2.ts
- [ ] 3.2.2 - Implémenter coherenceScore calculation
- [ ] 3.2.3 - Implémenter filtrage automatique (doublons, toValidate)
- [ ] 3.2.4 - Générer generatedQuestions-v2.json
- [ ] 3.2.5 - Valider la qualité des questions générées

## Phase 4 : UI/UX Multi-Mode

### 4.1 Layout Unifié
- [ ] 4.1.1 - Créer MainLayout.tsx (Header + 3 zones)
- [ ] 4.1.2 - Créer medicalTheme.ts (palette médicale)
- [ ] 4.1.3 - Implémenter navigation persistante

### 4.2 Mode Cours
- [ ] 4.2.1 - Créer CourseReviewMode.tsx
- [ ] 4.2.2 - Implémenter navigation par chapitres/thèmes
- [ ] 4.2.3 - Implémenter affichage structuré (concepts, protocoles, calculs)
- [ ] 4.2.4 - Implémenter mini-carte mentale (react-flow/mermaid)
- [ ] 4.2.5 - Implémenter moteur de recherche par concept
- [ ] 4.2.6 - Implémenter panel droit (résumé, fiche révision, notes)

### 4.3 Mode Entraînement
- [ ] 4.3.1 - Améliorer TrainingMode.tsx existant
- [ ] 4.3.2 - Ajouter sélection par thème ET difficulté
- [ ] 4.3.3 - Implémenter parcours progressif automatique
- [ ] 4.3.4 - Enrichir corrections (explications + références au cours)
- [ ] 4.3.5 - Ajouter stats de progression par thème (radar chart)
- [ ] 4.3.6 - Implémenter historique des sessions

### 4.4 Mode Concours Blanc
- [ ] 4.4.1 - Créer ExamSimulationMode.tsx
- [ ] 4.4.2 - Implémenter sélection de difficulté (V1/V2)
- [ ] 4.4.3 - Implémenter session chronométrée (timer)
- [ ] 4.4.4 - Implémenter mix automatique (60% QCM, 25% QROC, 15% Cas)
- [ ] 4.4.5 - Implémenter mode "examen réel" (pas de retour arrière)
- [ ] 4.4.6 - Implémenter post-examen (score, correction, analyse, export PDF)

### 4.5 Navigation Inter-Modes
- [ ] 4.5.1 - Implémenter liens intelligents Cours ↔ Entraînement
- [ ] 4.5.2 - Implémenter liens intelligents Entraînement ↔ Concours
- [ ] 4.5.3 - Implémenter "Réviser concepts faibles" depuis Concours

## Phase 5 : Suivi de Progression & Moteur Adaptatif

### 5.1 Service de Progression
- [ ] 5.1.1 - Créer progressionTracker.ts
- [ ] 5.1.2 - Implémenter UserProgress interface (localStorage)
- [ ] 5.1.3 - Implémenter spaced repetition algorithm (Ebbinghaus modifié)
- [ ] 5.1.4 - Implémenter recordAnswer(), getConceptsToReview()
- [ ] 5.1.5 - Implémenter getRecommendations(), getWeakConcepts()

### 5.2 Dashboard de Progression
- [ ] 5.2.1 - Créer ProgressDashboard.tsx
- [ ] 5.2.2 - Implémenter Section 1 : Vue Globale (cercle maîtrise, streak)
- [ ] 5.2.3 - Implémenter Section 2 : Analyse Thématique (radar chart, concepts à revoir)
- [ ] 5.2.4 - Implémenter Section 3 : Historique (line chart, sessions, temps total)
- [ ] 5.2.5 - Implémenter Section 4 : Recommandations Actives

### 5.3 Service de Recommandation
- [ ] 5.3.1 - Créer recommendationEngine.ts
- [ ] 5.3.2 - Implémenter logique de détection des gaps
- [ ] 5.3.3 - Implémenter système de priorisation
- [ ] 5.3.4 - Retourner liste ordonnée avec priorités

## Phase Bonus : Intent Engine (V3)

- [ ] Bonus.1 - Créer intentEngine.ts
- [ ] Bonus.2 - Implémenter tracking comportemental
- [ ] Bonus.3 - Implémenter adaptations automatiques selon profil

## Tests & Validation

- [ ] Test.1 - Tests unitaires pour chaque parser
- [ ] Test.2 - Validation du graphe (nœuds, edges cohérents)
- [ ] Test.3 - Tests UI des 3 modes
- [ ] Test.4 - Tests de régression sur questions existantes
- [ ] Test.5 - Validation médicale des corrections générées

## Déploiement

- [ ] Deploy.1 - Vérifier build production
- [ ] Deploy.2 - Déployer sur Vercel/Netlify
- [ ] Deploy.3 - Tester en production
- [ ] Deploy.4 - Documentation utilisateur finale


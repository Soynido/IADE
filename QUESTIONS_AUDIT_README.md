# 📊 Audit des Questions IADE

## Fichier : `questions_audit.csv`

Ce fichier CSV contient **838 questions** extraites du repository IADE pour analyse et supervision de la qualité.

## Structure du CSV

Le fichier contient les colonnes suivantes :

### Colonnes Principales

| Colonne | Description |
|---------|-------------|
| **ID** | Identifiant unique de la question |
| **Question** | Texte de la question |
| **Réponses Proposées** | Toutes les options séparées par `\|` |
| **Réponse Vraie** | La réponse correcte |
| **Label/Thématique** | Tags ou catégorie de la question |

### Scores de Confiance

Pour chaque élément (Question, Réponses Proposées, Réponse Vraie), il y a **2 colonnes de score** :

1. **Confidence (AI)** : Score automatique calculé par l'IA (sur 10)
   - Basé sur des critères algorithmiques :
     - Longueur du texte
     - Présence d'artefacts OCR
     - Structure et cohérence
     - Caractères suspects

2. **Confidence (Manual)** : Score manuel à télécharger par vous (options : `0-2`, `2-5`, `5-7`, `7-10`)
   - Catégorie de qualité qualitative
   - À remplir en fonction de votre expertise médicale
   - Permet de comparer avec les scores AI

## Statistiques Globales

### Scores Moyens (calculés automatiquement)

- **Questions** : 7.28/10
- **Réponses Proposées** : 7.65/10
- **Réponses Vraies** : 7.41/10

### Interprétation des Scores AI

| Score | Signification |
|-------|--------------|
| **0-4** | Très mauvaise qualité - artefacts OCR importants, texte illisible |
| **5-6** | Qualité médiocre - problèmes de structure ou d'OCR |
| **7-8** | Bonne qualité - quelques imperfections mineures |
| **9-10** | Excellente qualité - texte clair et structuré |

## Objectifs de ce Document

✅ **Superviser la cohérence des questions**
- Identifier les questions malformées
- Détecter les artefacts OCR
- Repérer les questions incomplètes

✅ **Superviser la cohérence des réponses**
- Vérifier que les réponses proposées sont pertinentes
- S'assurer que la réponse vraie est cohérente
- Détecter les options trop courtes ou incohérentes

✅ **Optimiser la génération de questions/réponses**
- Analyser les patterns de mauvaises questions
- Améliorer les prompts de génération
- Ajuster les paramètres OCR

✅ **Tendre vers la meilleure version possible**
- Prioriser la correction des questions les moins bonnes
- Améliorer l'algorithme de scoring
- Valider la qualité médicale

## Comment Utiliser ce Fichier

### 1. Ouvrir dans Excel/Google Sheets
```bash
# Le fichier est au format CSV standard
# Ouvrez-le avec votre tableur préféré
```

### 2. Remplir les Scores Manuels
- Examinez chaque question
- Classez-la dans une des 4 catégories : `0-2`, `2-5`, `5-7`, `7-10`
- Comparez avec le score AI pour identifier les écarts

### 3. Identifier les Questions Problématiques
- Filtrer les questions avec score AI < 6
- Examiner les questions avec grand écart AI vs Manuel
- Prioriser la correction de celles-ci

### 4. Améliorer le Système
- Utiliser les données pour améliorer les prompts de génération
- Ajuster les paramètres OCR
- Optimiser l'algorithme de scoring

## Exemples de Questions par Type de Problème

### 🚨 Problèmes Majeurs (< 5/10)

**Questions trop courtes ou malformées :**
```
Question: "Quelle est la définition correcte de ""("" ?"
→ Score: 6.0 - Question incomplète
```

**Options trop courtes (probablement une question sur un diagramme) :**
```
Options: "C | A | B | D"
→ Score: 2.0 - Impossible à répondre sans le diagramme
```

**Réponses incohérentes :**
```
Question sur "Tétraplégie"
Réponse: "Mécanisme d'inhibition de la transmission synaptique"
→ Score: 7.5 - Réponse probablement incorrecte
```

### ✅ Bonnes Questions (7-10/10)

**Questions claires et structurées :**
```
Question: "Quelle est la définition correcte de ""Bradypnée"" ?"
Options: ["diminution de la FR", "augmentation de la FR", "trouble du rythme respiratoire", ...]
→ Score: 7.0-8.0 - Question valide
```

## Recommandations

### Priorité Haute 🔴
1. Corriger les questions avec score < 5
2. Ajouter les diagrammes manquants pour les questions anatomiques
3. Vérifier la cohérence des réponses vraies

### Priorité Moyenne 🟡
1. Compléter les questions incomplètes
2. Reformuler les questions avec artefacts OCR
3. Améliorer les options trop courtes

### Priorité Basse 🟢
1. Enrichir les labels/thématiques
2. Ajuster les scores AI pour plus de précision
3. Optimiser la génération de nouvelles questions

## Génération

Le fichier a été généré automatiquement par le script :
```
scripts/extractQuestionsToCSV.ts
```

Pour régénérer le fichier :
```bash
cd iade-app
npx tsx scripts/extractQuestionsToCSV.ts
```

## Notes Importantes

⚠️ **Les réponses proposées sont séparées par `|`** pour faciliter la lecture

⚠️ **Certaines questions font référence à des diagrammes** absents du CSV - elles ont un score faible

⚠️ **Les scores AI sont indicatifs** - votre jugement médical est essentiel pour valider la qualité

---

*Document généré automatiquement - Mise à jour recommandée après chaque modification du corpus de questions*


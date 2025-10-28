# 📚 Questions Extraites - Phase 1.5 Consolidation

## Statistiques

- **Total questions uniques** : 16
- **Doublons supprimés** : 1
- **Source** : `annalescorrigées-Volume-1.txt`
- **Méthode** : Normalisation OCR + Split intelligent + Déduplication

---

## Liste des 16 Questions

### Bloc 1-2 (Questions 1 à 20)

#### 1-2 : Fonctions du rein
**Question** : Citez les différentes fonctions du rein.

#### 1-3 : Équilibre acido-basique
**Question** : Donnez le sens de variation du PH, de la PCO2 et des HCO3- en cas d'acidose et d'alcalose métabolique et respiratoire.

#### 1-4 : Surdosage morphinique
**Question** : Quels sont les signes de surdosage en morphinique et la conduite à tenir.

#### 1-5 : Muscles lisses et striés
**Question** : Définir muscles lisses et muscles striés. Donnez un exemple pour chacun.

#### 1-6 : Don du sang
**Question** : Donnez le principe du don du sang, le délai entre deux dons et la fréquence des dons autorisés par an. Combien de temps sont valables les RAI ?

#### 1-7 : Transfusion
**Question** : Quels éléments du sang peut-on transfuser ? Que sont les médicaments dérivés du sang ?

#### 1-8 : Schéma (question incomplète)
**Question** : 3. OO OO OO © Remplissez le schéma suivant : ONCOURSIADE.COM 3

---

### Bloc 21-40 (Questions 21 à 40)

#### 21-1 : Surfactant
**Question** : Donnez la définition et le rôle du surfactant.

#### 21-2 : Surfactant + glucose
**Question** : Quelle est la conséquence de son absence chez le nouveau-né ? Vous devez perfuser 120g de glucose à un patient. Vous disposez d'ampoules de G30%.

#### 21-3 : Débit horaire + schéma
**Question** : Quel débit horaire ? © © Remplissez le schéma suivant : © Anti A Anti B Anti AB Détermination 0 0 eu OO e pas d'agglutination © agglutination ONCOURSIADE.COM

---

### Bloc 41-60 (Questions 41 à 60)

#### 41-1 : Système rénine-angiotensine
**Question** : Qu'est-ce que le système rénine-angiotensine-aldostérone ? Décrivez-le.

#### 41-2 : Détresse respiratoire + pharmacocinétique
**Question** : Quels sont les signes cliniques et paracliniques d'une détresse respiratoire chez l'adulte ? Qu'est ce que la pharmacocinétique ?

#### 41-3 : Pharmacocinétique + administration
**Question** : Expliquez et décrivez les quatre phases. Que devez-vous vérifier avant d'administrer un traitement à un patient ?

#### 41-4 : Drain thoracique + FAV
**Question** : Quels sont les éléments à surveiller chez un patient porteur d'un drain thoracique ? Mr M. est un patient en insuffisance rénale sévère, il est dialysé et est porteur d'une FAV au bras droit. Il vous demande

#### 41-5 : Surveillance FAV + Glasgow
**Question** : Quelles surveillances il doit effectuer. Que lui dites-vous ? Remplissez le schéma suivant : Un homme est retrouvé inconscient avec : - une ouverture des yeux à la douleur - une réponse verbale inappropriée - une réponse motrice à type d'extension stéréotypée

#### 41-6 : Score de Glasgow
**Question** : Quel est son score de Glasgow au regard de chaque signe ? Que proposez-vous ? ONCOURSIADE.COM

---

## ✅ Points Positifs

- **Qualité nettoyée** : Titres parasites supprimés ("QUESTIONS DE X À Y", "ANNALES"...)
- **Déduplication fonctionnelle** : 1 doublon détecté et supprimé
- **Questions complètes** : La plupart sont intelligibles
- **Blocs variés** : Questions issues de blocs 1-2, 21-40, 41-60

## ⚠️ Problèmes Identifiés

1. **Quantité réduite** : 16 questions seulement (au lieu de 59 avant nettoyage)
2. **Questions incomplètes** : Certaines questions sont coupées (1-8, 21-2, 21-3, 41-4, 41-5)
3. **Artéfacts OCR** : "é1éments" au lieu de "éléments", "I2Og" au lieu de "120g", "OO OO OO"
4. **Articles parasites** : "ONCOURSIADE.COM", "ANNALES CORRIGÉS" encore présents
5. **Questions fusionnées** : Certaines questions sont collées ensemble (21-2, 41-2, 41-3)

## 📋 Thèmes Identifiés

- **Néphrologie** : Fonctions rénales, dialyse, RAI
- **Cardiologie** : Système rénine-angiotensine, débit cardiaque
- **Pharmacologie** : Morphine, surdosage, pharmacocinétique
- **Transfusion** : Don de sang, transfusion, plaquettes
- **Anatomie** : Muscles lisses/striés, surfactant
- **Réanimation** : Score de Glasgow, détresse respiratoire, drain thoracique

## 🎯 Prochaines Étapes Recommandées

1. **Réduire le filtrage** : Baisser le seuil de longueur minimum (30 → 15 chars)
2. **Améliorer la regex de split** : Mieux détecter les fins de questions
3. **Corriger les artéfacts OCR** : "é1éments" → "éléments", "I" → "1", "O" → "0"
4. **Retravailler les schémas** : Les questions avec schémas sont incomplètes


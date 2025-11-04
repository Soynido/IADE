import fs from 'fs';
import path from 'path';

interface Concept {
  id: string;
  concept: string;
  domain: string;
  subcategory: string;
  keywords: string[];
  context: string;
  cours_refs: string[];
  annales_refs: string[];
  difficulty_hint: 'easy' | 'intermediate' | 'hard';
}

// Taxonomie médicale IADE
const TAXONOMY = {
  'Pharmacologie': ['morphine', 'naloxone', 'curare', 'benzodiazépine', 'dosage', 'posologie'],
  'Réanimation': ['choc', 'glasgow', 'oxygène', 'ventilation', 'protocole', 'urgence'],
  'Anatomie': ['surfactant', 'poumon', 'cœur', 'nerf', 'muscle'],
  'Physiologie': ['acido-basique', 'pH', 'homéostasie', 'régulation', 'compensation'],
  'Cas Cliniques': ['patient', 'antécédents', 'symptômes', 'prise en charge']
};

function detectDomain(text: string): string {
  for (const [domain, keywords] of Object.entries(TAXONOMY)) {
    const matches = keywords.filter(kw => text.toLowerCase().includes(kw));
    if (matches.length >= 2) return domain;
  }
  return 'Général';
}

function buildGroundTruth() {
  console.log('🔄 Construction du Ground Truth IADE...');
  
  // Vérifier si le fichier cours-enriched.json existe
  const coursEnrichedPath = path.join(process.cwd(), 'src/data/cours-enriched.json');
  if (!fs.existsSync(coursEnrichedPath)) {
    console.warn('⚠️ cours-enriched.json non trouvé. Utilisez npm run extract:full d\'abord.');
    console.log('📝 Création d\'un Ground Truth minimal depuis les données existantes...');
    
    // Fallback : utiliser les données existantes
    const concepts = createMinimalGroundTruth();
    saveGroundTruth(concepts);
    return;
  }
  
  // Charger les sources
  const coursEnriched = JSON.parse(fs.readFileSync(coursEnrichedPath, 'utf-8'));
  const knowledgeGraphPath = path.join(process.cwd(), 'src/data/concours/knowledge-graph.json');
  const knowledgeGraph = fs.existsSync(knowledgeGraphPath) 
    ? JSON.parse(fs.readFileSync(knowledgeGraphPath, 'utf-8'))
    : { nodes: [] };
  
  const concepts: Concept[] = [];
  let conceptId = 1;
  
  // Extraire les concepts depuis le cours enrichi
  if (coursEnriched.chapters && Array.isArray(coursEnriched.chapters)) {
    for (const chapter of coursEnriched.chapters) {
      if (!chapter.sections || !Array.isArray(chapter.sections)) continue;
      
      for (const section of chapter.sections) {
        const fullText = Array.isArray(section.content) ? section.content.join(' ') : '';
        
        if (fullText.length < 100) continue; // Filtrer contenu trop court
        
        // Extraire keywords (mots importants)
        const keywords = extractKeywords(fullText);
        
        if (keywords.length < 2) continue;
        
        const domain = detectDomain(fullText);
        
        concepts.push({
          id: `concept_${conceptId++}`,
          concept: section.title || `Section ${conceptId}`,
          domain,
          subcategory: keywords[0], // Utiliser le premier keyword comme sous-catégorie
          keywords: keywords.slice(0, 5),
          context: fullText.slice(0, 500), // Limiter la longueur du contexte
          cours_refs: [chapter.title || 'Chapitre'],
          annales_refs: findAnnalesRefs(section.title || '', knowledgeGraph),
          difficulty_hint: estimateDifficulty(fullText)
        });
      }
    }
  }
  
  saveGroundTruth(concepts);
}

function createMinimalGroundTruth(): Concept[] {
  console.log('📝 Création d\'un Ground Truth minimal...');
  
  // Charger les questions existantes pour créer des concepts
  const compiledQuestionsPath = path.join(process.cwd(), 'src/data/compiledQuestions.json');
  
  if (!fs.existsSync(compiledQuestionsPath)) {
    console.error('❌ Aucune donnée disponible pour créer le Ground Truth');
    return [];
  }
  
  const questions = JSON.parse(fs.readFileSync(compiledQuestionsPath, 'utf-8'));
  const concepts: Concept[] = [];
  const themesMap = new Map<string, any[]>();
  
  // Grouper les questions par thème
  questions.forEach((q: any) => {
    const theme = q.theme || 'Général';
    if (!themesMap.has(theme)) {
      themesMap.set(theme, []);
    }
    themesMap.get(theme)?.push(q);
  });
  
  // Créer un concept par thème
  let conceptId = 1;
  themesMap.forEach((questions, theme) => {
    const allText = questions.map(q => q.question + ' ' + q.explanation).join(' ');
    const keywords = extractKeywords(allText);
    
    concepts.push({
      id: `concept_${conceptId++}`,
      concept: theme,
      domain: detectDomain(allText),
      subcategory: keywords[0] || theme,
      keywords: keywords.slice(0, 5),
      context: allText.slice(0, 500),
      cours_refs: [theme],
      annales_refs: [],
      difficulty_hint: 'intermediate'
    });
  });
  
  return concepts;
}

function saveGroundTruth(concepts: Concept[]) {
  // Sauvegarder
  const outputPath = path.join(process.cwd(), 'src/data/groundTruth.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(concepts, null, 2),
    'utf-8'
  );
  
  console.log(`✅ Ground Truth créé : ${concepts.length} concepts`);
  console.log(`   Domaines: ${new Set(concepts.map(c => c.domain)).size}`);
  console.log(`   Fichier: ${outputPath}`);
}

function extractKeywords(text: string): string[] {
  // Mots médicaux importants (heuristique simple)
  const medicalWords = text
    .toLowerCase()
    .match(/\b[a-zàâçéèêëïîôûù]{5,}\b/g) || [];
  
  // Compter fréquences
  const freq: Record<string, number> = {};
  medicalWords.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  // Top 10 mots les plus fréquents
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function findAnnalesRefs(title: string, knowledgeGraph: any): string[] {
  // Rechercher des références dans le knowledge graph
  const refs: string[] = [];
  
  if (knowledgeGraph.nodes) {
    for (const node of knowledgeGraph.nodes) {
      if (node.label && title.toLowerCase().includes(node.label.toLowerCase())) {
        refs.push(node.id);
      }
    }
  }
  
  return refs.slice(0, 3);
}

function estimateDifficulty(text: string): 'easy' | 'intermediate' | 'hard' {
  const hardKeywords = ['calcul', 'formule', 'dosage', 'débit', 'équation'];
  const easyKeywords = ['définition', 'principe', 'qu\'est-ce', 'nommer'];
  
  const hardScore = hardKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
  const easyScore = easyKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
  
  if (hardScore >= 2) return 'hard';
  if (easyScore >= 2) return 'easy';
  return 'intermediate';
}

buildGroundTruth();


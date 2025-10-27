import { Question } from './pathology.js';

export interface Module {
  id: string;
  title: string;
  category: 'cours' | 'concours_2024' | 'concours_2025';
  filePath: string;
  metadata: {
    author?: string;
    year: number;
    topics: string[];
  };
  questionsCount: number;
  parsedAt: string;
}

export interface PedagogicalContext {
  courseExtract: string;      // 3-5 lignes contexte du cours
  moduleSection: string;       // "Chapitre 2 > Section 2.3"
  relatedConcepts: string[];   // ["Morphine", "Palier III"]
  prerequisites: string[];     // Concepts à maîtriser avant
}

export interface CompiledQuestion extends Question {
  sourceModule: string;    // ID du module source
  originalText: string;    // Question originale brute
  variants?: string[];     // Variantes générées
  relatedQuestions: string[];  // IDs de questions similaires
  pedagogicalContext?: PedagogicalContext; // Contexte pédagogique enrichi
  webSources?: {
    title: string;
    url: string;
    snippet: string;
  }[];
}

export interface ModulesIndex {
  modules: Module[];
  totalQuestions: number;
  compiledAt: string;
  version: string;
}


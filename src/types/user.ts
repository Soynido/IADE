import { UserStats } from './pathology.js';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;  // 0-100
  target?: number;    // Objectif à atteindre
}

export interface UserProfile extends UserStats {
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  achievements: Achievement[];
  preferences: {
    showTimer: boolean;
    feedbackDelay: number;
    dailyGoal: number;
  };
  learningPath: {
    completedModules: string[];
    inProgressModules: string[];
    recommendedNext: string[];
  };
  onboarded: boolean;
  initialLevel?: 'facile' | 'moyen' | 'difficile';
  startDate: string;
  streakDays: number;
  lastActivityDate?: string;
  questionsSeen: string[];  // IDs des questions déjà vues
  questionsToReview: {
    questionId: string;
    nextReviewDate: string;
    repetitionLevel: number;  // 0-5 pour spaced repetition
  }[];
}

export interface QuestionAttempt {
  questionId: string;
  attempts: {
    timestamp: Date;
    correct: boolean;
    hintsUsed: number;
    recallTime: number;  // temps avant réponse en secondes
  }[];
}

export interface SessionMode {
  type: 'revision' | 'simulation';
  config: {
    showTimer: boolean;
    feedbackImmediate: boolean;
    timePerQuestion?: number;  // en secondes
    allowHints: boolean;
  };
}


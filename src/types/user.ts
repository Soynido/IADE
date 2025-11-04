import { UserStats } from './pathology.js';

export interface UserProfile extends UserStats {
  // Core user data
  streakDays: number;
  lastStreakDate?: string;
  lastActivityDate?: string;
  
  // Progress tracking
  averageScore: number;
  totalSessions: number;
  questionsSeen: string[];
  recentScores: SessionScore[];
  
  // Module progress
  moduleProgress?: {
    [moduleId: string]: {
      questionsSeenIds: string[];
      scores: number[];
      averageScore: number;
      lastReviewDate: string;
    };
  };
  
  // Adaptive learning profile
  adaptiveProfile?: {
    accuracyRate: number;
    domainPerformance: Record<string, number>;
    targetDifficulty: string;
    lastUpdated: string;
  };
}

export interface SessionScore {
  date: string;
  score: number;
  theme: string;
  questionsCount: number;
  mode: 'revision' | 'training' | 'exam';
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


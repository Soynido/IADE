/**
 * Types pour le système de feedback utilisateur
 * Permet la collecte et l'analyse des retours sur la qualité des questions
 */

export interface QuestionFeedback {
  questionId: string;
  rating: 1 | 2 | 3; // 1=Bad, 2=Good, 3=Very Good
  timestamp: number;
  userId: string; // ID anonyme local (UUID)
  sessionId: string;
  responseTime?: number; // Temps de réponse en ms
  wasCorrect: boolean; // Si la réponse était correcte
}

export interface FeedbackStats {
  questionId: string;
  averageRating: number;
  totalFeedbacks: number;
  lastUpdated: string;
}

export interface LocalFeedbackStorage {
  userId: string;
  feedbacks: QuestionFeedback[];
  lastSyncAt?: number;
}


export interface Pathology {
  id: string;
  name: string;
  category: string;
  symptoms: string[];                    // ✅ Standardisé en anglais
  diagnostics: string[];                   // ✅ Standardisé en anglais
  nursingCare: string[];                   // ✅ Standardisé en anglais
  emergencyTreatment: string[];            // ✅ Standardisé en anglais
  severitySigns: string[];                 // ✅ Standardisé en anglais
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correct: string;
  explanation: string;
  points: number;
  theme: string;
  difficulty: string;
  pathology: string;
}

export interface LearningSession {
  questions: Question[];
  theme: string;
  difficulty: string;
  currentIndex: number;
  startTime: Date;
}

export interface UserStats {
  userId: string;
  totalSessions: number;
  averageScore: number;
  weakAreas: string[];
  recentScores: Array<{
    date: string;
    score: number;
    theme: string;
  }>;
  lastSession?: string;
  progression10percent: number;
}
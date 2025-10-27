import { useState, useCallback } from 'react';
import { QuestionGeneratorV2 } from '../services/questionGeneratorV2';
import { StorageService } from '../services/storageService';
import type { LearningSession, UserStats } from '../types/pathology';

type SessionMode = 'revision' | 'simulation';

/**
 * Hook personnalisé pour gérer une session de quiz
 */
export function useQuizSession(mode: SessionMode = 'revision', questionCount: number = 10) {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Démarrer une nouvelle session
  const startSession = useCallback(() => {
    setIsLoading(true);
    
    const profile = StorageService.getUserProfile();
    const userStats: UserStats = {
      userId: profile.userId,
      totalSessions: profile.totalSessions || 0,
      averageScore: profile.averageScore || 0,
      weakAreas: profile.weakAreas || [],
      recentScores: profile.recentScores || [],
      progression10percent: profile.progression10percent || 0,
    };

    // Générer la session avec l'algorithme adaptatif V2
    const generatedSession = QuestionGeneratorV2.startLearningSession(userStats, questionCount);
    
    // Construire une vraie LearningSession avec currentIndex et startTime
    const newSession: LearningSession = {
      questions: generatedSession.questions,
      theme: generatedSession.theme,
      difficulty: generatedSession.difficulty,
      currentIndex: 0,
      startTime: new Date(),
    };
    
    setSession(newSession);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers(new Map());
    setStartTime(new Date());
    setIsLoading(false);
  }, [questionCount]);

  // Répondre à une question
  const answerQuestion = useCallback((answer: string) => {
    if (!session) return null;

    const currentQuestion = session.questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct;
    const points = isCorrect ? currentQuestion.points : 0;

    // Enregistrer la réponse
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestionIndex, answer);
    setAnswers(newAnswers);

    // Mettre à jour le score
    setScore(score + points);

    // Marquer la question comme vue
    if (currentQuestion.id) {
      StorageService.markQuestionAsSeen(currentQuestion.id);
    }

    return {
      isCorrect,
      points,
      correctAnswer: currentQuestion.correct,
      explanation: currentQuestion.explanation,
    };
  }, [session, currentQuestionIndex, answers, score]);

  // Passer à la question suivante
  const nextQuestion = useCallback(() => {
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [session, currentQuestionIndex]);

  // Finaliser la session
  const finishSession = useCallback(() => {
    if (!session || !startTime) return null;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Calculer le total des points possibles
    const maxPoints = session.questions.reduce((sum, q) => sum + q.points, 0);
    const finalScore = maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;

    // Enregistrer dans le profil utilisateur
    StorageService.updateSessionStats(session.theme, finalScore, session.questions.length);

    return {
      score: finalScore,
      totalPoints: score,
      maxPoints,
      questionsAnswered: session.questions.length,
      duration,
      theme: session.theme,
      difficulty: session.difficulty,
    };
  }, [session, score, startTime]);

  // Calculer la progression
  const progress = session
    ? ((currentQuestionIndex + 1) / session.questions.length) * 100
    : 0;

  return {
    session,
    currentQuestion: session?.questions[currentQuestionIndex] || null,
    currentQuestionIndex,
    score,
    progress,
    isLoading,
    mode,
    startSession,
    answerQuestion,
    nextQuestion,
    finishSession,
    isLastQuestion: session ? currentQuestionIndex >= session.questions.length - 1 : false,
  };
}


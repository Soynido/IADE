import React, { useState, useCallback } from 'react';
import { LearningSession, UserStats } from '../types/pathology';
import { QuestionGenerator } from '../services/questionGenerator';

interface QuizSessionProps {
  initialUserStats?: UserStats;
}

export const QuizSession: React.FC<QuizSessionProps> = ({ initialUserStats }) => {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState<{
    score: number;
    totalPoints: number;
    maxPoints: number;
    theme: string;
    difficulty: string;
    questionsAnswered: number;
  } | null>(null);

  // État utilisateur avec localStorage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    if (initialUserStats) return initialUserStats;

    const saved = localStorage.getItem('iade_user_stats');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      userId: 'user1',
      totalSessions: 0,
      averageScore: 50,
      weakAreas: [],
      recentScores: []
    };
  });

  // Sauvegarder les résultats dans localStorage
  const saveSessionResults = useCallback((theme: string, score: number) => {
    const existingStats = { ...userStats };
    const today = new Date().toISOString().split('T')[0];

    const newStats: UserStats = {
      ...existingStats,
      totalSessions: (existingStats.totalSessions || 0) + 1,
      recentScores: [...(existingStats.recentScores || []), { date: today, score, theme }].slice(-10),
      averageScore: existingStats.recentScores
        ? Math.round([...existingStats.recentScores, { score }].reduce((sum, s) => sum + s.score, 0) / (existingStats.recentScores.length + 1))
        : score,
      weakAreas: score < 60 ? [theme] : (existingStats.weakAreas || []).filter(area => area !== theme),
      lastSession: new Date().toISOString(),
      progression10percent: calculateProgression(existingStats)
    };

    localStorage.setItem('iade_user_stats', JSON.stringify(newStats));
    setUserStats(newStats);
  }, [userStats]);

  // Calculer la progression (+10% objectif)
  const calculateProgression = useCallback((stats: UserStats) => {
    if (!stats.recentScores || stats.recentScores.length < 2) return 0;

    const recent = stats.recentScores.slice(-5);
    const older = stats.recentScores.slice(-10, -5);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / older.length;

    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }, []);

  // Démarrer une nouvelle session
  const handleStartSession = useCallback(() => {
    console.log('🚀 Démarrage de la session...');
    setIsLoading(true);

    try {
      // Appeler le moteur adaptatif
      const { questions, theme, difficulty } = QuestionGenerator.startLearningSession(userStats, 10);

      // Créer la session
      const newSession: LearningSession = {
        questions,
        theme,
        difficulty,
        currentIndex: 0,
        startTime: new Date()
      };

      // Mettre à jour l'état React
      setSession(newSession);
      setCurrentQuestionIndex(0);
      setIsStarted(true);
      setIsCompleted(false);
      setScore(0);
      setShowFeedback(false);
      setFeedback('');
      setShowResults(false);
      setFinalResults(null);

      console.log('✅ Session créée:', { theme, difficulty, questionCount: questions.length });

    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userStats]);

  // Gérer la réponse à une question
  const handleAnswer = useCallback((selectedOption: string) => {
    if (!session) return;

    const currentQuestion = session.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;

    // Mettre à jour le score
    setScore(prev => prev + pointsEarned);

    // Afficher le feedback
    setTimeout(() => {
      if (isCorrect) {
        setFeedback(`✅ Correct! +${pointsEarned} points\n\n${currentQuestion.explanation}`);
      } else {
        setFeedback(`❌ Incorrect. La bonne réponse était: "${currentQuestion.correct}"\n\n${currentQuestion.explanation}`);
      }
      setShowFeedback(true);
    }, 300);

    // Passer à la question suivante après 2 secondes
    setTimeout(() => {
      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowFeedback(false);
        setFeedback('');
      } else {
        // Session terminée
        const totalPoints = score + pointsEarned;
        const maxPoints = session.questions.reduce((sum, q) => sum + q.points, 0);
        const percentage = Math.round((totalPoints / maxPoints) * 100);

        // Sauvegarder les résultats
        saveSessionResults(session.theme, percentage);

        setTimeout(() => {
          setShowResults(true);
          setFinalResults({
            score: percentage,
            totalPoints,
            maxPoints,
            theme: session.theme,
            difficulty: session.difficulty,
            questionsAnswered: session.questions.length
          });
        }, 500);
      }
    }, 2000);
  }, [session, currentQuestionIndex, score, saveSessionResults]);

  // Recommencer une nouvelle session
  const handleRestart = useCallback(() => {
    setIsStarted(false);
    setIsCompleted(false);
    setSession(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowFeedback(false);
    setFeedback('');
    setShowResults(false);
    setFinalResults(null);
  }, []);

  // CTA principal
  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-iade-blue to-iade-purple p-10">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-iade-green to-green-600 bg-clip-text text-transparent">
            🧠 IADE Learning Core v2.0
          </h1>

          <p className="text-gray-600 mb-8 text-lg">
            Plateforme adaptative pour la préparation aux concours IADE 2024-2025
          </p>

          {/* Statistiques utilisateur */}
          {userStats.totalSessions > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-iade-blue">{userStats.totalSessions}</div>
                  <div className="text-xs text-gray-600">Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-iade-green">{userStats.averageScore}%</div>
                  <div className="text-xs text-gray-600">Moyenne</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${userStats.progression10percent >= 10 ? 'text-iade-green' : 'text-orange-600'}`}>
                    {userStats.progression10percent > 0 ? '+' : ''}{userStats.progression10percent}%
                  </div>
                  <div className="text-xs text-gray-600">Progression</div>
                </div>
              </div>
              {userStats.weakAreas.length > 0 && (
                <div className="mt-3 text-sm text-orange-600">
                  🎯 Zones à renforcer: {userStats.weakAreas.join(', ')}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleStartSession}
            disabled={isLoading}
            className={`px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all transform ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-iade-green to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-solid border-white border-t-transparent rounded-full animate-spin" />
                Préparation...
              </span>
            ) : (
              <span>🚀 Commencer une session adaptative</span>
            )}
          </button>

          <div className="mt-6 text-sm text-gray-500">
            10 questions • Intelligence artificielle • Adaptation automatique
          </div>
        </div>
      </div>
    );
  }

  // Session en cours
  if (session && !isCompleted) {
    const currentQuestion = session.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-iade-blue to-iade-purple">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center text-white">
              <div>
                <h1 className="text-2xl font-bold">🧠 IADE Learning Core</h1>
                <p className="text-sm opacity-80">Thème: {session.theme} • {session.difficulty}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold">{currentQuestionIndex + 1} / {session.questions.length}</div>
                <div className="text-sm opacity-80">Score: {score} pts</div>
              </div>
            </div>
            {/* Barre de progression */}
            <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-iade-green to-green-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Feedback modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="text-lg font-semibold mb-4 whitespace-pre-line">
                {feedback}
              </div>
              <button
                onClick={() => {
                  setShowFeedback(false);
                  setFeedback('');
                }}
                className="px-6 py-3 bg-iade-blue text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                QCM
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                📍 {session.theme}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                🏥 {currentQuestion.pathology}
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                ⭐ {currentQuestion.points} pts
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              {currentQuestion.question}
            </h2>

            {/* Options de réponse */}
            <div className="flex flex-col items-center gap-4">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className="w-full max-w-md px-6 py-4 text-left border-2 border-gray-200 rounded-xl hover:border-iade-blue hover:bg-blue-50 transition-all transform hover:scale-102 flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-iade-blue to-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran de résultats
  if (showResults && finalResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-iade-blue to-iade-purple p-10">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg w-full text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
            finalResults.score >= 70
              ? 'bg-gradient-to-r from-iade-green to-green-600'
              : finalResults.score >= 50
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            {finalResults.score}%
          </div>

          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            🎉 Session terminée !
          </h2>

          <div className="space-y-3 mb-6 text-left bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between">
              <span className="text-gray-600">Score final:</span>
              <span className="font-semibold">{finalResults.totalPoints}/{finalResults.maxPoints} points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thème:</span>
              <span className="font-semibold">{finalResults.theme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulté:</span>
              <span className="font-semibold">{finalResults.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Questions:</span>
              <span className="font-semibold">{finalResults.questionsAnswered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Progression:</span>
              <span className={`font-semibold ${userStats.progression10percent >= 10 ? 'text-iade-green' : 'text-orange-600'}`}>
                {userStats.progression10percent > 0 ? '+' : ''}{userStats.progression10percent}%
              </span>
            </div>
          </div>

          {finalResults.score >= 70 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-medium">🌟 Excellent travail ! Continuez comme ça !</p>
            </div>
          )}

          {finalResults.score < 60 && userStats.weakAreas.includes(finalResults.theme) && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-orange-800">💪 Ce thème sera travaillé davantage dans les prochaines sessions.</p>
            </div>
          )}

          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-gradient-to-r from-iade-blue to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold"
          >
            🚀 Nouvelle session
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizSession;
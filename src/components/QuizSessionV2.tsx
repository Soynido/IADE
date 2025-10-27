import React, { useState, useCallback, useEffect } from 'react';
import { LearningSession } from '../types/pathology';
import { QuestionGeneratorV3 } from '../services/questionGeneratorV3';
import { StorageService } from '../services/storageService';
import { AchievementsEngine } from '../services/achievementsEngine';
import { QuestionCard } from './quiz/QuestionCard';
import { FeedbackModal } from './quiz/FeedbackModal';
import { Button, Card, Badge, ProgressBar, CircularProgress } from './ui';
import { Toast } from './ui/Toast';
import type { Achievement } from '../types/user';

interface QuizSessionV2Props {
  mode?: 'revision' | 'simulation';
  onComplete?: () => void;
}

export const QuizSessionV2: React.FC<QuizSessionV2Props> = ({
  mode = 'revision',
  onComplete,
}) => {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    points: number;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState<{
    score: number;
    totalPoints: number;
    maxPoints: number;
    theme: string;
    difficulty: string;
    questionsAnswered: number;
  } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Nouveau : Mode de révision sélectionné
  const [revisionMode, setRevisionMode] = useState<'qcm' | 'qroc' | 'diagram' | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(true);

  // Démarrer la session quand un mode est sélectionné
  useEffect(() => {
    if (revisionMode && !session) {
      handleStartSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionMode]);

  const handleStartSession = useCallback(() => {
    console.log('🚀 Démarrage de la session V2...');
    setIsLoading(true);

    try {
      const userProfile = StorageService.getUserProfile();
      
      // Utiliser le nouveau générateur V3 avec répétition espacée
      const { questions, theme, difficulty } = QuestionGeneratorV3.generateSessionWithSpacedRepetition(
        userProfile,
        10,
        true // Inclure nouvelles questions
      );

      const newSession: LearningSession = {
        questions,
        theme,
        difficulty,
        currentIndex: 0,
        startTime: new Date()
      };

      setSession(newSession);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowFeedback(false);
      setShowResults(false);
      setFinalResults(null);
      setQuestionStartTime(Date.now());

      console.log('✅ Session V2 créée:', { theme, difficulty, questionCount: questions.length });
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnswer = useCallback((selectedOption: string, hintsUsed: number = 0, recallTime: number = 0) => {
    if (!session) return;

    const currentQuestion = session.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct;
    
    // Ajuster les points selon l'utilisation des indices
    let pointsMultiplier = 1.0;
    if (hintsUsed === 0 && recallTime > 10) {
      pointsMultiplier = 1.2; // Bonus de 20% pour rappel actif sans aide
    } else if (hintsUsed === 1) {
      pointsMultiplier = 0.8; // -20% avec 1 indice
    } else if (hintsUsed >= 2) {
      pointsMultiplier = 0.6; // -40% avec 2+ indices
    }
    
    const basePoints = isCorrect ? currentQuestion.points : 0;
    const pointsEarned = Math.round(basePoints * pointsMultiplier);
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Enregistrer la réponse avec les métadonnées de rappel actif
    QuestionGeneratorV2.recordAnswer(currentQuestion.id, isCorrect, timeSpent);

    // Mettre à jour le score
    setScore(prev => prev + pointsEarned);

    // Préparer le feedback enrichi
    setCurrentFeedback({
      isCorrect,
      correctAnswer: currentQuestion.correct,
      explanation: currentQuestion.explanation,
      points: pointsEarned,
    });

    // Afficher le feedback
    setShowFeedback(true);
  }, [session, currentQuestionIndex, questionStartTime]);

  const handleContinue = useCallback(() => {
    if (!session) return;

    setShowFeedback(false);
    setCurrentFeedback(null);

    if (currentQuestionIndex < session.questions.length - 1) {
      // Question suivante
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Session terminée
      const totalPoints = score + (currentFeedback?.isCorrect ? currentFeedback.points : 0);
      const maxPoints = session.questions.reduce((sum, q) => sum + q.points, 0);
      const percentage = Math.round((totalPoints / maxPoints) * 100);

      // Sauvegarder les résultats
      StorageService.updateSessionStats(session.theme, percentage, session.questions.length);

      // Vérifier les achievements
      const newAchievements = AchievementsEngine.checkAfterSession(session.theme, percentage);
      setAchievements(newAchievements);

      // Afficher les résultats
      setShowResults(true);
      setFinalResults({
        score: percentage,
        totalPoints,
        maxPoints,
        theme: session.theme,
        difficulty: session.difficulty,
        questionsAnswered: session.questions.length
      });
    }
  }, [session, currentQuestionIndex, score, currentFeedback]);

  const handleRestart = useCallback(() => {
    setShowResults(false);
    setFinalResults(null);
    handleStartSession();
  }, [handleStartSession]);

  const handleExit = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Écran de sélection de mode
  if (showModeSelector && !revisionMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-iade-blue-50 to-iade-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card variant="elevated" padding="lg" className="bg-white dark:bg-gray-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-iade-blue-600 to-iade-purple-600 bg-clip-text text-transparent mb-3">
                🎓 Choisissez votre mode de révision
              </h2>
              <p className="text-iade-gray-600 dark:text-gray-400">
                Chaque mode est optimisé pour un type d'apprentissage spécifique
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mode QCM Classique */}
              <button
                onClick={() => {
                  setRevisionMode('qcm');
                  setShowModeSelector(false);
                }}
                className="p-6 border-2 border-iade-blue-200 dark:border-iade-blue-700 rounded-xl hover:border-iade-blue-500 hover:shadow-lg transition-all bg-gradient-to-br from-iade-blue-50 to-white dark:from-iade-blue-900/20 dark:to-gray-800 hover:scale-105"
              >
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-bold text-lg text-iade-gray-900 dark:text-gray-100 mb-2">
                  QCM Classique
                </h3>
                <p className="text-sm text-iade-gray-600 dark:text-gray-400 mb-3">
                  Choix multiples avec rappel actif et indices progressifs
                </p>
                <Badge variant="success" size="sm">Recommandé</Badge>
              </button>

              {/* Mode QROC Rédaction */}
              <button
                onClick={() => {
                  setRevisionMode('qroc');
                  setShowModeSelector(false);
                }}
                className="p-6 border-2 border-iade-purple-200 dark:border-iade-purple-700 rounded-xl hover:border-iade-purple-500 hover:shadow-lg transition-all bg-gradient-to-br from-iade-purple-50 to-white dark:from-iade-purple-900/20 dark:to-gray-800 hover:scale-105"
              >
                <div className="text-4xl mb-3">✍️</div>
                <h3 className="font-bold text-lg text-iade-gray-900 dark:text-gray-100 mb-2">
                  Mode Rédaction
                </h3>
                <p className="text-sm text-iade-gray-600 dark:text-gray-400 mb-3">
                  Rédigez vos réponses, analyse sémantique automatique
                </p>
                <Badge variant="purple" size="sm">Avancé</Badge>
              </button>

              {/* Mode Schémas */}
              <button
                onClick={() => {
                  setRevisionMode('diagram');
                  setShowModeSelector(false);
                }}
                className="p-6 border-2 border-iade-green-200 dark:border-iade-green-700 rounded-xl hover:border-iade-green-500 hover:shadow-lg transition-all bg-gradient-to-br from-iade-green-50 to-white dark:from-iade-green-900/20 dark:to-gray-800 hover:scale-105"
              >
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-bold text-lg text-iade-gray-900 dark:text-gray-100 mb-2">
                  Schémas Interactifs
                </h3>
                <p className="text-sm text-iade-gray-600 dark:text-gray-400 mb-3">
                  Complétez des diagrammes physiologiques
                </p>
                <Badge variant="info" size="sm">Visuel</Badge>
              </button>
            </div>

            <div className="mt-6 p-4 bg-iade-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-iade-gray-600 dark:text-gray-400 text-center">
                💡 Astuce : Alternez entre les modes pour optimiser votre apprentissage
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-iade-blue-50 to-iade-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-iade-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-iade-gray-600 dark:text-gray-400">Génération de votre session adaptative...</p>
        </div>
      </div>
    );
  }

  // Écran de résultats
  if (showResults && finalResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-iade-blue-50 to-iade-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        {/* Achievements Toast */}
        {achievements.map((achievement, index) => (
          <Toast
            key={achievement.id}
            message={`${achievement.icon} ${achievement.title} débloqué !`}
            type="achievement"
            duration={5000 + index * 1000}
            onClose={() => {}}
          />
        ))}

        <div className="max-w-2xl mx-auto">
          <Card variant="elevated" padding="lg" className="bg-white dark:bg-gray-800">
            {/* Score Circle */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <CircularProgress
                value={finalResults.score}
                size={160}
                strokeWidth={12}
                variant={finalResults.score >= 70 ? 'success' : finalResults.score >= 50 ? 'warning' : 'danger'}
                label="Score final"
              />
            </div>

            <h2 className="text-3xl font-bold text-center mb-6 text-iade-gray-900 dark:text-gray-100">
              🎉 Session terminée !
            </h2>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-iade-gray-50 dark:bg-gray-700 rounded-xl text-center">
                <p className="text-sm text-iade-gray-600 dark:text-gray-400 mb-1">Points obtenus</p>
                <p className="text-2xl font-bold text-iade-blue-600 dark:text-iade-blue-400">
                  {finalResults.totalPoints}/{finalResults.maxPoints}
                </p>
              </div>
              <div className="p-4 bg-iade-gray-50 dark:bg-gray-700 rounded-xl text-center">
                <p className="text-sm text-iade-gray-600 dark:text-gray-400 mb-1">Questions</p>
                <p className="text-2xl font-bold text-iade-green-600 dark:text-iade-green-400">
                  {finalResults.questionsAnswered}
                </p>
              </div>
            </div>

            {/* Détails */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-iade-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-iade-gray-600 dark:text-gray-400">Thème</span>
                <Badge variant="purple">{finalResults.theme}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-iade-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-iade-gray-600 dark:text-gray-400">Difficulté</span>
                <Badge variant="warning">{finalResults.difficulty}</Badge>
              </div>
            </div>

            {/* Message encouragement */}
            {finalResults.score >= 80 && (
              <div className="p-4 bg-iade-green-50 border-2 border-iade-green-200 rounded-xl mb-6 text-center">
                <p className="text-iade-green-800 font-semibold">
                  🌟 Excellent travail ! Vous maîtrisez ce sujet !
                </p>
              </div>
            )}

            {finalResults.score >= 60 && finalResults.score < 80 && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl mb-6 text-center">
                <p className="text-yellow-800 font-semibold">
                  💪 Bon travail ! Continuez à vous entraîner !
                </p>
              </div>
            )}

            {finalResults.score < 60 && (
              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl mb-6 text-center">
                <p className="text-orange-800 font-semibold">
                  📚 Révisez ce thème pour progresser davantage !
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleRestart}
                fullWidth
              >
                🔄 Nouvelle Session
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleExit}
                fullWidth
              >
                🏠 Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Session en cours
  if (session) {
    const currentQuestion = session.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-iade-blue-50 to-iade-purple-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header avec progression */}
        <div className="bg-white dark:bg-gray-800 border-b border-iade-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-xl font-bold text-iade-gray-900 dark:text-gray-100">{session.theme}</h2>
                <p className="text-sm text-iade-gray-600 dark:text-gray-400">
                  {mode === 'revision' ? '📚 Mode Révision' : '⏱️ Mode Simulation'} • {session.difficulty}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-iade-blue-600 dark:text-iade-blue-400">{score} pts</p>
                <p className="text-sm text-iade-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1}/{session.questions.length}
                </p>
              </div>
            </div>
            
            <ProgressBar
              value={progress}
              variant="success"
              size="md"
              animated
            />
          </div>
        </div>

        {/* Question */}
        <div className="py-8 px-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={session.questions.length}
            onAnswer={handleAnswer}
            disabled={showFeedback}
          />
        </div>

        {/* Feedback Modal */}
        {currentFeedback && (
          <FeedbackModal
            isOpen={showFeedback}
            isCorrect={currentFeedback.isCorrect}
            correctAnswer={currentFeedback.correctAnswer}
            explanation={currentFeedback.explanation}
            points={currentFeedback.points}
            question={currentQuestion}
            onContinue={handleContinue}
          />
        )}
      </div>
    );
  }

  return null;
};

export default QuizSessionV2;


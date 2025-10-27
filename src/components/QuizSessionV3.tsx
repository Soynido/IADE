import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/progress';
import { QuestionGeneratorV3 } from '../services/questionGeneratorV3';
import { StorageService } from '../services/storageService';
import { AchievementsEngine } from '../services/achievementsEngine';
import { 
  BookOpen, Clock, Target, Trophy, ArrowLeft, CheckCircle2, 
  XCircle, Lightbulb, Timer, Zap 
} from 'lucide-react';
import type { Question } from '../types/pathology';
import type { LearningSession } from '../types/pathology';

interface QuizSessionV3Props {
  mode?: 'revision' | 'simulation';
}

export const QuizSessionV3: React.FC<QuizSessionV3Props> = ({ mode = 'revision' }) => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId?: string }>();
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mode === 'simulation' ? 120 : 0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Démarrer la session automatiquement
  useEffect(() => {
    startNewSession();
  }, [moduleId]);

  // Timer pour mode simulation
  useEffect(() => {
    if (mode === 'simulation' && session && !showFeedback && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t > 0 ? t - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, session, showFeedback, timeLeft]);

  const startNewSession = () => {
    const userProfile = StorageService.getUserProfile();
    
    // Si moduleId présent (mode révision d'un module), générer session du module
    // Sinon, session mixte normale
    const { questions, theme, difficulty } = moduleId 
      ? QuestionGeneratorV3.generateModuleSession(moduleId, 10)
      : QuestionGeneratorV3.generateSessionWithSpacedRepetition(userProfile as any, 10, true);

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
    setCorrectAnswers(0);
    setQuestionStartTime(Date.now());
    setTimeLeft(mode === 'simulation' ? 120 : 0);
  };

  const handleSelectOption = (index: number) => {
    if (!showFeedback) {
      setSelectedOption(index);
    }
  };

  const handleValidate = () => {
    if (selectedOption === null || !session) return;

    const currentQuestion = session.questions[currentQuestionIndex];
    const correct = currentQuestion.options[selectedOption] === currentQuestion.correct;
    const responseTime = Date.now() - questionStartTime;

    setIsCorrect(correct);
    
    // Calculer les points avec bonus temps
    const scoring = QuestionGeneratorV3.calculateScoreWithTime(
      correct,
      responseTime,
      currentQuestion.difficulty
    );

    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
      setScore(score + scoring.totalPoints);
    }

    if (mode === 'revision') {
      setShowFeedback(true);
    } else {
      // Mode simulation : passer directement à la question suivante
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  const handleNext = () => {
    if (!session) return;

    setShowFeedback(false);
    setSelectedOption(null);

    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
      setTimeLeft(mode === 'simulation' ? 120 : 0);
    } else {
      // Session terminée
      finishSession();
    }
  };

  const finishSession = () => {
    if (!session) return;

    const userProfile = StorageService.getUserProfile();
    const finalScore = Math.round((correctAnswers / session.questions.length) * 100);

    // Sauvegarder la session
    StorageService.addSession({
      date: new Date().toISOString(),
      score: finalScore,
      theme: session.theme,
      questionsCount: session.questions.length,
      mode,
    });

    // Si révision d'un module, mettre à jour la progression du module
    if (moduleId && mode === 'revision') {
      const questionIds = session.questions.map(q => q.id);
      StorageService.updateModuleProgress(moduleId, finalScore, questionIds);
    }

    // Vérifier les achievements
    const newAchievements = AchievementsEngine.checkAchievements(userProfile);
    
    console.log('🎉 Session terminée:', {
      score: finalScore,
      correctAnswers,
      total: session.questions.length,
      moduleId: moduleId || 'mixte',
      newAchievements: newAchievements.length,
    });

    // Retourner au dashboard après 3 secondes
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="bg-white shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="animate-spin text-6xl mb-4">⚡</div>
            <p className="text-xl text-gray-600">Génération de votre session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  // Session terminée - Afficher résultats
  if (currentQuestionIndex >= session.questions.length) {
    const finalScore = Math.round((correctAnswers / session.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full bg-white shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="text-6xl mb-4">
              {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '💪'}
            </div>
            <CardTitle className="text-4xl font-black text-gray-900">
              Session terminée !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score final */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl text-center">
              <p className="text-sm text-gray-600 mb-2">Votre score</p>
              <div className="text-6xl font-bold text-gray-900 mb-2">{finalScore}%</div>
              <p className="text-lg text-gray-700">
                {correctAnswers} / {session.questions.length} bonnes réponses
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-700">{session.questions.length}</p>
                <p className="text-sm text-blue-600">Questions</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-700">{correctAnswers}</p>
                <p className="text-sm text-green-600">Correctes</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-700">{score}</p>
                <p className="text-sm text-purple-600">Points</p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-xl">
              <p className="text-gray-700 text-center font-medium">
                {finalScore >= 80 && '🌟 Excellent travail ! Vous maîtrisez bien ce thème.'}
                {finalScore >= 60 && finalScore < 80 && '👍 Bonne performance ! Continuez vos efforts.'}
                {finalScore < 60 && '💪 Bon début ! Révisez les points faibles et réessayez.'}
              </p>
            </div>

            <p className="text-center text-gray-500 text-sm">
              Retour au dashboard dans 3 secondes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Bouton retour */}
            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>

            {/* Info session */}
            <div className="flex items-center gap-4">
              <Badge className="text-sm">
                {mode === 'revision' ? '📚 Révision' : '⚡ Simulation'}
              </Badge>
              <div className="text-sm text-gray-600">
                {session.theme} • {session.difficulty}
              </div>
            </div>

            {/* Score et timer */}
            <div className="flex items-center gap-4">
              {mode === 'simulation' && (
                <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full">
                  <Timer className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-bold text-orange-700">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <div className="text-sm font-bold text-gray-900">
                Score: {score} pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600">
              Question {currentQuestionIndex + 1} / {session.questions.length}
            </p>
            <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="bg-white shadow-2xl border-0 mb-6">
          <CardHeader className="space-y-4">
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {currentQuestion.theme}
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                {currentQuestion.difficulty}
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {currentQuestion.points} pts
              </Badge>
            </div>

            {/* Question */}
            <CardTitle className="text-2xl font-bold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Options */}
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={showFeedback}
                className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-200 ${
                  selectedOption === index
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : showFeedback && option === currentQuestion.correct
                    ? 'border-green-500 bg-green-50'
                    : showFeedback && selectedOption === index
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    selectedOption === index
                      ? 'bg-blue-500 text-white'
                      : showFeedback && option === currentQuestion.correct
                      ? 'bg-green-500 text-white'
                      : showFeedback && selectedOption === index
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg text-gray-900 flex-1">{option}</span>
                  {showFeedback && option === currentQuestion.correct && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                  {showFeedback && selectedOption === index && !isCorrect && (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </button>
            ))}

            {/* Boutons d'action */}
            <div className="pt-6">
              {!showFeedback ? (
                <Button
                  onClick={handleValidate}
                  disabled={selectedOption === null}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Valider ma réponse
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Feedback */}
                  <div className={`p-6 rounded-xl border-l-4 ${
                    isCorrect 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">
                        {isCorrect ? '✅' : '❌'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900 mb-2">
                          {isCorrect ? 'Bravo ! Bonne réponse' : 'Pas tout à fait...'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-700 mb-3">
                            La bonne réponse était : <strong>{currentQuestion.correct}</strong>
                          </p>
                        )}
                        <div className="bg-white/60 p-4 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-semibold text-gray-900">Explication</p>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bouton suivant */}
                  <Button
                    onClick={handleNext}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    {currentQuestionIndex < session.questions.length - 1 
                      ? 'Question suivante →' 
                      : 'Voir mes résultats 🎉'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info mode */}
        {mode === 'revision' && (
          <div className="text-center text-sm text-gray-500">
            💡 Mode révision : Prenez votre temps et lisez les explications
          </div>
        )}
        {mode === 'simulation' && (
          <div className="text-center text-sm text-gray-500">
            ⏱️ Mode simulation : Répondez rapidement, feedback à la fin
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSessionV3;


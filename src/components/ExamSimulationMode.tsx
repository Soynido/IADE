import { useState, useEffect } from 'react';
import { useQuizSession } from '../hooks/useQuizSession';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle, Trophy } from 'lucide-react';

// Durée d'examen par défaut: 90 minutes (5400 secondes)
const EXAM_DURATION = 90 * 60;

export default function ExamSimulationMode() {
  const [time, setTime] = useState(EXAM_DURATION);
  const [isRunning, setIsRunning] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'volume1' | 'volume2'>('volume1');
  
  const {
    currentQuestion,
    questionNumber,
    totalQuestions,
    progress,
    score,
    accuracy,
    answerQuestion,
    showFeedback,
    lastAnswer,
    isCompleted
  } = useQuizSession();

  useEffect(() => {
    if (!isRunning || !examStarted) return;
    
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, examStarted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentageLeft = (time / EXAM_DURATION) * 100;
    if (percentageLeft > 50) return 'text-green-600';
    if (percentageLeft > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Écran de démarrage
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-violet-900 mb-8 flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            🎯 Mode Concours Blanc
          </h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuration de l'examen</h2>
            
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choisir la difficulté
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDifficulty('volume1')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    difficulty === 'volume1'
                      ? 'border-violet-500 bg-violet-50 shadow-md'
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">Volume 1</div>
                  <div className="text-sm text-gray-600">Questions standard</div>
                  <div className="text-xs text-violet-600 mt-2">Recommandé pour débuter</div>
                </button>
                
                <button
                  onClick={() => setDifficulty('volume2')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    difficulty === 'volume2'
                      ? 'border-violet-500 bg-violet-50 shadow-md'
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">Volume 2</div>
                  <div className="text-sm text-gray-600">Questions avancées</div>
                  <div className="text-xs text-red-600 mt-2">Plus difficile</div>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Conditions d'examen</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>⏱️ Durée: <strong>90 minutes</strong> (chronomètre dégressif)</li>
                    <li>📝 {totalQuestions} questions (QCM, QROC, Cas cliniques)</li>
                    <li>🎯 Mix automatique: 60% QCM, 25% QROC, 15% Cas</li>
                    <li>✅ Correction détaillée à la fin</li>
                    <li>🚫 Pas de retour en arrière possible</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setExamStarted(true);
                  setIsRunning(true);
                }}
                className="flex-1 bg-violet-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-violet-700 transition-colors shadow-lg hover:shadow-xl"
              >
                🚀 Démarrer le concours
              </button>
              <Link
                to="/"
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-violet-900 mb-8">🎯 Mode Concours Blanc</h1>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">Chargement des questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted || time === 0) {
    if (isRunning) setIsRunning(false);
    
    const timeSpent = EXAM_DURATION - time;
    const timeoutOccurred = time === 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{timeoutOccurred ? '⏰' : '🎓'}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {timeoutOccurred ? 'Temps écoulé !' : 'Concours terminé !'}
              </h2>
              {timeoutOccurred && (
                <p className="text-red-600 font-medium">Le temps imparti est écoulé</p>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Score final</p>
                <p className="text-3xl font-bold text-purple-700">{score}/{totalQuestions}</p>
              </div>
              <div className="bg-purple-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Temps utilisé</p>
                <p className="text-3xl font-bold text-purple-700">{formatTime(timeSpent)}</p>
              </div>
              <div className="bg-purple-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Précision</p>
                <p className="text-3xl font-bold text-purple-700">{accuracy.toFixed(0)}%</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl p-6 mb-6 text-center">
              <p className="text-5xl font-bold text-white mb-2">{accuracy.toFixed(1)}%</p>
              <p className="text-xl text-purple-50">Taux de réussite</p>
            </div>

            {/* Analyse détaillée */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">📊 Analyse de votre performance</h3>
              
              {accuracy >= 80 ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                  <p className="text-green-700 font-semibold text-lg">
                    🎉 Excellent ! Vous êtes prêt pour le concours !
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    Votre niveau de maîtrise est excellent. Continuez à réviser régulièrement pour maintenir ce niveau.
                  </p>
                </div>
              ) : accuracy >= 60 ? (
                <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-4">
                  <p className="text-yellow-700 font-semibold text-lg">
                    💪 Bon travail ! Continuez vos révisions
                  </p>
                  <p className="text-yellow-600 text-sm mt-2">
                    Vous avez un bon niveau mais quelques points à améliorer. Concentrez-vous sur vos points faibles.
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-red-700 font-semibold text-lg">
                    📚 Poursuivez vos efforts !
                  </p>
                  <p className="text-red-600 text-sm mt-2">
                    Revoyez les cours et entraînez-vous davantage. Utilisez le mode révision pour renforcer vos bases.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-600 mb-1">Temps moyen/question</p>
                  <p className="font-bold text-gray-800">
                    {Math.round(timeSpent / totalQuestions)} secondes
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-600 mb-1">Difficulté</p>
                  <p className="font-bold text-gray-800">{difficulty === 'volume1' ? 'Standard' : 'Avancée'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors shadow-lg"
              >
                🔄 Nouveau concours
              </button>
              <Link 
                to="/"
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                📊 Retour au Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec Timer */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-violet-900">🎯 Concours Blanc</h1>
            <p className="text-sm text-gray-600 mt-1">Simulation d'examen chronométré</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">Temps restant</p>
              </div>
              <p className={`text-3xl font-bold font-mono ${getTimerColor()}`}>
                {formatTime(time)}
              </p>
              {time < 300 && (
                <p className="text-xs text-red-600 mt-1 font-medium animate-pulse">
                  ⚠️ Moins de 5 min
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Question {questionNumber}/{totalQuestions}
            </span>
            <span className="text-sm font-semibold text-violet-600">
              Score: {score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-violet-500 transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start mb-6">
            <span className="bg-violet-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
              {currentQuestion.type}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              {currentQuestion.theme}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              return (
                <button
                  key={index}
                  onClick={() => answerQuestion(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    'bg-gray-50 border-gray-200 hover:border-violet-500 hover:bg-violet-50'
                  } ${showFeedback ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showFeedback && lastAnswer && (
            <div className="mt-6 p-4 rounded-lg bg-gray-50">
              <p className="font-semibold text-gray-800 mb-2">Explication :</p>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

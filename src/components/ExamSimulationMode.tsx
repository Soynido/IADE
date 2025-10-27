import { useState, useEffect } from 'react';
import { useQuizSession } from '../hooks/useQuizSession';
import { Link } from 'react-router-dom';

export default function ExamSimulationMode() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  
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
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  if (isCompleted) {
    setIsRunning(false);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Concours terminé !</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Score final</p>
                <p className="text-3xl font-bold text-purple-700">{score}/{totalQuestions}</p>
              </div>
              <div className="bg-purple-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Temps</p>
                <p className="text-3xl font-bold text-purple-700">{formatTime(time)}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl p-6 mb-6">
              <p className="text-4xl font-bold text-white mb-2">{accuracy.toFixed(0)}%</p>
              <p className="text-xl text-purple-50">de bonnes réponses</p>
            </div>

            {accuracy >= 80 ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-green-700 font-semibold">
                  🎉 Excellent ! Vous êtes prêt pour le concours !
                </p>
              </div>
            ) : accuracy >= 60 ? (
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-6">
                <p className="text-yellow-700 font-semibold">
                  💪 Continue vos révisions pour améliorer votre score !
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-semibold">
                  📚 N'hésitez pas à revoir les cours et vous entraîner davantage !
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.locationBasel.reload()}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
              >
                Nouveau concours
              </button>
              <Link 
                to="/dashboard"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Retour au Dashboard
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
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Temps écoulé</p>
              <p className="text-3xl font-bold text-violet-600 font-mono">
                {formatTime(time)}
              </p>
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

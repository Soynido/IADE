import { useQuizSession } from '../hooks/useQuizSession';
import { Link } from 'react-router-dom';

export default function TrainingMode() {
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">💪 Mode Entraînement</h1>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">Chargement des questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Session terminée !</h2>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 mb-6">
              <p className="text-4xl font-bold text-white mb-2">{score}/{totalQuestions}</p>
              <p className="text-xl text-green-50">Score : {accuracy.toFixed(0)}%</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Rejouer
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-emerald-900">💪 Entraînement</h1>
          <Link 
            to="/dashboard"
            className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Question {questionNumber}/{totalQuestions}
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              Score: {score}/{totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              устойчивое
              className={`h-3 rounded-full transition-all ${
                accuracy >= 70 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start mb-6">
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
              {currentQuestion.type}
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {currentQuestion.theme}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = showFeedback && lastAnswer?.selectedOption === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = showFeedback && (isSelected || isCorrect);

              return (
                <button
                  key={index}
                  onClick={() => answerQuestion(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-green-500'
                        : isSelected
                        ? 'bg-red-100 border-red-500'
                        : ''
                      : 'bg-gray-50 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50'
                  } ${showFeedback ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800">{option}</span>
                    {showResult && isCorrect && (
                      <span className="ml-auto text-2xl">✓</span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="ml-auto text-2xl">✗</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showFeedback && lastAnswer && (
            <div className={`mt-6 p-4 rounded-lg ${
              lastAnswer.correct ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className="font-semibold text-gray-800 mb-2">
                {lastAnswer.correct ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}
              </p>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

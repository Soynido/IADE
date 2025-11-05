/**
 * Training Mode MVP - Legacy IADE Style
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import compiledQuestions from '../data/compiledQuestions.json';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category?: string;
  difficulty?: string;
}

export default function TrainingMode() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Prendre 20 questions aléatoires
    const shuffled = [...(compiledQuestions as Question[])].sort(() => Math.random() - 0.5).slice(0, 20);
    setQuestions(shuffled);
  }, []);

  const currentQuestion = questions[currentIndex];
  const isCompleted = currentIndex >= questions.length;

  const handleAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setAnswers([...answers, isCorrect]);
    if (isCorrect) setScore(score + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Sauvegarder la session
      StorageService.addSession({
        date: new Date().toISOString(),
        score,
        total: questions.length,
        mode: 'training'
      });
      setCurrentIndex(questions.length); // Marquer comme terminé
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-xl">Chargement des questions...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const accuracy = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Session terminée !
            </h2>
            <div className="bg-gradient-to-r from-[#F2662F] to-[#FF8C66] rounded-xl p-8 mb-8">
              <p className="text-6xl font-bold text-white mb-2">{score}/{questions.length}</p>
              <p className="text-2xl text-orange-100" style={{ fontFamily: 'Inter, sans-serif' }}>
                Score : {accuracy.toFixed(0)}%
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
              >
                Rejouer
              </button>
              <Link
                to="/"
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all text-lg"
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
    <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
            💪 Entraînement
          </h1>
          <Link
            to="/"
            className="px-6 py-3 bg-white text-[#F2662F] rounded-xl font-semibold hover:bg-orange-50 transition-colors duration-300 flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              Question {currentIndex + 1}/{questions.length}
            </span>
            <span className="text-sm font-semibold text-[#F2662F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Score: {score}/{currentIndex}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-[#F2662F] to-[#FF8C66] h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-6 border border-gray-100">
          <div className="flex gap-2 mb-6">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-200">
              {currentQuestion?.category || 'Général'}
            </span>
            <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">
              {currentQuestion?.difficulty || 'Moyen'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            {currentQuestion?.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = showFeedback && (isSelected || isCorrect);

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && setSelectedAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-50 border-green-500 shadow-md'
                        : isSelected
                        ? 'bg-red-50 border-red-500 shadow-md'
                        : 'border-gray-200 bg-white'
                      : isSelected
                      ? 'bg-[#fff5f2] border-[#F2662F] shadow-md'
                      : 'bg-white border-gray-200 hover:border-[#F2662F] hover:bg-[#fff5f2]'
                  } ${showFeedback ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:scale-[1.01]'}`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-4 text-xl">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800 font-medium flex-1 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {option}
                    </span>
                    {showResult && isCorrect && <CheckCircle className="w-7 h-7 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-7 h-7 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-8 p-6 rounded-xl border-l-4 ${
              answers[currentIndex] 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <p className="font-bold text-gray-800 text-xl flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {answers[currentIndex] ? (
                  <><CheckCircle className="w-7 h-7" /> Bonne réponse !</>
                ) : (
                  <><XCircle className="w-7 h-7" /> Réponse incorrecte</>
                )}
              </p>
              <p className="text-gray-700 mt-3 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                La bonne réponse était : <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8">
            {!showFeedback ? (
              <button
                onClick={handleAnswer}
                disabled={selectedAnswer === null}
                className="w-full bg-gradient-to-r from-[#F2662F] to-[#e85a29] text-white px-8 py-5 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Valider
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 rounded-xl font-bold hover:shadow-xl transition-all text-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {currentIndex < questions.length - 1 ? 'Question suivante →' : 'Voir les résultats'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

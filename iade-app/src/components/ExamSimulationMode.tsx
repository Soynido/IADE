/**
 * Exam Simulation Mode MVP - Legacy IADE Style
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
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

const EXAM_DURATION = 90 * 60; // 90 minutes

export default function ExamSimulationMode() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [time, setTime] = useState(EXAM_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isRunning || !examStarted || isCompleted) return;

    const timer = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, examStarted, isCompleted]);

  const startExam = () => {
    // Prendre 60 questions aléatoires
    const shuffled = [...(compiledQuestions as Question[])].sort(() => Math.random() - 0.5).slice(0, 60);
    setQuestions(shuffled);
    setUserAnswers(new Array(60).fill(null));
    setExamStarted(true);
    setIsRunning(true);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishExam = () => {
    setIsRunning(false);
    setIsCompleted(true);

    // Calculer score
    let correct = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] !== null && userAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });

    // Sauvegarder la session
    StorageService.addSession({
      date: new Date().toISOString(),
      score: correct,
      total: questions.length,
      mode: 'exam'
    });
  };

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

  // Écran de configuration
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              🎯 Mode Concours Blanc
            </h1>
            <Link
              to="/"
              className="px-6 py-3 bg-white text-[#F2662F] rounded-xl font-semibold hover:bg-orange-50 transition-colors duration-300 flex items-center gap-2 shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Configuration de l'examen
            </h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-3 text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Conditions d'examen
                  </h3>
                  <ul className="text-lg text-blue-800 space-y-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li>⏱️ Durée: <strong>90 minutes</strong> (chronomètre dégressif)</li>
                    <li>📝 <strong>60 questions</strong> (QCM variés)</li>
                    <li>✅ Correction détaillée à la fin</li>
                    <li>🚫 Pas de retour en arrière possible après validation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startExam}
                className="flex-1 bg-gradient-to-r from-[#F2662F] to-[#e85a29] text-white px-8 py-5 rounded-xl font-bold text-xl hover:shadow-xl transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                🚀 Démarrer le concours
              </button>
              <Link
                to="/"
                className="px-8 py-5 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all text-xl"
              >
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran de résultats
  if (isCompleted) {
    const timeSpent = EXAM_DURATION - time;
    const correctAnswers = questions.filter((q, i) => userAnswers[i] === q.correctAnswer).length;
    const accuracy = (correctAnswers / questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{time === 0 ? '⏰' : '🎓'}</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {time === 0 ? 'Temps écoulé !' : 'Concours terminé !'}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-orange-100 rounded-xl p-6 text-center border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Score final</p>
                <p className="text-4xl font-bold text-[#F2662F]" style={{ fontFamily: 'Inter, sans-serif' }}>{correctAnswers}/{questions.length}</p>
              </div>
              <div className="bg-blue-100 rounded-xl p-6 text-center border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Temps utilisé</p>
                <p className="text-4xl font-bold text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>{formatTime(timeSpent)}</p>
              </div>
              <div className="bg-green-100 rounded-xl p-6 text-center border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Précision</p>
                <p className="text-4xl font-bold text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>{accuracy.toFixed(0)}%</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#F2662F] to-[#FF8C66] rounded-xl p-8 mb-8 text-center">
              <p className="text-6xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{accuracy.toFixed(1)}%</p>
              <p className="text-2xl text-orange-100" style={{ fontFamily: 'Inter, sans-serif' }}>Taux de réussite</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                to="/entrainement"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
              >
                Mode Entraînement
              </Link>
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

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
            🎯 Concours Blanc
          </h1>
          <div className={`text-3xl font-bold ${getTimerColor()}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <Clock className="inline-block w-8 h-8 mr-2" />
            {formatTime(time)}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              Question {currentIndex + 1}/{questions.length}
            </span>
            <span className="text-sm font-semibold text-[#F2662F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Répondues: {userAnswers.filter(a => a !== null).length}/{questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-700 h-3 rounded-full transition-all duration-300"
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
              const isSelected = userAnswers[currentIndex] === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                  } cursor-pointer hover:scale-[1.01]`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-4 text-xl">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800 font-medium flex-1 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {option}
                    </span>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Précédent
          </button>
          <div className="flex-1"></div>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:shadow-lg transition-all text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={finishExam}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all text-xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Terminer le concours
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

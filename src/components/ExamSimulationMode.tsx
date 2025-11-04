/**
 * Mode Concours Blanc - Legacy IADE visual style
 * 60 QCM chronométrés (2h)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Trophy, AlertTriangle, TrendingDown, CheckCircle, ArrowLeft } from 'lucide-react';
import { StorageService } from '../services/storageService';
import type { Question } from '../types/pathology';
import compiledQuestions from '../data/compiledQuestions.json';

const EXAM_DURATION = 120 * 60; // 2 heures en secondes
const TOTAL_QUESTIONS = 60;

export default function ExamSimulationMode() {
  const navigate = useNavigate();
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [time, setTime] = useState(EXAM_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Initialiser les questions
  useEffect(() => {
    if (!examStarted) return;

    const allQuestions = compiledQuestions.questions || compiledQuestions;
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_QUESTIONS);
    
    setQuestions(selected);
    setUserAnswers(new Array(TOTAL_QUESTIONS).fill(null));
    setIsRunning(true);
  }, [examStarted]);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    
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
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentageLeft = (time / EXAM_DURATION) * 100;
    if (percentageLeft > 50) return 'text-green-600';
    if (percentageLeft > 20) return 'text-yellow-600';
    return 'text-red-600';
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
    
    // Calculer score
    let correct = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] !== null && q.options[userAnswers[i]!] === q.correct) {
        correct++;
      }
    });

    const sessionScore = Math.round((correct / questions.length) * 100);
    
    // Sauvegarder la session
    StorageService.addSession({
      date: new Date().toISOString(),
      score: sessionScore,
      questionsCount: questions.length,
      mode: 'exam',
      theme: 'Concours blanc'
    });

    setShowResults(true);
  };

  const currentQuestion = questions[currentIndex];

  // Écran de démarrage
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-gray-600 hover:text-[#F2662F] mb-6 inline-flex items-center gap-2 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-8 mt-4 flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
            <Trophy className="w-10 h-10 text-purple-600" />
            Mode Concours Blanc
          </h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Simulation du concours IADE
            </h2>
            
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900 mb-3 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Conditions d'examen
                  </h3>
                  <ul className="text-sm text-purple-800 space-y-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    <li className="flex items-start gap-2">
                      <span>⏱️</span>
                      <span>Durée: <strong>2 heures</strong> (chronomètre dégressif)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>📝</span>
                      <span>{TOTAL_QUESTIONS} questions à traiter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span>Correction détaillée à la fin uniquement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>⏪</span>
                      <span>Navigation possible entre les questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>⚠️</span>
                      <span>Temps limité - gérez votre rythme</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setExamStarted(true)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-5 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
              >
                Démarrer le concours
              </button>
              <Link
                to="/"
                className="px-8 py-5 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
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
  if (showResults) {
    const timeSpent = EXAM_DURATION - time;
    const correctAnswers = questions.filter((q, i) => 
      userAnswers[i] !== null && q.options[userAnswers[i]!] === q.correct
    ).length;
    const accuracy = (correctAnswers / questions.length) * 100;
    const avgTimePerQuestion = Math.round(timeSpent / questions.length);

    // Erreurs par domaine
    const errorsByDomain: Record<string, number> = {};
    questions.forEach((q, i) => {
      if (userAnswers[i] === null || q.options[userAnswers[i]!] !== q.correct) {
        const domain = q.domain || q.theme || 'Autre';
        errorsByDomain[domain] = (errorsByDomain[domain] || 0) + 1;
      }
    });

    const sortedErrors = Object.entries(errorsByDomain)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return (
      <div className="min-h-screen bg-[#F4F7F9] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="text-center mb-10">
              <div className="text-7xl mb-4">
                {accuracy >= 70 ? '🏆' : accuracy >= 50 ? '📚' : '💪'}
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                Concours terminé !
              </h2>
              {time === 0 && (
                <p className="text-red-600 font-semibold text-lg">Temps écoulé</p>
              )}
            </div>

            {/* Score principal */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-10 text-center mb-10 shadow-xl">
              <p className="text-white/90 text-lg mb-2 font-medium">Score total</p>
              <p className="text-8xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {accuracy.toFixed(1)}%
              </p>
              <p className="text-2xl text-white/90 font-semibold">{correctAnswers}/{questions.length} bonnes réponses</p>
            </div>

            {/* Stats détaillées */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#F4F7F9] rounded-xl p-6 text-center border border-gray-200">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatTime(timeSpent)}
                </p>
                <p className="text-sm text-gray-600 font-medium">Temps utilisé</p>
              </div>
              <div className="bg-[#F4F7F9] rounded-xl p-6 text-center border border-gray-200">
                <div className="text-4xl mb-2">⚡</div>
                <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {avgTimePerQuestion}s
                </p>
                <p className="text-sm text-gray-600 font-medium">Temps moyen/question</p>
              </div>
              <div className="bg-[#F4F7F9] rounded-xl p-6 text-center border border-gray-200">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {questions.length - (userAnswers.filter(a => a === null).length)}
                </p>
                <p className="text-sm text-gray-600 font-medium">Questions répondues</p>
              </div>
            </div>

            {/* Erreurs par domaine */}
            {sortedErrors.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-6 mb-8 border-2 border-red-200">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Domaines à revoir
                </h3>
                <div className="space-y-3">
                  {sortedErrors.map(([domain, count]) => (
                    <div key={domain} className="flex items-center justify-between bg-white rounded-lg p-4 border border-red-100">
                      <span className="font-semibold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {domain}
                      </span>
                      <span className="text-red-600 font-bold text-lg">
                        {count} erreur{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/entrainement')}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Revoir mes erreurs
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Refaire un concours
              </button>
              <Link
                to="/"
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors text-lg"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran de question en cours
  return (
    <div className="min-h-screen bg-[#F4F7F9] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Timer */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className={`w-7 h-7 ${getTimerColor()}`} />
              <span className={`text-3xl font-bold ${getTimerColor()}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {formatTime(time)}
              </span>
            </div>
            <span className="text-base text-gray-600 font-semibold">
              Question {currentIndex + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Navigation questions */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Navigation rapide
          </p>
          <div className="flex gap-2 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-11 h-11 rounded-lg font-bold transition-all ${
                  index === currentIndex
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-md scale-110'
                    : userAnswers[index] !== null
                    ? 'bg-green-200 text-green-800 border border-green-300'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex gap-2 mb-5">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-200">
              {currentQuestion?.domain || currentQuestion?.theme}
            </span>
            <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">
              {currentQuestion?.difficulty}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            {currentQuestion?.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = userAnswers[currentIndex] === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                  } cursor-pointer hover:scale-[1.01]`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-4 text-lg">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800 font-medium flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {option}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
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
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            ← Précédent
          </button>
          <div className="flex-1"></div>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={finishExam}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all text-lg"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
            >
              Terminer le concours
            </button>
          )}
        </div>

        {/* Indicateur réponses */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">
              Questions répondues: <strong className="text-gray-900">{userAnswers.filter(a => a !== null).length}/{questions.length}</strong>
            </span>
            <span className="text-gray-600 font-medium">
              Non répondues: <strong className="text-red-600">{userAnswers.filter(a => a === null).length}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

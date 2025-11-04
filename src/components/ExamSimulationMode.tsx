/**
 * Mode Concours Blanc - 60 QCM chronométrés (2h)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Trophy, AlertTriangle, TrendingDown } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2">
            ← Retour au dashboard
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-purple-600" />
            Mode Concours Blanc
          </h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Simulation du concours IADE</h2>
            
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900 mb-2">Conditions d'examen</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>⏱️  Durée: <strong>2 heures</strong> (chronomètre dégressif)</li>
                    <li>📝 {TOTAL_QUESTIONS} questions à traiter</li>
                    <li>✅ Correction détaillée à la fin uniquement</li>
                    <li>⏪ Navigation possible entre les questions</li>
                    <li>⚠️  Temps limité - gérez votre rythme</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setExamStarted(true)}
                className="flex-1 bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                Démarrer le concours
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {accuracy >= 70 ? '🏆' : accuracy >= 50 ? '📚' : '💪'}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Concours terminé !
              </h2>
              {time === 0 && (
                <p className="text-red-600 font-medium">Temps écoulé</p>
              )}
            </div>

            {/* Score principal */}
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl p-8 text-center mb-8">
              <p className="text-white/90 text-lg mb-2">Score total</p>
              <p className="text-7xl font-bold text-white mb-3">{accuracy.toFixed(1)}%</p>
              <p className="text-2xl text-white/80">{correctAnswers}/{questions.length} bonnes réponses</p>
            </div>

            {/* Stats détaillées */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{formatTime(timeSpent)}</p>
                <p className="text-sm text-gray-600">Temps utilisé</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-2xl font-bold text-gray-800">{avgTimePerQuestion}s</p>
                <p className="text-sm text-gray-600">Temps moyen/question</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-2xl font-bold text-gray-800">{questions.length - (userAnswers.filter(a => a === null).length)}</p>
                <p className="text-sm text-gray-600">Questions répondues</p>
              </div>
            </div>

            {/* Erreurs par domaine */}
            {sortedErrors.length > 0 && (
              <div className="bg-red-50 rounded-xl p-6 mb-6 border-2 border-red-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Domaines à revoir
                </h3>
                <div className="space-y-3">
                  {sortedErrors.map(([domain, count]) => (
                    <div key={domain} className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{domain}</span>
                      <span className="text-red-600 font-bold">{count} erreur{count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // TODO: Implémenter "Revoir mes erreurs" - session ciblée sur les domaines faibles
                  navigate('/entrainement');
                }}
                className="flex-1 bg-red-100 text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                Revoir mes erreurs
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Refaire un concours
              </button>
              <Link
                to="/"
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Timer */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className={`w-6 h-6 ${getTimerColor()}`} />
              <span className={`text-2xl font-bold ${getTimerColor()}`}>
                {formatTime(time)}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Question {currentIndex + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Navigation questions */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  index === currentIndex
                    ? 'bg-purple-600 text-white'
                    : userAnswers[index] !== null
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {currentQuestion?.domain || currentQuestion?.theme}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {currentQuestion?.difficulty}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion?.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = userAnswers[currentIndex] === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                  } cursor-pointer hover:scale-[1.01]`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800">{option}</span>
                    {isSelected && <span className="ml-auto text-purple-600 font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <div className="flex-1"></div>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={finishExam}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Terminer le concours
            </button>
          )}
        </div>

        {/* Indicateur réponses */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Questions répondues: <strong>{userAnswers.filter(a => a !== null).length}/{questions.length}</strong>
            </span>
            <span className="text-gray-600">
              Non répondues: <strong>{userAnswers.filter(a => a === null).length}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

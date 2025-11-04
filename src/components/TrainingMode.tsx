/**
 * Mode Entraînement - Sessions adaptatives de 10 QCM
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, TrendingUp, Target } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { adaptiveEngine } from '../services/adaptiveEngine';
import { QuestionFeedbackComponent } from './QuestionFeedback';
import type { Question } from '../types/pathology';
import compiledQuestions from '../data/compiledQuestions.json';

const QUESTIONS_PER_SESSION = 10;

export default function TrainingMode() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Initialiser la session avec le moteur adaptatif
  useEffect(() => {
    const profile = StorageService.getUserProfile();
    const allQuestions = compiledQuestions.questions || compiledQuestions;
    
    // Utiliser le moteur adaptatif pour sélectionner 10 questions
    const selectedQuestions: Question[] = [];
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      const question = adaptiveEngine.selectNextQuestion(allQuestions, profile, selectedQuestions.map(q => q.id));
      if (question) {
        selectedQuestions.push(question);
      }
    }
    
    setQuestions(selectedQuestions);
  }, []);

  const currentQuestion = questions[currentIndex];
  const isCompleted = currentIndex >= questions.length;

  const handleAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = currentQuestion.options[selectedAnswer] === currentQuestion.correct;
    setAnswers([...answers, isCorrect]);
    if (isCorrect) setScore(score + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
    } else {
      // Sauvegarder la session
      const profile = StorageService.getUserProfile();
      const sessionScore = Math.round((score / questions.length) * 100);
      
      StorageService.addSession({
        date: new Date().toISOString(),
        score: sessionScore,
        questionsCount: questions.length,
        mode: 'training',
        theme: 'Entraînement adaptatif'
      });
      
      setCurrentIndex(currentIndex + 1); // Déclenche isCompleted
    }
  };

  // Écran de fin
  if (isCompleted) {
    const accuracy = (score / questions.length) * 100;
    const profile = StorageService.getUserProfile();

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Session terminée !</h2>
            </div>

            {/* Score principal */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-center mb-6">
              <p className="text-white/90 text-lg mb-2">Votre score</p>
              <p className="text-6xl font-bold text-white mb-2">{accuracy.toFixed(0)}%</p>
              <p className="text-xl text-white/80">{score}/{questions.length} bonnes réponses</p>
            </div>

            {/* Scoreboard simplifié */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{profile.averageScore.toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Score moyen</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{profile.totalSessions}</p>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <p className="text-2xl font-bold text-gray-800">{profile.streakDays}</p>
                <p className="text-sm text-gray-600">Jours de série</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Nouvelle session
              </button>
              <Link 
                to="/"
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran de question
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-green-600" />
            Entraînement
          </h1>
          <Link 
            to="/"
            className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Question {currentIndex + 1}/{questions.length}
            </span>
            <span className="text-sm font-semibold text-green-600">
              Score: {score}/{currentIndex + 1}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
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
              const isSelected = selectedAnswer === index;
              const isCorrect = option === currentQuestion.correct;
              const showResult = showFeedback && (isSelected || isCorrect);

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && setSelectedAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-green-500'
                        : isSelected
                        ? 'bg-red-100 border-red-500'
                        : 'border-gray-200'
                      : isSelected
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-green-500 hover:bg-green-50'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800">{option}</span>
                    {showResult && isCorrect && <span className="ml-auto text-2xl">✓</span>}
                    {showResult && isSelected && !isCorrect && <span className="ml-auto text-2xl">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showFeedback && currentQuestion?.explanation && (
            <div className={`mt-6 p-4 rounded-lg ${
              answers[currentIndex] ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
            }`}>
              <p className="font-semibold text-gray-800 mb-2">
                {answers[currentIndex] ? '✓ Bonne réponse !' : '✗ Réponse incorrecte'}
              </p>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Feedback component */}
          {showFeedback && currentQuestion && (
            <div className="mt-6">
              <QuestionFeedbackComponent
                questionId={currentQuestion.id}
                sessionId={sessionId}
                wasCorrect={answers[currentIndex]}
                responseTime={Date.now() - questionStartTime}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6">
            {!showFeedback ? (
              <button
                onClick={handleAnswer}
                disabled={selectedAnswer === null}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Valider
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
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

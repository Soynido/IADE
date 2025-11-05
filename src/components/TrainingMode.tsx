/**
 * Mode Entraînement - Legacy IADE visual style
 * 10 QCM adaptatifs avec feedback immédiat
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, TrendingUp, Target, ArrowLeft, Flame, Brain, Award, CheckCircle, XCircle } from 'lucide-react';
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
    const userProfile = StorageService.getUserProfile();
    const allQuestions = compiledQuestions.questions || compiledQuestions;
    
    // Créer un profil adaptatif depuis le profil utilisateur
    const adaptiveProfile = adaptiveEngine.computeProfile(userProfile);
    
    // Créer un Map vide pour les feedbacks (système de feedback pas encore implémenté)
    const feedbacksMap = new Map();
    
    // Utiliser le moteur adaptatif pour sélectionner 10 questions
    const selectedQuestions: Question[] = [];
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      const questionsSeen = selectedQuestions.map(q => ({ questionId: q.id, timestamp: Date.now() }));
      const question = adaptiveEngine.selectNextQuestion(allQuestions, adaptiveProfile, feedbacksMap, questionsSeen);
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
      <div className="min-h-screen bg-[#F4F7F9] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">
                {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                Session terminée !
              </h2>
            </div>

            {/* Score principal */}
            <div className="bg-gradient-to-br from-[#F2662F] to-[#e85a29] rounded-2xl p-10 text-center mb-8 shadow-lg">
              <p className="text-white/90 text-lg mb-2 font-medium">Votre score</p>
              <p className="text-7xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {accuracy.toFixed(0)}%
              </p>
              <p className="text-2xl text-white/90 font-semibold">{score}/{questions.length} bonnes réponses</p>
            </div>

            {/* Scoreboard simplifié */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#F4F7F9] rounded-xl p-6 text-center border border-gray-200">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {profile.averageScore.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600 font-medium">Score moyen</p>
              </div>
              <div className="bg-[#F4F7F9] rounded-xl p-6 text-center border border-gray-200">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {profile.totalSessions}
                </p>
                <p className="text-sm text-gray-600 font-medium">Sessions</p>
              </div>
              <div className="bg-[#F4F7F9] rounded-xl p-6 text-center border border-gray-200">
                <Flame className="w-8 h-8 text-[#F2662F] mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {profile.streakDays}
                </p>
                <p className="text-sm text-gray-600 font-medium">Jours de série</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-[#F2662F] to-[#e85a29] text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Nouvelle session
              </button>
              <Link 
                to="/"
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-300 transition-colors text-center text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran de question
  return (
    <div className="min-h-screen bg-[#F4F7F9] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
            <Dumbbell className="w-8 h-8 text-[#F2662F]" />
            Entraînement
          </h1>
          <Link 
            to="/"
            className="text-gray-600 hover:text-[#F2662F] font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-base font-bold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              Question {currentIndex + 1}/{questions.length}
            </span>
            <span className="text-base font-bold text-[#F2662F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Score: {score}/{currentIndex + 1}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-[#F2662F] to-[#e85a29] transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
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
              const isSelected = selectedAnswer === index;
              const isCorrect = option === currentQuestion.correct;
              const showResult = showFeedback && (isSelected || isCorrect);

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && setSelectedAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-50 border-green-500 shadow-md'
                        : isSelected
                        ? 'bg-red-50 border-red-500 shadow-md'
                        : 'border-gray-200 bg-white'
                      : isSelected
                      ? 'bg-[#fff5f2] border-[#F2662F] shadow-md'
                      : 'bg-white border-gray-200 hover:border-[#F2662F] hover:bg-[#fff5f2]'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-gray-600 mr-4 text-lg">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800 font-medium flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {option}
                    </span>
                    {showResult && isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showFeedback && currentQuestion?.explanation && (
            <div className={`mt-6 p-6 rounded-xl border-l-4 ${
              answers[currentIndex] 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <p className="font-bold text-gray-800 mb-3 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                {answers[currentIndex] ? '✓ Bonne réponse !' : '✗ Réponse incorrecte'}
              </p>
              <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {currentQuestion.explanation}
              </p>
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
                className="w-full bg-gradient-to-r from-[#F2662F] to-[#e85a29] text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Valider
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
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

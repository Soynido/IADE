import { useState, useEffect } from 'react';
import questionsData from '../data/questions-unified.json';

interface Answer {
  questionId: string;
  selectedOption: number | string;
  correct: boolean;
  time: number;
}

interface QuizSessionState {
  questionIndex: number;
  score: number;
  totalAnswers: number;
  answers: Answer[];
  startTime: number;
  isCompleted: boolean;
}

export function useQuizSession() {
  const [state, setState] = useState<QuizSessionState>({
    questionIndex: 0,
    score: 0,
    totalAnswers: 0,
    answers: [],
    startTime: Date.now(),
    isCompleted: false
  });

  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<Answer | null>(null);

  const currentQuestion = questionsData.questions[state.questionIndex];
  const progress = ((state.questionIndex + 1) / questionsData.questions.length) * 100;

  // Réinitialiser la session
  const reset = () => {
    setState({
      questionIndex: 0,
      score: 0,
      totalAnswers: 0,
      answers: [],
      startTime: Date.now(),
      isCompleted: false
    });
    setShowFeedback(false);
    setLastAnswer(null);
  };

  // Répondre à une question
  const answerQuestion = (selectedOption: number | string) => {
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOption,
      correct: isCorrect,
      time: Date.now() - state.startTime
    };

    setLastAnswer(answer);
    setShowFeedback(true);

    // Mise à jour de l'état
    setState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalAnswers: prev.totalAnswers + 1,
      answers: [...prev.answers, answer]
    }));

    // Auto-avancer après 2 secondes
    setTimeout(() => {
      setShowFeedback(false);
      
      // Si dernière question
      if (state.questionIndex >= questionsData.questions.length - 1) {
        setState(prev => ({ ...prev, isCompleted: true }));
      } else {
        setState(prev => ({ 
          ...prev, 
          questionIndex: prev.questionIndex + 1 
        }));
      }
    }, 2000);
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    if (state.questionIndex < questionsData.questions.length - 1) {
      setState(prev => ({ ...prev, questionIndex: prev.questionIndex + 1 }));
      setShowFeedback(false);
    }
  };

  // Passer à la question précédente
  const previousQuestion = () => {
    if (state.questionIndex > 0) {
      setState(prev => ({ ...prev, questionIndex: prev.questionIndex - 1 }));
      setShowFeedback(false);
    }
  };

  return {
    // État actuel
    currentQuestion,
    questionNumber: state.questionIndex + 1,
    totalQuestions: questionsData.questions.length,
    progress,
    score: state.score,
    totalAnswers: state.totalAnswers,
    accuracy: state.totalAnswers > 0 ? (state.score / state.totalAnswers) * 100 : 0,
    
    // Actions
    answerQuestion,
    nextQuestion,
    previousQuestion,
    reset,
    
    // Feedback
    showFeedback,
    lastAnswer,
    
    // État de session
    isCompleted: state.isCompleted,
    answers: state.answers,
    sessionTime: Date.now() - state.startTime
  };
}

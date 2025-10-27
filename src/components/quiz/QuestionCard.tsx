import React, { useState, useEffect } from 'react';
import { Question } from '../../types/pathology';
import { Card, Badge, Button } from '../ui';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, hintsUsed: number, recallTime: number) => void;
  disabled?: boolean;
  enableActiveRecall?: boolean; // Mode rappel actif activé
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled = false,
  enableActiveRecall = true,
}) => {
  // États pour le rappel actif
  const [recallMode, setRecallMode] = useState<'initial' | 'thinking' | 'hint1' | 'hint2' | 'reveal'>(
    enableActiveRecall ? 'initial' : 'reveal'
  );
  const [recallStartTime, setRecallStartTime] = useState<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [thinkingTimer, setThinkingTimer] = useState<number>(0);

  // Timer pour le mode "thinking"
  useEffect(() => {
    if (recallMode === 'thinking') {
      const interval = setInterval(() => {
        setThinkingTimer(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [recallMode]);

  // Réinitialiser quand la question change
  useEffect(() => {
    setRecallMode(enableActiveRecall ? 'initial' : 'reveal');
    setRecallStartTime(Date.now());
    setHintsUsed(0);
    setThinkingTimer(0);
  }, [question.id, enableActiveRecall]);

  const handleStartThinking = () => {
    setRecallMode('thinking');
    setRecallStartTime(Date.now());
  };

  const handleUseHint = (level: 'hint1' | 'hint2') => {
    setRecallMode(level);
    setHintsUsed(prev => prev + 1);
  };

  const handleRevealAnswers = () => {
    setRecallMode('reveal');
  };

  const handleAnswer = (answer: string) => {
    const recallTime = Math.floor((Date.now() - recallStartTime) / 1000);
    onAnswer(answer, hintsUsed, recallTime);
  };

  // Générer des indices contextuels progressifs
  const getHint1 = () => {
    // Indice niveau 1 : 30% de l'info (thème + difficulté)
    return `💡 Indice 1/2 : Cette question porte sur "${question.theme}" et est de niveau ${question.difficulty}.`;
  };

  const getHint2 = () => {
    // Indice niveau 2 : 60% de l'info (première lettre + nombre de mots)
    const correctAnswer = question.correct;
    const firstLetter = correctAnswer.charAt(0);
    const wordCount = correctAnswer.split(' ').length;
    return `💡 Indice 2/2 : La réponse commence par "${firstLetter}" et contient ${wordCount} mot(s).`;
  };

  return (
    <Card variant="elevated" padding="lg" className="max-w-4xl mx-auto bg-white dark:bg-gray-800">
      {/* Tags */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Badge variant="info" icon="📝">
          Question {questionNumber}/{totalQuestions}
        </Badge>
        <Badge variant="purple">
          📍 {question.theme}
        </Badge>
        <Badge variant="default">
          🏥 {question.pathology}
        </Badge>
        <Badge variant="warning">
          ⭐ {question.points} pts
        </Badge>
        <Badge 
          variant={
            question.difficulty === 'Difficile' ? 'danger' : 
            question.difficulty === 'Moyen' ? 'warning' : 
            'success'
          }
        >
          {question.difficulty}
        </Badge>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold mb-8 text-iade-gray-900 dark:text-gray-100 leading-relaxed">
        {question.question}
      </h2>

      {/* Mode Rappel Actif - Phase initiale */}
      {recallMode === 'initial' && (
        <div className="bg-gradient-to-r from-iade-purple-50 to-iade-blue-50 dark:from-iade-purple-900/20 dark:to-iade-blue-900/20 p-8 rounded-xl border-2 border-iade-purple-200 dark:border-iade-purple-700">
          <div className="text-center mb-6">
            <span className="text-4xl mb-4 block">🧠</span>
            <h3 className="text-xl font-bold text-iade-gray-900 dark:text-gray-100 mb-2">
              Rappel Actif
            </h3>
            <p className="text-iade-gray-600 dark:text-gray-400">
              Essayez de répondre mentalement avant de voir les options.
              <br />
              Cette technique améliore votre mémorisation !
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleStartThinking} size="lg" variant="primary">
              💭 J'essaie de me souvenir
            </Button>
            <Button onClick={handleRevealAnswers} size="lg" variant="secondary">
              👀 Voir les réponses
            </Button>
          </div>
        </div>
      )}

      {/* Mode Rappel Actif - Phase réflexion */}
      {recallMode === 'thinking' && (
        <div className="bg-gradient-to-r from-iade-blue-50 to-iade-purple-50 dark:from-iade-blue-900/20 dark:to-iade-purple-900/20 p-8 rounded-xl border-2 border-iade-blue-200 dark:border-iade-blue-700">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4 animate-pulse">⏱️</div>
            <p className="text-2xl font-bold text-iade-gray-900 dark:text-gray-100 mb-2">
              {thinkingTimer}s
            </p>
            <p className="text-iade-gray-600 dark:text-gray-400">
              Prenez le temps de réfléchir...
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => handleUseHint('hint1')} size="md" variant="secondary">
              💡 Indice 1
            </Button>
            <Button onClick={handleRevealAnswers} size="md" variant="primary">
              ✅ Voir les réponses
            </Button>
          </div>
        </div>
      )}

      {/* Mode Rappel Actif - Indice 1 */}
      {recallMode === 'hint1' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border-2 border-amber-300 dark:border-amber-700 mb-6">
          <p className="text-lg text-iade-gray-900 dark:text-gray-100 mb-4">
            {getHint1()}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => handleUseHint('hint2')} size="sm" variant="secondary">
              💡 Indice 2
            </Button>
            <Button onClick={handleRevealAnswers} size="sm" variant="primary">
              ✅ Voir les réponses
            </Button>
          </div>
        </div>
      )}

      {/* Mode Rappel Actif - Indice 2 */}
      {recallMode === 'hint2' && (
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700">
            <p className="text-sm text-iade-gray-900 dark:text-gray-100">
              {getHint1()}
            </p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border-2 border-red-300 dark:border-red-700">
            <p className="text-sm text-iade-gray-900 dark:text-gray-100 mb-3">
              {getHint2()}
            </p>
            <Button onClick={handleRevealAnswers} size="sm" variant="primary" className="w-full">
              ✅ Voir les réponses
            </Button>
          </div>
        </div>
      )}

      {/* Options de réponse (visible uniquement en mode reveal) */}
      {recallMode === 'reveal' && (
        <>
          {hintsUsed > 0 && (
            <div className="bg-iade-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 text-center">
              <span className="text-sm text-iade-gray-600 dark:text-gray-400">
                {hintsUsed === 0 ? '🌟 Sans aide' : `💡 ${hintsUsed} indice(s) utilisé(s)`}
              </span>
            </div>
          )}
          
          <div className="flex flex-col items-stretch gap-4">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={disabled}
                className={`w-full px-6 py-4 text-left border-2 rounded-xl transition-all transform hover:scale-[1.02] flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                  disabled
                    ? 'border-iade-gray-200 dark:border-gray-700 bg-iade-gray-50 dark:bg-gray-700'
                    : 'border-iade-gray-200 dark:border-gray-700 hover:border-iade-blue-500 dark:hover:border-iade-blue-500 hover:bg-iade-blue-50 dark:hover:bg-iade-blue-900/30 hover:shadow-iade'
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-iade-blue-500 to-iade-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg text-iade-gray-900 dark:text-gray-100 flex-1">{option}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};


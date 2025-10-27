import React, { useState } from 'react';
import { Star } from 'lucide-react';
import type { Question } from '../../types/pathology';

export interface QuestionCardV3Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

/**
 * QuestionCard V3 - Style Kahoot/Ornikar
 * 
 * Changements majeurs:
 * - Fond coloré selon difficulté (success-100, accent-100, danger-100)
 * - Question en text-3xl bold (très gros)
 * - Options height min 64px (touch-friendly)
 * - Lettres Ⓐ Ⓑ Ⓒ Ⓓ en cercles colorés (48px)
 * - Hover prononcé : scale(1.05) + shadow-2xl + glow
 * - Active : scale(0.95) + ripple
 * - Border 3px coloré
 * - Animations staggered (apparition décalée)
 */
export const QuestionCardV3: React.FC<QuestionCardV3Props> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Couleur de fond selon difficulté
  const difficultyBg = {
    Facile: 'bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20',
    Moyen: 'bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
    Difficile: 'bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20',
  };

  const bgClass = difficultyBg[question.difficulty as keyof typeof difficultyBg] || difficultyBg.Moyen;

  const handleOptionClick = (option: string) => {
    if (disabled) return;
    
    setSelectedOption(option);
    // Animation scale-bounce puis callback
    setTimeout(() => {
      onAnswer(option);
    }, 200);
  };

  // Lettres pour les options
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Couleurs des cercles de lettres
  const letterColors = [
    'bg-primary-500',
    'bg-accent-500',
    'bg-success-500',
    'bg-danger-500',
    'bg-primary-600',
    'bg-success-600',
  ];

  return (
    <div className={`rounded-3xl p-8 shadow-2xl ${bgClass}`}>
      {/* Header avec tags */}
      <div className="flex flex-wrap gap-3 mb-8">
        <span className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-full text-sm font-bold text-neutral-700 dark:text-neutral-300 shadow-md">
          Question {questionNumber}/{totalQuestions}
        </span>
        <span className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-bold shadow-md">
          📍 {question.theme}
        </span>
        <span className="px-4 py-2 bg-success-500 text-white rounded-full text-sm font-bold shadow-md">
          🏥 {question.pathology}
        </span>
        <span className="px-4 py-2 bg-accent-500 text-neutral-900 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
          <Star className="w-4 h-4" fill="currentColor" />
          {question.points} pts
        </span>
      </div>

      {/* Question - TRÈS GROS */}
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-10 leading-tight">
        {question.question}
      </h2>

      {/* Options - Style Kahoot avec lettres cercles */}
      <div className="space-y-4">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={disabled}
            className={`
              stagger-item
              w-full min-h-[64px] px-6 py-4
              flex items-center gap-4
              bg-white dark:bg-neutral-800
              border-3 rounded-2xl
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                disabled
                  ? 'border-neutral-200 dark:border-neutral-700'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-500'
              }
              ${!disabled ? 'hover:scale-105 hover:shadow-2xl hover-glow cursor-pointer' : ''}
              ${selectedOption === option ? 'scale-bounce border-primary-500 shadow-2xl' : ''}
              ${!disabled ? 'active:scale-95 button-ripple' : ''}
            `}
          >
            {/* Lettre dans cercle coloré */}
            <div
              className={`
                w-12 h-12 flex-shrink-0
                ${letterColors[index % letterColors.length]}
                rounded-full
                flex items-center justify-center
                text-white font-black text-xl
                shadow-lg
                ${!disabled ? 'group-hover:rotate-12 group-hover:scale-110' : ''}
                transition-transform duration-200
              `}
            >
              {letters[index]}
            </div>

            {/* Texte de l'option */}
            <span className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white text-left flex-1">
              {option}
            </span>

            {/* Indicateur sélection */}
            {selectedOption === option && (
              <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center animate-scale-bounce">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Hint si disponible (optionnel) */}
      {!disabled && (
        <div className="mt-6 flex justify-center gap-4">
          <button className="px-4 py-2 bg-white/50 dark:bg-neutral-700/50 backdrop-blur-sm rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 transition-all">
            💡 Indice
          </button>
          <button className="px-4 py-2 bg-white/50 dark:bg-neutral-700/50 backdrop-blur-sm rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 transition-all">
            ⏭️ Passer
          </button>
        </div>
      )}
    </div>
  );
};


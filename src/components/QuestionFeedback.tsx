/**
 * Composant de feedback utilisateur sur la qualité des questions
 * Affiche 3 boutons de rating: Bad (1), Good (2), Very Good (3)
 */

import { useState } from 'react';
import { feedbackService, getOrCreateAnonUserId } from '../services/feedbackService';
import type { QuestionFeedback } from '../types/feedback';

interface QuestionFeedbackProps {
  questionId: string;
  sessionId: string;
  wasCorrect: boolean;
  responseTime?: number;
  onRate?: (rating: 1 | 2 | 3) => void;
}

export function QuestionFeedbackComponent({ 
  questionId, 
  sessionId, 
  wasCorrect, 
  responseTime,
  onRate 
}: QuestionFeedbackProps) {
  const [currentRating, setCurrentRating] = useState<1 | 2 | 3 | null>(
    () => feedbackService.getUserRating(questionId)
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRate = (rating: 1 | 2 | 3) => {
    // Animation au clic
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Sauvegarder le feedback
    const feedback: QuestionFeedback = {
      questionId,
      rating,
      timestamp: Date.now(),
      userId: getOrCreateAnonUserId(),
      sessionId,
      responseTime,
      wasCorrect
    };

    feedbackService.saveFeedback(feedback);
    setCurrentRating(rating);

    // Callback optionnel
    if (onRate) {
      onRate(rating);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Cette question vous a-t-elle été utile ?
      </h4>
      
      <div className="flex items-center gap-3">
        {/* Bouton Bad */}
        <button
          onClick={() => handleRate(1)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
            ${currentRating === 1 
              ? 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500' 
              : 'border-gray-300 hover:border-red-400 dark:border-gray-600 dark:hover:border-red-500'
            }
            ${isAnimating && currentRating === 1 ? 'scale-110' : 'scale-100'}
          `}
          title="Question peu claire ou incorrecte"
        >
          <span className="text-2xl">👎</span>
          <span className="text-sm font-medium">Peu utile</span>
        </button>

        {/* Bouton Good */}
        <button
          onClick={() => handleRate(2)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
            ${currentRating === 2 
              ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500' 
              : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500'
            }
            ${isAnimating && currentRating === 2 ? 'scale-110' : 'scale-100'}
          `}
          title="Question claire et pertinente"
        >
          <span className="text-2xl">👍</span>
          <span className="text-sm font-medium">Utile</span>
        </button>

        {/* Bouton Very Good */}
        <button
          onClick={() => handleRate(3)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
            ${currentRating === 3 
              ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500' 
              : 'border-gray-300 hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500'
            }
            ${isAnimating && currentRating === 3 ? 'scale-110' : 'scale-100'}
          `}
          title="Question excellente, très instructive"
        >
          <span className="text-2xl">🌟</span>
          <span className="text-sm font-medium">Excellente</span>
        </button>
      </div>

      {currentRating && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Merci pour votre feedback ! Votre avis nous aide à améliorer les questions.
        </p>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';

export interface FeedbackModalV3Props {
  isOpen: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  points: number;
  onContinue: () => void;
  mode?: 'revision' | 'simulation';
}

/**
 * FeedbackModal V3 - Style Duolingo Celebration
 * 
 * Changements majeurs:
 * - Confettis plein écran si correct
 * - Badge énorme (120px) avec animation pop-in
 * - XP gained très visible en jaune vif
 * - Bouton continuer jaune énorme (h-16, text-xl)
 * - Messages encourageants personnalisés
 * - Shake animation si incorrect
 * - Couleurs selon score (< 50%: rouge, 50-70%: jaune, > 70%: vert)
 */
export const FeedbackModalV3: React.FC<FeedbackModalV3Props> = ({
  isOpen,
  isCorrect,
  correctAnswer,
  explanation,
  points,
  onContinue,
  mode = 'revision',
}) => {
  const [showCourseContext, setShowCourseContext] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti si correct
  React.useEffect(() => {
    if (isOpen && isCorrect) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isCorrect]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onContinue}
      size="lg"
    >
      {/* Confettis si correct */}
      {showConfetti && <Confetti count={50} duration={3000} />}

      <div className={`text-center ${isCorrect ? 'animate-pop-in' : 'animate-shake-strong'}`}>
        {/* Badge énorme avec icône */}
        <div
          className={`
            w-32 h-32 mx-auto mb-6
            rounded-full
            flex items-center justify-center
            shadow-2xl
            ${
              isCorrect
                ? 'bg-gradient-to-br from-success-400 to-success-600 animate-bounce-big'
                : 'bg-gradient-to-br from-danger-400 to-danger-600 animate-shake-strong'
            }
          `}
          style={{
            boxShadow: isCorrect
              ? '0 20px 40px rgba(0, 213, 99, 0.6)'
              : '0 20px 40px rgba(255, 59, 48, 0.6)',
          }}
        >
          {isCorrect ? (
            <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
          ) : (
            <XCircle className="w-16 h-16 text-white" strokeWidth={3} />
          )}
        </div>

        {/* Titre ÉNORME */}
        <h2
          className={`
            text-5xl font-black mb-4
            ${isCorrect ? 'text-success-600' : 'text-danger-600'}
          `}
        >
          {isCorrect ? 'EXCELLENT !' : 'PRESQUE !'}
        </h2>

        {/* XP gained si correct (mode révision) */}
        {isCorrect && mode === 'revision' && (
          <div className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-accent-500 rounded-full shadow-xl animate-scale-bounce">
            <span className="text-2xl">✨</span>
            <span className="text-2xl font-black text-neutral-900">
              +{points} XP
            </span>
          </div>
        )}

        {/* Réponse correcte si erreur */}
        {!isCorrect && (
          <div className="mb-6 p-6 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-3 border-success-500 rounded-2xl shadow-lg">
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              La bonne réponse était :
            </p>
            <p className="text-2xl font-bold text-success-700 dark:text-success-400">
              {correctAnswer}
            </p>
          </div>
        )}

        {/* Explication avec style moderne */}
        <div className="text-left mb-6 p-6 bg-neutral-50 dark:bg-neutral-700 rounded-2xl border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <p className="text-sm font-bold text-primary-600 uppercase">
              Explication
            </p>
          </div>
          <p className="text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Message encourageant personnalisé */}
        <div className="mb-6">
          {isCorrect ? (
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
              🌟 Continue comme ça, tu progresses !
            </p>
          ) : (
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
              💪 Pas de souci, on apprend de ses erreurs !
            </p>
          )}
        </div>

        {/* Bouton continuer ÉNORME en jaune */}
        <Button
          variant="accent"
          size="xl"
          onClick={onContinue}
          fullWidth
          className="shadow-2xl"
        >
          CONTINUER →
        </Button>

        {/* Lien "Voir le contexte du cours" (optionnel) */}
        {explanation.length > 50 && (
          <button
            onClick={() => setShowCourseContext(!showCourseContext)}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium underline"
          >
            {showCourseContext ? '👁️ Masquer' : '📚 Voir plus de détails'}
          </button>
        )}
      </div>
    </Modal>
  );
};


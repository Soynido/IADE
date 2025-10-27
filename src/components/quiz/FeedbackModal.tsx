import React, { useState } from 'react';
import { Modal, Button, Badge } from '../ui';
import type { Question } from '../../types/pathology';
import type { CompiledQuestion } from '../../types/module';

interface FeedbackModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  points: number;
  onContinue: () => void;
  question?: Question | CompiledQuestion; // Question complète pour accéder au contexte
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  isCorrect,
  correctAnswer,
  explanation,
  points,
  onContinue,
  question,
}) => {
  const [showCourseContext, setShowCourseContext] = useState(false);
  
  // Vérifier si la question a un contexte pédagogique
  const compiledQuestion = question as CompiledQuestion;
  const hasPedagogicalContext = compiledQuestion?.pedagogicalContext;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onContinue}
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        {/* Icône de résultat */}
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-scale-in ${
          isCorrect
            ? 'bg-gradient-to-r from-iade-green-500 to-iade-green-600'
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <span className="text-4xl">
            {isCorrect ? '✓' : '✗'}
          </span>
        </div>

        {/* Titre */}
        <h3 className={`text-2xl font-bold mb-2 ${
          isCorrect ? 'text-iade-green-700' : 'text-red-700'
        }`}>
          {isCorrect ? 'Correct !' : 'Incorrect'}
        </h3>

        {/* Points */}
        {isCorrect && (
          <Badge variant="success" size="lg" className="mb-4">
            +{points} points
          </Badge>
        )}

        {/* Réponse correcte si erreur */}
        {!isCorrect && (
          <div className="mb-4 p-4 bg-iade-blue-50 dark:bg-iade-blue-900/30 border-2 border-iade-blue-200 dark:border-iade-blue-700 rounded-xl">
            <p className="text-sm font-medium text-iade-gray-600 dark:text-gray-400 mb-1">La bonne réponse était :</p>
            <p className="text-lg font-bold text-iade-blue-700 dark:text-iade-blue-400">{correctAnswer}</p>
          </div>
        )}

        {/* Explication */}
        <div className="text-left p-4 bg-iade-gray-50 dark:bg-gray-700 rounded-xl mb-4">
          <p className="text-sm font-semibold text-iade-gray-700 dark:text-gray-300 mb-2">💡 Explication</p>
          <p className="text-iade-gray-800 dark:text-gray-200 leading-relaxed">{explanation}</p>
        </div>

        {/* Contexte Pédagogique Enrichi */}
        {hasPedagogicalContext && (
          <div className="text-left mb-4 space-y-3">
            {/* Section du cours */}
            <div className="p-3 bg-iade-blue-50 dark:bg-iade-blue-900/20 border-l-4 border-iade-blue-500 rounded">
              <p className="text-xs font-semibold text-iade-blue-700 dark:text-iade-blue-400 mb-1">
                📖 Section : {compiledQuestion?.pedagogicalContext?.moduleSection}
              </p>
            </div>

            {/* Concepts liés */}
            {compiledQuestion?.pedagogicalContext?.relatedConcepts && compiledQuestion.pedagogicalContext.relatedConcepts.length > 0 && (
              <div className="p-3 bg-iade-purple-50 dark:bg-iade-purple-900/20 rounded-lg">
                <p className="text-xs font-semibold text-iade-gray-700 dark:text-gray-300 mb-2">
                  🔗 Concepts liés
                </p>
                <div className="flex flex-wrap gap-2">
                  {compiledQuestion.pedagogicalContext.relatedConcepts.map((concept, i) => (
                    <Badge key={i} variant="info" size="sm">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton pour afficher contexte cours complet */}
            {compiledQuestion?.pedagogicalContext?.courseExtract && (
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCourseContext(!showCourseContext)}
                  fullWidth
                >
                  {showCourseContext ? '👁️ Masquer' : '📚 Voir le contexte du cours'}
                </Button>
                
                {showCourseContext && (
                  <div className="mt-3 p-4 bg-white dark:bg-gray-800 border-2 border-iade-gray-200 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-xs font-semibold text-iade-gray-700 dark:text-gray-300 mb-2">
                      📄 Extrait du cours
                    </p>
                    <pre className="text-xs text-iade-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans">
                      {compiledQuestion?.pedagogicalContext?.courseExtract}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Prérequis si présents */}
            {compiledQuestion?.pedagogicalContext?.prerequisites && compiledQuestion.pedagogicalContext.prerequisites.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-xs font-semibold text-iade-gray-700 dark:text-gray-300 mb-2">
                  ⚡ Prérequis recommandés
                </p>
                <div className="flex flex-wrap gap-2">
                  {compiledQuestion.pedagogicalContext.prerequisites.map((prereq, i) => (
                    <span key={i} className="text-xs text-amber-700 dark:text-amber-400">
                      • {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bouton continuer */}
        <Button
          variant="primary"
          size="lg"
          onClick={onContinue}
          fullWidth
        >
          Continuer
        </Button>
      </div>
    </Modal>
  );
};


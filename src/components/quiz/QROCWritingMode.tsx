import React, { useState } from 'react';
import { Card, Button, Badge } from '../ui';
import type { Question } from '../../types/pathology';

interface QROCEvaluation {
  userAnswer: string;
  expectedKeywords: string[];
  foundKeywords: string[];
  missingKeywords: string[];
  score: number;  // 0-3 étoiles
}

interface QROCWritingModeProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (evaluation: QROCEvaluation) => void;
  disabled?: boolean;
}

/**
 * Mode rédaction pour questions ouvertes (QROC)
 * Analyse sémantique de la réponse avec scoring par mots-clés
 */
export const QROCWritingMode: React.FC<QROCWritingModeProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled = false,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setUserAnswer(text);
    setCharCount(text.length);
  };

  const handleSubmit = () => {
    const evaluation = evaluateAnswer(userAnswer, question.correct);
    onAnswer(evaluation);
  };

  const evaluateAnswer = (userAnswer: string, correctAnswer: string): QROCEvaluation => {
    // Extraire les mots-clés de la réponse attendue
    const expectedKeywords = extractKeywords(correctAnswer);
    
    // Chercher les mots-clés dans la réponse de l'utilisateur
    const userLower = userAnswer.toLowerCase();
    const foundKeywords: string[] = [];
    const missingKeywords: string[] = [];

    expectedKeywords.forEach(keyword => {
      if (userLower.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });

    // Calculer le score (0-3 étoiles)
    const matchRate = foundKeywords.length / expectedKeywords.length;
    let score = 0;
    
    if (matchRate >= 0.8) {
      score = 3; // ⭐⭐⭐ Excellent
    } else if (matchRate >= 0.5) {
      score = 2; // ⭐⭐ Bien
    } else if (matchRate >= 0.3) {
      score = 1; // ⭐ Partiel
    }

    return {
      userAnswer,
      expectedKeywords,
      foundKeywords,
      missingKeywords,
      score,
    };
  };

  const extractKeywords = (text: string): string[] => {
    // Mots vides à exclure
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'est', 'sont', 'à', 'en', 'dans', 'par', 'pour', 'sur'];
    
    // Séparer en mots
    const words = text
      .toLowerCase()
      .replace(/[.,;:!?()]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.includes(w));

    // Dédupliquer
    return [...new Set(words)];
  };

  const getHintText = () => {
    // Indice : premiers mots de la réponse
    const firstWords = question.correct.split(' ').slice(0, 3).join(' ');
    return `💡 Commencez par : "${firstWords}..."`;
  };

  return (
    <Card variant="elevated" padding="lg" className="max-w-4xl mx-auto bg-white dark:bg-gray-800">
      {/* Tags */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Badge variant="info" icon="✍️">
          Question {questionNumber}/{totalQuestions} - Mode Rédaction
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
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold mb-6 text-iade-gray-900 dark:text-gray-100 leading-relaxed">
        {question.question}
      </h2>

      {/* Zone de texte */}
      <div className="mb-6">
        <textarea
          value={userAnswer}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="Rédigez votre réponse ici... Soyez précis et utilisez les termes médicaux appropriés."
          className="w-full h-48 px-4 py-3 border-2 border-iade-gray-300 dark:border-gray-600 rounded-xl focus:border-iade-blue-500 focus:ring-2 focus:ring-iade-blue-200 dark:focus:ring-iade-blue-800 resize-none text-iade-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 disabled:opacity-50"
        />
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-iade-gray-500 dark:text-gray-400">
            {charCount} caractères
          </p>
          
          {charCount < 20 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Minimum 20 caractères recommandé
            </p>
          )}
        </div>
      </div>

      {/* Indice */}
      {showHint ? (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {getHintText()}
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHint(true)}
          >
            💡 Besoin d'un indice ?
          </Button>
        </div>
      )}

      {/* Bouton valider */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        disabled={disabled || charCount < 10}
        fullWidth
      >
        ✅ Valider ma réponse
      </Button>
    </Card>
  );
};


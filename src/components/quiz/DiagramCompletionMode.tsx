import React, { useState } from 'react';
import { Card, Button, Badge } from '../ui';
import type { Question } from '../../types/pathology';

interface DiagramElement {
  id: string;
  label: string;
  type: 'node' | 'arrow';
}

interface DiagramCompletionModeProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  diagramCode: string; // Code Mermaid du diagramme
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

/**
 * Mode complétion de schémas Mermaid
 * L'utilisateur doit drag-and-drop les éléments manquants
 */
export const DiagramCompletionMode: React.FC<DiagramCompletionModeProps> = ({
  question,
  questionNumber,
  totalQuestions,
  diagramCode,
  onAnswer,
  disabled = false,
}) => {
  const [hiddenElements] = useState<DiagramElement[]>(() => {
    // Extraire et masquer 2-3 éléments du diagramme
    return extractDiagramElements(diagramCode).slice(0, 3);
  });
  
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map());
  const [showHint, setShowHint] = useState(false);

  const handleSelectElement = (elementId: string, label: string) => {
    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(elementId, label);
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // Vérifier si toutes les réponses sont correctes
    let allCorrect = true;
    
    hiddenElements.forEach(element => {
      const userAnswer = selectedAnswers.get(element.id);
      if (userAnswer !== element.label) {
        allCorrect = false;
      }
    });

    onAnswer(allCorrect);
  };

  const extractDiagramElements = (mermaidCode: string): DiagramElement[] => {
    const elements: DiagramElement[] = [];
    const lines = mermaidCode.split('\n');
    
    // Parser simple pour Mermaid
    lines.forEach((line, index) => {
      // Détecter les noeuds : A[Label]
      const nodeMatch = line.match(/([A-Z]+)\[(.*?)\]/);
      if (nodeMatch) {
        elements.push({
          id: `node_${index}`,
          label: nodeMatch[2],
          type: 'node',
        });
      }
      
      // Détecter les flèches : -->|Label|
      const arrowMatch = line.match(/-->\|(.+?)\|/);
      if (arrowMatch) {
        elements.push({
          id: `arrow_${index}`,
          label: arrowMatch[1],
          type: 'arrow',
        });
      }
    });
    
    return elements;
  };

  const allAnswered = selectedAnswers.size === hiddenElements.length;

  return (
    <Card variant="elevated" padding="lg" className="max-w-4xl mx-auto bg-white dark:bg-gray-800">
      {/* Tags */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Badge variant="info" icon="🎨">
          Question {questionNumber}/{totalQuestions} - Schéma à Compléter
        </Badge>
        <Badge variant="purple">
          📍 {question.theme}
        </Badge>
        <Badge variant="warning">
          ⭐ {question.points} pts
        </Badge>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold mb-6 text-iade-gray-900 dark:text-gray-100 leading-relaxed">
        {question.question}
      </h2>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-iade-blue-50 dark:bg-iade-blue-900/20 border-l-4 border-iade-blue-500 rounded">
        <p className="text-sm text-iade-gray-700 dark:text-gray-300">
          📌 Complétez le schéma en sélectionnant les bonnes étiquettes pour chaque élément masqué.
        </p>
      </div>

      {/* Diagramme simplifié (pour démo) */}
      <div className="mb-6 p-6 bg-iade-gray-50 dark:bg-gray-700 rounded-xl border-2 border-iade-gray-200 dark:border-gray-600">
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-iade-gray-600 dark:text-gray-400 mb-2">
            Schéma Physiologique
          </p>
        </div>
        
        {/* Zones à compléter */}
        <div className="space-y-4">
          {hiddenElements.map((element, index) => (
            <div key={element.id} className="p-3 bg-white dark:bg-gray-800 border-2 border-dashed border-iade-blue-300 dark:border-iade-blue-600 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-iade-gray-700 dark:text-gray-300">
                  {element.type === 'node' ? '🔵 Noeud' : '➡️ Flèche'} #{index + 1}
                </span>
                
                {selectedAnswers.has(element.id) ? (
                  <Badge variant="success" size="sm">
                    {selectedAnswers.get(element.id)}
                  </Badge>
                ) : (
                  <span className="text-xs text-iade-gray-400 dark:text-gray-500">
                    Non complété
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Options disponibles */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-iade-gray-700 dark:text-gray-300 mb-3">
          Étiquettes disponibles :
        </p>
        <div className="grid grid-cols-2 gap-2">
          {hiddenElements.map((element) => (
            <button
              key={element.id}
              onClick={() => handleSelectElement(element.id, element.label)}
              disabled={disabled || selectedAnswers.has(element.id)}
              className={`p-3 border-2 rounded-lg transition-all ${
                selectedAnswers.has(element.id)
                  ? 'border-iade-green-500 bg-iade-green-50 dark:bg-iade-green-900/20 opacity-50'
                  : 'border-iade-gray-200 dark:border-gray-600 hover:border-iade-blue-500 hover:bg-iade-blue-50 dark:hover:bg-iade-blue-900/20'
              }`}
            >
              <span className="text-sm font-medium text-iade-gray-900 dark:text-gray-100">
                {element.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Indice */}
      {!allAnswered && (
        <div className="mb-6">
          {showHint ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                💡 {question.explanation.substring(0, 100)}...
              </p>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHint(true)}
            >
              💡 Voir un indice
            </Button>
          )}
        </div>
      )}

      {/* Bouton valider */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        disabled={disabled || !allAnswered}
        fullWidth
      >
        {allAnswered ? '✅ Valider le schéma' : `Compléter ${hiddenElements.length - selectedAnswers.size} élément(s)`}
      </Button>
    </Card>
  );
};


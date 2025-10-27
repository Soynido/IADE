import React, { useEffect, useState } from 'react';

export interface ConfettiProps {
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

/**
 * Confetti component CSS-only style Duolingo
 * - Déclenché lors de succès, achievements, etc.
 * - Animation confetti-fall (translateY + rotate)
 * - Couleurs primaires (bleu, jaune, vert)
 * - Auto-cleanup après animation
 */
export const Confetti: React.FC<ConfettiProps> = ({
  count = 50,
  duration = 3000,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Générer les pièces de confettis
    const colors = ['#0066FF', '#FFD500', '#00D563', '#FF3B30'];
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // Position X en %
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500, // Delay 0-500ms
        rotation: Math.random() * 360, // Rotation initiale
      });
    }

    setPieces(newPieces);

    // Cleanup après animation
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [count, duration, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};


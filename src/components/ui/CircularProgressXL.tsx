import React from 'react';

export interface CircularProgressXLProps {
  value: number; // 0-100
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showConfetti?: boolean;
  className?: string;
}

/**
 * CircularProgress XL style Ornikar/Duolingo
 * - Taille énorme par défaut (240px)
 * - Stroke épais (20px)
 * - Gradient selon variant
 * - Animation de remplissage progressive
 * - Optionnel: confettis si showConfetti=true
 */
export const CircularProgressXL: React.FC<CircularProgressXLProps> = ({
  value,
  size = 240,
  strokeWidth = 20,
  label = 'Score',
  variant = 'primary',
  showConfetti = false,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Couleurs selon variant
  const variantColors = {
    primary: {
      stroke: 'url(#gradient-primary)',
      bg: '#E6F0FF',
      text: 'text-primary-600',
    },
    success: {
      stroke: 'url(#gradient-success)',
      bg: '#E6FFF2',
      text: 'text-success-600',
    },
    warning: {
      stroke: 'url(#gradient-warning)',
      bg: '#FFFBEB',
      text: 'text-accent-600',
    },
    danger: {
      stroke: 'url(#gradient-danger)',
      bg: '#FFE6E6',
      text: 'text-danger-600',
    },
  };

  const colors = variantColors[variant];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Confettis si activé */}
      {showConfetti && value >= 80 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti absolute top-0 left-1/2"
              style={{
                left: `${50 + (Math.random() - 0.5) * 100}%`,
                animationDelay: `${i * 0.1}s`,
                backgroundColor: i % 3 === 0 ? '#0066FF' : i % 3 === 1 ? '#FFD500' : '#00D563',
              }}
            />
          ))}
        </div>
      )}

      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Définitions de gradients */}
        <defs>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#00D563" />
          </linearGradient>
          <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D563" />
            <stop offset="100%" stopColor="#00AA4F" />
          </linearGradient>
          <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD500" />
            <stop offset="100%" stopColor="#CCAA00" />
          </linearGradient>
          <linearGradient id="gradient-danger" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="100%" stopColor="#CC2F26" />
          </linearGradient>
        </defs>

        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bg}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Cercle de progression avec gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(0, 102, 255, 0.3))',
          }}
        />
      </svg>

      {/* Label et valeur au centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-6xl font-black ${colors.text}`}>
          {Math.round(value)}%
        </span>
        <span className="text-base font-medium text-neutral-600 dark:text-neutral-400 mt-2">
          {label}
        </span>
      </div>
    </div>
  );
};


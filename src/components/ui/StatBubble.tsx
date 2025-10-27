import React from 'react';

export interface StatBubbleProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: 'primary' | 'accent' | 'success' | 'danger';
  onClick?: () => void;
  className?: string;
}

/**
 * StatBubble - Remplace StatCard avec style circulaire coloré
 * - Cercle 120px diameter
 * - Icône Lucide au centre
 * - Valeur en text-3xl bold
 * - Hover : scale + glow-ring
 * - Background gradient
 */
export const StatBubble: React.FC<StatBubbleProps> = ({
  icon,
  value,
  label,
  color = 'primary',
  onClick,
  className = '',
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-primary-400 to-primary-600',
      glow: 'group-hover:shadow-[0_0_30px_rgba(0,102,255,0.6)]',
      ring: 'group-hover:ring-4 group-hover:ring-primary-200',
    },
    accent: {
      bg: 'bg-gradient-to-br from-accent-400 to-accent-600',
      glow: 'group-hover:shadow-[0_0_30px_rgba(255,213,0,0.6)]',
      ring: 'group-hover:ring-4 group-hover:ring-accent-200',
    },
    success: {
      bg: 'bg-gradient-to-br from-success-400 to-success-600',
      glow: 'group-hover:shadow-[0_0_30px_rgba(0,213,99,0.6)]',
      ring: 'group-hover:ring-4 group-hover:ring-success-200',
    },
    danger: {
      bg: 'bg-gradient-to-br from-danger-400 to-danger-600',
      glow: 'group-hover:shadow-[0_0_30px_rgba(255,59,48,0.6)]',
      ring: 'group-hover:ring-4 group-hover:ring-danger-200',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`
        group relative
        flex flex-col items-center
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Bubble circulaire */}
      <div
        className={`
          w-30 h-30
          ${colors.bg}
          rounded-full
          flex flex-col items-center justify-center
          text-white
          shadow-xl
          transition-all duration-300
          ${colors.glow}
          ${colors.ring}
          ${onClick ? 'group-hover:scale-110 group-hover:rotate-6' : ''}
        `}
      >
        {/* Icône */}
        <div className="mb-1">
          {icon}
        </div>

        {/* Valeur */}
        <div className="text-3xl font-black">
          {value}
        </div>
      </div>

      {/* Label en dessous */}
      <div className="mt-3 text-center">
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
      </div>
    </div>
  );
};


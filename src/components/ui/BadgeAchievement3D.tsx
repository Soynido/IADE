import React from 'react';
import type { Achievement } from '../../types/user';

export interface BadgeAchievement3DProps {
  achievement: Achievement;
  size?: 'md' | 'lg' | 'xl';
  locked?: boolean;
  onClick?: () => void;
  progress?: number; // 0-100 pour locked achievements
}

/**
 * Badge Achievement style 3D avec animations
 * - Taille 80x80px par défaut (vs 40x40 actuel)
 * - Shadow XL avec couleur de l'achievement
 * - Transform perspective 3D
 * - Hover : rotate3d + scale(1.2)
 * - Locked : grayscale filter
 * - Animation unlock : confettis + bounce-big
 */
export const BadgeAchievement3D: React.FC<BadgeAchievement3DProps> = ({
  achievement,
  size = 'lg',
  locked = false,
  onClick,
  progress = 0,
}) => {
  const sizeClasses = {
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-24 h-24 text-5xl',
  };

  return (
    <div
      className={`
        group relative
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Badge principal avec effet 3D */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-2xl
          flex items-center justify-center
          transition-all duration-300
          ${
            locked
              ? 'bg-neutral-200 dark:bg-neutral-700 grayscale opacity-60'
              : 'bg-gradient-to-br from-primary-400 to-success-400 animate-glow-pulse shadow-2xl'
          }
          ${
            onClick && !locked
              ? 'group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-2xl'
              : ''
          }
          ${!locked ? 'group-hover:animate-bounce-big' : ''}
        `}
        style={{
          boxShadow: locked
            ? 'none'
            : '0 10px 30px rgba(0, 102, 255, 0.4), 0 5px 15px rgba(0, 213, 99, 0.3)',
        }}
      >
        <span className="drop-shadow-lg">{achievement.icon}</span>
      </div>

      {/* Badge "NEW" si récemment débloqué */}
      {!locked && achievement.unlockedAt && (
        <>
          {new Date(achievement.unlockedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
            <div className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              NEW
            </div>
          )}
        </>
      )}

      {/* Progress ring pour locked achievements */}
      {locked && progress > 0 && (
        <div className="absolute inset-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="#E5E5E5"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="#0066FF"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${progress * 2.83} 283`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
        </div>
      )}

      {/* Tooltip au hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-neutral-900 dark:bg-neutral-700 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shadow-xl">
          <div className="font-bold">{achievement.title}</div>
          <div className="text-xs text-neutral-300">{achievement.description}</div>
          {locked && progress > 0 && (
            <div className="text-xs text-accent-400 mt-1">
              Progression : {Math.round(progress)}%
            </div>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-neutral-900 dark:border-t-neutral-700" />
        </div>
      </div>
    </div>
  );
};


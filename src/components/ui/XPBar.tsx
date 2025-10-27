import React from 'react';
import { Flame } from 'lucide-react';

export interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  streakDays: number;
  className?: string;
}

/**
 * Barre XP sticky style Ornikar/Duolingo
 * - Toujours visible en haut (sticky top-0)
 * - Gradient bleu → vert
 * - Flame animée pour le streak
 * - Texte bold avec XP actuel / prochain niveau
 */
export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  nextLevelXP,
  level,
  streakDays,
  className = '',
}) => {
  const percentage = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  return (
    <div
      className={`
        sticky top-0 z-50
        bg-white dark:bg-neutral-800
        border-b-2 border-neutral-200 dark:border-neutral-700
        shadow-lg
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Barre XP avec gradient */}
          <div className="flex-1">
            <div className="relative h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              {/* Gradient animé bleu → vert */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 via-success-400 to-success-500 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              
              {/* Texte XP centré */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white drop-shadow-md">
                  {currentXP} / {nextLevelXP} XP
                </span>
              </div>
            </div>
            
            {/* Label niveau */}
            <div className="flex items-center justify-between mt-1 px-2">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Niveau {level}
              </span>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Streak avec flame animée */}
          <div className="flex items-center gap-2 px-4 py-2 bg-danger-50 dark:bg-danger-900/20 rounded-full border-2 border-danger-200 dark:border-danger-700">
            <Flame 
              className={`w-6 h-6 text-danger-500 ${streakDays > 0 ? 'animate-bounce-big' : ''}`}
              fill={streakDays > 0 ? 'currentColor' : 'none'}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Streak
              </span>
              <span className="text-lg font-bold text-danger-500">
                {streakDays} {streakDays > 1 ? 'jours' : 'jour'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


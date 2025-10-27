import React, { useEffect, useState } from 'react';
import type { Achievement } from '../../types/user';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  duration?: number;
}

/**
 * Notification toast pour afficher un achievement débloqué
 */
export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 10);

    // Auto-fermeture après durée
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-20 right-6 z-50 transition-all duration-300 transform ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-iade-purple-500 to-iade-blue-500 text-white rounded-2xl shadow-iade-xl p-6 max-w-sm animate-bounce-slow">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Achievement Débloqué !</h3>
          </div>
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Badge & Titre */}
        <div className="flex items-center gap-4 mb-2">
          <div className="text-5xl animate-bounce">{achievement.icon}</div>
          <div>
            <h4 className="font-bold text-xl mb-1">{achievement.title}</h4>
            <p className="text-white/90 text-sm">{achievement.description}</p>
          </div>
        </div>

        {/* Date */}
        <div className="text-xs text-white/70 mt-3 text-right">
          Débloqué le {new Date(achievement.unlockedAt || Date.now()).toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Trophy, Zap, Target, BookOpen, Flame, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { XPBar } from '../ui/XPBar';
import { CircularProgressXL } from '../ui/CircularProgressXL';

export interface DashboardV3FixedProps {
  onStartSession?: (mode: 'revision' | 'simulation') => void;
}

/**
 * Dashboard V3 Corrigé - Style Ornikar/Duolingo
 * - Pas de dépendances aux hooks
 * - Mock data pour la démo
 * - Tous les effets visuels
 */
export const DashboardV3Fixed: React.FC<DashboardV3FixedProps> = ({ onStartSession }) => {
  // Mock data pour la démo (pas de dépendance aux hooks)
  const currentXP = 47;
  const nextLevelXP = 100;
  const level = 1;
  const streakDays = 3;
  const averageScore = 76;
  const totalSessions = 5;
  const questionsSeen = 42;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* XP Bar Sticky */}
      <XPBar
        currentXP={currentXP}
        nextLevelXP={nextLevelXP}
        level={level}
        streakDays={streakDays}
      />

      {/* Main Content - Centré et spacieux */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black bg-gradient-to-r from-primary-600 to-success-600 bg-clip-text text-transparent">
            🧠 IADE Learning
          </h1>
          <p className="text-2xl font-semibold text-neutral-600 dark:text-neutral-400">
            Prêt pour le concours 2025 ?
          </p>
        </div>

        {/* Score Global - ÉNORME */}
        <div className="flex justify-center">
          <CircularProgressXL
            value={averageScore}
            size={240}
            strokeWidth={20}
            variant={averageScore >= 70 ? 'success' : 'primary'}
            showConfetti={averageScore >= 80}
          />
        </div>

        {/* Stats Bubbles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-primary-100 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-primary-700 mb-2">
              {totalSessions}
            </div>
            <div className="text-sm font-medium text-primary-600">
              Sessions Complétées
            </div>
          </div>
          
          <div className="bg-accent-100 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-accent-700 mb-2">
              {streakDays}
            </div>
            <div className="text-sm font-medium text-accent-600">
              Jours de Streak
            </div>
          </div>
          
          <div className="bg-success-100 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-success-700 mb-2">
              {questionsSeen}
            </div>
            <div className="text-sm font-medium text-success-600">
              Questions Vues
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent-500" />
            Vos Achievements
          </h2>
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-lg text-neutral-600">
              Complétez des sessions pour débloquer des achievements !
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary-500" />
            Prêt(e) à vous entraîner ?
          </h2>
          
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onStartSession?.('revision')}
              className="w-full h-20 text-2xl shadow-2xl hover:shadow-primary-500/50 animate-bounce-big"
              icon={<BookOpen size={28} />}
            >
              📚 Mode Révision
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onStartSession?.('simulation')}
              className="w-full h-20 text-2xl shadow-2xl hover:shadow-accent-500/50"
              icon={<Target size={28} />}
            >
              ⚡ Simulation Examen
            </Button>
            
            <div className="text-center text-sm text-neutral-500 mt-4">
              10 questions • Intelligence adaptative • Feedback immédiat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

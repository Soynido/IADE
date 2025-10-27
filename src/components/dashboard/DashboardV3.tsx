import React from 'react';
import { Trophy, Zap, Target, BookOpen, Flame, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { XPBar } from '../ui/XPBar';
import { CircularProgressXL } from '../ui/CircularProgressXL';

export interface DashboardV3Props {
  onStartSession?: (mode: 'revision' | 'simulation') => void;
}

/**
 * Dashboard V3 - Style Ornikar/Duolingo
 * 
 * Changements majeurs vs Dashboard actuel:
 * - Layout centré max-w-4xl spacieux
 * - XPBar sticky toujours visible
 * - Score circulaire ÉNORME (240px)
 * - Badges 3D animés (80x80px) - À venir
 * - Bouton CTA hero énorme (h-20, text-2xl)
 * - Palette bleu électrique + jaune soleil
 * - Stats en bubbles colorées - À venir
 */
export const DashboardV3: React.FC<DashboardV3Props> = ({ onStartSession }) => {
  // Mock data pour la démo (pas de dépendance aux hooks)
  const currentXP = 47;
  const nextLevelXP = 100;
  const level = 1;
  const streakDays = 3;
  const averageScore = 76;
  const totalSessions = 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
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

        {/* Score Circulaire ÉNORME */}
        <div className="flex flex-col items-center space-y-6">
          <CircularProgressXL
            value={userProfile.averageScore || 0}
            size={240}
            strokeWidth={20}
            label="Score Global"
            variant={
              (userProfile.averageScore || 0) >= 80
                ? 'success'
                : (userProfile.averageScore || 0) >= 60
                ? 'primary'
                : 'warning'
            }
            showConfetti={(userProfile.averageScore || 0) >= 80}
          />

          {/* Stats sous le cercle */}
          <div className="flex items-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">{currentXP}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">XP Total</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success-600">
                {userProfile.totalSessions || 0}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Sessions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-600">
                {userProfile.questionsSeen?.length || 0}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Questions vues</div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-accent-500" />
              Achievements
            </h2>
            <span className="px-4 py-2 bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400 rounded-full text-sm font-bold">
              {userProfile.achievements?.length || 0} / 10
            </span>
          </div>

          {userProfile.achievements && userProfile.achievements.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {userProfile.achievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 rounded-2xl hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                >
                  <div className="text-5xl mb-2 group-hover:animate-bounce-big">
                    {achievement.icon}
                  </div>
                  <span className="text-xs font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    {achievement.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Complétez des sessions pour débloquer des achievements !
              </p>
            </div>
          )}
        </div>

        {/* Zones faibles */}
        {userProfile.weakAreas && userProfile.weakAreas.length > 0 && (
          <div className="bg-gradient-to-r from-danger-50 to-accent-50 dark:from-danger-900/20 dark:to-accent-900/20 rounded-3xl p-8 border-2 border-danger-200 dark:border-danger-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-danger-100 dark:bg-danger-900/50 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-danger-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                  🎯 Zones à renforcer
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Nos recommandations pour améliorer votre score :
                </p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.weakAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-full text-sm font-semibold text-danger-600 border-2 border-danger-200 dark:border-danger-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section - Boutons ÉNORMES */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <h3 className="text-3xl font-bold text-primary-600 flex items-center justify-center gap-3">
            <Zap className="w-8 h-8" />
            Prêt(e) à vous entraîner ?
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="hero"
              onClick={() => onStartSession?.('revision')}
              icon={<BookOpen className="w-6 h-6" />}
              className="animate-pulse"
            >
              Mode Révision
            </Button>
            <Button
              variant="accent"
              size="hero"
              onClick={() => onStartSession?.('simulation')}
              icon={<Zap className="w-6 h-6" />}
            >
              Simulation Examen
            </Button>
          </div>

          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            10 questions • Intelligence adaptative • Feedback immédiat
          </p>
        </div>

        {/* Historique récent */}
        {userProfile.recentScores && userProfile.recentScores.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
              📊 Historique Récent
            </h3>
            <div className="space-y-3">
              {userProfile.recentScores.slice(-5).reverse().map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
                        session.score >= 70
                          ? 'bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400'
                          : session.score >= 50
                          ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-400'
                          : 'bg-danger-100 dark:bg-danger-900/50 text-danger-700 dark:text-danger-400'
                      }`}
                    >
                      {session.score}%
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {session.theme}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(session.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      session.score >= 70
                        ? 'bg-success-100 text-success-700'
                        : session.score >= 50
                        ? 'bg-accent-100 text-accent-700'
                        : 'bg-danger-100 text-danger-700'
                    }`}
                  >
                    {session.score >= 70 ? '✓ Réussi' : session.score >= 50 ? '~ Moyen' : '✗ À revoir'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


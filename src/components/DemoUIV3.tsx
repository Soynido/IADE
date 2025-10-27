import React, { useState } from 'react';
import { Trophy, Flame, Star, Zap, Target } from 'lucide-react';
import { Button, XPBar, CircularProgressXL, BadgeAchievement3D, StatBubble, Confetti } from './ui';
import type { Achievement } from '../types/user';

/**
 * Page de démonstration UI V3 - Style Ornikar/Duolingo
 * 
 * Cette page montre tous les nouveaux components et le style cible.
 * À utiliser comme référence pour la refonte complète.
 * 
 * Accès: Ajouter route '/demo-v3' temporaire
 */
export const DemoUIV3: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock achievements pour la démo
  const mockAchievements: Achievement[] = [
    { id: '1', title: 'Premier Pas', description: 'Première session', icon: '🎓', unlockedAt: new Date().toISOString(), progress: 100 },
    { id: '2', title: 'Streak 7j', description: '7 jours consécutifs', icon: '🔥', progress: 60 },
    { id: '3', title: 'Centurion', description: '100 questions', icon: '⭐', progress: 30 },
    { id: '4', title: 'Score Parfait', description: '100%', icon: '🏆', progress: 0 },
    { id: '5', title: 'Expert IADE', description: '50 sessions', icon: '💎', progress: 20 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Confettis demo */}
      {showConfetti && <Confetti count={50} duration={3000} onComplete={() => setShowConfetti(false)} />}

      {/* XP Bar Sticky */}
      <XPBar
        currentXP={847}
        nextLevelXP={1000}
        level={3}
        streakDays={12}
      />

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black bg-gradient-to-r from-primary-600 to-success-600 bg-clip-text text-transparent animate-slide-up">
            🎨 IADE Learning V3
          </h1>
          <p className="text-2xl font-semibold text-neutral-600">
            Démonstration du nouveau style Ornikar/Duolingo
          </p>
        </div>

        {/* Section 1 : Nouveau Score Circulaire */}
        <section className="bg-white rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary-600" />
            Score Circulaire XL
          </h2>
          <div className="flex flex-col items-center">
            <CircularProgressXL
              value={76}
              size={240}
              strokeWidth={20}
              label="Score Global"
              variant="success"
              showConfetti={false}
            />
            <p className="mt-6 text-neutral-600 italic">
              240px de diameter, stroke 20px, gradient bleu → vert
            </p>
          </div>
        </section>

        {/* Section 2 : Nouveaux Boutons */}
        <section className="bg-white rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            🎯 Nouveaux Boutons
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-3">Hero Size (h-20, text-2xl)</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="hero" icon={<Zap className="w-6 h-6" />}>
                  Mode Révision
                </Button>
                <Button variant="accent" size="hero" icon={<Trophy className="w-6 h-6" />}>
                  Simulation Examen
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-3">XL Size (h-16, text-xl)</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="success" size="xl">
                  CONTINUER →
                </Button>
                <Button variant="danger" size="xl">
                  Abandonner
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-3">LG Size (h-14, text-lg)</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg">Démarrer</Button>
                <Button variant="accent" size="lg">Voir résultats</Button>
                <Button variant="outline" size="lg">Paramètres</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 : Badges 3D */}
        <section className="bg-white rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent-500" />
            Badges Achievements 3D
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
            {mockAchievements.map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center">
                <BadgeAchievement3D
                  achievement={achievement}
                  size="xl"
                  locked={!achievement.unlockedAt}
                  progress={achievement.progress || 0}
                  onClick={() => alert(`Clicked: ${achievement.title}`)}
                />
                <p className="mt-3 text-sm font-medium text-center text-neutral-700">
                  {achievement.title}
                </p>
                {achievement.progress !== undefined && achievement.progress < 100 && (
                  <p className="text-xs text-neutral-500">
                    {Math.round(achievement.progress)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 : Stats Bubbles */}
        <section className="bg-white rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            📊 Stats Bubbles (remplace StatCard)
          </h2>
          
          <div className="flex flex-wrap justify-center gap-12">
            <StatBubble
              icon={<Trophy className="w-10 h-10" />}
              value="42"
              label="Sessions"
              color="primary"
            />
            <StatBubble
              icon={<Star className="w-10 h-10" />}
              value="847"
              label="XP Total"
              color="accent"
            />
            <StatBubble
              icon={<Target className="w-10 h-10" />}
              value="214"
              label="Questions"
              color="success"
            />
            <StatBubble
              icon={<Flame className="w-10 h-10" />}
              value="12"
              label="Streak"
              color="danger"
            />
          </div>
        </section>

        {/* Section 5 : Démonstration Confettis */}
        <section className="bg-white rounded-3xl p-12 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            ✨ Confettis & Célébrations
          </h2>
          
          <div className="space-y-6">
            <p className="text-neutral-600 mb-6">
              Déclenche des confettis pour succès, achievements, perfect score
            </p>
            
            <Button
              variant="accent"
              size="xl"
              onClick={() => setShowConfetti(true)}
              icon={<Star className="w-6 h-6" />}
            >
              🎉 DÉCLENCHER CONFETTIS
            </Button>
          </div>
        </section>

        {/* Section 6 : Palette de Couleurs */}
        <section className="bg-white rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            🎨 Nouvelle Palette Ornikar
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Primary */}
            <div className="text-center">
              <div className="w-full h-24 bg-primary-500 rounded-2xl shadow-lg mb-3" />
              <p className="font-semibold text-neutral-900">Primary</p>
              <p className="text-sm text-neutral-600">#0066FF</p>
              <p className="text-xs text-neutral-500">Bleu électrique</p>
            </div>

            {/* Accent */}
            <div className="text-center">
              <div className="w-full h-24 bg-accent-500 rounded-2xl shadow-lg mb-3" />
              <p className="font-semibold text-neutral-900">Accent</p>
              <p className="text-sm text-neutral-600">#FFD500</p>
              <p className="text-xs text-neutral-500">Jaune soleil</p>
            </div>

            {/* Success */}
            <div className="text-center">
              <div className="w-full h-24 bg-success-500 rounded-2xl shadow-lg mb-3" />
              <p className="font-semibold text-neutral-900">Success</p>
              <p className="text-sm text-neutral-600">#00D563</p>
              <p className="text-xs text-neutral-500">Vert flash</p>
            </div>

            {/* Danger */}
            <div className="text-center">
              <div className="w-full h-24 bg-danger-500 rounded-2xl shadow-lg mb-3" />
              <p className="font-semibold text-neutral-900">Danger</p>
              <p className="text-sm text-neutral-600">#FF3B30</p>
              <p className="text-xs text-neutral-500">Rouge vif</p>
            </div>
          </div>
        </section>

        {/* Section 7 : Animations */}
        <section className="bg-white rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            ⚡ Nouvelles Animations
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-neutral-50 rounded-2xl">
              <div className="text-5xl mb-3 animate-bounce-big">🎯</div>
              <p className="font-semibold">bounce-big</p>
            </div>

            <div className="text-center p-6 bg-neutral-50 rounded-2xl">
              <div className="text-5xl mb-3 animate-scale-bounce">⭐</div>
              <p className="font-semibold">scale-bounce</p>
            </div>

            <div className="text-center p-6 bg-neutral-50 rounded-2xl">
              <div className="text-5xl mb-3 animate-glow-pulse">💎</div>
              <p className="font-semibold">glow-pulse</p>
            </div>

            <div className="text-center p-6 bg-neutral-50 rounded-2xl">
              <div className="text-5xl mb-3 animate-shake-strong">❌</div>
              <p className="font-semibold">shake-strong</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t-2 border-neutral-200">
          <p className="text-neutral-600 mb-4">
            🎨 Refonte UI Complète - Style Ornikar/Duolingo
          </p>
          <p className="text-sm text-neutral-500">
            Components créés : Button, XPBar, CircularProgressXL, BadgeAchievement3D, StatBubble, Confetti, QuestionCardV3, FeedbackModalV3, DashboardV3
          </p>
        </div>
      </div>
    </div>
  );
};


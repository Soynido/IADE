/**
 * Dashboard MVP - Visual redesign with legacy IADE aesthetics
 * Order: Actions → Stats → Concepts → Footer
 * Colors: #F2662F (primary), #F4F7F9 (background)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, BookOpen, Dumbbell, Trophy, Flame, Brain, Award } from 'lucide-react';
import { StorageService } from '../services/storageService';
import type { UserProfile } from '../services/storageService';

export default function ProgressDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userProfile = StorageService.getUserProfile();
    setProfile(userProfile);
  }, []);

  if (!profile) {
    return <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
      <p className="text-gray-600">Chargement...</p>
    </div>;
  }

  // Calculer les stats depuis le profil réel
  const averageScore = profile.averageScore || 0;
  const totalSessions = profile.totalSessions || 0;
  const streak = profile.streakDays || 0;

  // Top 5 domaines faibles (depuis adaptiveProfile)
  const weakDomains = profile.adaptiveProfile?.domainPerformance 
    ? Object.entries(profile.adaptiveProfile.domainPerformance)
        .map(([domain, score]) => ({ domain, score }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 5)
    : [];

  // Dernière session
  const lastSessionDate = profile.lastSessionAt 
    ? new Date(profile.lastSessionAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : 'Jamais';

  return (
    <div className="min-h-screen bg-[#F4F7F9] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
            Préparation Concours IADE
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Votre tableau de bord d'apprentissage
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 1. ACTION ZONE - Les 3 modes (Primary CTAs) */}
        {/* ========================================================================= */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Commencer une session
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode Révision */}
            <Link 
              to="/cours" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <BookOpen className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Mode Révision
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Explorez les cours par thème et révisez les concepts clés
                </p>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Parcourir les modules</span>
                  <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Mode Entraînement */}
            <Link 
              to="/entrainement" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-[#F2662F] to-[#e85a29] p-6 text-white">
                <Dumbbell className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Mode Entraînement
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed">
                  10 questions adaptatives avec feedback immédiat
                </p>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Lancer une session</span>
                  <span className="text-[#F2662F] font-bold group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Mode Concours Blanc */}
            <Link 
              to="/concours" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                <Trophy className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Concours Blanc
                </h3>
                <p className="text-purple-100 text-sm leading-relaxed">
                  60 QCM chronométrés - Simulation réelle
                </p>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Démarrer le concours</span>
                  <span className="text-purple-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. QUICK STATS - Métriques de motivation */}
        {/* ========================================================================= */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Votre progression
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Streak */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Série active
                </h3>
                <Flame className="w-8 h-8 text-[#F2662F]" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-6xl font-bold text-[#F2662F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {streak}
                </p>
                <span className="text-2xl text-gray-500 font-medium">jours</span>
              </div>
              <p className="text-sm text-gray-500">
                {streak === 0 ? 'Commencez une session pour démarrer !' : 'Continuez comme ça !'}
              </p>
            </div>

            {/* Score Global */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Score global
                </h3>
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-6xl font-bold text-blue-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {averageScore.toFixed(0)}
                </p>
                <span className="text-2xl text-gray-500 font-medium">%</span>
              </div>
              <p className="text-sm text-gray-500">
                Moyenne sur {Math.min(profile.recentScores?.length || 0, 5)} dernières sessions
              </p>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sessions
                </h3>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-6xl font-bold text-purple-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {totalSessions}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Dernière: {lastSessionDate}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CONCEPTS À REVOIR - Personnalisation */}
        {/* ========================================================================= */}
        {weakDomains.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                Vos concepts à retravailler
              </h2>
              <Link 
                to="/entrainement"
                className="text-[#F2662F] font-semibold hover:underline text-sm"
              >
                Revoir ces concepts →
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <div className="space-y-4">
                {weakDomains.map((item, index) => (
                  <div key={item.domain} className="flex items-center gap-4 py-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-500 text-white font-bold flex items-center justify-center shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.domain}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          {item.score.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            item.score >= 70 
                              ? 'bg-gradient-to-r from-green-400 to-green-500' 
                              : item.score >= 50 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. FOOTER - Informations subtiles */}
        {/* ========================================================================= */}
        <div className="text-center mt-16 pb-8">
          <p className="text-sm text-gray-400">
            IADE Adaptive Learning Engine v2.0 MVP
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Plus de 1000 questions générées par IA
          </p>
        </div>
      </div>
    </div>
  );
}

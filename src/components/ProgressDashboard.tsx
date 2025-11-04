/**
 * MVP Dashboard - Simplifié et centré sur la progression réelle
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, BookOpen, Dumbbell, Trophy } from 'lucide-react';
import { StorageService } from '../services/storageService';
import type { UserProfile } from '../services/storageService';

export default function ProgressDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userProfile = StorageService.getUserProfile();
    setProfile(userProfile);
  }, []);

  if (!profile) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    ? new Date(profile.lastSessionAt).toLocaleDateString('fr-FR')
    : 'Aucune';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Préparation Concours IADE
          </h1>
          <p className="text-gray-600">Votre tableau de bord de progression</p>
        </div>

        {/* Stats Cards - Métriques essentielles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Streak */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Série</h3>
              <span className="text-3xl">🔥</span>
            </div>
            <p className="text-5xl font-bold text-orange-500 mb-2">{streak}</p>
            <p className="text-sm text-gray-500">jours consécutifs</p>
            {streak === 0 && (
              <p className="text-xs text-gray-400 mt-2">Commencez une session pour démarrer !</p>
            )}
          </div>

          {/* Score Moyen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Score Moyen</h3>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-5xl font-bold text-green-500 mb-2">{averageScore.toFixed(0)}%</p>
            <p className="text-sm text-gray-500">
              Calculé sur {Math.min(profile.recentScores?.length || 0, 5)} dernières sessions
            </p>
          </div>

          {/* Sessions Complétées */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Sessions</h3>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-5xl font-bold text-blue-500 mb-2">{totalSessions}</p>
            <p className="text-sm text-gray-500">Dernière: {lastSessionDate}</p>
          </div>
        </div>

        {/* Top 5 Concepts à Revoir */}
        {weakDomains.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-red-500" />
              Top 5 - Concepts à Revoir
            </h2>
            <div className="space-y-4">
              {weakDomains.map((item, index) => (
                <div key={item.domain} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{item.domain}</span>
                      <span className="text-sm text-gray-600">{item.score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.score >= 70 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 Modes Principaux - CTAs clairs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode Révision */}
          <Link 
            to="/cours" 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white hover:scale-105 transition-transform group"
          >
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">Réviser un module</h3>
              <p className="text-blue-100 mb-6">
                Explorez les cours par catégorie et révisez les concepts clés
              </p>
              <div className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block">
                Commencer →
              </div>
            </div>
          </Link>

          {/* Mode Entraînement */}
          <Link 
            to="/entrainement" 
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white hover:scale-105 transition-transform group"
          >
            <div className="text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">Faire un entraînement</h3>
              <p className="text-green-100 mb-6">
                10 questions adaptatives avec feedback immédiat
              </p>
              <div className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-block">
                Démarrer →
              </div>
            </div>
          </Link>

          {/* Mode Concours Blanc */}
          <Link 
            to="/concours" 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white hover:scale-105 transition-transform group"
          >
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">Lancer un concours blanc</h3>
              <p className="text-purple-100 mb-6">
                60 QCM chronométrés - Simulation réelle
              </p>
              <div className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors inline-block">
                Commencer →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

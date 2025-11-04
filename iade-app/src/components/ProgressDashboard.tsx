/**
 * Dashboard MVP - Legacy IADE Style
 */

import { Link } from 'react-router-dom';
import { BookOpen, Dumbbell, Target } from 'lucide-react';

export default function ProgressDashboard() {
  return (
    <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Bienvenue, futur IADE ! 🎓
          </h1>
          <p className="text-gray-600 text-xl" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Choisissez votre mode d'entraînement
          </p>
        </div>

        {/* Action Zone - 3 CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Mode Révision */}
          <Link
            to="/cours"
            className="bg-gradient-to-br from-[#F2662F] to-[#FF8C66] rounded-2xl shadow-xl p-10 text-white hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <div className="text-center">
              <div className="text-7xl mb-5">📚</div>
              <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Mode Révision
              </h3>
              <p className="text-orange-100 text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Explorez les modules de cours et révisez les concepts clés
              </p>
              <button className="mt-6 bg-white text-[#F2662F] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors duration-300 text-lg">
                Démarrer →
              </button>
            </div>
          </Link>

          {/* Mode Entraînement */}
          <Link
            to="/entrainement"
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-10 text-white hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <div className="text-center">
              <div className="text-7xl mb-5">💪</div>
              <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Mode Entraînement
              </h3>
              <p className="text-blue-100 text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Séries de questions adaptatives avec feedback immédiat
              </p>
              <button className="mt-6 bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors duration-300 text-lg">
                Démarrer →
              </button>
            </div>
          </Link>

          {/* Mode Concours Blanc */}
          <Link
            to="/concours"
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-xl p-10 text-white hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <div className="text-center">
              <div className="text-7xl mb-5">🎯</div>
              <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Concours Blanc
              </h3>
              <p className="text-purple-100 text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Simulez les conditions réelles de l'examen IADE
              </p>
              <button className="mt-6 bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors duration-300 text-lg">
                Démarrer →
              </button>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-[1.02] transition-transform duration-300">
            <div className="text-6xl mb-4">🔥</div>
            <p className="text-5xl font-bold text-orange-500" style={{ fontFamily: 'Inter, sans-serif' }}>0</p>
            <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>jours de pratique consécutifs</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-[1.02] transition-transform duration-300">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-5xl font-bold text-green-500" style={{ fontFamily: 'Inter, sans-serif' }}>0%</p>
            <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>score moyen global</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-[1.02] transition-transform duration-300">
            <div className="text-6xl mb-4">⏱️</div>
            <p className="text-5xl font-bold text-blue-500" style={{ fontFamily: 'Inter, sans-serif' }}>0</p>
            <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>sessions terminées</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16" style={{ fontFamily: 'Inter, sans-serif' }}>
          <p>&copy; {new Date().getFullYear()} IADE Learning Core. Tous droits réservés.</p>
          <p className="mt-2">Version MVP 2.0</p>
        </footer>
      </div>
    </div>
  );
}


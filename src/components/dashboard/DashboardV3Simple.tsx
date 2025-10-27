import React from 'react';

export interface DashboardV3SimpleProps {
  onStartSession?: (mode: 'revision' | 'simulation') => void;
}

/**
 * Dashboard V3 Ultra-Simplifié pour debug
 * - Pas de dépendances externes
 * - Juste du HTML/CSS basique
 * - Pour identifier le problème
 */
export const DashboardV3Simple: React.FC<DashboardV3SimpleProps> = ({ onStartSession }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-black text-blue-600 mb-8">
          🧠 IADE Learning V3
        </h1>
        
        <p className="text-2xl text-gray-600 mb-12">
          Prêt pour le concours 2025 ?
        </p>
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <div className="text-8xl font-bold text-green-600 mb-4">
            76%
          </div>
          <div className="text-xl text-gray-600">
            Score Global
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-100 rounded-2xl p-6">
            <div className="text-4xl font-bold text-blue-700">5</div>
            <div className="text-sm text-blue-600">Sessions</div>
          </div>
          <div className="bg-yellow-100 rounded-2xl p-6">
            <div className="text-4xl font-bold text-yellow-700">3</div>
            <div className="text-sm text-yellow-600">Streak</div>
          </div>
          <div className="bg-green-100 rounded-2xl p-6">
            <div className="text-4xl font-bold text-green-700">42</div>
            <div className="text-sm text-green-600">Questions</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => onStartSession?.('revision')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-6 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all"
          >
            📚 Mode Révision
          </button>
          
          <button 
            onClick={() => onStartSession?.('simulation')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-2xl font-bold py-6 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all"
          >
            ⚡ Simulation Examen
          </button>
        </div>
      </div>
    </div>
  );
};

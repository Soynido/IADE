import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import questionsData from '../data/mock/questions.json';
import statsData from '../data/mock/stats.json';

export default function ProgressDashboard() {
  const [stats, setStats] = useState(statsData.userStats);
  const [achievements, setAchievements] = useState(statsData.achievements);
  
  const accuracy = stats.correctAnswers / stats.totalQuestionsAnswered * 100;
  const weeklyProgress = stats.weeklyGoal.current / stats.weeklyGoal.questions * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            🎓 Préparation Concours IADE
          </h1>
          <p className="text-indigo-600">Votre tableau de bord de progression</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Streak */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Streak</h3>
              <span className="text-3xl">🔥</span>
            </div>
            <p className="text-4xl font-bold text-orange-500">{stats.streak} jours</p>
            <p className="text-sm text-gray-500 mt-2">consecutifs de pratique</p>
          </div>

          {/* Score */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Score</h3>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-green-500">{accuracy.toFixed(0)}%</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.correctAnswers}/{stats.totalQuestionsAnswered} bonnes réponses
            </p>
          </div>

          {/* Progression */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Objectif</h3>
              <span className="text-3xl">🎯</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-indigo-500 h-4 rounded-full transition-all"
                style={{ width: `${weeklyProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {stats.weeklyGoal.current}/{stats.weeklyGoal.questions} questions
            </p>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Mode Cours */}
          <Link 
            to="/cours" 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">Révision</h3>
              <p className="text-blue-100">
                Parcourez les cours par thème et révisez les concepts
              </p>
              <button className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Démarrer →
              </button>
            </div>
          </Link>

          {/* Mode Entraînement */}
          <Link 
            to="/entrainement" 
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">💪</div>
              <h3 className="text-2xl font-bold mb-2">Entraînement</h3>
              <p className="text-green-100">
                Entraînez-vous avec feedback immédiat et progression
              </p>
              <button className="mt-6 bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                Démarrer →
              </button>
            </div>
          </Link>

          {/* Mode Concours */}
          <Link 
            to="/concours" 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-2">Concours Blanc</h3>
              <p className="text-purple-100">
                Simulez un vrai concours chronométré
              </p>
              <button className="mt-6 bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                Démarrer →
              </button>
            </div>
          </Link>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <span className="ml-auto text-green-500">✓ Débloqué</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, Award, Calendar, Brain, AlertCircle } from 'lucide-react';
import questionsData from '../data/mock/questions.json';
import statsData from '../data/mock/stats.json';
import { SuccessPredictionEngine } from '../services/successPredictionEngine';
import { kgRecommendations } from '../services/knowledgeGraphRecommendations';

export default function ProgressDashboard() {
  const [stats, setStats] = useState(statsData.userStats);
  const [achievements, setAchievements] = useState(statsData.achievements);
  
  const accuracy = stats.correctAnswers / stats.totalQuestionsAnswered * 100;
  const weeklyProgress = stats.weeklyGoal.current / stats.weeklyGoal.questions * 100;

  // Calcul de la prédiction de réussite
  const examDate = new Date('2025-12-15'); // Date d'examen fictive
  const prediction = SuccessPredictionEngine.predictSuccessRate({
    totalSessions: stats.sessions || 15,
    averageScore: accuracy,
    totalQuestionsAnswered: stats.totalQuestionsAnswered,
    correctAnswers: stats.correctAnswers,
    streak: stats.streak,
    totalTimeSpent: 0
  }, examDate);

  // Top 5 concepts à revoir (basé sur les thèmes des questions)
  const themeStats = new Map<string, { total: number; correct: number }>();
  // Simuler des stats par thème
  const themes = ['Neurologie', 'Pharmacologie', 'Réanimation', 'Transfusion', 'Acidose-Base'];
  themes.forEach(theme => {
    themeStats.set(theme, {
      total: Math.floor(Math.random() * 20) + 5,
      correct: Math.floor(Math.random() * 15) + 3
    });
  });

  const weakestThemes = Array.from(themeStats.entries())
    .map(([theme, data]) => ({
      theme,
      accuracy: (data.correct / data.total) * 100,
      total: data.total
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  // Recommandations KG
  const kgRecommendedThemes = kgRecommendations.getRecommendedThemes(5);

  const getPredictionColor = (prob: number) => {
    if (prob >= 80) return 'text-green-600';
    if (prob >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPredictionBgColor = (prob: number) => {
    if (prob >= 80) return 'bg-green-50 border-green-200';
    if (prob >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

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

        {/* Prédiction de réussite (mise en avant) */}
        <div className={`rounded-2xl shadow-xl p-6 mb-8 border-2 ${getPredictionBgColor(prediction.probability)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-8 h-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Prédiction de Réussite</h2>
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <p className={`text-6xl font-bold ${getPredictionColor(prediction.probability)}`}>
                  {prediction.probability.toFixed(0)}%
                </p>
                <div>
                  <p className="text-gray-600 font-medium">Probabilité de réussite au concours</p>
                  <p className="text-sm text-gray-500">
                    Confiance: <span className="font-semibold capitalize">{prediction.confidence}</span>
                  </p>
                </div>
              </div>
              
              {prediction.recommendations.length > 0 && (
                <div className="bg-white rounded-lg p-4 mt-4">
                  <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Recommandations
                  </p>
                  <ul className="space-y-1">
                    {prediction.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="text-sm text-gray-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <Calendar className="w-6 h-6 text-gray-400 mb-2 ml-auto" />
              <p className="text-sm text-gray-600">Concours dans</p>
              <p className="text-2xl font-bold text-gray-800">
                {prediction.daysUntilExam || 0} jours
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          {/* Sessions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Sessions</h3>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-4xl font-bold text-indigo-500">{stats.sessions || 15}</p>
            <p className="text-sm text-gray-500 mt-2">entraînements complétés</p>
          </div>

          {/* Progression */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Objectif</h3>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-purple-500 h-4 rounded-full transition-all"
                style={{ width: `${weeklyProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {stats.weeklyGoal.current}/{stats.weeklyGoal.questions} questions
            </p>
          </div>
        </div>

            {/* Recommandations KG */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                🧠 Recommandations Intelligentes (Knowledge Graph)
              </h2>
              <div className="space-y-3">
                {kgRecommendedThemes.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-sm border border-purple-100 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{rec.theme}</p>
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          rec.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {rec.priority === 'high' ? '🔥 Urgent' : rec.priority === 'medium' ? '⚡ Important' : '✓ Suggéré'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Concepts à Revoir */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-red-500" />
                Top 5 - Concepts à Revoir (Stats)
              </h2>
          <div className="space-y-4">
            {weakestThemes.map((theme, index) => (
              <div key={theme.theme} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800">{theme.theme}</span>
                    <span className="text-sm text-gray-600">{theme.accuracy.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        theme.accuracy >= 70 ? 'bg-green-500' : theme.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${theme.accuracy}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{theme.total} questions traitées</p>
                </div>
                <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors">
                  Réviser
                </button>
              </div>
            ))}
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


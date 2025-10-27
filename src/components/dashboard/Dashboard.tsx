import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, StatCard, CircularProgress } from '../ui';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/user';
import { ModuleRecommendationEngine } from '../../services/moduleRecommendationEngine';
import { SuccessPredictionEngine } from '../../services/successPredictionEngine';

interface DashboardProps {
  onStartSession: (mode: 'revision' | 'simulation') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartSession }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le profil utilisateur
    const profile = StorageService.getUserProfile();
    setUserProfile(profile);
    setLoading(false);

    // Cleanup automatique
    StorageService.cleanup();
  }, []);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-iade-blue-50 to-iade-purple-50">
        <div className="animate-spin w-12 h-12 border-4 border-iade-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getLevelBadge = (level: UserProfile['level']) => {
    const badges = {
      bronze: { icon: '🥉', label: 'Bronze', variant: 'warning' as const },
      silver: { icon: '🥈', label: 'Argent', variant: 'info' as const },
      gold: { icon: '🥇', label: 'Or', variant: 'warning' as const },
      platinum: { icon: '💎', label: 'Platine', variant: 'purple' as const },
    };
    return badges[level];
  };

  const levelBadge = getLevelBadge(userProfile.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-iade-blue-50 via-white to-iade-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-iade-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-iade-blue-600 to-iade-purple-600 bg-clip-text text-transparent">
                🧠 IADE Learning Core
              </h1>
              <p className="text-iade-gray-600 dark:text-gray-400 mt-1">Préparation Concours IADE 2025</p>
            </div>
            
            <Badge variant={levelBadge.variant} size="lg">
              {levelBadge.icon} {levelBadge.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Score Moyen"
            value={`${userProfile.averageScore}%`}
            icon={
              <svg className="w-6 h-6 text-iade-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            trend={{
              value: userProfile.progression10percent,
              label: 'vs. période précédente',
              positive: userProfile.progression10percent >= 0,
            }}
            variant={userProfile.averageScore >= 70 ? 'success' : 'default'}
          />

          <StatCard
            title="Sessions Complétées"
            value={userProfile.totalSessions}
            subtitle={`Depuis le ${new Date(userProfile.startDate).toLocaleDateString('fr-FR')}`}
            icon={
              <svg className="w-6 h-6 text-iade-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            }
          />

          <StatCard
            title="Streak"
            value={`${userProfile.streakDays} ${userProfile.streakDays > 1 ? 'jours' : 'jour'}`}
            subtitle={userProfile.streakDays >= 7 ? 'Excellent !' : 'Continuez !'}
            icon={<span className="text-2xl">🔥</span>}
            variant={userProfile.streakDays >= 7 ? 'success' : 'default'}
          />

          <StatCard
            title="Questions Vues"
            value={userProfile.questionsSeen.length}
            subtitle={`${userProfile.questionsToReview.length} à réviser`}
            icon={
              <svg className="w-6 h-6 text-iade-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Prédiction de Réussite */}
        {(() => {
          const examDate = new Date('2025-06-15'); // Date exemple du concours
          const prediction = SuccessPredictionEngine.predictSuccessRate(userProfile, examDate);
          
          return (
            <Card variant="elevated" padding="lg" className="mb-8 bg-gradient-to-br from-iade-purple-50 to-iade-blue-50 dark:from-iade-purple-900/20 dark:to-iade-blue-900/20 border-2 border-iade-purple-200 dark:border-iade-purple-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-iade-gray-900 dark:text-gray-100">
                  🎯 Prédiction de Réussite
                </h3>
                <Badge variant={
                  prediction.confidence === 'high' ? 'success' : 
                  prediction.confidence === 'medium' ? 'warning' : 
                  'default'
                }>
                  Confiance : {prediction.confidence === 'high' ? 'Élevée' : prediction.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                </Badge>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Jauge de probabilité */}
                <div className="flex-shrink-0">
                  <CircularProgress
                    value={prediction.probability}
                    size={160}
                    strokeWidth={12}
                    variant={
                      prediction.probability >= 80 ? 'success' : 
                      prediction.probability >= 70 ? 'warning' : 
                      'danger'
                    }
                    label="Probabilité"
                  />
                </div>
                
                {/* Détails */}
                <div className="flex-1">
                  <p className="text-sm text-iade-gray-600 dark:text-gray-400 mb-3">
                    {prediction.daysUntilExam && `J-${prediction.daysUntilExam} • `}
                    Basé sur {userProfile.totalSessions} sessions • Objectif : {prediction.targetScore}%
                  </p>
                  
                  {/* Top 3 facteurs */}
                  <div className="space-y-2 mb-4">
                    {prediction.factors.slice(0, 3).map((factor, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={`
                          ${factor.status === 'good' ? 'text-iade-green-600 dark:text-iade-green-400' : ''}
                          ${factor.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                          ${factor.status === 'critical' ? 'text-red-600 dark:text-red-400' : ''}
                        `}>
                          {factor.status === 'good' ? '✓' : factor.status === 'warning' ? '!' : '✗'}
                        </span>
                        <span className="text-iade-gray-700 dark:text-gray-300">
                          {factor.name}: <span className="font-semibold">{factor.contribution > 0 ? '+' : ''}{factor.contribution.toFixed(0)} pts</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Recommandations */}
                  {prediction.recommendations.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-iade-gray-700 dark:text-gray-300 mb-2">
                        💡 Recommandations :
                      </p>
                      <p className="text-xs text-iade-gray-600 dark:text-gray-400">
                        {prediction.recommendations[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Progression visuelle */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score global avec cercle */}
          <Card variant="elevated" padding="lg" className="text-center bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-iade-gray-900 dark:text-gray-100 mb-4">Votre Progression</h3>
            <div className="flex flex-col items-center justify-center mb-4">
              <CircularProgress
                value={userProfile.averageScore}
                size={140}
                strokeWidth={10}
                variant={userProfile.averageScore >= 70 ? 'success' : 'default'}
                label="Score global"
              />
            </div>
            <p className="text-sm text-iade-gray-600 dark:text-gray-400">
              {userProfile.averageScore >= 80 && 'Excellence ! Continuez sur cette lancée.'}
              {userProfile.averageScore >= 60 && userProfile.averageScore < 80 && 'Très bien ! Encore un effort.'}
              {userProfile.averageScore < 60 && 'Bon début ! La pratique fait la perfection.'}
            </p>
          </Card>

          {/* Achievements récents */}
          <Card variant="elevated" padding="lg" className="lg:col-span-2 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-iade-gray-900 dark:text-gray-100">Achievements</h3>
              <Badge variant="info">{userProfile.achievements.length} / 10</Badge>
            </div>
            
            {userProfile.achievements.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {userProfile.achievements.slice(0, 6).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center p-3 bg-iade-gray-50 dark:bg-gray-700 rounded-xl hover:bg-iade-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-3xl mb-2">{achievement.icon}</span>
                    <span className="text-xs font-medium text-iade-gray-700 dark:text-gray-300 text-center">
                      {achievement.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-iade-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-2">🏆</span>
                <p className="text-sm">Complétez des sessions pour débloquer des achievements !</p>
              </div>
            )}
          </Card>
        </div>

        {/* Zones faibles & recommandations */}
        {userProfile.weakAreas.length > 0 && (
          <Card variant="bordered" padding="lg" className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-iade-gray-900 dark:text-gray-100 mb-2">
                  Zones à renforcer
                </h3>
                <p className="text-sm text-iade-gray-600 dark:text-gray-400 mb-3">
                  Nos recommandations pour améliorer votre score :
                </p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.weakAreas.map((area, index) => (
                    <Badge key={index} variant="warning" size="md">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* CTA principal */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-iade-blue-500 to-iade-purple-600 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Prêt pour une nouvelle session ?</h2>
            <p className="text-white text-opacity-90 mb-6">
              Notre algorithme adaptatif génère des questions personnalisées selon votre niveau
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onStartSession('revision')}
                className="bg-white text-iade-blue-600 hover:bg-iade-gray-100 shadow-lg min-w-[200px]"
              >
                📚 Mode Révision
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onStartSession('simulation')}
                className="bg-white bg-opacity-20 text-white border-2 border-white hover:bg-opacity-30 backdrop-blur-sm min-w-[200px]"
              >
                ⏱️ Simulation Examen
              </Button>
            </div>

            <p className="text-xs text-white text-opacity-75 mt-4">
              10 questions • Intelligence adaptative • Feedback immédiat
            </p>
          </div>
        </Card>

        {/* Modules Recommandés */}
        <Card variant="elevated" padding="lg" className="mt-8 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-iade-gray-900 dark:text-gray-100">
              🎯 Modules Recommandés pour Vous
            </h3>
            <Badge variant="info">
              {ModuleRecommendationEngine.getProgressionStats(userProfile).overallCompletion}% complété
            </Badge>
          </div>
          
          <div className="space-y-3">
            {ModuleRecommendationEngine.getRecommendations(userProfile, 5).map((module, index) => (
              <div
                key={module.moduleId}
                className="p-4 bg-gradient-to-r from-iade-blue-50 to-iade-purple-50 dark:from-iade-blue-900/20 dark:to-iade-purple-900/20 rounded-xl border-2 border-iade-blue-100 dark:border-iade-blue-800 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-iade-blue-600 dark:text-iade-blue-400">
                        #{index + 1}
                      </span>
                      <h4 className="font-semibold text-iade-gray-900 dark:text-gray-100">
                        {module.moduleName}
                      </h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge 
                        variant={
                          module.importance === 'essentiel' ? 'danger' : 
                          module.importance === 'important' ? 'warning' : 
                          'default'
                        }
                        size="sm"
                      >
                        {module.importance === 'essentiel' ? '⭐ Essentiel' : 
                         module.importance === 'important' ? '💼 Important' : 
                         '📚 Complémentaire'}
                      </Badge>
                      
                      <Badge variant="info" size="sm">
                        {module.questionsCount} questions
                      </Badge>
                      
                      <Badge variant="default" size="sm">
                        ~{module.estimatedTime} min
                      </Badge>
                      
                      {!module.prerequisitesMet && (
                        <Badge variant="danger" size="sm">
                          ⚠️ Prérequis manquants
                        </Badge>
                      )}
                    </div>
                    
                    {/* Progression */}
                    {module.completionRate > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-iade-gray-600 dark:text-gray-400">Progression</span>
                          <span className="font-semibold text-iade-gray-900 dark:text-gray-100">
                            {module.completionRate}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-iade-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-iade-blue-500 to-iade-purple-500 transition-all"
                            style={{ width: `${module.completionRate}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Raisons */}
                    <div className="text-xs text-iade-gray-600 dark:text-gray-400 space-y-1">
                      {module.reasons.slice(0, 2).map((reason, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-iade-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-iade-gray-600 dark:text-gray-400 text-center">
              💡 Modules triés par pertinence selon votre profil et vos zones faibles
            </p>
          </div>
        </Card>

        {/* Historique récent */}
        {userProfile.recentScores.length > 0 && (
          <Card variant="elevated" padding="lg" className="mt-8 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-iade-gray-900 dark:text-gray-100 mb-4">Historique Récent</h3>
            <div className="space-y-3">
              {userProfile.recentScores.slice(-5).reverse().map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-iade-gray-50 dark:bg-gray-700 rounded-lg hover:bg-iade-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      session.score >= 70 ? 'bg-iade-green-100 dark:bg-iade-green-900/50 text-iade-green-700 dark:text-iade-green-400' :
                      session.score >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                    }`}>
                      {session.score}%
                    </div>
                    <div>
                      <p className="font-medium text-iade-gray-900 dark:text-gray-100">{session.theme}</p>
                      <p className="text-xs text-iade-gray-500 dark:text-gray-400">{new Date(session.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <Badge variant={session.score >= 70 ? 'success' : session.score >= 50 ? 'warning' : 'danger'}>
                    {session.score >= 70 ? '✓ Réussi' : session.score >= 50 ? '~ Moyen' : '✗ À revoir'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};


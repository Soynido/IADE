import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Flame, Star, BookOpen, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { StorageService, type UserProfile, type Achievement } from '../../services/storageService';
import { AchievementsEngine } from '../../services/achievementsEngine';
import { QuestionGeneratorV3 } from '../../services/questionGeneratorV3';
import { ModuleService, type Module } from '../../services/moduleService';

export interface DashboardV3ShadcnProps {
  onStartSession?: (mode: 'revision' | 'simulation') => void;
}

export const DashboardV3Shadcn: React.FC<DashboardV3ShadcnProps> = ({ onStartSession }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [predictions, setPredictions] = useState({ estimated: 50, confidence: 'low' as 'low' | 'medium' | 'high', reasoning: '' });
  const [recentModules, setRecentModules] = useState<Module[]>([]);

  useEffect(() => {
    // Charger le profil et les achievements
    const profile = StorageService.getUserProfile();
    setUserProfile(profile);
    
    // Vérifier les achievements
    const allAchievements = AchievementsEngine.getAllAchievements();
    setAchievements(allAchievements);
    
    // Prédire le prochain score
    try {
      const prediction = QuestionGeneratorV3.predictNextScore(profile as any);
      setPredictions(prediction as any);
    } catch (error) {
      console.warn('Erreur prédiction:', error);
    }
    
    // Charger les modules recommandés
    const recommended = ModuleService.getRecommendedModules(profile as any);
    setRecentModules(recommended);
  }, []);

  // Calculer les valeurs dérivées
  const currentXP = userProfile.totalSessions * 10; // 10 XP par session
  const nextLevelXP = (userProfile.totalSessions < 20) ? 200 : (userProfile.totalSessions < 50) ? 500 : 1000;
  const level = userProfile.level === 'bronze' ? 1 : userProfile.level === 'silver' ? 2 : userProfile.level === 'gold' ? 3 : 4;
  const streakDays = userProfile.streakDays;
  const averageScore = userProfile.averageScore;
  const totalSessions = userProfile.totalSessions;
  const questionsSeen = userProfile.questionsSeen.length;

  const xpProgress = (currentXP / nextLevelXP) * 100;
  
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const nextAchievement = achievements.find(a => !a.unlockedAt && a.progress > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* XP Bar Sticky */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 border-2 border-blue-500">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg">
                    {level}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-gray-900">Niveau {level}</p>
                  <p className="text-xs text-gray-500">{currentXP}/{nextLevelXP} XP</p>
                </div>
              </div>
              <Progress value={xpProgress} className="w-40 h-2" />
            </div>
            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-700">{streakDays} jours 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* CTA Hero - Priorité 1 */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Prêt pour le concours IADE 2025 ?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Entraînement adaptatif et personnalisé pour maximiser vos chances de réussite
            </p>
          </div>

          {/* CTA Buttons - Plus gros et plus visibles */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => onStartSession?.('revision')}
              className="h-20 px-12 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200"
            >
              <BookOpen className="mr-3 h-7 w-7" />
              Démarrer une révision
            </Button>
            <Button
              size="lg"
              onClick={() => onStartSession?.('simulation')}
              className="h-20 px-12 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 transition-all duration-200"
            >
              <Target className="mr-3 h-7 w-7" />
              Simulation examen
            </Button>
          </div>

          <p className="text-sm text-gray-500 pt-2">
            ⚡ 10 questions • 🎯 Intelligence adaptative • 📊 Feedback immédiat
          </p>
        </div>

        {/* Stats Grid - Priorité 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Global */}
          <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    stroke={averageScore >= 70 ? '#10b981' : averageScore >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - averageScore / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{averageScore}%</div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                </div>
              </div>
              <Badge className="text-lg px-4 py-1">
                {userProfile.level === 'platinum' && '💎 Platine'}
                {userProfile.level === 'gold' && '🥇 Or'}
                {userProfile.level === 'silver' && '🥈 Argent'}
                {userProfile.level === 'bronze' && '🥉 Bronze'}
              </Badge>
              <p className="text-sm text-gray-500 mt-3 text-center">
                {averageScore >= 80 && '🌟 Excellence !'}
                {averageScore >= 60 && averageScore < 80 && '👍 Très bien !'}
                {averageScore < 60 && '💪 Bon début !'}
              </p>
            </CardContent>
          </Card>

          {/* Autres stats */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-blue-700 mb-2">{totalSessions}</div>
              <div className="text-sm font-medium text-blue-600">Sessions Complétées</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-green-700 mb-2">{questionsSeen}</div>
              <div className="text-sm font-medium text-green-600">Questions Vues</div>
            </CardContent>
          </Card>
        </div>

        {/* Modules - Priorité 3 */}
        {recentModules.length > 0 && (
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-blue-600" />
                  Vos Modules en Cours
                </CardTitle>
                <Button
                  onClick={() => navigate('/quiz/revision')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Voir tous
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentModules.map((module) => {
                  const progressPercent = module.questionsCount > 0
                    ? (module.userProgress.questionsSeenCount / module.questionsCount) * 100
                    : 0;

                  return (
                    <button
                      key={module.id}
                      onClick={() => navigate(`/quiz/revision/${module.id}`)}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{module.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm">{module.title}</h3>
                          <p className="text-xs text-gray-600">
                            {module.userProgress.questionsSeenCount} / {module.questionsCount} questions
                          </p>
                        </div>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      {module.userProgress.averageScore > 0 && (
                        <p className="text-xs text-gray-600 mt-2">
                          Moyenne : <span className="font-bold text-blue-700">{module.userProgress.averageScore}%</span>
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements - Priorité 4 */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-500" />
              Vos Achievements ({unlockedAchievements.length}/{achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unlockedAchievements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 animate-bounce">🏆</div>
                <p className="text-lg text-gray-600 font-medium">
                  Complétez vos premières sessions pour débloquer des achievements !
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  🎯 Première session • 🔥 Streak 7 jours • ⭐ 100 questions • 💯 Score parfait
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {unlockedAchievements.slice(0, 5).map((ach) => (
                    <div key={ach.id} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                      <div className="text-4xl mb-2">{ach.icon}</div>
                      <p className="text-xs font-semibold text-gray-900">{ach.title}</p>
                    </div>
                  ))}
                </div>
                {nextAchievement && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Prochain : {nextAchievement.title}
                    </p>
                    <Progress value={nextAchievement.progress} className="h-2 mb-2" />
                    <p className="text-xs text-gray-600">{Math.round(nextAchievement.progress)}% complété</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progression Tips & Predictions */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-8 w-8 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Analyse & Recommandations</h3>
                
                {/* Prédiction */}
                {totalSessions >= 3 && (
                  <div className="bg-white/60 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-1">Score estimé prochaine session</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-purple-700">{predictions.estimated}%</span>
                      <Badge className="text-xs">
                        Confiance: {predictions.confidence === 'high' ? 'Élevée' : predictions.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{predictions.reasoning}</p>
                  </div>
                )}
                
                {/* Conseils */}
                <div className="space-y-2">
                  {QuestionGeneratorV3.analyzeErrorPatterns(userProfile).recommendations.map((rec, i) => (
                    <p key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>{rec}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

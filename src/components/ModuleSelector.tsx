import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/progress';
import { ModuleService, type Module } from '../services/moduleService';
import { ArrowLeft, BookOpen, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const ModuleSelector: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [stats, setStats] = useState({
    totalModules: 0,
    startedModules: 0,
    masteredModules: 0,
    averageCompletion: 0,
  });

  useEffect(() => {
    // Charger les modules
    const allModules = ModuleService.getAllModules();
    setModules(allModules);
    
    // Charger les stats
    const moduleStats = ModuleService.getModulesStats();
    setStats(moduleStats);
  }, []);

  const handleSelectModule = (moduleId: string) => {
    navigate(`/quiz/revision/${moduleId}`);
  };

  const getStatusBadge = (module: Module) => {
    switch (module.status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Nouveau</Badge>;
      case 'to_review':
        return <Badge className="bg-red-100 text-red-700 border-red-200">À revoir</Badge>;
      case 'mastered':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Maîtrisé</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">En cours</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Choisir un module</h1>
              <p className="text-sm text-gray-600">Sélectionnez un module à réviser</p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats globales */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-700">{stats.totalModules}</div>
              <div className="text-sm text-gray-600">Modules totaux</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-700">{stats.startedModules}</div>
              <div className="text-sm text-gray-600">Commencés</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{stats.masteredModules}</div>
              <div className="text-sm text-gray-600">Maîtrisés</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-700">{stats.averageCompletion}%</div>
              <div className="text-sm text-gray-600">Progression</div>
            </CardContent>
          </Card>
        </div>

        {/* Modules recommandés */}
        {modules.filter(m => m.recommended).length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                Modules recommandés pour vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {modules.filter(m => m.recommended).slice(0, 3).map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleSelectModule(module.id)}
                    className="bg-white p-4 rounded-xl border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">{module.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">{module.title}</h3>
                        <p className="text-xs text-gray-600">
                          {module.userProgress.questionsSeenCount} / {module.questionsCount} questions
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tous les modules */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Tous les modules ({modules.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const progressPercent = module.questionsCount > 0
                  ? (module.userProgress.questionsSeenCount / module.questionsCount) * 100
                  : 0;

                return (
                  <button
                    key={module.id}
                    onClick={() => handleSelectModule(module.id)}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-2xl transition-all duration-200 text-left group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{module.icon}</div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(module)}
                        {module.recommended && (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                            <Sparkles className="h-3 w-3 inline mr-1" />
                            Recommandé
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Titre */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>

                    {/* Stats */}
                    <div className="space-y-3">
                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progression</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {isNaN(progressPercent) ? 0 : Math.round(progressPercent)}%
                          </span>
                        </div>
                        <Progress value={isNaN(progressPercent) ? 0 : progressPercent} className="h-2" />
                      </div>

                      {/* Questions */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Questions</span>
                        <span className="font-semibold text-gray-900">
                          {module.userProgress.questionsSeenCount} / {module.questionsCount}
                        </span>
                      </div>

                      {/* Score moyen */}
                      {module.userProgress.averageScore > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Score moyen</span>
                          <span className={`font-bold ${
                            module.userProgress.averageScore >= 70 
                              ? 'text-green-600' 
                              : module.userProgress.averageScore >= 50 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                          }`}>
                            {module.userProgress.averageScore}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                        <BookOpen className="h-4 w-4" />
                        Réviser ce module
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModuleSelector;


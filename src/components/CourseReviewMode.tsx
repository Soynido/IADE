import { useState } from 'react';
import { Book, Search, ChevronRight, Clock, Target, BookOpen } from 'lucide-react';
import modulesDependencies from '../data/modulesDependencies.json';

interface Module {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  importance: string;
  estimatedTime: number;
  themes: string[];
  prerequisites: string[];
}

export default function CourseReviewMode() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<'debutant' | 'intensif' | 'revision'>('debutant');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Transformer les données du JSON en modules structurés
  const modules: Module[] = Object.entries(modulesDependencies.modules).map(([id, data]: [string, any]) => ({
    id,
    name: id.replace(/module_\d+_/, '').replace(/_/g, ' ').toUpperCase(),
    description: `Module ${data.importance} - ${data.themes.join(', ')}`,
    difficulty: data.difficulty,
    importance: data.importance,
    estimatedTime: data.estimatedTime,
    themes: data.themes,
    prerequisites: data.prerequisites || []
  }));

  // Filtrer les modules selon la recherche
  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.themes.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Obtenir l'ordre recommandé selon le parcours sélectionné
  const learningPath = modulesDependencies.learningPaths[selectedPath];
  const orderedModules = learningPath.recommendedOrder
    .map(moduleId => modules.find(m => m.id === moduleId))
    .filter(Boolean) as Module[];

  const displayModules = searchQuery ? filteredModules : orderedModules;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceIcon = (importance: string) => {
    if (importance === 'essentiel') return '⭐⭐⭐';
    if (importance === 'important') return '⭐⭐';
    return '⭐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center gap-3">
            <Book className="w-10 h-10" />
            📚 Mode Révision - Cours IADE
          </h1>
          <p className="text-gray-600 text-lg">
            Explorez les modules de cours structurés pour le concours IADE
          </p>
        </div>

        {/* Parcours de formation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Choisir un parcours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['debutant', 'intensif', 'revision'] as const).map(path => (
              <button
                key={path}
                onClick={() => setSelectedPath(path)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedPath === path
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="font-bold text-lg mb-1">
                  {modulesDependencies.learningPaths[path].name}
                </div>
                <div className="text-sm text-gray-600">
                  {modulesDependencies.learningPaths[path].description}
                </div>
                <div className="text-xs text-indigo-600 mt-2 font-medium">
                  {modulesDependencies.learningPaths[path].recommendedOrder.length} modules
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un module ou un thème (ex: Pharmacologie, Neurologie...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Liste des modules */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            {searchQuery ? `Résultats (${displayModules.length})` : learningPath.name}
          </h2>

          {displayModules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Aucun module trouvé pour "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayModules.map((module, index) => (
                <div
                  key={module.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-indigo-600">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800">
                          {module.name}
                        </h3>
                        <span className="text-xl">
                          {getImportanceIcon(module.importance)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{module.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {module.themes.map(theme => (
                          <span
                            key={theme}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {module.estimatedTime} min
                        </span>
                        {module.prerequisites.length > 0 && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Target className="w-4 h-4" />
                            {module.prerequisites.length} prérequis
                          </span>
                        )}
                      </div>

                      {/* Détails étendus */}
                      {selectedModule === module.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-bold text-gray-800 mb-2">📖 Contenu du module</h4>
                          <p className="text-gray-600 mb-3">
                            Ce module couvre les concepts essentiels en {module.themes.join(', ').toLowerCase()}.
                            Il est recommandé de prévoir environ {module.estimatedTime} minutes pour l'étudier complètement.
                          </p>

                          {module.prerequisites.length > 0 && (
                            <div className="mb-3">
                              <h4 className="font-bold text-gray-800 mb-2">🎯 Prérequis</h4>
                              <ul className="list-disc list-inside text-gray-600">
                                {module.prerequisites.map(prereqId => {
                                  const prereq = modules.find(m => m.id === prereqId);
                                  return prereq ? (
                                    <li key={prereqId}>{prereq.name}</li>
                                  ) : null;
                                })}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-3 mt-4">
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                              Commencer le module
                            </button>
                            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                              Voir les questions
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <ChevronRight
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        selectedModule === module.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{modules.length}</div>
            <div className="text-gray-600">Modules disponibles</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {Math.round(modules.reduce((sum, m) => sum + m.estimatedTime, 0) / 60)}h
            </div>
            <div className="text-gray-600">Temps total estimé</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {modules.filter(m => m.importance === 'essentiel').length}
            </div>
            <div className="text-gray-600">Modules essentiels</div>
          </div>
        </div>
      </div>
    </div>
  );
}

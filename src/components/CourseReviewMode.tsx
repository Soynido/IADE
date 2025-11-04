/**
 * Mode Révision - Navigation simplifiée par catégorie
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Search, ChevronRight, Clock, CheckCircle, AlertCircle, Circle, BookOpen } from 'lucide-react';
import { StorageService } from '../services/storageService';
import modulesDependencies from '../data/modulesDependencies.json';

interface Module {
  id: string;
  name: string;
  difficulty: string;
  importance: string;
  estimatedTime: number;
  themes: string[];
}

export default function CourseReviewMode() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const profile = StorageService.getUserProfile();

  // Transformer les données en modules
  const modules: Module[] = Object.entries(modulesDependencies.modules).map(([id, data]: [string, any]) => ({
    id,
    name: id.replace(/module_\d+_/, '').replace(/_/g, ' '),
    difficulty: data.difficulty,
    importance: data.importance,
    estimatedTime: data.estimatedTime,
    themes: data.themes || [],
  }));

  // Extraire les catégories uniques
  const allCategories = ['Tous', ...Array.from(new Set(modules.flatMap(m => m.themes)))];

  // Filtrer les modules
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.themes.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Tous' || module.themes.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Calculer le statut du module
  const getModuleStatus = (moduleId: string): 'maitrise' | 'vu' | 'non-vu' => {
    const stats = StorageService.getModuleStats(moduleId);
    if (stats.questionsSeenCount === 0) return 'non-vu';
    if (stats.averageScore >= 80) return 'maitrise';
    return 'vu';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'maitrise': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'vu': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'maitrise': return 'Maîtrisé';
      case 'vu': return 'À revoir';
      default: return 'Non vu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'maitrise': return 'bg-green-50 text-green-700 border-green-200';
      case 'vu': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2">
            ← Retour au dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-blue-600" />
            Mode Révision - Cours IADE
          </h1>
          <p className="text-gray-600 text-lg">
            Explorez les modules par catégorie et lancez des révisions ciblées
          </p>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Catégories</h2>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des modules */}
        <div className="space-y-4">
          {filteredModules.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500">Aucun module trouvé</p>
            </div>
          ) : (
            filteredModules.map(module => {
              const status = getModuleStatus(module.id);
              const stats = StorageService.getModuleStats(module.id);

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(status)}
                        <h3 className="text-xl font-bold text-gray-800">{module.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {module.themes.map(theme => (
                          <span
                            key={theme}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {module.estimatedTime} min
                        </span>
                        {stats.questionsSeenCount > 0 && (
                          <span>
                            {stats.questionsSeenCount} questions vues · Score: {stats.averageScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      to={`/quiz/revision/${module.id}`}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                    >
                      Commencer la révision (10 QCM)
                    </Link>
                    {module.themes[0] && (
                      <button
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        title="Voir le cours PDF"
                      >
                        📖 Voir le cours
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats footer */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {modules.filter(m => getModuleStatus(m.id) === 'maitrise').length}
            </div>
            <div className="text-sm text-gray-600">Modules maîtrisés</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {modules.filter(m => getModuleStatus(m.id) === 'vu').length}
            </div>
            <div className="text-sm text-gray-600">Modules à revoir</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {modules.filter(m => getModuleStatus(m.id) === 'non-vu').length}
            </div>
            <div className="text-sm text-gray-600">Modules non vus</div>
          </div>
        </div>
      </div>
    </div>
  );
}

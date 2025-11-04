/**
 * Mode Révision - Legacy IADE visual style
 * Colors: #F2662F primary, #F4F7F9 background
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Search, ChevronRight, Clock, CheckCircle, AlertCircle, Circle, BookOpen, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F4F7F9] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-gray-600 hover:text-[#F2662F] mb-4 inline-flex items-center gap-2 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 mt-4 flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
            <BookOpen className="w-10 h-10 text-[#F2662F]" />
            Mode Révision
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Parcourez les modules par catégorie et révisez les concepts
          </p>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F2662F] focus:outline-none text-base transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Catégories
          </h2>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[#F2662F] to-[#e85a29] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des modules */}
        <div className="space-y-4 mb-8">
          {filteredModules.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Aucun module trouvé
              </p>
            </div>
          ) : (
            filteredModules.map(module => {
              const status = getModuleStatus(module.id);
              const stats = StorageService.getModuleStats(module.id);

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(status)}
                        <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {module.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {module.themes.map(theme => (
                          <span
                            key={theme}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
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
                          <span className="font-medium">
                            {stats.questionsSeenCount} questions · Score: {stats.averageScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      to={`/quiz/revision/${module.id}`}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F2662F] to-[#e85a29] text-white rounded-xl hover:shadow-lg transition-all font-bold text-center"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Commencer la révision (10 QCM)
                    </Link>
                    {module.themes[0] && (
                      <button
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
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
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {modules.filter(m => getModuleStatus(m.id) === 'maitrise').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Modules maîtrisés</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100">
            <div className="text-3xl font-bold text-yellow-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {modules.filter(m => getModuleStatus(m.id) === 'vu').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Modules à revoir</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100">
            <div className="text-3xl font-bold text-gray-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {modules.filter(m => getModuleStatus(m.id) === 'non-vu').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Modules non vus</div>
          </div>
        </div>
      </div>
    </div>
  );
}

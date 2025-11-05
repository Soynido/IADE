/**
 * Course Review Mode MVP - Legacy IADE Style
 */

import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function CourseReviewMode() {
  return (
    <div className="min-h-screen bg-[#F4F7F9] p-6 font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            <BookOpen className="w-10 h-10 text-[#F2662F]" />
            📚 Mode Révision
          </h1>
          <Link
            to="/"
            className="px-6 py-3 bg-white text-[#F2662F] rounded-xl font-semibold hover:bg-orange-50 transition-colors duration-300 flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <div className="text-8xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Mode Révision - Prochainement
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ce mode vous permettra d'explorer les modules de cours de manière structurée.
            <br />
            En attendant, essayez le <strong>Mode Entraînement</strong> pour commencer à pratiquer !
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/entrainement"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
            >
              💪 Mode Entraînement
            </Link>
            <Link
              to="/concours"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all text-lg"
            >
              🎯 Concours Blanc
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { StorageService } from '../services/storageService';
import { BookOpen, Target, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  // Terminer l'onboarding et créer le profil
  const completeOnboarding = () => {
    // Créer le profil utilisateur avec valeurs par défaut
    StorageService.initializeUserProfile();
    StorageService.setOnboarded(true);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Welcome Screen */}
        <Card className="bg-white shadow-2xl border-0 animate-fade-in">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="text-6xl mb-4">🧠</div>
            <CardTitle className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bienvenue sur IADE Learning !
            </CardTitle>
            <p className="text-xl text-gray-600">
              Votre compagnon d'entraînement adaptatif pour le concours IADE 2025
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-6 rounded-xl text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Intelligence Adaptative</h3>
                <p className="text-sm text-gray-600">
                  Les questions s'adaptent à votre niveau en temps réel
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Questions Brillantes</h3>
                <p className="text-sm text-gray-600">
                  Plus de 1000 questions générées par IA et validées
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl text-center">
                <Zap className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Feedback Immédiat</h3>
                <p className="text-sm text-gray-600">
                  Comprenez vos erreurs avec des explications détaillées
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Commencez votre entraînement
              </h3>
              <p className="text-gray-700">
                Accédez immédiatement à toutes les fonctionnalités : révisions, simulations, et dashboard de progression.
              </p>
            </div>

            <Button
              onClick={completeOnboarding}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl"
            >
              C'est parti ! 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

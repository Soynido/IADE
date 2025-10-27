import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/progress';
import { StorageService } from '../services/storageService';
import { QuestionGenerator } from '../services/questionGenerator';
import { BookOpen, Target, Zap, CheckCircle2 } from 'lucide-react';
import type { Question, UserStats } from '../types/pathology';

interface OnboardingProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'diagnostic' | 'results';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Initialiser les questions diagnostiques
  const startDiagnostic = () => {
    const initialStats: UserStats = {
      totalSessions: 0,
      // questionsSeen: [],
      averageScore: 50,
      lastSession: new Date().toISOString(),
      streakDays: 0,
      weakAreas: [],
      recentScores: [],
      progression10percent: 0,
    };
    
    const session = QuestionGenerator.startLearningSession(initialStats, 5);
    setDiagnosticQuestions(session.questions);
    setCurrentStep('diagnostic');
  };

  // Valider une réponse
  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    const currentQuestion = diagnosticQuestions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[selectedOption] === currentQuestion.correct;
    
    setAnswers([...answers, isCorrect]);
    
    if (currentQuestionIndex < diagnosticQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Quiz terminé
      finalizeDiagnostic();
    }
  };

  // Finaliser le diagnostic et créer le profil
  const finalizeDiagnostic = () => {
    const correctCount = answers.filter(a => a).length;
    const score = Math.round((correctCount / diagnosticQuestions.length) * 100);
    
    // Déterminer le niveau initial
    let initialLevel: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (score >= 80) initialLevel = 'gold';
    else if (score >= 60) initialLevel = 'silver';
    
    // Créer le profil utilisateur
    const profile = StorageService.initializeUserProfile();
    StorageService.updateUserProfile({
      level: initialLevel,
      averageScore: score,
    });
    
    setCurrentStep('results');
  };

  // Terminer l'onboarding
  const completeOnboarding = () => {
    StorageService.setOnboarded(true);
    onComplete();
  };

  const progress = currentStep === 'welcome' ? 0 : currentStep === 'diagnostic' 
    ? ((currentQuestionIndex + 1) / (diagnosticQuestions.length + 1)) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Progress Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
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
                  <h3 className="font-bold text-gray-900 mb-2">Gamification</h3>
                  <p className="text-sm text-gray-600">
                    Débloquez des achievements et progressez par niveaux
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

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Commençons par évaluer votre niveau
                </h3>
                <p className="text-gray-700">
                  Répondez à 5 questions pour que nous puissions personnaliser votre expérience d'apprentissage.
                </p>
              </div>

              <Button
                onClick={startDiagnostic}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl"
              >
                C'est parti ! 🚀
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Diagnostic Quiz Step */}
        {currentStep === 'diagnostic' && diagnosticQuestions.length > 0 && (
          <Card className="bg-white shadow-2xl border-0 animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Question {currentQuestionIndex + 1} / {diagnosticQuestions.length}
                </CardTitle>
                <div className="text-sm font-semibold text-gray-500">
                  Quiz diagnostique
                </div>
              </div>
              <Progress 
                value={((currentQuestionIndex) / diagnosticQuestions.length) * 100} 
                className="h-2" 
              />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                <p className="text-lg font-semibold text-gray-900">
                  {diagnosticQuestions[currentQuestionIndex].question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {diagnosticQuestions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        selectedOption === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bouton Valider */}
              <Button
                onClick={handleAnswer}
                disabled={selectedOption === null}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex < diagnosticQuestions.length - 1 ? 'Suivant' : 'Terminer'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <Card className="bg-white shadow-2xl border-0 animate-fade-in">
            <CardHeader className="text-center space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-3xl font-black text-gray-900">
                Votre profil est créé !
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl text-center">
                <p className="text-sm text-gray-600 mb-2">Score du quiz diagnostique</p>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {Math.round((answers.filter(a => a).length / diagnosticQuestions.length) * 100)}%
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  {answers.filter(a => a).length} / {diagnosticQuestions.length} bonnes réponses
                </p>
              </div>

              {/* Niveau */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">
                    {(() => {
                      const score = (answers.filter(a => a).length / diagnosticQuestions.length) * 100;
                      if (score >= 80) return '🥇';
                      if (score >= 60) return '🥈';
                      return '🥉';
                    })()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Votre niveau initial</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const score = (answers.filter(a => a).length / diagnosticQuestions.length) * 100;
                        if (score >= 80) return 'Or - Avancé';
                        if (score >= 60) return 'Argent - Intermédiaire';
                        return 'Bronze - Débutant';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Recommandations pour vous
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {(() => {
                    const score = (answers.filter(a => a).length / diagnosticQuestions.length) * 100;
                    if (score >= 80) {
                      return [
                        '✅ Excellente base ! Concentrez-vous sur les questions difficiles',
                        '📚 Explorez tous les modules pour approfondir vos connaissances',
                        '🎯 Visez le mode simulation examen pour vous challenger',
                      ];
                    } else if (score >= 60) {
                      return [
                        '👍 Bon niveau ! Commencez par le mode révision',
                        '📈 Identifiez vos zones faibles et renforcez-les',
                        '🔥 Maintenez un streak quotidien pour progresser',
                      ];
                    }
                    return [
                      '💪 Pas de souci ! Tout le monde commence quelque part',
                      '📚 Commencez par les questions faciles en mode révision',
                      '⏰ Prenez votre temps pour lire les explications',
                    ];
                  })().map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Button
                onClick={completeOnboarding}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-xl"
              >
                Commencer l'entraînement ! 🚀
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

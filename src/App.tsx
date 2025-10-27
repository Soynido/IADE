import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { DashboardV3Shadcn } from './components/dashboard/DashboardV3Shadcn'
import { Onboarding } from './components/Onboarding'
import { ModuleSelector } from './components/ModuleSelector'
import QuizSessionV3 from './components/QuizSessionV3'
import { StorageService } from './services/storageService'
import './App.css'

function MainApp() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur doit voir l'onboarding
    setShowOnboarding(!StorageService.isOnboarded());
  }, []);

  const handleStartSession = useCallback((mode: 'revision' | 'simulation') => {
    console.log('🚀 Démarrage session:', mode);
    navigate(`/quiz/${mode}`);
  }, [navigate]);

  // const handleReturnToDashboard = useCallback(() => {
  //   console.log('🏠 Retour dashboard');
  //   navigate('/');
  // }, [navigate]);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Si onboarding non complété, afficher l'onboarding
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Routes>
      {/* Dashboard V3 Shadcn */}
      <Route path="/" element={
        <DashboardV3Shadcn onStartSession={handleStartSession} />
      } />
      
      {/* Sélection de module pour révision */}
      <Route path="/quiz/revision" element={
        <ModuleSelector />
      } />
      
      {/* Quiz Session - Révision d'un module spécifique */}
      <Route path="/quiz/revision/:moduleId" element={
        <QuizSessionV3 mode="revision" />
      } />
      
      {/* Quiz Session - Mode Simulation */}
      <Route path="/quiz/simulation" element={
        <QuizSessionV3 mode="simulation" />
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App

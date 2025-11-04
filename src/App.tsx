import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { Onboarding } from './components/Onboarding'
import ProgressDashboard from './components/ProgressDashboard'
import CourseReviewMode from './components/CourseReviewMode'
import TrainingMode from './components/TrainingMode'
import ExamSimulationMode from './components/ExamSimulationMode'
import { StorageService } from './services/storageService'
import { BugReportButton } from './components/BugReportButton'
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
      {/* Main Dashboard */}
      <Route path="/" element={<ProgressDashboard />} />
      
      {/* 3 Core Modes */}
      <Route path="/cours" element={<CourseReviewMode />} />
      <Route path="/entrainement" element={<TrainingMode />} />
      <Route path="/concours" element={<ExamSimulationMode />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
      <BugReportButton />
    </Router>
  );
}

export default App

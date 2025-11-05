import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProgressDashboard from './components/ProgressDashboard'
import CourseReviewMode from './components/CourseReviewMode'
import TrainingMode from './components/TrainingMode'
import ExamSimulationMode from './components/ExamSimulationMode'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={<ProgressDashboard />} />
        
        {/* 3 Core Modes */}
        <Route path="/cours" element={<CourseReviewMode />} />
        <Route path="/entrainement" element={<TrainingMode />} />
        <Route path="/concours" element={<ExamSimulationMode />} />
      </Routes>
    </Router>
  );
}

export default App

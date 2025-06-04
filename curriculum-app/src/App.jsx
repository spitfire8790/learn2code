import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PhaseView from './components/PhaseView';
import ModuleView from './components/ModuleView';
import ProgressProvider from './context/ProgressContext';
import { curriculumData } from './data/curriculumData';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <ProgressProvider>
      <Router>
        <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
          <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navigation 
              curriculumTitle={curriculumData.title}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
            
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route 
                  path="/" 
                  element={<Dashboard curriculumData={curriculumData} />} 
                />
                <Route 
                  path="/phase/:phaseId" 
                  element={<PhaseView curriculumData={curriculumData} />} 
                />
                <Route 
                  path="/phase/:phaseId/module/:moduleId" 
                  element={<ModuleView curriculumData={curriculumData} />} 
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ProgressProvider>
  );
}

export default App; 
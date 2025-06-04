import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Code } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PhaseView from './components/PhaseView';
import ModuleView from './components/ModuleView';
import LoginModal from './components/LoginModal';
import ProgressPage from './components/ProgressPage';
import CodeIDE from './components/CodeIDE';
import ProgressProvider from './context/ProgressContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { curriculumData } from './data/curriculumData';

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    // Set favicon
    const faviconLink = document.getElementById('favicon-link');
    if (faviconLink) {
      const svgString = renderToStaticMarkup(<Code size={32} color={darkMode ? 'white' : 'black'} />);
      const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;
      faviconLink.href = dataUri;
    }

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

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
              isAuthenticated={isAuthenticated}
              user={user}
              onLogin={() => setShowLoginModal(true)}
              onLogout={logout}
            />
            
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route 
                  path="/" 
                  element={<Dashboard curriculumData={curriculumData} />} 
                />
                <Route 
                  path="/progress" 
                  element={<ProgressPage curriculum={curriculumData} />} 
                />
                <Route 
                  path="/ide" 
                  element={<CodeIDE />} 
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
            
            {/* Login Modal */}
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
            />
          </div>
        </div>
      </Router>
    </ProgressProvider>
  );
}

// Main App component with AuthProvider wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 
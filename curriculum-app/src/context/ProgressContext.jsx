import { createContext, useContext, useState, useEffect } from 'react';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({});
  const [completedModules, setCompletedModules] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());

  // Load progress from localStorage on initial load
  useEffect(() => {
    const savedProgress = localStorage.getItem('curriculumProgress');
    const savedCompleted = localStorage.getItem('completedModules');
    const savedBookmarks = localStorage.getItem('bookmarks');

    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
    if (savedCompleted) {
      setCompletedModules(new Set(JSON.parse(savedCompleted)));
    }
    if (savedBookmarks) {
      setBookmarks(new Set(JSON.parse(savedBookmarks)));
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('curriculumProgress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('completedModules', JSON.stringify([...completedModules]));
  }, [completedModules]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify([...bookmarks]));
  }, [bookmarks]);

  const updateModuleProgress = (moduleId, sectionId, completed = true) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [sectionId]: completed
      }
    }));
  };

  const markModuleComplete = (moduleId) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  const markModuleIncomplete = (moduleId) => {
    setCompletedModules(prev => {
      const newSet = new Set(prev);
      newSet.delete(moduleId);
      return newSet;
    });
  };

  const toggleBookmark = (moduleId) => {
    setBookmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getModuleProgress = (moduleId) => {
    return progress[moduleId] || {};
  };

  const getPhaseProgress = (phaseModules) => {
    const completed = phaseModules.filter(module => 
      completedModules.has(module.id)
    ).length;
    return {
      completed,
      total: phaseModules.length,
      percentage: phaseModules.length > 0 ? (completed / phaseModules.length) * 100 : 0
    };
  };

  const getTotalProgress = (allPhases) => {
    const totalModules = allPhases.reduce((acc, phase) => acc + phase.modules.length, 0);
    const completedCount = completedModules.size;
    return {
      completed: completedCount,
      total: totalModules,
      percentage: totalModules > 0 ? (completedCount / totalModules) * 100 : 0
    };
  };

  const resetProgress = () => {
    setProgress({});
    setCompletedModules(new Set());
    setBookmarks(new Set());
    localStorage.removeItem('curriculumProgress');
    localStorage.removeItem('completedModules');
    localStorage.removeItem('bookmarks');
  };

  const value = {
    progress,
    completedModules,
    bookmarks,
    updateModuleProgress,
    markModuleComplete,
    markModuleIncomplete,
    toggleBookmark,
    getModuleProgress,
    getPhaseProgress,
    getTotalProgress,
    resetProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressProvider; 
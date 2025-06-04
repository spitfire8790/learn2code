import { createContext, useContext, useReducer, useEffect } from 'react';

// Auth context for localStorage-based authentication
const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  progress: {},
  bookmarks: [],
  settings: {
    theme: 'light',
    notifications: true,
    autoSave: true
  }
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        progress: action.payload.progress || {},
        bookmarks: action.payload.bookmarks || [],
        settings: { ...state.settings, ...action.payload.settings }
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    
    case 'UPDATE_PROGRESS':
      const newProgress = { ...state.progress, ...action.payload };
      return { ...state, progress: newProgress };
    
    case 'ADD_BOOKMARK':
      const newBookmarks = [...state.bookmarks];
      if (!newBookmarks.some(b => b.id === action.payload.id)) {
        newBookmarks.push(action.payload);
      }
      return { ...state, bookmarks: newBookmarks };
    
    case 'REMOVE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter(b => b.id !== action.payload)
      };
    
    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      return { ...state, settings: newSettings };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user data from localStorage on initialization
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('curriculum_user');
        const progressData = localStorage.getItem('curriculum_progress');
        const bookmarksData = localStorage.getItem('curriculum_bookmarks');
        const settingsData = localStorage.getItem('curriculum_settings');

        if (userData) {
          const user = JSON.parse(userData);
          const progress = progressData ? JSON.parse(progressData) : {};
          const bookmarks = bookmarksData ? JSON.parse(bookmarksData) : [];
          const settings = settingsData ? JSON.parse(settingsData) : {};

          dispatch({
            type: 'LOGIN',
            payload: { user, progress, bookmarks, settings }
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUserData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!state.loading && state.isAuthenticated) {
      try {
        localStorage.setItem('curriculum_user', JSON.stringify(state.user));
        localStorage.setItem('curriculum_progress', JSON.stringify(state.progress));
        localStorage.setItem('curriculum_bookmarks', JSON.stringify(state.bookmarks));
        localStorage.setItem('curriculum_settings', JSON.stringify(state.settings));
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }
  }, [state.user, state.progress, state.bookmarks, state.settings, state.loading, state.isAuthenticated]);

  const login = (userData) => {
    const user = {
      id: userData.email, // Use email as unique ID
      name: userData.name,
      email: userData.email,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    dispatch({
      type: 'LOGIN',
      payload: { user, progress: {}, bookmarks: [], settings: {} }
    });

    return Promise.resolve(user);
  };

  const logout = () => {
    localStorage.removeItem('curriculum_user');
    localStorage.removeItem('curriculum_progress');
    localStorage.removeItem('curriculum_bookmarks');
    localStorage.removeItem('curriculum_settings');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProgress = (moduleId, progressData) => {
    const progress = {
      [moduleId]: {
        ...progressData,
        lastAccessed: new Date().toISOString()
      }
    };
    dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
  };

  const markModuleComplete = (moduleId) => {
    updateProgress(moduleId, {
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpent: (state.progress[moduleId]?.timeSpent || 0)
    });
  };

  const addBookmark = (module) => {
    const bookmark = {
      id: module.id,
      title: module.title,
      phaseId: module.phaseId,
      addedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_BOOKMARK', payload: bookmark });
  };

  const removeBookmark = (moduleId) => {
    dispatch({ type: 'REMOVE_BOOKMARK', payload: moduleId });
  };

  const updateSettings = (newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const getModuleProgress = (moduleId) => {
    return state.progress[moduleId] || {
      completed: false,
      timeSpent: 0,
      lastAccessed: null
    };
  };

  const getPhaseProgress = (phaseId, modules) => {
    if (!modules || modules.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = modules.filter(module => 
      state.progress[module.id]?.completed
    ).length;
    
    return {
      completed,
      total: modules.length,
      percentage: Math.round((completed / modules.length) * 100)
    };
  };

  const getOverallProgress = (phases) => {
    if (!phases || phases.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const totalModules = phases.reduce((sum, phase) => sum + (phase.modules?.length || 0), 0);
    const completedModules = phases.reduce((sum, phase) => {
      return sum + (phase.modules?.filter(module => 
        state.progress[module.id]?.completed
      ).length || 0);
    }, 0);
    
    return {
      completed: completedModules,
      total: totalModules,
      percentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
    };
  };

  const isBookmarked = (moduleId) => {
    return state.bookmarks.some(bookmark => bookmark.id === moduleId);
  };

  const value = {
    ...state,
    login,
    logout,
    updateProgress,
    markModuleComplete,
    addBookmark,
    removeBookmark,
    updateSettings,
    getModuleProgress,
    getPhaseProgress,
    getOverallProgress,
    isBookmarked
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
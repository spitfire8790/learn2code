import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  BookOpen, 
  Menu, 
  X, 
  Home,
  TrendingUp,
  Code,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

const Navigation = ({ 
  curriculumTitle, 
  isAuthenticated, 
  user, 
  onLogin, 
  onLogout 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/progress', label: 'Progress', icon: TrendingUp },
    { path: '/ide', label: 'Code IDE', icon: Code },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="hidden sm:block truncate">
              {curriculumTitle.split(' - ')[0]}
            </span>
            <span className="sm:hidden">Curriculum</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link flex items-center space-x-2 ${
                  location.pathname === path ? 'active' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link flex items-center space-x-3 py-3 ${
                    location.pathname === path ? 'active' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Circle,
  BookOpen,
  Target,
  TrendingUp,
  Star
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const Dashboard = ({ curriculumData }) => {
  const { getTotalProgress, getPhaseProgress, completedModules, bookmarks } = useProgress();

  const totalProgress = getTotalProgress(curriculumData.phases);
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Interactive Coding Curriculum
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {curriculumData.description}
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
          Your Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {Math.round(totalProgress.percentage)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {totalProgress.completed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Modules Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {totalProgress.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Modules</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {bookmarks.size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bookmarked</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${totalProgress.percentage}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {curriculumData.phases.map((phase, index) => {
          const phaseProgress = getPhaseProgress(phase.modules);
          
          return (
            <motion.div
              key={phase.id}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card rounded-xl p-6 hover:shadow-xl transition-all duration-300"
            >
              <Link to={`/phase/${phase.id}`} className="block">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className={`inline-block w-12 h-12 rounded-lg bg-gradient-to-r ${phase.color} mb-3 flex items-center justify-center text-white font-bold text-lg`}>
                      {index}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {phase.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>

                {/* Module Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {phaseProgress.completed} of {phaseProgress.total} modules completed
                    </span>
                    <span className="font-medium text-primary-600">
                      {Math.round(phaseProgress.percentage)}%
                    </span>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${phaseProgress.percentage}%` }}
                    />
                  </div>

                  {/* Module Previews */}
                  {phase.modules.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-4">
                      {phase.modules.slice(0, 3).map((module) => (
                        <div 
                          key={module.id}
                          className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                        >
                          {completedModules.has(module.id) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {module.title}
                            </div>
                            {module.duration && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {module.duration}
                              </div>
                            )}
                          </div>
                          {bookmarks.has(module.id) && (
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 fill-current" />
                          )}
                        </div>
                      ))}
                      {phase.modules.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                          +{phase.modules.length - 3} more modules
                        </div>
                      )}
                    </div>
                  )}
                  
                  {phase.modules.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      Coming soon...
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/phase/phase-0"
            className="p-4 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <BookOpen className="h-6 w-6 mb-2" />
            <div className="font-semibold">Start Learning</div>
            <div className="text-sm opacity-90">Begin with Phase 0</div>
          </Link>
          
          <button className="p-4 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
            <Star className="h-6 w-6 mb-2" />
            <div className="font-semibold">Bookmarks</div>
            <div className="text-sm opacity-90">View saved modules</div>
          </button>
          
          <button className="p-4 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
            <TrendingUp className="h-6 w-6 mb-2" />
            <div className="font-semibold">Progress</div>
            <div className="text-sm opacity-90">Track your learning</div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 
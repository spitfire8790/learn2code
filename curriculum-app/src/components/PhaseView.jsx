import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle,
  BookOpen,
  Star,
  Target,
  Users
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const PhaseView = ({ curriculumData }) => {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const { getPhaseProgress, completedModules, bookmarks, toggleBookmark } = useProgress();

  const phase = curriculumData.phases.find(p => p.id === phaseId);
  const phaseIndex = curriculumData.phases.findIndex(p => p.id === phaseId);
  
  if (!phase) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Phase not found
        </h2>
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const phaseProgress = getPhaseProgress(phase.modules);
  const nextPhase = curriculumData.phases[phaseIndex + 1];
  const prevPhase = curriculumData.phases[phaseIndex - 1];

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
      {/* Navigation */}
      <motion.div variants={itemVariants} className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-primary-600">Dashboard</Link>
          <span className="mx-2">/</span>
          <span>{phase.title}</span>
        </div>
      </motion.div>

      {/* Phase Header */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-8">
        <div className="flex items-start space-x-6">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${phase.color} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0`}>
            {phaseIndex}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {phase.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {phase.description}
            </p>
            
            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(phaseProgress.percentage)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {phaseProgress.completed}/{phaseProgress.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Modules</div>
                </div>
              </div>
              

            </div>

            <div className="mt-6">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${phaseProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      {phase.modules.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {phase.modules.map((module, moduleIndex) => (
            <motion.div
              key={module.id}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card rounded-xl p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {completedModules.has(module.id) ? (
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Module {phaseIndex}.{moduleIndex + 1}
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(module.id)}
                  className={`p-1 rounded ${
                    bookmarks.has(module.id) 
                      ? 'text-yellow-500' 
                      : 'text-gray-400 hover:text-yellow-500'
                  } transition-colors`}
                >
                  <Star className={`h-5 w-5 ${bookmarks.has(module.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link to={`/phase/${phaseId}/module/${module.id}`} className="block">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {module.description}
                </p>

                {module.difficulty && (
                  <div className="flex justify-end mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                  </div>
                )}

                {/* Topics Preview */}
                {module.topics && module.topics.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Topics:
                    </div>
                    <div className="space-y-1">
                      {module.topics.slice(0, 3).map((topic, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2 flex-shrink-0" />
                          {topic}
                        </div>
                      ))}
                      {module.topics.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{module.topics.length - 3} more topics
                        </div>
                      )}
                    </div>
                  </div>
                )}


              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Modules for this phase are currently being developed.
          </p>
        </motion.div>
      )}

      {/* Phase Navigation */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          {prevPhase && (
            <Link
              to={`/phase/${prevPhase.id}`}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous: {prevPhase.title}</span>
            </Link>
          )}
        </div>
        <div>
          {nextPhase && (
            <Link
              to={`/phase/${nextPhase.id}`}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
            >
              <span>Next: {nextPhase.title}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhaseView; 
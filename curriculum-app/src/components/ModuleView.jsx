import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle,
  BookOpen,
  Star,
  Target,
  Code,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import MarkdownViewer from './MarkdownViewer';

const ModuleView = ({ curriculumData }) => {
  const { phaseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { 
    completedModules, 
    bookmarks, 
    toggleBookmark, 
    markModuleComplete, 
    markModuleIncomplete 
  } = useProgress();

  const [activeTab, setActiveTab] = useState('overview');

  const phase = curriculumData.phases.find(p => p.id === phaseId);
  const module = phase?.modules.find(m => m.id === moduleId);
  const moduleIndex = phase?.modules.findIndex(m => m.id === moduleId);
  const phaseIndex = curriculumData.phases.findIndex(p => p.id === phaseId);
  
  if (!phase || !module) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Module not found
        </h2>
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isCompleted = completedModules.has(moduleId);
  const isBookmarked = bookmarks.has(moduleId);
  
  const nextModule = phase.modules[moduleIndex + 1];
  const prevModule = phase.modules[moduleIndex - 1];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const toggleCompletion = () => {
    if (isCompleted) {
      markModuleIncomplete(moduleId);
    } else {
      markModuleComplete(moduleId);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'content', label: 'Full Content', icon: FileText }
  ];

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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">{phase.title.split(':')[0]}</Link>
            <span className="mx-2">/</span>
            <Link to={`/phase/${phaseId}`} className="hover:text-primary-600 dark:hover:text-primary-400">{phase.title.split(':')[1] || phase.title}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-200">{module.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleBookmark(moduleId)}
            className={`p-2 rounded-lg ${
              isBookmarked 
                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            } hover:scale-105 transition-all`}
          >
            <Star className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={toggleCompletion}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-all ${
              isCompleted
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 hover:bg-primary-200'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                <span>Mark Complete</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Module Header */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-8">
        <div className="flex items-start space-x-6">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${phase.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {phaseIndex}.{moduleIndex + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {module.title}
              </h1>
              {module.difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {module.description}
            </p>
            

          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-2">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div 
        variants={itemVariants}
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-8"
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Learning Objectives
              </h2>
              {module.learningObjectives && module.learningObjectives.length > 0 ? (
                <div className="space-y-4">
                  {module.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{objective}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    By completing this module, you will gain practical experience with the key concepts and be able to apply them in real-world scenarios.
                  </p>
                </div>
              )}
            </div>

            {module.prerequisites && module.prerequisites.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Prerequisites
                </h3>
                <div className="space-y-2">
                  {module.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300">{prereq}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Complete Module Content
            </h2>
            <MarkdownViewer 
              phaseId={phaseId} 
              moduleId={moduleId} 
              title={module.title} 
            />
          </div>
        )}





        
      </motion.div>

      {/* Module Navigation */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          {prevModule && (
            <Link
              to={`/phase/${phaseId}/module/${prevModule.id}`}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous: {prevModule.title}</span>
            </Link>
          )}
        </div>
        <div>
          {nextModule && (
            <Link
              to={`/phase/${phaseId}/module/${nextModule.id}`}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
            >
              <span>Next: {nextModule.title}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModuleView; 
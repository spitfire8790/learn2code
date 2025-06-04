import { CheckCircle, Circle, BookOpen, Clock, Trophy, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProgressTracker = ({ curriculum }) => {
  const { progress, getPhaseProgress, getOverallProgress } = useAuth();

  if (!curriculum || !curriculum.phases) {
    return null;
  }

  const overallProgress = getOverallProgress(curriculum.phases);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Trophy className="mr-2 text-yellow-500" size={28} />
          Your Progress
        </h2>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {overallProgress.percentage}%
          </div>
          <div className="text-sm text-gray-600">
            {overallProgress.completed} of {overallProgress.total} modules
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">
            {overallProgress.completed}/{overallProgress.total} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Phase Progress</h3>
        {curriculum.phases.map((phase) => {
          const phaseProgress = getPhaseProgress(phase.id, phase.modules);
          
          return (
            <div key={phase.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{phase.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {phaseProgress.completed}/{phaseProgress.total}
                  </span>
                  <div className="text-sm font-medium text-blue-600">
                    {phaseProgress.percentage}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${phase.color.replace('from-', 'bg-').replace(' to-purple-600', '').replace(' to-blue-600', '').replace(' to-green-600', '').replace(' to-teal-600', '').replace(' to-orange-600', '').replace(' to-red-600', '').replace(' to-indigo-600', '').replace(' to-pink-600', '').replace(' to-yellow-600', '')}`}
                  style={{ width: `${phaseProgress.percentage}%` }}
                ></div>
              </div>

              {/* Module List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {phase.modules?.map((module) => {
                  const moduleProgress = progress[module.id];
                  const isCompleted = moduleProgress?.completed || false;
                  
                  return (
                    <div
                      key={module.id}
                      className={`flex items-center space-x-2 p-2 rounded text-sm ${
                        isCompleted 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{module.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Badges */}
      {overallProgress.percentage > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {overallProgress.percentage >= 10 && (
              <div className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                <Star size={16} className="mr-1" />
                Getting Started
              </div>
            )}
            {overallProgress.percentage >= 25 && (
              <div className="flex items-center bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm">
                <BookOpen size={16} className="mr-1" />
                Quarter Complete
              </div>
            )}
            {overallProgress.percentage >= 50 && (
              <div className="flex items-center bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <Trophy size={16} className="mr-1" />
                Halfway There
              </div>
            )}
            {overallProgress.percentage >= 75 && (
              <div className="flex items-center bg-orange-50 text-orange-800 px-3 py-1 rounded-full text-sm">
                <Clock size={16} className="mr-1" />
                Almost Done
              </div>
            )}
            {overallProgress.percentage === 100 && (
              <div className="flex items-center bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm">
                <Trophy size={16} className="mr-1" />
                Curriculum Complete!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker; 
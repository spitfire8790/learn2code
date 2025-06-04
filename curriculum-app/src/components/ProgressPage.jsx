import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const ProgressPage = ({ curriculum }) => {
  const { progress, getPhaseProgress, getOverallProgress, user } = useAuth();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState(null);

  if (!curriculum || !curriculum.phases) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Curriculum Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please load curriculum data to view progress.
          </p>
        </div>
      </div>
    );
  }

  const overallProgress = getOverallProgress(curriculum.phases);

  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress.percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [overallProgress.percentage]);

  // Calculate real stats from actual data
  const calculateStats = () => {
    const completedModules = Object.values(progress).filter(p => p.completed);
    const recentActivity = completedModules
      .filter(p => p.completedAt && new Date(p.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .length;
    
    return {
      recentActivity,
      completedToday: completedModules.filter(p => 
        p.completedAt && new Date(p.completedAt).toDateString() === new Date().toDateString()
      ).length,
      totalCompleted: completedModules.length
    };
  };

  const stats = calculateStats();

  // Progress ring component
  const ProgressRing = ({ percentage, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedProgress / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-blue-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(animatedProgress)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stats card component
  const StatsCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Phase progress card
  const PhaseCard = ({ phase, phaseProgress, index }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
        selectedPhase === phase.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          {phase.title}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {phaseProgress.completed}/{phaseProgress.total}
          </span>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {phaseProgress.percentage}%
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${phase.color}`}
          style={{ 
            width: `${phaseProgress.percentage}%`,
            animationDelay: `${index * 100}ms`
          }}
        ></div>
      </div>

      {/* Module grid */}
      {selectedPhase === phase.id && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 animate-in slide-in-from-top duration-300">
          {phase.modules?.map((module, moduleIndex) => {
            const moduleProgress = progress[module.id];
            const isCompleted = moduleProgress?.completed || false;
            
            return (
              <div
                key={module.id}
                className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                style={{ animationDelay: `${moduleIndex * 50}ms` }}
              >
                {isCompleted ? (
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <Circle size={16} className="text-gray-400 flex-shrink-0" />
                )}
                <span className="truncate">{module.title}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );



  // Chart data
  const phaseChartData = curriculum.phases.map((phase, index) => {
    const phaseProgress = getPhaseProgress(phase.id, phase.modules);
    return {
      name: `Phase ${index}`,
      completed: phaseProgress.completed,
      total: phaseProgress.total,
      percentage: phaseProgress.percentage
    };
  });

  const pieChartData = [
    { name: 'Completed', value: overallProgress.completed, color: '#10b981' },
    { name: 'Remaining', value: overallProgress.total - overallProgress.completed, color: '#6b7280' }
  ];

  // Weekly progress - using real completion data where available
  const weeklyProgressData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    modules: i === 6 ? stats.completedToday : 0 // Only show real data for today, rest would need historical tracking
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <TrendingUp className="mr-3 text-blue-600 dark:text-blue-400" size={32} />
                Your Learning Progress
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name || 'Learner'}! Here's how you're doing.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Ring */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Overall Progress
              </h2>
              <div className="flex justify-center mb-6">
                <ProgressRing percentage={overallProgress.percentage} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {overallProgress.completed} of {overallProgress.total} modules completed
                </p>
                <div className="flex justify-center space-x-4 text-xs">
                  <span className="text-green-600 dark:text-green-400">
                    ✓ {overallProgress.completed} Done
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    ○ {overallProgress.total - overallProgress.completed} Remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatsCard
                icon={CheckCircle}
                title="Total Completed"
                value={stats.totalCompleted}
                subtitle="Modules finished"
                color="green"
              />
              <StatsCard
                icon={Zap}
                title="This Week"
                value={stats.recentActivity}
                subtitle="Modules completed"
                color="purple"
              />
              <StatsCard
                icon={Calendar}
                title="Today"
                value={stats.completedToday}
                subtitle="Modules completed"
                color="blue"
              />
            </div>
          </div>
        </div>



        {/* Analytics & Charts Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Progress Analytics
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Phase Progress Bar Chart */}
            <div className="col-span-1 lg:col-span-2 xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Progress by Phase
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={phaseChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(31 41 55)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value, name) => [
                      name === 'completed' ? `${value} completed` : `${value} total`,
                      name === 'completed' ? 'Completed' : 'Total'
                    ]}
                  />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#6b7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Overall Progress Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Overall Completion
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(31 41 55)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value} modules`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-2">
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                </div>
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="col-span-1 lg:col-span-2 xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                This Week's Activity
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(31 41 55)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value} modules`, 'Completed']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="modules" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Phase Progress Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Progress by Phase
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {curriculum.phases.map((phase, index) => {
              const phaseProgress = getPhaseProgress(phase.id, phase.modules);
              return (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  phaseProgress={phaseProgress}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 
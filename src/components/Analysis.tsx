import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { 
  ArrowLeft,
  BarChart3, 
  Clock,
  CheckCircle,
  Target
} from 'lucide-react'
import { useState, useMemo } from 'react'

// Analysis view navigation type
type AnalysisView = 'menu' | 'taskFinishRate' | 'totalTime'

// Time range options
type TimeRange = 'day' | 'week' | 'month'

// Time display mode for total time feature
type TimeDisplayMode = 'total' | 'working'

// Task grouping for total time feature
type TaskGrouping = 'overall' | 'perTask'

export default function Analysis() {
  const { theme } = useSettingsStore()
  const { tasks } = useTaskStore()
  
  // Navigation state
  const [currentView, setCurrentView] = useState<AnalysisView>('menu')
  
  // Task Finish Rate states
  const [finishRateTimeRange, setFinishRateTimeRange] = useState<TimeRange>('week')
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  
  // Total Time states  
  const [totalTimeRange, setTotalTimeRange] = useState<TimeRange>('week')
  const [timeDisplayMode, setTimeDisplayMode] = useState<TimeDisplayMode>('working')
  const [taskGrouping, setTaskGrouping] = useState<TaskGrouping>('overall')

  // Helper function to get date range
  const getDateRange = (range: TimeRange) => {
    const now = new Date()
    const endDate = now
    const startDate = new Date()
    
    switch (range) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setDate(now.getDate() - 30)
        break
    }
    
    return { startDate: startDate.getTime(), endDate: endDate.getTime() }
  }

  // Helper function to format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Calculate task finish rate statistics
  const finishRateStats = useMemo(() => {
    const { startDate, endDate } = getDateRange(finishRateTimeRange)
    
    // Filter tasks by time range and selected tasks (if any)
    let filteredTasks = tasks.filter(task => 
      task.createdAt >= startDate && task.createdAt <= endDate
    )
    
    if (selectedTaskIds.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        selectedTaskIds.includes(task.id)
      )
    }
    
    const totalTasks = filteredTasks.length
    const completedTasks = filteredTasks.filter(task => 
      task.status === 'completed'
    ).length
    const inProgressTasks = filteredTasks.filter(task => 
      task.status === 'in-progress'
    ).length
    const todoTasks = filteredTasks.filter(task => 
      task.status === 'todo'
    ).length
    
    const finishRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      finishRate: Math.round(finishRate * 100) / 100
    }
  }, [tasks, finishRateTimeRange, selectedTaskIds])

  // Calculate total time statistics
  const totalTimeStats = useMemo(() => {
    const { startDate, endDate } = getDateRange(totalTimeRange)
    
    // Filter tasks by time range
    const filteredTasks = tasks.filter(task => 
      task.createdAt >= startDate && task.createdAt <= endDate
    )
    
    if (taskGrouping === 'overall') {
      // Overall statistics
      const totalWorkingTime = filteredTasks.reduce((acc, task) => 
        acc + (task.totalTimeSpent || 0), 0
      )
      
      // Estimate break time based on Pomodoro technique
      // Assuming 5-minute breaks between sessions and longer breaks every 4 pomodoros
      const totalPomodoros = filteredTasks.reduce((acc, task) => 
        acc + (task.pomodoroCount || 0), 0
      )
      
      // Rough calculation: 5 min short breaks + 15 min long breaks every 4 pomodoros
      const shortBreaks = Math.max(0, totalPomodoros - 1) * 5 * 60 // 5 minutes in seconds
      const longBreaks = Math.floor(totalPomodoros / 4) * 15 * 60 // 15 minutes in seconds
      const estimatedBreakTime = shortBreaks + longBreaks
      const totalTime = totalWorkingTime + estimatedBreakTime
      
      return {
        type: 'overall' as const,
        totalTime,
        workingTime: totalWorkingTime,
        breakTime: estimatedBreakTime,
        taskCount: filteredTasks.length
      }
    } else {
      // Per-task statistics
      const taskStats = filteredTasks.map(task => {
        const workingTime = task.totalTimeSpent || 0
        const pomodoroCount = task.pomodoroCount || 0
        
        // Estimate break time for this task
        const shortBreaks = Math.max(0, pomodoroCount - 1) * 5 * 60 // 5 minutes in seconds
        const longBreaks = Math.floor(pomodoroCount / 4) * 15 * 60 // 15 minutes in seconds
        const estimatedBreakTime = shortBreaks + longBreaks
        const totalTime = workingTime + estimatedBreakTime
        
        return {
          id: task.id,
          title: task.title,
          totalTime,
          workingTime,
          pomodoroCount,
          status: task.status
        }
      })
      
      return {
        type: 'perTask' as const,
        tasks: taskStats.sort((a, b) => b.workingTime - a.workingTime)
      }
    }
  }, [tasks, totalTimeRange, taskGrouping])

  // Analysis menu configuration
  const analysisMenu = [
    {
      id: 'taskFinishRate' as AnalysisView,
      title: 'Task Finish Rate',
      description: 'Track completion rates with time range and task filters',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      id: 'totalTime' as AnalysisView,
      title: 'Total Time',
      description: 'Analyze working time with flexible filtering options',
      icon: Clock,
      color: 'bg-blue-500',
    },
  ]

  // Render main menu
  const renderMainMenu = () => (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          📊 Analysis
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Insights into your productivity patterns
        </p>
      </div>

      <div className="grid gap-4">
        {analysisMenu.map(feature => {
          const Icon = feature.icon
          return (
            <button
              key={feature.id}
              onClick={() => setCurrentView(feature.id)}
              className={`w-full p-4 rounded-xl transition-all border ${
                theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-gray-700/70 border-gray-600 hover:border-gray-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <Icon size={24} color="white" />
                </div>
                <div className="text-left flex-1">
                  <div className={`font-semibold text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </div>
                </div>
                <div className={`text-2xl ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  →
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Render Task Finish Rate view
  const renderTaskFinishRate = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentView('menu')}
          className={`p-2 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <ArrowLeft size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ✅ Task Finish Rate
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Track your task completion performance
          </p>
        </div>
      </div>

      {/* Time Range Selection */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-700/30' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-sm font-medium mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          📅 Time Range
        </h3>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setFinishRateTimeRange(range)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                finishRateTimeRange === range
                  ? theme === 'dark'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === 'day' ? 'Today' : range === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Task Selection */}
      {tasks.length > 0 && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'border-gray-600 bg-gray-700/30' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            🎯 Filter Tasks (Optional)
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {tasks.map(task => (
              <label key={task.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTaskIds([...selectedTaskIds, task.id])
                    } else {
                      setSelectedTaskIds(selectedTaskIds.filter(id => id !== task.id))
                    }
                  }}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {task.title}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  task.status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {task.status}
                </span>
              </label>
            ))}
          </div>
          {selectedTaskIds.length > 0 && (
            <button
              onClick={() => setSelectedTaskIds([])}
              className={`mt-3 text-sm ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Statistics Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className={`w-4 h-4 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`font-medium text-xs ${
              theme === 'dark' ? 'text-green-300' : 'text-green-700'
            }`}>
              Finish Rate
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {finishRateStats.finishRate.toFixed(1)}%
          </div>
          <div className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {finishRateStats.completedTasks} of {finishRateStats.totalTasks} tasks
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className={`w-4 h-4 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <span className={`font-medium text-xs ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Total Tasks
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {finishRateStats.totalTasks}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-700/30' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-sm font-medium mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          📋 Status Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className={`text-lg font-bold ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              {finishRateStats.completedTasks}
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {finishRateStats.inProgressTasks}
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              In Progress
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {finishRateStats.todoTasks}
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              To Do
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Total Time view  
  const renderTotalTime = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentView('menu')}
          className={`p-2 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <ArrowLeft size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ⏰ Total Time
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Analyze your time usage patterns
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Range */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'border-gray-600 bg-gray-700/30' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            📅 Time Range
          </h3>
          <select
            value={totalTimeRange}
            onChange={(e) => setTotalTimeRange(e.target.value as TimeRange)}
            className={`w-full p-2 rounded-lg border text-sm ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="day">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Time Display Mode */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'border-gray-600 bg-gray-700/30' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ⚙️ Display Mode
          </h3>
          <select
            value={timeDisplayMode}
            onChange={(e) => setTimeDisplayMode(e.target.value as TimeDisplayMode)}
            className={`w-full p-2 rounded-lg border text-sm ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="working">Working Time Only</option>
            <option value="total">Total Time (with breaks)</option>
          </select>
        </div>

        {/* Task Grouping */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'border-gray-600 bg-gray-700/30' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            📊 Grouping
          </h3>
          <select
            value={taskGrouping}
            onChange={(e) => setTaskGrouping(e.target.value as TaskGrouping)}
            className={`w-full p-2 rounded-lg border text-sm ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="overall">Overall Summary</option>
            <option value="perTask">Per Task Breakdown</option>
          </select>
        </div>
      </div>

      {/* Statistics Display */}
      {totalTimeStats.type === 'overall' ? (
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-4 h-4 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`font-medium text-xs ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {timeDisplayMode === 'working' ? 'Working Time' : 'Total Time (with breaks)'}
              </span>
            </div>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {formatTime(timeDisplayMode === 'working' ? totalTimeStats.workingTime : totalTimeStats.totalTime)}
            </div>
            {timeDisplayMode === 'total' && totalTimeStats.breakTime > 0 && (
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Includes {formatTime(totalTimeStats.breakTime)} estimated breaks
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className={`w-4 h-4 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className={`font-medium text-xs ${
                theme === 'dark' ? 'text-green-300' : 'text-green-700'
              }`}>
                Tasks Worked On
              </span>
            </div>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {totalTimeStats.taskCount}
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'border-gray-600 bg-gray-700/30' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-sm font-medium mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            📋 Time Per Task
          </h3>
          {totalTimeStats.tasks.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {totalTimeStats.tasks.map(task => (
                <div key={task.id} className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-600/50' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-medium text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {formatTime(timeDisplayMode === 'working' ? task.workingTime : task.totalTime)}
                    </span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {task.pomodoroCount} pomodoros
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No time data available for the selected period</p>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Main component render
  return (
    <div className={`w-full h-full overflow-y-auto ${
      theme === 'dark' 
        ? 'bg-gray-800 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <div className="p-6 max-w-4xl mx-auto">
        {currentView === 'menu' && renderMainMenu()}
        {currentView === 'taskFinishRate' && renderTaskFinishRate()}
        {currentView === 'totalTime' && renderTotalTime()}
      </div>
    </div>
  )
}

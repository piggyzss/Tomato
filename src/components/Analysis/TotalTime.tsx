import { useTaskStore } from '@/store/useTaskStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Clock, Target } from 'lucide-react'
import { useState, useMemo } from 'react'
import { getDateRange, formatTime } from './utils'
import type { TimeRange, TimeDisplayMode, TaskGrouping } from './types'
import { ModalWithBack } from '@/components/Common'

interface TotalTimeProps {
  onBack: () => void
}

export default function TotalTime({ onBack }: TotalTimeProps) {
  const { theme } = useSettingsStore()
  const { tasks } = useTaskStore()
  
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [timeDisplayMode, setTimeDisplayMode] = useState<TimeDisplayMode>('working')
  const [taskGrouping, setTaskGrouping] = useState<TaskGrouping>('overall')

  // Calculate total time statistics
  const stats = useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRange)
    
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
      const totalPomodoros = filteredTasks.reduce((acc, task) => 
        acc + (task.pomodoroCount || 0), 0
      )
      
      const shortBreaks = Math.max(0, totalPomodoros - 1) * 5 * 60
      const longBreaks = Math.floor(totalPomodoros / 4) * 15 * 60
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
        
        const shortBreaks = Math.max(0, pomodoroCount - 1) * 5 * 60
        const longBreaks = Math.floor(pomodoroCount / 4) * 15 * 60
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
  }, [tasks, timeRange, taskGrouping])

  return (
    <ModalWithBack
      title={<>⏰ Total Time</>}
      subtitle="Analyze your time usage patterns"
      onBack={onBack}
    >
      <div className="space-y-6 mt-4">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Range */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-black/20 border border-white/20' 
              : 'bg-black/20 border border-white/20'
          }`}>
            <h3 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              📅 Time Range
            </h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className={`w-full p-2 rounded-lg border text-sm ${
                theme === 'dark'
                  ? 'bg-black/30 border-white/20 text-white'
                  : 'bg-black/30 border-white/20 text-white'
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
              ? 'bg-black/20 border border-white/20' 
              : 'bg-black/20 border border-white/20'
          }`}>
            <h3 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              ⚙️ Display Mode
            </h3>
            <select
              value={timeDisplayMode}
              onChange={(e) => setTimeDisplayMode(e.target.value as TimeDisplayMode)}
              className={`w-full p-2 rounded-lg border text-sm ${
                theme === 'dark'
                  ? 'bg-black/30 border-white/20 text-white'
                  : 'bg-black/30 border-white/20 text-white'
              }`}
            >
              <option value="working">Working Time Only</option>
              <option value="total">Total Time (with breaks)</option>
            </select>
          </div>

          {/* Task Grouping */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-black/20 border border-white/20' 
              : 'bg-black/20 border border-white/20'
          }`}>
            <h3 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              📊 Grouping
            </h3>
            <select
              value={taskGrouping}
              onChange={(e) => setTaskGrouping(e.target.value as TaskGrouping)}
              className={`w-full p-2 rounded-lg border text-sm ${
                theme === 'dark'
                  ? 'bg-black/30 border-white/20 text-white'
                  : 'bg-black/30 border-white/20 text-white'
              }`}
            >
              <option value="overall">Overall Summary</option>
              <option value="perTask">Per Task Breakdown</option>
            </select>
          </div>
        </div>

        {/* Statistics Display */}
        {stats.type === 'overall' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-black/20 border border-white/20' : 'bg-black/20 border border-white/20'
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
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}>
                {formatTime(timeDisplayMode === 'working' ? stats.workingTime : stats.totalTime)}
              </div>
              {timeDisplayMode === 'total' && stats.breakTime > 0 && (
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-white/70' : 'text-white/70'
                }`}>
                  Includes {formatTime(stats.breakTime)} estimated breaks
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-black/20 border border-white/20' : 'bg-black/20 border border-white/20'
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
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}>
                {stats.taskCount}
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-black/20 border border-white/20' 
              : 'bg-black/20 border border-white/20'
          }`}>
            <h3 className={`text-sm font-medium mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              📋 Time Per Task
            </h3>
            {stats.tasks.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.tasks.map(task => (
                  <div key={task.id} className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-black/30' : 'bg-black/30'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-medium text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-white'
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
                        theme === 'dark' ? 'text-white/70' : 'text-white/70'
                      }`}>
                        {task.pomodoroCount} pomodoros
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${
                theme === 'dark' ? 'text-white/70' : 'text-white/70'
              }`}>
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>No time data available for the selected period</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalWithBack>
  )
}

import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { ArrowLeft, BarChart3, Target } from 'lucide-react'
import { useState, useMemo } from 'react'
import { getDateRange } from './utils'
import type { TimeRange } from './types'

interface TaskFinishRateProps {
  onBack: () => void
}

export default function TaskFinishRate({ onBack }: TaskFinishRateProps) {
  const { theme } = useSettingsStore()
  const { tasks } = useTaskStore()
  
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // Calculate task finish rate statistics
  const stats = useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRange)
    
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
  }, [tasks, timeRange, selectedTaskIds])

  return (
    <div>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pb-3 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-[#D84848]'
      }`}>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">Task Finish Rate</h1>
            <p className="text-white/70 text-xs">Track your task completion performance</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-4">
        {/* Time Range Selection */}
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
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? theme === 'dark'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-600 text-white'
                    : theme === 'dark'
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white/20 text-white hover:bg-white/30'
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
              ? 'bg-black/20 border border-white/20' 
              : 'bg-black/20 border border-white/20'
          }`}>
            <h3 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-white'
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
                    theme === 'dark' ? 'text-white' : 'text-white/70'
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
            theme === 'dark' ? 'bg-black/20 border border-white/20' : 'bg-black/20 border border-white/20'
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
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              {stats.finishRate.toFixed(1)}%
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-white/70' : 'text-white/70'
            }`}>
              {stats.completedTasks} of {stats.totalTasks} tasks
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-black/20 border border-white/20' : 'bg-black/20 border border-white/20'
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
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              {stats.totalTasks}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-black/20 border border-white/20' 
            : 'bg-black/20 border border-white/20'
        }`}>
          <h3 className={`text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-white'
          }`}>
            📋 Status Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className={`text-lg font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {stats.completedTasks}
              </div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-white/70' : 'text-white/70'
              }`}>
                Completed
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {stats.inProgressTasks}
              </div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-white/70' : 'text-white/70'
              }`}>
                In Progress
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white/70' : 'text-white/70'
              }`}>
                {stats.todoTasks}
              </div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-white/70' : 'text-white/70'
              }`}>
                To Do
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

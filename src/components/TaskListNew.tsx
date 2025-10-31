import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import clsx from 'clsx'
import {
  Check,
  Coffee,
  Monitor,
  MonitorPlay,
  MonitorX,
  SquareMousePointer,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export function TaskListNew() {
  const {
    tasks,
    currentTaskId,
    addTask,
    updateTask,
    deleteTask,
    setCurrentTask,
  } = useTaskStore()
  const { theme } = useSettingsStore()
  const { status, mode } = useTimerStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // 初始化时自动选中第一个未完成的任务
  useEffect(() => {
    if (!currentTaskId && tasks.length > 0) {
      const firstIncompleteTask = tasks.find(t => t.status !== 'completed')
      if (firstIncompleteTask) {
        setCurrentTask(firstIncompleteTask.id)
      }
    }
  }, [tasks, currentTaskId, setCurrentTask])

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    addTask({
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      pomodoroCount: 0,
      totalTimeSpent: 0,
    })
    setNewTaskTitle('')
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
  }

  const handleSelectTask = (taskId: string) => {
    setCurrentTask(taskId)
  }

  const handleToggleComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    updateTask(taskId, {
      status: task.status === 'completed' ? 'todo' : 'completed',
      completedAt: task.status === 'completed' ? undefined : Date.now(),
    })
  }

  // 格式化时间显示为 MM:SS
  const formatTime = (seconds: number): string => {
    // 确保 seconds 是有效数字
    const validSeconds =
      typeof seconds === 'number' && !isNaN(seconds) ? seconds : 0
    const mins = Math.floor(validSeconds / 60)
    const secs = validSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 计算已完成任务数
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-xl p-5 shadow-lg transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/80 backdrop-blur border border-gray-700'
          : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-[#3d2b2b]'
          }`}
        >
          Tasks
        </h3>
        <span
          className={`text-sm font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-[#3d2b2b]'
          }`}
        >
          {completedCount}/{tasks.length}
        </span>
      </div>

      <div
        className={`border-t-2 mb-4 transition-colors duration-300 ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}
      ></div>

      {/* Task List */}
      <div className="mb-4 h-[180px] overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {tasks.length === 0 ? (
          <div
            className={`text-center py-10 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            <div className="mb-2 text-2xl">📝</div>
            <div className="font-medium">No tasks yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => {
              const isActive = currentTaskId === task.id

              return (
                <div
                  key={task.id}
                  className={clsx(
                    'rounded-lg overflow-visible transition-all relative',
                    isActive
                      ? theme === 'dark'
                        ? 'border-l-4 border-l-tomato bg-gray-700/50'
                        : 'border-l-4 border-l-tomato bg-gray-100'
                      : theme === 'dark'
                        ? 'bg-gray-800/50'
                        : 'bg-white'
                  )}
                >
                  <div className="px-1.5 py-3 flex items-center gap-1">
                    {/* Checkbox */}
                    <button
                      onClick={e => handleToggleComplete(task.id, e)}
                      className={clsx(
                        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        task.status === 'completed'
                          ? theme === 'dark'
                            ? 'bg-green-600 border-green-600'
                            : 'bg-[#3d2b2b] border-[#3d2b2b]'
                          : theme === 'dark'
                            ? 'border-gray-500 hover:border-gray-400'
                            : 'border-gray-300 hover:border-gray-400'
                      )}
                    >
                      {task.status === 'completed' && (
                        <Check
                          size={14}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={clsx(
                          'font-semibold text-sm transition-colors duration-300 truncate',
                          task.status === 'completed'
                            ? theme === 'dark'
                              ? 'line-through text-gray-500'
                              : 'line-through text-gray-400'
                            : theme === 'dark'
                              ? 'text-white'
                              : 'text-[#3d2b2b]'
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    </div>

                    {/* Status Display or Select Button */}
                    {task.status !== 'completed' && (
                      <>
                        {isActive ? (
                          <div
                            className={clsx(
                              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                              theme === 'dark'
                                ? 'bg-tomato/20 text-tomato'
                                : 'bg-tomato/10 text-tomato'
                            )}
                          >
                            {mode === 'shortBreak' || mode === 'longBreak' ? (
                              // During break modes
                              <>
                                <Coffee size={12} />
                                In Break
                              </>
                            ) : status === 'running' ? (
                              // Timer running in pomodoro mode
                              <>
                                <Monitor size={12} />
                                Working
                              </>
                            ) : status === 'paused' ? (
                              // Timer paused in pomodoro mode
                              <>
                                <MonitorX size={12} />
                                Paused
                              </>
                            ) : (
                              // Timer idle in pomodoro mode
                              <>
                                <MonitorPlay size={12} />
                                Ready
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectTask(task.id)}
                            className={clsx(
                              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                          >
                            <SquareMousePointer size={12} />
                            Select
                          </button>
                        )}
                      </>
                    )}

                    {/* Time Spent */}
                    <div
                      className={`text-xs font-bold min-w-[42px] text-right transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(task.totalTimeSpent)}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className={`p-0.5 rounded-lg transition-colors duration-200 ${
                        theme === 'dark'
                          ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400'
                          : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                      }`}
                      title="Delete task"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Task Input */}
      <div className="mt-3">
        <input
          id="new-task-input"
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTask()}
          placeholder="What are you working on?"
          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:border-tomato focus:outline-none transition-all text-sm font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
          }`}
        />
        {newTaskTitle && (
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={handleAddTask}
              className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold bg-tomato text-white hover:bg-tomato/90"
            >
              Save
            </button>
            <button
              onClick={() => setNewTaskTitle('')}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-[#3d2b2b] hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

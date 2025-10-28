import { useTaskStore } from '@/store/useTaskStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTimerStore } from '@/store/useTimerStore'
import clsx from 'clsx'
import { Check, X, Play, Pause, Coffee, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export function TaskListNew() {
  const {
    tasks,
    currentTaskId,
    addTask,
    updateTask,
    deleteTask,
    setCurrentTask,
  } = useTaskStore()
  const { theme, workDuration } = useSettingsStore()
  const { status, mode, remainingSeconds, setStatus, setTotalSeconds, reset } =
    useTimerStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')

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

  const handleTaskAction = (taskId: string) => {
    const isActive = currentTaskId === taskId

    // Only allow control in Pomodoro mode, not during breaks
    if (mode !== 'pomodoro') {
      return // Do nothing during break modes
    }

    if (isActive) {
      // Timer finished (remainingSeconds = 0), act as reset button
      if (remainingSeconds === 0 && status === 'idle') {
        reset()
        setTotalSeconds(workDuration * 60)
        setStatus('running')
        return
      }

      // Normal pause/resume functionality
      if (status === 'running') {
        setStatus('paused')
      } else if (status === 'paused') {
        setStatus('running')
      } else if (status === 'idle') {
        // Start timer like BigTimer start button
        setStatus('running')
      }
    } else {
      // If task is not active, select it
      setCurrentTask(taskId)
    }
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
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
        >
          Tasks
        </h3>
        <span
          className={`text-sm font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
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
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto relative">
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
          tasks.map(task => {
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
                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={e => handleToggleComplete(task.id, e)}
                    className={clsx(
                      'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      task.status === 'completed'
                        ? theme === 'dark'
                          ? 'bg-green-600 border-green-600'
                          : 'bg-gray-800 border-gray-800'
                        : theme === 'dark'
                          ? 'border-gray-500 hover:border-gray-400'
                          : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    {task.status === 'completed' && (
                      <Check size={14} className="text-white" strokeWidth={3} />
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={clsx(
                        'font-semibold text-sm transition-colors duration-300',
                        task.status === 'completed'
                          ? theme === 'dark'
                            ? 'line-through text-gray-500'
                            : 'line-through text-gray-400'
                          : theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-800'
                      )}
                    >
                      {task.title}
                    </div>
                  </div>

                  {/* Smart Timer Control Button */}
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleTaskAction(task.id)}
                      disabled={
                        isActive && mode !== 'pomodoro' && mode !== undefined
                      }
                      className={clsx(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                        // Disabled state during breaks
                        isActive && mode !== 'pomodoro' && mode !== undefined
                          ? theme === 'dark'
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : // Timer finished state (like BigTimer disabled state)
                            isActive &&
                              remainingSeconds === 0 &&
                              status === 'idle'
                            ? theme === 'dark'
                              ? 'bg-green-600 text-white hover:bg-green-500'
                              : 'bg-green-600 text-white hover:bg-green-500'
                            : // Active task states
                              isActive
                              ? theme === 'dark'
                                ? 'bg-tomato text-white hover:bg-tomato/90'
                                : 'bg-tomato text-white hover:bg-tomato/90'
                              : // Inactive task
                                theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {isActive ? (
                        // During break modes, show break status
                        mode === 'shortBreak' || mode === 'longBreak' ? (
                          <>
                            <Coffee size={12} />
                            In Break
                          </>
                        ) : remainingSeconds === 0 && status === 'idle' ? (
                          // Timer finished, show restart option
                          <>
                            <RotateCcw size={12} />
                            Restart
                          </>
                        ) : status === 'running' ? (
                          // Timer running in pomodoro mode
                          <>
                            <Pause size={12} />
                            Pause
                          </>
                        ) : status === 'paused' ? (
                          // Timer paused in pomodoro mode
                          <>
                            <Play size={12} />
                            Resume
                          </>
                        ) : (
                          // Timer idle in pomodoro mode
                          <>
                            <Play size={12} />
                            Start
                          </>
                        )
                      ) : (
                        // Task not selected
                        <>
                          <Play size={12} />
                          Select
                        </>
                      )}
                    </button>
                  )}

                  {/* Time Spent */}
                  <div
                    className={`text-xs font-bold min-w-[50px] text-right transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(task.totalTimeSpent)}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className={`p-1.5 rounded-lg transition-colors duration-200 ${
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
          })
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
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                theme === 'dark'
                  ? 'bg-tomato text-white hover:bg-tomato/90'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              Save
            </button>
            <button
              onClick={() => setNewTaskTitle('')}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
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

import { useTaskStore } from '@/store/useTaskStore'
import clsx from 'clsx'
import { Check, MoreVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function TaskListNew() {
  const { tasks, currentTaskId, addTask, updateTask, deleteTask, setCurrentTask } = useTaskStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    
    addTask({
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      pomodoroCount: 0,
      totalTimeSpent: 0
    })
    setNewTaskTitle('')
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
    setShowMenu(null)
  }

  const handleToggleComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    updateTask(taskId, {
      status: task.status === 'completed' ? 'todo' : 'completed',
      completedAt: task.status === 'completed' ? undefined : Date.now()
    })
  }

  // 点击空白区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // 格式化时间显示为 MM:SS
  const formatTime = (seconds: number): string => {
    // 确保 seconds 是有效数字
    const validSeconds = typeof seconds === 'number' && !isNaN(seconds) ? seconds : 0
    const mins = Math.floor(validSeconds / 60)
    const secs = validSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 计算已完成任务数
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="bg-white rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Tasks</h3>
        <span className="text-sm font-semibold text-gray-500">
          {completedCount}/{tasks.length}
        </span>
      </div>

      <div className="border-t-2 border-gray-200 mb-4"></div>

      {/* Task List */}
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto relative">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="mb-2 text-2xl">📝</div>
            <div className="font-medium">No tasks yet</div>
          </div>
        ) : (
          tasks.map((task) => {
            const isActive = currentTaskId === task.id
            
            return (
              <div
                key={task.id}
                className={clsx(
                  'rounded-lg overflow-visible transition-all relative',
                  isActive ? 'border-l-4 border-l-tomato bg-gray-100' : 'bg-white'
                )}
              >
                <div
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setCurrentTask(task.id)}
                >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => handleToggleComplete(task.id, e)}
                    className={clsx(
                      'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      task.status === 'completed'
                        ? 'bg-gray-800 border-gray-800'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    {task.status === 'completed' && (
                      <Check size={14} className="text-white" strokeWidth={3} />
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className={clsx(
                      'font-semibold text-gray-800 text-sm',
                      task.status === 'completed' && 'line-through text-gray-400'
                    )}>
                      {task.title}
                    </div>
                  </div>

                  {/* Time Spent */}
                  <div className="text-xs text-gray-500 font-bold min-w-[50px] text-right">
                    {formatTime(task.totalTimeSpent)}
                  </div>

                  {/* More Menu */}
                  <div className="relative" ref={showMenu === task.id ? menuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(showMenu === task.id ? null : task.id)
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                    
                    {showMenu === task.id && (
                      <div className="absolute right-0 top-6 bg-white/95 backdrop-blur-sm rounded-md shadow-lg py-0.5 z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTask(task.id)
                          }}
                          className="px-3 py-1.5 text-left hover:bg-gray-100/80 text-red-600 text-xs font-medium whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
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
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="What are you working on?"
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-tomato focus:outline-none transition-colors text-sm font-medium"
        />
        {newTaskTitle && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => setNewTaskTitle('')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

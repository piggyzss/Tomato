import { useTaskStore } from '@/store/useTaskStore'
import { useSettingsStore } from '@/store/useSettingsStore'

export function CurrentTask() {
  const { tasks, currentTaskId } = useTaskStore()
  const { theme } = useSettingsStore()
  const currentTask = tasks.find(t => t.id === currentTaskId)

  if (!currentTask) {
    return (
      <div
        className={`flex items-center justify-between py-3 px-4 mb-4 w-full max-w-2xl mx-auto rounded-lg transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur border border-gray-700'
            : 'bg-white/10 backdrop-blur'
        }`}
      >
        <div className="flex flex-col">
          <div
            className={`text-sm uppercase tracking-wide font-semibold transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : 'text-white'
            }`}
          >
            Working On
          </div>
          <div
            className={`text-base font-bold transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-white/80'
            }`}
          >
            Select a task to start
          </div>
        </div>
        <div
          className={`flex items-center gap-4 text-xl ${
            theme === 'dark' ? 'text-gray-500' : 'text-white/50'
          }`}
        >
          <span className="flex items-center gap-1">🍅 0</span>
          <span className="flex items-center gap-1">⏱️ 0m</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 mb-4 w-full max-w-2xl mx-auto rounded-lg transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/50 backdrop-blur border border-gray-700'
          : 'bg-white/10 backdrop-blur'
      }`}
    >
      <div className="flex flex-col">
        <div
          className={`text-sm uppercase tracking-wide font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-300' : 'text-white'
          }`}
        >
          Working On
        </div>
        <div
          className={`text-base font-bold transition-colors duration-300 break-words ${
            theme === 'dark' ? 'text-white' : 'text-white'
          }`}
        >
          {currentTask.title}
        </div>
      </div>

      {/* Task Progress Indicator */}
      <div
        className={`flex items-center gap-4 text-2xl font-bold ${
          theme === 'dark' ? 'text-gray-300' : 'text-white/90'
        }`}
      >
        <span className="flex items-center gap-1">
          🍅 {currentTask.pomodoroCount}
        </span>
        <span className="flex items-center gap-1">
          ⏱️ {Math.floor((currentTask.totalTimeSpent || 0) / 60)}m
        </span>
      </div>
    </div>
  )
}

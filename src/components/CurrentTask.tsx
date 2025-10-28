import { useTaskStore } from '@/store/useTaskStore'
import { useSettingsStore } from '@/store/useSettingsStore'

export function CurrentTask() {
  const { tasks, currentTaskId } = useTaskStore()
  const { theme } = useSettingsStore()
  const currentTask = tasks.find(t => t.id === currentTaskId)

  if (!currentTask) {
    return (
      <div
        className={`text-center py-6 mb-6 w-full max-w-2xl mx-auto rounded-xl transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur border border-gray-700'
            : 'bg-white/10 backdrop-blur'
        }`}
      >
        <div
          className={`text-xl mb-2 uppercase tracking-widest font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-300' : 'text-white'
          }`}
        >
          Working On
        </div>
        <div
          className={`text-lg font-bold transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-white/80'
          }`}
        >
          Select a task to start
        </div>
      </div>
    )
  }

  return (
    <div
      className={`text-center py-6 mb-6 w-full max-w-2xl mx-auto rounded-xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/50 backdrop-blur border border-gray-700'
          : 'bg-white/10 backdrop-blur'
      }`}
    >
      <div
        className={`text-xl mb-2 uppercase tracking-widest font-semibold transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-300' : 'text-white'
        }`}
      >
        Working On
      </div>
      <div
        className={`text-lg font-bold transition-colors duration-300 break-words px-4 ${
          theme === 'dark' ? 'text-white' : 'text-white'
        }`}
      >
        {currentTask.title}
      </div>

      {/* Task Progress Indicator */}
      <div
        className={`mt-3 flex items-center justify-center gap-4 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-white/70'
        }`}
      >
        <span className="flex items-center gap-1">
          🍅 {currentTask.pomodoroCount} pomodoros
        </span>
        <span className="flex items-center gap-1">
          ⏱️ {Math.floor((currentTask.totalTimeSpent || 0) / 60)}m spent
        </span>
      </div>
    </div>
  )
}

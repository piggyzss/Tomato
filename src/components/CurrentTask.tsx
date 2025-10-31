import { useTaskStore } from '@/store/useTaskStore'
import { useSettingsStore } from '@/store/useSettingsStore'

export function CurrentTask() {
  const { tasks, currentTaskId } = useTaskStore()
  const { theme } = useSettingsStore()
  const currentTask = tasks.find(t => t.id === currentTaskId)

  // Debug: Log when values change
  // console.log('CurrentTask render:', {
  //   pomodoroCount: currentTask?.pomodoroCount,
  //   totalTimeSpent: currentTask?.totalTimeSpent
  // })

  if (!currentTask) {
    return (
      <div
        className={`flex items-center justify-between py-3 px-4 mb-5 w-full max-w-2xl mx-auto rounded-xl transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur border border-gray-700'
            : 'bg-white/10 backdrop-blur'
        }`}
      >
        <div className="flex-1">
          <div
            className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-white/70'
            }`}
          >
            Working On
          </div>
          <div
            className={`text-sm font-semibold mt-0.5 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-white/80'
            }`}
          >
            Select a task to start
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 mb-5 w-full max-w-2xl mx-auto rounded-xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/50 backdrop-blur border border-gray-700'
          : 'bg-white/10 backdrop-blur'
      }`}
    >
      {/* Left Side - Working On */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-white/70'
          }`}
        >
          Working On
        </div>
        <div
          className={`text-sm font-bold mt-0.5 transition-colors duration-300 truncate ${
            theme === 'dark' ? 'text-white' : 'text-white'
          }`}
          title={currentTask.title}
        >
          {currentTask.title}
        </div>
      </div>

      {/* Right Side - Progress Stats */}
      <div
        className={`flex items-center gap-4 text-xs ml-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-white/70'
        }`}
      >
        <span className="flex items-center gap-1 whitespace-nowrap font-semibold">
          🍅 {currentTask.pomodoroCount}
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap font-semibold">
          ⏱️ {Math.floor((currentTask.totalTimeSpent || 0) / 60)}m
        </span>
      </div>
    </div>
  )
}

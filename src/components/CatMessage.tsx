import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { Cat } from 'lucide-react'

export function CatMessage() {
  const { status, remainingSeconds } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()

  // 获取当前任务名称
  const currentTask = tasks.find(t => t.id === currentTaskId)

  // 根据状态生成提示文案
  const getMessage = () => {
    // 计时结束
    if (status === 'idle' && remainingSeconds === 0) {
      return '🎉 Great job! Time to take a break and stretch~'
    }
    
    // 正在运行
    if (status === 'running') {
      if (currentTask) {
        return `💪 Working on "${currentTask.title}" - Stay focused!`
      }
      return '💪 Stay focused! You can do it!'
    }
    
    // 暂停中
    if (status === 'paused') {
      return '⏸️ Take a breath, then continue when ready~'
    }
    
    // 初始状态
    if (!currentTaskId) {
      return '😊 Hi! Pick a task from the list below to get started~'
    }
    
    return '👋 Ready to start your Pomodoro session?'
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3.5 shadow-md mb-5 transition-all hover:shadow-lg">
      <div className="flex items-center gap-3">
        {/* Cat Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-tomato/10 rounded-full flex items-center justify-center">
            <Cat size={24} className="text-tomato" strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-700 font-medium text-sm leading-relaxed truncate">
            {getMessage()}
          </p>
        </div>
      </div>
    </div>
  )
}


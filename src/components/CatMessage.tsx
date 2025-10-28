import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Cat, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

export function CatMessage() {
  const { status, remainingSeconds, mode } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()
  const { useAIMessages, aiMessages } = useSettingsStore()

  // 获取当前任务名称
  const currentTask = tasks.find(t => t.id === currentTaskId)



  // Find matching AI message based on context
  const getAIMessage = useMemo(() => {
    if (!useAIMessages || aiMessages.length === 0) return null
    
    // Try to find a message with similar context
    const matchingMessage = aiMessages.find(msg => {
      const msgContext = msg.context.toLowerCase()
      
      // Simple keyword matching
      if (status === 'running' && mode === 'pomodoro' && msgContext.includes('working')) return true
      if (status === 'running' && mode === 'shortBreak' && msgContext.includes('short break')) return true
      if (status === 'running' && mode === 'longBreak' && msgContext.includes('long break')) return true
      if (status === 'paused' && msgContext.includes('paused')) return true
      if (status === 'idle' && remainingSeconds === 0 && msgContext.includes('finished')) return true
      if (status === 'idle' && remainingSeconds > 0 && msgContext.includes('ready to start')) return true
      
      return false
    })
    
    // If no exact match, return a random recent message
    return matchingMessage || aiMessages[0] || null
  }, [useAIMessages, aiMessages, status, mode, remainingSeconds])

  // 根据状态生成提示文案
  const getMessage = () => {
    // Use AI message if available and enabled
    if (getAIMessage) {
      return getAIMessage.text
    }

    // Default messages
    // 计时结束
    if (status === 'idle' && remainingSeconds === 0) {
      return '🎉 Great job! Time to take a break and stretch~'
    }

    // 正在运行
    if (status === 'running') {
      if (mode === 'shortBreak' || mode === 'longBreak') {
        return '☕ Enjoy your break! Relax and recharge~'
      }
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
          <div className="flex items-center gap-2">
            <p className="text-gray-700 font-medium text-sm leading-relaxed flex-1 truncate">
              {getMessage()}
            </p>
            {getAIMessage && (
              <div className="flex-shrink-0" title="AI-generated message">
                <Sparkles 
                  size={14} 
                  className="text-blue-500 animate-pulse" 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

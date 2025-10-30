import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Cat, Sparkles } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { playSoundEffect } from '@/utils/soundEffects'

export function CatMessage() {
  const { status, remainingSeconds, mode, timerFinished, setTimerFinished } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()
  const { useAIMessages, aiMessages, soundEnabled, soundType } = useSettingsStore()
  const [isShaking, setIsShaking] = useState(false)

  // 获取当前任务名称
  const currentTask = tasks.find(t => t.id === currentTaskId)

  // 监听计时器完成标志，触发摇动动画和音效
  useEffect(() => {
    if (timerFinished) {
      // 播放提示音（如果启用）
      if (soundEnabled) {
        playSoundEffect(soundType)
      }

      setIsShaking(true)
      // 摇动动画持续约1秒后停止
      setTimeout(() => {
        setIsShaking(false)
        // 重置标志
        setTimerFinished(false)
      }, 1000)
    }
  }, [timerFinished, setTimerFinished, soundEnabled, soundType])



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
    // 计时结束 - 优先显示完成消息
    if (status === 'idle' && remainingSeconds === 0) {
      return 'Time is up! Great job! Time to take a break and stretch~'
    }

    // Use AI message if available and enabled
    if (getAIMessage) {
      return getAIMessage.text
    }

    // Default messages

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

  // 判断是否应该显示呼吸效果
  const shouldBreathe = status === 'running' && (mode === 'shortBreak' || mode === 'longBreak')

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .shake-animation {
          animation: shake 0.5s ease-in-out 2;
        }
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.7;
          }
        }
        .breathe-animation {
          animation: breathe 2s ease-in-out infinite;
        }
      `}</style>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-3.5 shadow-md mb-5 transition-all hover:shadow-lg max-w-full">
        <div className="flex items-start gap-3">
          {/* Cat Icon - 添加摇动和呼吸动画 */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 bg-tomato/10 rounded-full flex items-center justify-center">
              <Cat
                size={24}
                className={`text-tomato ${isShaking ? 'shake-animation' : ''} ${shouldBreathe ? 'breathe-animation' : ''}`}
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className="text-gray-700 font-medium text-sm leading-relaxed flex-1 break-words whitespace-pre-wrap">
                {getMessage()}
              </p>
              {getAIMessage && (
                <div className="flex-shrink-0 mt-0.5" title="AI-generated message">
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
    </>
  )
}

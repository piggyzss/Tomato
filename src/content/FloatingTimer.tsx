import { Cat, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FloatingTimerProps {
  onClose: () => void
}

export function FloatingTimer({ onClose }: FloatingTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [message, setMessage] = useState('Working...')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 从 chrome.storage 读取计时器状态
    const loadTimerState = () => {
      chrome.storage.local.get(['timerState'], (result) => {
        const state = result.timerState
        if (state && state.status === 'running') {
          // 计算剩余时间
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
          const remaining = Math.max(0, state.remainingSeconds - elapsed)
          setRemainingSeconds(remaining)
          
          if (remaining > 0) {
            setMessage('Stay focused! 💪')
          } else {
            setMessage('Time\'s up! 🎉')
          }
        } else if (state && state.status === 'paused') {
          setRemainingSeconds(state.pausedTime)
          setMessage('Paused ⏸️')
        }
      })
    }

    // 初始加载
    loadTimerState()

    // 每秒更新
    const interval = setInterval(loadTimerState, 1000)

    return () => clearInterval(interval)
  }, [])

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // 等待动画完成
  }

  if (!isVisible) return null

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] transition-all duration-300 ease-out"
      style={{
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-tomato/20">
        <div className="bg-gradient-to-r from-tomato/10 to-tomato/5 px-4 py-3 flex items-center gap-3">
          {/* Cat Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-tomato rounded-full flex items-center justify-center shadow-md">
              <Cat size={20} className="text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 mb-0.5">
              {message}
            </p>
            <p className="text-2xl font-bold text-tomato font-mono tracking-tight">
              {formatTime(remainingSeconds)}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors group"
            title="Close"
          >
            <X size={16} className="text-gray-500 group-hover:text-gray-700" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}


import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { formatTime } from '@/utils/time'
import { Cat, X } from 'lucide-react'
import { useEffect } from 'react'

interface FloatingWidgetProps {
  onClose: () => void
}

export function FloatingWidget({ onClose }: FloatingWidgetProps) {
  const { status, remainingSeconds } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()

  // 从 storage 同步状态
  useEffect(() => {
    const syncState = async () => {
      const data = await chrome.storage.local.get(['timerState', 'tasks'])
      if (data.timerState) {
        useTimerStore.setState({
          status: data.timerState.status,
          remainingSeconds: data.timerState.remainingSeconds
        })
      }
      if (data.tasks) {
        useTaskStore.setState({ tasks: data.tasks })
      }
    }
    
    syncState()
    
    // 监听存储变化
    const listener = (changes: any) => {
      if (changes.timerState) {
        useTimerStore.setState({
          status: changes.timerState.newValue?.status,
          remainingSeconds: changes.timerState.newValue?.remainingSeconds
        })
      }
      if (changes.tasks) {
        useTaskStore.setState({ tasks: changes.tasks.newValue })
      }
    }
    
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  // 获取当前任务
  const currentTask = tasks.find(t => t.id === currentTaskId)

  // 生成提示文案
  const getMessage = () => {
    if (status === 'idle' && remainingSeconds === 0) {
      return 'Time to rest! 🎉'
    }
    
    if (status === 'running') {
      if (currentTask) {
        return `${currentTask.title}`
      }
      return 'Stay focused! 💪'
    }
    
    if (status === 'paused') {
      return 'Paused ⏸️'
    }
    
    return 'Ready to start 😊'
  }

  // 点击打开侧边栏
  const handleOpenSidePanel = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        await chrome.sidePanel.open({ tabId: tab.id })
      }
    } catch (error) {
      console.error('Failed to open side panel:', error)
    }
  }

  return (
    <div 
      className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 w-80 cursor-pointer hover:shadow-xl transition-all border border-gray-200"
      onClick={handleOpenSidePanel}
      style={{ fontFamily: 'Quicksand, system-ui, sans-serif' }}
    >
      <div className="flex items-start gap-3">
        {/* Cat Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-9 h-9 bg-gradient-to-br from-tomato/20 to-tomato/10 rounded-full flex items-center justify-center">
            <Cat size={22} className="text-tomato" strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <p className="text-gray-700 font-medium text-xs mb-1.5 truncate">
            {getMessage()}
          </p>
          
          {/* Timer */}
          <div className="flex items-center gap-2">
            <span className="text-tomato font-bold text-2xl font-mono tracking-tight">
              {formatTime(remainingSeconds)}
            </span>
            {status === 'running' && (
              <span className="inline-flex h-2 w-2 rounded-full bg-tomato animate-pulse"></span>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Hint */}
      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
        <p className="text-gray-400 text-xs text-center">
          Click to open Tomato Cat panel
        </p>
      </div>
    </div>
  )
}


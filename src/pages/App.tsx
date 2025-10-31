import AI from '@/components/AI/index'
import Analysis from '@/components/Analysis'
import { CatMessage } from '@/components/CatMessage'
import { CurrentTask } from '@/components/CurrentTask'
import SettingsPanel from '@/components/SettingsPanel'
import { TaskListNew } from '@/components/TaskListNew'
import TimerPage from '@/components/TimerPage'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { getStorage, setStorage, getMultipleStorage } from '@/utils/storage'
import { checkAndArchiveIfNeeded } from '@/utils/historyManager'
import { aiService } from '@/services/aiService'
import { BarChart3, Bot, Settings, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
function App() {
  const { tasks, setTasks } = useTaskStore()
  const { setSettings, workDuration, theme } = useSettingsStore()
  const { setTotalSeconds } = useTimerStore()

  // Initialize theme
  useTheme()

  // 加载数据和初始化
  useEffect(() => {
    const loadData = async () => {
      // 1. 检查是否需要归档（跨天检测）
      await checkAndArchiveIfNeeded()
      
      // 2. 加载数据
      const { tasks: savedTasks, settings: savedSettings, geminiApiKey, aiModePreference } = 
        await getMultipleStorage(['tasks', 'settings', 'geminiApiKey', 'aiModePreference'])

      if (savedTasks) setTasks(savedTasks)
      if (savedSettings) setSettings(savedSettings)
      
      // 3. 初始化 AI 服务
      if (geminiApiKey) {
        aiService.setApiKey(geminiApiKey)
        console.log('AI API Key 已加载')
      }
      
      if (aiModePreference) {
        aiService.setModePreference(aiModePreference)
        console.log('AI 模式偏好已加载:', aiModePreference)
      } else {
        // 如果没有设置，使用默认值并保存
        const defaultMode = 'cloud'
        aiService.setModePreference(defaultMode)
        await setStorage('aiModePreference', defaultMode)
        console.log('使用默认 AI 模式:', defaultMode)
      }
    }

    loadData()
  }, [setTasks, setSettings])

  // 保存任务
  useEffect(() => {
    if (tasks.length >= 0) {
      setStorage('tasks', tasks)
    }
  }, [tasks])

  // 设置默认番茄钟时长（只在初始化时设置，不覆盖恢复的状态）
  useEffect(() => {
    // 检查是否有保存的计时器状态
    const checkTimerState = async () => {
      const savedState = await getStorage('timerState')
      // 只有在没有保存状态或状态为 idle 时才设置默认时长
      if (!savedState || (savedState as any).status === 'idle') {
        setTotalSeconds(workDuration * 60)
      }
    }
    checkTimerState()
  }, [workDuration, setTotalSeconds])

  const [activePanel, setActivePanel] = useState<'settings' | 'analysis' | 'ai' | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [showDebugButton] = useState(true) // 调试按钮开关
  
  // 监听每日重置消息
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'DAILY_RESET') {
        console.log('收到每日重置通知，重新加载数据')
        // 重新加载数据
        getStorage('tasks').then(tasks => {
          if (tasks) setTasks(tasks)
        })
        // 重置计时器状态
        const { reset, setStatus, setTotalSeconds } = useTimerStore.getState()
        reset()
        setStatus('idle')
        setTotalSeconds(workDuration * 60)
      }
    }
    
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [setTasks, workDuration])

  function setSettingsPanel(e: React.MouseEvent) {
    e.preventDefault()
    if (activePanel === 'settings') {
      setIsClosing(true)
      setTimeout(() => {
        setActivePanel(null)
        setIsClosing(false)
      }, 300)
    } else {
      setActivePanel('settings')
    }
  }

  function setAnalysisPanel(e: React.MouseEvent) {
    e.preventDefault()
    setActivePanel(activePanel === 'analysis' ? null : 'analysis')
  }

  function setAIPanel(e: React.MouseEvent) {
    e.preventDefault()
    setActivePanel(activePanel === 'ai' ? null : 'ai')
  }
  
  // 调试：手动触发每日重置
  async function handleDebugReset(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('确定要模拟零点归档和重置吗？这将归档当前数据并清空任务列表。')) {
      return
    }
    
    try {
      console.log('=== 开始手动触发每日重置 ===')
      console.log('当前任务数:', tasks.length)
      
      // 发送消息到 background script
      const response = await chrome.runtime.sendMessage({ type: 'TRIGGER_DAILY_RESET' })
      console.log('Background 响应:', response)
      
      if (response && response.success) {
        console.log('归档成功，开始重新加载数据')
        
        // 重新加载数据
        const { tasks: newTasks, history } = await getMultipleStorage(['tasks', 'history'])
        
        console.log('重新加载后的任务数:', newTasks?.length || 0)
        console.log('历史记录:', history)
        
        setTasks(newTasks || [])
        
        // 重置计时器状态
        const { reset, setStatus, setTotalSeconds } = useTimerStore.getState()
        reset()
        setStatus('idle')
        setTotalSeconds(workDuration * 60)
        console.log('计时器已重置')
        console.log('=== 重置完成 ===')
        
        alert('归档和重置成功！请查看控制台日志。')
      } else {
        console.error('归档失败:', response)
        alert('归档和重置失败: ' + (response?.error || '未知错误'))
      }
    } catch (error) {
      console.error('触发重置失败:', error)
      alert('触发重置失败: ' + (error as Error).message)
    }
  }

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-300 ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-tomato'
        }`}
    >
      {/* Fixed Top Section */}
      <div className="flex-shrink-0 max-w-2xl mx-auto w-full pt-6">
        {/* Cat Message - with horizontal padding */}
        <div className="px-6">
          <CatMessage />
        </div>

        {/* Timer Card - full width, no outer padding */}
        <div
          className={`py-5 px-6 mb-5 transition-colors duration-300 ${theme === 'dark'
            ? 'bg-gray-800/80 backdrop-blur border-y border-gray-700'
            : 'bg-tomato-light/30'
            }`}
        >
          {/* Timer Display */}
          <TimerPage />
        </div>
      </div>

      {/* Scrollable Section */}
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-6 pb-6">
        {/* Current Task */}
        <CurrentTask />

        {/* Task List */}
        <TaskListNew />

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-4 mt-6 relative">
          <button
            onClick={setSettingsPanel}
            id="settings-button"
            className={`p-2 rounded-lg transition-all duration-300 ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-tomato hover:bg-black/20 text-white'
              }`}
          >
            <Settings size={20} />
          </button>

          <button
            onClick={setAnalysisPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-tomato hover:bg-black/20 text-white'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          
          <button
            onClick={setAIPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-tomato hover:bg-black/20 text-white'
              }`}
          >
            <Bot className="w-5 h-5" />
          </button>
          
          {/* 调试按钮：手动触发每日重置 */}
          {showDebugButton && (
            <button
              onClick={handleDebugReset}
              title="调试：模拟零点归档和重置"
              className={`p-2 rounded-lg transition-all duration-300 ${theme === 'dark'
                ? 'bg-orange-700 hover:bg-orange-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div
          className={`text-center mt-6 mb-4 text-sm font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-gray-400' : 'text-white/50'
            }`}
        >
          Tomato Cat v0.1.0
        </div>
      </div>

      {/* Settings Modal */}
      {(activePanel === 'settings' || isClosing) && (
        <div
          className="fixed inset-x-0 z-50 flex items-end justify-center px-4"
          style={{
            top: 'auto',
            bottom: '120px',
            height: 'calc(100vh - 220px)',
            pointerEvents: 'none'
          }}
        >
          {/* Settings Panel */}
          <div
            className="relative w-full max-w-md mb-4"
            style={{
              animation: isClosing
                ? 'slideDown 0.3s cubic-bezier(0.4, 0, 1, 1)'
                : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SettingsPanel onClose={() => {
              setIsClosing(true)
              setTimeout(() => {
                setActivePanel(null)
                setIsClosing(false)
              }, 300)
            }} />
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {(activePanel === 'analysis' || isClosing) && (
        <div
          className="fixed inset-x-0 z-50 flex items-end justify-center px-4"
          style={{
            top: 'auto',
            bottom: '120px',
            height: 'calc(100vh - 220px)',
            pointerEvents: 'none'
          }}
        >
          {/* Analysis Panel */}
          <div
            className="relative w-full max-w-md mb-4"
            style={{
              animation: isClosing
                ? 'slideDown 0.3s cubic-bezier(0.4, 0, 1, 1)'
                : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Analysis onClose={() => {
              setIsClosing(true)
              setTimeout(() => {
                setActivePanel(null)
                setIsClosing(false)
              }, 300)
            }} />
          </div>
        </div>
      )}

      {/* AI Modal */}
      {(activePanel === 'ai' || isClosing) && (
        <div
          className="fixed inset-x-0 z-50 flex items-end justify-center px-4"
          style={{
            top: 'auto',
            bottom: '120px',
            height: 'calc(100vh - 220px)',
            pointerEvents: 'none'
          }}
        >
          {/* AI Panel */}
          <div
            className="relative w-full max-w-md mb-4"
            style={{
              animation: isClosing
                ? 'slideDown 0.3s cubic-bezier(0.4, 0, 1, 1)'
                : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AI onClose={() => {
              setIsClosing(true)
              setTimeout(() => {
                setActivePanel(null)
                setIsClosing(false)
              }, 300)
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App

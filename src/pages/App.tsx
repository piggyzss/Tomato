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
import { BarChart3, Bot, Settings } from 'lucide-react'
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
      const {
        tasks: savedTasks,
        settings: savedSettings,
        geminiApiKey,
      } = await getMultipleStorage(['tasks', 'settings', 'geminiApiKey'])

      if (savedTasks) setTasks(savedTasks)

      // 加载设置（包含 aiProvider）
      if (savedSettings) {
        setSettings(savedSettings)
        // 从设置中获取 AI 提供商偏好
        const aiProvider = savedSettings.aiProvider || 'builtin'
        aiService.setModePreference(aiProvider)
        console.log('AI 模式偏好已从设置加载:', aiProvider)
      } else {
        // 如果没有设置，使用默认值
        const defaultProvider = 'builtin'
        aiService.setModePreference(defaultProvider)
        console.log('使用默认 AI 模式:', defaultProvider)
      }

      // 3. 初始化 AI 服务
      if (geminiApiKey) {
        aiService.setApiKey(geminiApiKey)
        console.log('AI API Key 已加载')
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

  const [activePanel, setActivePanel] = useState<
    'settings' | 'analysis' | 'ai' | null
  >(null)
  const [isClosing, setIsClosing] = useState(false)

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
    if (activePanel === 'analysis') {
      setIsClosing(true)
      setTimeout(() => {
        setActivePanel(null)
        setIsClosing(false)
      }, 300)
    } else {
      setActivePanel('analysis')
    }
  }

  function setAIPanel(e: React.MouseEvent) {
    e.preventDefault()
    if (activePanel === 'ai') {
      setIsClosing(true)
      setTimeout(() => {
        setActivePanel(null)
        setIsClosing(false)
      }, 300)
    } else {
      setActivePanel('ai')
    }
  }

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-300 ${
        theme === 'dark'
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
          className={`py-5 px-6 mb-5 transition-colors duration-300 ${
            theme === 'dark'
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
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-tomato hover:bg-black/20 text-white'
            }`}
          >
            <Settings size={20} />
          </button>

          <button
            onClick={setAnalysisPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-tomato hover:bg-black/20 text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          <button
            onClick={setAIPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-tomato hover:bg-black/20 text-white'
            }`}
          >
            <Bot className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div
          className={`text-center mt-6 mb-4 text-sm font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-white/50'
          }`}
        >
          Tomato Cat v0.1.0
        </div>
      </div>

      {/* Unified Modal Container */}
      {activePanel && (
        <div
          className="fixed inset-x-0 z-50 flex items-end justify-center px-4"
          style={{
            top: 'auto',
            bottom: '80px',
            height: 'calc(100vh - 180px)',
            pointerEvents: 'none',
          }}
        >
          {/* Panel Container */}
          <div
            className="relative w-full max-w-md mb-4"
            style={{
              animation: isClosing
                ? 'slideDown 0.3s cubic-bezier(0.4, 0, 1, 1)'
                : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {activePanel === 'settings' && (
              <SettingsPanel
                onClose={() => {
                  setIsClosing(true)
                  setTimeout(() => {
                    setActivePanel(null)
                    setIsClosing(false)
                  }, 300)
                }}
              />
            )}
            {activePanel === 'analysis' && (
              <Analysis
                onClose={() => {
                  setIsClosing(true)
                  setTimeout(() => {
                    setActivePanel(null)
                    setIsClosing(false)
                  }, 300)
                }}
              />
            )}
            {activePanel === 'ai' && (
              <AI
                onClose={() => {
                  setIsClosing(true)
                  setTimeout(() => {
                    setActivePanel(null)
                    setIsClosing(false)
                  }, 300)
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

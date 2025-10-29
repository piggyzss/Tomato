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
import { getStorage, setStorage } from '@/utils/storage'
import { BarChart3, Bot, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
function App() {
  const { tasks, setTasks } = useTaskStore()
  const { setSettings, workDuration, theme } = useSettingsStore()
  const { setTotalSeconds } = useTimerStore()

  // Initialize theme
  useTheme()

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      const [savedTasks, savedSettings] = await Promise.all([
        getStorage('tasks'),
        getStorage('settings'),
      ])

      if (savedTasks) setTasks(savedTasks)
      if (savedSettings) setSettings(savedSettings)
    }

    loadData()
  }, [setTasks, setSettings])

  // 保存任务
  useEffect(() => {
    if (tasks.length >= 0) {
      setStorage('tasks', tasks)
    }
  }, [tasks])

  // 设置默认番茄钟时长
  useEffect(() => {
    setTotalSeconds(workDuration * 60)
  }, [workDuration, setTotalSeconds])

  const [activePanel, setActivePanel] = useState<'settings' | 'analysis' | 'ai' | null>(null)
  const [isClosing, setIsClosing] = useState(false)

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
          className={`py-8 px-6 mb-5 transition-colors duration-300 ${theme === 'dark'
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
            {/* <span className="ml-2">分析</span> */}
          </button>
          <button
            onClick={setAIPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-tomato hover:bg-black/20 text-white'
              }`}
          >
            <Bot className="w-5 h-5" />
            {/* <span className="ml-2">分析</span> */}
          </button>
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

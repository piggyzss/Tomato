import AI from '@/components/AI'
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

  function setSettingsPanel(e: React.MouseEvent) {
    e.preventDefault()
    setActivePanel(activePanel === 'settings' ? null : 'settings')
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
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-tomato'
      }`}
    >
      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col items-center">
        {/* Cat Message */}
        <CatMessage />

        {/* Timer Card */}
        <div
          className={`rounded-2xl px-8 py-8 mb-5 transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/80 backdrop-blur border border-gray-700'
              : 'bg-tomato-light/30'
          }`}
        >
          {/* Timer Display */}
          <TimerPage />
        </div>

        {/* Current Task */}
        <CurrentTask />

        {/* Task List */}
        <TaskListNew />

        {activePanel === 'settings' && <SettingsPanel />}
        {activePanel === 'analysis' && <Analysis />}
        {activePanel === 'ai' && <AI />}
        
        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={setSettingsPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
          >
            <Settings size={20} />
          </button>

          <button
            onClick={setAnalysisPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            {/* <span className="ml-2">分析</span> */}
          </button>
           <button
            onClick={setAIPanel}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
          >
            <Bot className="w-5 h-5" />
            {/* <span className="ml-2">分析</span> */}
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
    </div>
  )
}

export default App

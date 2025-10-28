import { BigTimer } from '@/components/BigTimer'
import { CurrentTask } from '@/components/CurrentTask'
import { TaskListNew } from '@/components/TaskListNew'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { getStorage, setStorage } from '@/utils/storage'
import { useEffect } from 'react'

function App() {
  const { tasks, setTasks } = useTaskStore()
  const { setSettings, workDuration } = useSettingsStore()
  const { setTotalSeconds } = useTimerStore()

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      const [savedTasks, savedSettings] = await Promise.all([
        getStorage('tasks'),
        getStorage('settings')
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

  return (
    <div className="min-h-screen bg-tomato">
      <div className="max-w-2xl mx-auto px-6 py-6">

        {/* Timer Card */}
        <div className="bg-tomato-light/30 rounded-2xl px-8 py-8 mb-5">
          {/* Timer Display */}
          <BigTimer />
        </div>

        {/* Current Task */}
        <CurrentTask />

        {/* Task List */}
        <TaskListNew />

        {/* Footer */}
        <div className="text-center mt-6 mb-4 text-white/50 text-sm font-medium">
          Tomato Cat v0.1.0
        </div>
      </div>
    </div>
  )
}

export default App

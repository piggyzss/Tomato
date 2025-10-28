import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { getStorage, onStorageChange, setStorage } from '@/utils/storage'
import { useEffect } from 'react'

/**
 * 数据同步 Hook
 * 负责加载和保存数据到 Chrome Storage
 */
export function useStorage() {
  const { tasks, setTasks } = useTaskStore()
  const { setSettings, ...settings } = useSettingsStore()

  // 初始化加载数据
  useEffect(() => {
    const loadData = async () => {
      const [savedTasks, savedSettings] = await Promise.all([
        getStorage('tasks'),
        getStorage('settings'),
      ])

      if (savedTasks) {
        setTasks(savedTasks)
      }

      if (savedSettings) {
        setSettings(savedSettings)
      }
    }

    loadData()
  }, [setTasks, setSettings])

  // 监听任务变化并保存
  useEffect(() => {
    if (tasks.length >= 0) {
      setStorage('tasks', tasks).catch(console.error)
    }
  }, [tasks])

  // 监听设置变化并保存
  useEffect(() => {
    setStorage('settings', settings).catch(console.error)
  }, [settings])

  // 监听其他标签页的数据变化
  useEffect(() => {
    const unsubscribe = onStorageChange(changes => {
      if (changes.tasks) {
        setTasks(changes.tasks.newValue)
      }
      if (changes.settings) {
        setSettings(changes.settings.newValue)
      }
    })

    return unsubscribe
  }, [setTasks, setSettings])
}

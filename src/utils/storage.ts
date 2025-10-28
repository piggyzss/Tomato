import type { StorageData } from '@/types'

// 默认存储数据
const defaultData: Partial<StorageData> = {
  tasks: [],
  statistics: [],
  pomodoroRecords: [],
  aiHistory: [],
  settings: {
    workDuration: 10 / 60, // 10秒，方便调试
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    soundEnabled: true,
    notificationEnabled: true,
    theme: 'light',
    language: 'zh-CN',
    aiEnabled: false
  }
}

// 获取存储数据
export async function getStorage<K extends keyof StorageData>(
  key: K
): Promise<StorageData[K] | undefined> {
  try {
    const result = await chrome.storage.local.get(key)
    return result[key] ?? defaultData[key]
  } catch (error) {
    console.error('Error reading from storage:', error)
    return defaultData[key]
  }
}

// 设置存储数据
export async function setStorage<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
): Promise<void> {
  try {
    await chrome.storage.local.set({ [key]: value })
  } catch (error) {
    console.error('Error writing to storage:', error)
    throw error
  }
}

// 获取所有存储数据
export async function getAllStorage(): Promise<Partial<StorageData>> {
  try {
    const result = await chrome.storage.local.get(null)
    return { ...defaultData, ...result }
  } catch (error) {
    console.error('Error reading all storage:', error)
    return defaultData
  }
}

// 清空存储数据
export async function clearStorage(): Promise<void> {
  try {
    await chrome.storage.local.clear()
  } catch (error) {
    console.error('Error clearing storage:', error)
    throw error
  }
}

// 监听存储变化
export function onStorageChange(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
) {
  chrome.storage.local.onChanged.addListener(callback)
  
  // 返回取消监听函数
  return () => chrome.storage.local.onChanged.removeListener(callback)
}


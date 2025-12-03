import type { StorageData } from '@/types'

// 默认存储数据
const defaultData: Partial<StorageData> = {
  tasks: [],
  statistics: [],
  pomodoroRecords: [],
  aiHistory: [],
  settings: {
    workDuration: 25, // 25分钟
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    soundEnabled: true,
    soundType: 'ding',
    notificationEnabled: true,
    theme: 'light',
    language: 'en-US', // 默认英文
    aiEnabled: false,
    aiMessages: [],
    useAIMessages: false,
    aiProvider: 'builtin', // 默认使用内置 AI
  },
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

// 批量获取存储数据
export async function getMultipleStorage<K extends keyof StorageData>(
  keys: K[]
): Promise<{ [P in K]: StorageData[P] | undefined }> {
  try {
    const results = await Promise.all(keys.map(key => getStorage(key)))
    const resultObj = {} as { [P in K]: StorageData[P] | undefined }
    keys.forEach((key, index) => {
      resultObj[key] = results[index]
    })
    return resultObj
  } catch (error) {
    console.error('Error reading multiple storage keys:', error)
    const resultObj = {} as { [P in K]: StorageData[P] | undefined }
    keys.forEach(key => {
      resultObj[key] = defaultData[key]
    })
    return resultObj
  }
}

// 批量设置存储数据
export async function setMultipleStorage(
  data: Partial<StorageData>
): Promise<void> {
  try {
    // chrome.storage.local.set 本身就支持一次性设置多个键值对
    await chrome.storage.local.set(data)
  } catch (error) {
    console.error('Error writing multiple storage keys:', error)
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

// 获取存储使用情况
export async function getStorageUsage(): Promise<{
  bytesInUse: number
  quota: number
  percentage: number
  formattedSize: string
}> {
  try {
    const bytesInUse = await chrome.storage.local.getBytesInUse()
    const quota = chrome.storage.local.QUOTA_BYTES || 10485760 // 10MB
    const percentage = (bytesInUse / quota) * 100

    // 格式化大小显示
    const formatBytes = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    return {
      bytesInUse,
      quota,
      percentage: Math.round(percentage * 100) / 100,
      formattedSize: formatBytes(bytesInUse),
    }
  } catch (error) {
    console.error('Error getting storage usage:', error)
    return { bytesInUse: 0, quota: 0, percentage: 0, formattedSize: '0 B' }
  }
}

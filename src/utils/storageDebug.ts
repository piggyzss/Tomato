// 存储调试工具
import { getStorage, getStorageUsage, getAllStorage } from './storage'
import type { PomodoroRecord, Task } from '@/types'

/**
 * 打印当前存储使用情况
 */
export async function logStorageUsage() {
  const usage = await getStorageUsage()
  console.log('=== 存储使用情况 ===')
  console.log(`已使用: ${usage.formattedSize}`)
  console.log(`配额: ${(usage.quota / (1024 * 1024)).toFixed(2)} MB`)
  console.log(`使用率: ${usage.percentage.toFixed(2)}%`)
  console.log('==================')
}

/**
 * 打印番茄钟记录统计
 */
export async function logPomodoroRecords() {
  const records = (await getStorage('pomodoroRecords')) || []
  const completed = records.filter((r: PomodoroRecord) => r.completed)
  const incomplete = records.filter((r: PomodoroRecord) => !r.completed)

  console.log('=== 番茄钟记录统计 ===')
  console.log(`总记录数: ${records.length}`)
  console.log(`已完成: ${completed.length}`)
  console.log(`未完成: ${incomplete.length}`)
  console.log('==================')

  return { total: records.length, completed: completed.length, incomplete: incomplete.length }
}

/**
 * 打印任务统计
 */
export async function logTaskStats() {
  const tasks = (await getStorage('tasks')) || []
  const completed = tasks.filter((t: Task) => t.status === 'completed')
  const inProgress = tasks.filter((t: Task) => t.status === 'in-progress')
  const todo = tasks.filter((t: Task) => t.status === 'todo')

  console.log('=== 任务统计 ===')
  console.log(`总任务数: ${tasks.length}`)
  console.log(`已完成: ${completed.length}`)
  console.log(`进行中: ${inProgress.length}`)
  console.log(`待办: ${todo.length}`)
  console.log('==================')

  return { total: tasks.length, completed: completed.length, inProgress: inProgress.length, todo: todo.length }
}

/**
 * 打印历史数据统计
 */
export async function logHistoryStats() {
  const history = (await getStorage('history')) || {}
  const dates = Object.keys(history).sort()

  console.log('=== 历史数据统计 ===')
  console.log(`历史天数: ${dates.length}`)
  if (dates.length > 0) {
    console.log(`最早日期: ${dates[0]}`)
    console.log(`最新日期: ${dates[dates.length - 1]}`)
  }
  console.log('==================')

  return { days: dates.length, dates }
}

/**
 * 打印所有存储数据概览
 */
export async function logAllStorageOverview() {
  console.log('\n📊 === 存储数据完整概览 === 📊\n')
  
  await logStorageUsage()
  console.log('')
  
  await logTaskStats()
  console.log('')
  
  await logPomodoroRecords()
  console.log('')
  
  await logHistoryStats()
  console.log('')
  
  console.log('✅ 数据概览完成\n')
}

/**
 * 导出所有数据为JSON（用于备份）
 */
export async function exportAllData() {
  const allData = await getAllStorage()
  const dataStr = JSON.stringify(allData, null, 2)
  
  console.log('=== 导出数据 ===')
  console.log(`数据大小: ${(dataStr.length / 1024).toFixed(2)} KB`)
  
  // 创建下载链接
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tomato-cat-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('✅ 数据已导出')
}

// 在开发环境中暴露到 window 对象
if (import.meta.env.DEV) {
  (window as any).storageDebug = {
    logStorageUsage,
    logPomodoroRecords,
    logTaskStats,
    logHistoryStats,
    logAllStorageOverview,
    exportAllData,
  }
  console.log('💡 存储调试工具已加载，使用 window.storageDebug 访问')
}

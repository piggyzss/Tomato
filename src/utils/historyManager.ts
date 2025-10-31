import type { DailyHistory, Task, PomodoroRecord } from '@/types'
import { getStorage, setStorage, getMultipleStorage, setMultipleStorage } from '@/utils/storage'

/**
 * 获取当前日期字符串 YYYY-MM-DD
 */
export function getCurrentDateString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * 归档当天数据到历史记录
 */
export async function archiveTodayData(): Promise<void> {
  try {
    const today = getCurrentDateString()
    console.log('开始归档数据，日期:', today)

    // 获取当前数据
    const { tasks, pomodoroRecords, history } = await getMultipleStorage([
      'tasks',
      'pomodoroRecords',
      'history',
    ])

    // 计算统计数据
    const completedPomodoros = pomodoroRecords?.filter((r: PomodoroRecord) => r.completed).length || 0
    const totalFocusTime = pomodoroRecords?.reduce((sum: number, r: PomodoroRecord) => {
      return r.completed ? sum + (r.duration / 60) : sum
    }, 0) || 0
    const completedTasks = tasks?.filter((t: Task) => t.status === 'completed').length || 0

    // 创建今日历史记录
    const todayHistory: DailyHistory = {
      date: today,
      tasks: tasks || [],
      pomodoroRecords: pomodoroRecords || [],
      completedPomodoros,
      totalFocusTime,
      completedTasks,
    }

    // 更新历史记录
    const updatedHistory = {
      ...(history || {}),
      [today]: todayHistory,
    }

    // 清理超过90天的历史数据
    const cleanedHistory = cleanOldHistory(updatedHistory, 90)

    // 保存历史记录
    await setStorage('history', cleanedHistory)
    await setStorage('lastResetDate', today)

    console.log('数据归档完成:', todayHistory)
  } catch (error) {
    console.error('归档数据失败:', error)
    throw error
  }
}

/**
 * 重置当天数据
 */
export async function resetTodayData(): Promise<void> {
  try {
    console.log('开始重置当天数据')

    // 清空任务列表和番茄钟记录
    await setMultipleStorage({
      tasks: [],
      pomodoroRecords: [],
      currentTaskId: undefined,
      timerState: undefined,
    })

    console.log('当天数据重置完成')
  } catch (error) {
    console.error('重置数据失败:', error)
    throw error
  }
}

/**
 * 检查是否需要归档（跨天检测）
 */
export async function checkAndArchiveIfNeeded(): Promise<boolean> {
  try {
    const today = getCurrentDateString()
    const lastResetDate = await getStorage('lastResetDate')

    console.log('检查是否需要归档 - 今天:', today, '上次重置:', lastResetDate)

    // 如果是首次运行或者日期不同，需要归档
    if (!lastResetDate || lastResetDate !== today) {
      console.log('检测到跨天，开始归档和重置')
      
      // 只有在有上次重置日期时才归档（避免首次运行归档空数据）
      if (lastResetDate) {
        await archiveTodayData()
      } else {
        // 首次运行，只设置日期
        await setStorage('lastResetDate', today)
      }
      
      await resetTodayData()
      return true
    }

    return false
  } catch (error) {
    console.error('检查归档失败:', error)
    return false
  }
}

/**
 * 清理超过指定天数的历史数据
 */
function cleanOldHistory(
  history: Record<string, DailyHistory>,
  maxDays: number
): Record<string, DailyHistory> {
  const today = new Date()
  const cutoffDate = new Date(today.getTime() - maxDays * 24 * 60 * 60 * 1000)
  const cutoffDateString = cutoffDate.toISOString().split('T')[0]

  const cleaned: Record<string, DailyHistory> = {}

  for (const [date, data] of Object.entries(history)) {
    if (date >= cutoffDateString) {
      cleaned[date] = data
    } else {
      console.log('清理过期历史数据:', date)
    }
  }

  return cleaned
}

/**
 * 获取历史数据
 */
export async function getHistory(): Promise<Record<string, DailyHistory>> {
  const history = await getStorage('history')
  return history || {}
}

/**
 * 获取指定日期的历史数据
 */
export async function getHistoryByDate(date: string): Promise<DailyHistory | null> {
  const history = await getHistory()
  return history[date] || null
}

/**
 * 获取最近N天的历史数据
 */
export async function getRecentHistory(days: number): Promise<DailyHistory[]> {
  const history = await getHistory()
  const dates = Object.keys(history).sort().reverse().slice(0, days)
  return dates.map(date => history[date])
}

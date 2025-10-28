import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 格式化秒数为 MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化日期
export function formatDate(timestamp: number, formatStr: string = 'yyyy-MM-dd'): string {
  return format(timestamp, formatStr, { locale: zhCN })
}

// 相对时间
export function timeAgo(timestamp: number): string {
  if (isToday(timestamp)) {
    return '今天'
  }
  if (isYesterday(timestamp)) {
    return '昨天'
  }
  return formatDistanceToNow(timestamp, { addSuffix: true, locale: zhCN })
}

// 分钟转毫秒
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000
}

// 毫秒转分钟
export function msToMinutes(ms: number): number {
  return Math.floor(ms / 60000)
}


import type { TimeRange } from './types'

// Helper function to get date range
export const getDateRange = (range: TimeRange) => {
  const now = new Date()
  const endDate = now
  const startDate = new Date()
  
  switch (range) {
    case 'day':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setDate(now.getDate() - 30)
      break
  }
  
  return { startDate: startDate.getTime(), endDate: endDate.getTime() }
}

// Helper function to format time
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

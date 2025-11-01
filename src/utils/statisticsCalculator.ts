// src/utils/statisticsCalculator.ts
import type { Task, PomodoroRecord } from '@/types'

/**
 * Calculate basic statistics from tasks and pomodoro records
 */
export function calculateBasicStatistics(
  tasks: Task[],
  pomodoroRecords: PomodoroRecord[]
) {
  const completedPomodoros = pomodoroRecords.filter(r => r.completed).length

  const totalFocusTime = Math.round(
    pomodoroRecords.reduce((sum, r) => {
      return r.completed ? sum + r.duration / 60 : sum
    }, 0)
  )

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length

  return {
    completedPomodoros,
    totalFocusTime,
    completedTasks,
    totalTasks,
  }
}

/**
 * Calculate average session length from pomodoro records
 */
export function calculateAverageSessionLength(
  pomodoroRecords: PomodoroRecord[]
): number {
  const completedRecords = pomodoroRecords.filter(r => r.completed)

  if (completedRecords.length === 0) {
    return 0
  }

  const totalMinutes = completedRecords.reduce(
    (sum, r) => sum + r.duration / 60,
    0
  )

  return Math.round(totalMinutes / completedRecords.length)
}

/**
 * Calculate productivity score (0-100) based on task completion and pomodoro count
 */
export function calculateProductivityScore(
  completedTasks: number,
  totalTasks: number,
  completedPomodoros: number
): number {
  let productivityScore = 0

  if (totalTasks > 0) {
    // Base score on task completion rate (80% weight)
    const taskCompletionRate = (completedTasks / totalTasks) * 100
    // Bonus points for pomodoros (max 20 points)
    const pomodoroBonus = Math.min(completedPomodoros * 5, 20)
    productivityScore = Math.min(
      Math.round(taskCompletionRate * 0.8 + pomodoroBonus),
      100
    )
  } else if (completedPomodoros > 0) {
    // If no tasks but has pomodoros, give partial score
    productivityScore = Math.min(completedPomodoros * 10, 60)
  }

  return productivityScore
}

/**
 * Calculate all statistics at once
 */
export function calculateAllStatistics(
  tasks: Task[],
  pomodoroRecords: PomodoroRecord[]
) {
  const basicStats = calculateBasicStatistics(tasks, pomodoroRecords)
  const averageSessionLength = calculateAverageSessionLength(pomodoroRecords)
  const productivityScore = calculateProductivityScore(
    basicStats.completedTasks,
    basicStats.totalTasks,
    basicStats.completedPomodoros
  )

  return {
    ...basicStats,
    averageSessionLength,
    productivityScore,
  }
}

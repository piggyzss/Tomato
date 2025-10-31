// src/utils/insightsGenerator.ts
/**
 * Generate default insights based on productivity statistics.
 * These are status-based observations, not actionable recommendations.
 * For actionable advice, use AI-generated insights instead.
 */
export function generateDefaultInsights(stats: {
  completedPomodoros: number
  completedTasks: number
  totalFocusTime: number
  productivityScore: number
  totalTasks: number
}): string[] {
  const {
    completedPomodoros,
    completedTasks,
    totalFocusTime,
    productivityScore,
    totalTasks,
  } = stats
  const insights: string[] = []

  // Pomodoro completion insight
  if (completedPomodoros > 0) {
    insights.push(
      `🎯 You completed ${completedPomodoros} pomodoro session${completedPomodoros > 1 ? 's' : ''} today!`
    )
  }

  // Task completion insight
  if (completedTasks > 0) {
    insights.push(
      `✅ ${completedTasks} task${completedTasks > 1 ? 's' : ''} completed - great progress!`
    )
  }

  // Focus time insight
  if (totalFocusTime >= 60) {
    const hours = Math.floor(totalFocusTime / 60)
    const minutes = totalFocusTime % 60
    insights.push(`⏰ ${hours}h ${minutes}m of focused work - impressive!`)
  } else if (totalFocusTime > 0) {
    insights.push(`⏰ ${totalFocusTime} minutes of focused work today.`)
  }

  // Productivity score insight
  if (productivityScore >= 80) {
    insights.push('🔥 Outstanding productivity today!')
  } else if (productivityScore >= 60) {
    insights.push('👍 Good work today, keep it up!')
  } else if (totalTasks === 0 && completedPomodoros === 0) {
    insights.push(
      '💡 Click the refresh button above to get AI-powered recommendations!'
    )
  }

  // Ensure at least one insight
  if (insights.length === 0) {
    insights.push('📊 Start tracking your productivity with pomodoro sessions!')
  }

  return insights
}

/**
 * Parse AI-generated summary text into individual insights
 * @param aiSummary - The raw AI summary text
 * @param maxInsights - Maximum number of insights to return (default: 4)
 * @returns Array of parsed insight strings
 */
export function parseAISummaryToInsights(
  aiSummary: unknown,
  maxInsights: number = 4
): string[] {
  const summaryText = String(aiSummary)

  const insights = summaryText
    .split('\n')
    .filter((line: string) => line.trim().length > 0)
    .map((line: string) => line.replace(/^[-*]\s*/, '').trim())
    .filter((line: string) => line.length > 0)
    .slice(0, maxInsights)

  return insights
}

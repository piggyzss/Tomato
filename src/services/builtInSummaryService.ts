// src/services/builtInSummaryService.ts
//@panpan
/**
 * Utility functions for interacting with the Summarizer API.
 * Handles feature detection, availability, and summarization logic.
 */

export async function createSummarizer() {
  const summarizerClass =
    (window as any).Summarizer || (window as any).ai?.summarizer

  if (!summarizerClass) {
    throw new Error(
      'Summarizer API not found. Try enabling Chrome flags:\n' +
        'chrome://flags/#prompt-api-for-gemini-nano\n' +
        'chrome://flags/#summarization-api-for-gemini-nano'
    )
  }

  const availability = await summarizerClass.availability()
  if (availability === 'unavailable') {
    throw new Error('Summarizer API unavailable or model not downloaded.')
  }

  const summarizer = await summarizerClass.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
    expectedInputLanguages: ['en'],
    outputLanguage: 'en',
    sharedContext: 'This is a productivity and focus session summary.',
    monitor(m: any) {
      m.addEventListener('downloadprogress', (e: any) => {
        console.log(`Downloaded ${(e.loaded * 100).toFixed(0)}%`)
      })
    },
  })

  return summarizer
}

/**
 * Generates a preset paragraph describing the user's focus stats.
 */
export function buildPresetSummaryText(summaryData: {
  date: string
  totalFocusTime: number
  completedPomodoros: number
  completedTasks: number
  averageSessionLength: number
  productivityScore: number
  insights: string[]
}) {
  return `
Today (${summaryData.date}), you completed ${summaryData.completedTasks} tasks 
and focused for ${summaryData.totalFocusTime} minutes across ${summaryData.completedPomodoros} pomodoro sessions. 
Your average session length was ${summaryData.averageSessionLength} minutes, 
earning a productivity score of ${summaryData.productivityScore} out of 100.
${
  summaryData.productivityScore >= 80
    ? 'You maintained excellent consistency and focus throughout the day! 🎯'
    : 'There is room for improvement — try optimizing your break intervals for better energy flow. ⚡'
}
Here are your AI insights:
${summaryData.insights.map(i => `- ${i}`).join('\n')}
`
}

/**
 * Summarize the preset text into a motivational, short summary.
 */
export async function generateSummary(presetText: string) {
  const summarizer = await createSummarizer()
  const result = await summarizer.summarize(presetText, {
    context: 'Provide an insightful, motivational summary for the user.',
  })
  return result
}

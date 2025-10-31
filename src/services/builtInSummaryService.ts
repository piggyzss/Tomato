// src/services/builtInSummaryService.ts
//@panpan
/**
 * Utility functions for interacting with the Summarizer API.
 * Handles feature detection, availability, and summarization logic.
 */

/**
 * Availability status for Chrome Built-in AI APIs
 */
export enum AIAvailability {
  /** Model is ready and can be used immediately */
  READILY = 'readily',
  /** Model is currently downloading, will be available after download completes */
  AFTER_DOWNLOAD = 'after-download',
  /** Model can be downloaded but hasn't been downloaded yet */
  DOWNLOADABLE = 'downloadable',
  /** API is not available on this device */
  NO = 'no',
}

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

  const availability = (await summarizerClass.availability()) as AIAvailability

  if (availability === AIAvailability.NO) {
    throw new Error('Summarizer API is not available on this device.')
  }

  if (availability === AIAvailability.AFTER_DOWNLOAD) {
    throw new Error(
      'Summarizer model is downloading. Please wait and try again later.\n' +
      'Check progress at: chrome://components/'
    )
  }

  if (availability === AIAvailability.DOWNLOADABLE) {
    throw new Error(
      'Gemini Nano model needs to be downloaded first (about 1.5GB).\n\n' +
      'To download:\n' +
      '1. Visit: chrome://components/\n' +
      '2. Find "Optimization Guide On Device Model"\n' +
      '3. Click "Check for update"\n' +
      '4. Wait for download to complete (10-30 minutes)\n' +
      '5. Return and try again'
    )
  }

  const summarizer = await summarizerClass.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
    sharedContext: 'This is a productivity and focus session summary.',
    monitor(m: any) {
      m.addEventListener('downloadprogress', (e: any) => {
        const percent = Math.round(e.loaded * 100)
        console.log(`Model download progress: ${percent}%`)
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
${summaryData.productivityScore >= 80
      ? 'You maintained excellent consistency and focus throughout the day! 🎯'
      : 'There is room for improvement — try optimizing your break intervals for better energy flow. ⚡'
    }
Here are your AI insights:
${summaryData.insights.map(i => `- ${i}`).join('\n')}
`
}

/**
 * Helper function to add timeout to promises
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

/**
 * Summarize the preset text into a motivational, short summary.
 */
export async function generateSummary(presetText: string) {
  const summarizer = await withTimeout(
    createSummarizer(),
    60000,
    'Summarizer creation timeout. The model might be initializing. Please try again.'
  )

  const result = await withTimeout(
    summarizer.summarize(presetText, {
      context: 'Provide an insightful, motivational summary for the user.',
    }),
    30000,
    'Summarization timeout. Please try with shorter text.'
  )

  return result
}

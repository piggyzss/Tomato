import { useState } from 'react'
import { Brain, RefreshCw } from 'lucide-react'

interface SummaryProps {
  summaryData: {
    date: string
    totalFocusTime: number
    completedPomodoros: number
    completedTasks: number
    averageSessionLength: number
    productivityScore: number
    insights: string[]
  }
}

export default function Summary({ summaryData }: SummaryProps) {
  const [summaryText, setSummaryText] = useState<string>('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🧩 Step 1: Create a preset paragraph based on stats
  const presetParagraph = `
Today (${summaryData.date}), you completed ${summaryData.completedTasks} tasks 
and focused for ${summaryData.totalFocusTime} minutes across ${summaryData.completedPomodoros} pomodoro sessions. 
Your average session length was ${summaryData.averageSessionLength} minutes, 
earning a productivity score of ${summaryData.productivityScore} out of 100.
${summaryData.productivityScore >= 80 
  ? "You maintained excellent consistency and focus throughout the day! 🎯" 
  : "There’s room for improvement — try optimizing your break intervals for better energy flow. ⚡"}
Here are your AI insights:
${summaryData.insights.map((i) => `- ${i}`).join('\n')}
`

  // 🧠 Step 2: Summarize using the Summarizer API
  const handleSummarize = async () => {
    setIsSummarizing(true)
    setError(null)

    try {
      const ai = (window as any).ai
    if (!ai ) {
      throw new Error('The Summarizer API is not supported in this browser or is disabled.')
    }

      const availability = await (window as any).ai?.summarizer?.availability()
      if (availability === 'unavailable') {
        throw new Error('Summarizer API is not available in this browser.')
      }

      // Create summarizer instance
      const summarizer = await (window as any).ai.summarizer.create({
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

      // Perform summarization
      const result = await summarizer.summarize(presetParagraph, {
        context: 'Provide an insightful, motivational summary for the user.',
      })

      setSummaryText(result)
    } catch (err: any) {
      console.error('Summarize failed:', err)
      setError(err.message || 'Summarization failed.')
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-xl p-4 text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Brain size={16} className="text-purple-400" />
          AI Summary
        </h3>
        <button
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            size={14}
            className={`text-white/70 ${isSummarizing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Summary Content */}
      <div className="bg-black/30 rounded-lg p-3 text-sm whitespace-pre-wrap text-white/80 border border-white/10 min-h-[120px]">
        {isSummarizing && (
          <div className="flex justify-center items-center gap-2 text-white/60">
            <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
            <span>AI is generating your summary...</span>
          </div>
        )}

        {!isSummarizing && !summaryText && (
          <p className="text-white/60 italic text-center">
            Click the refresh icon to generate your AI summary ✨
          </p>
        )}

        {!isSummarizing && summaryText && <p>{summaryText}</p>}

        {error && (
          <p className="text-red-400 text-xs mt-2 text-center">
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  )
}

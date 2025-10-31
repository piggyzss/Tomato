
// @panpan
import { useState } from 'react'
import { Brain, RefreshCw } from 'lucide-react'
import {
  buildPresetSummaryText,
  generateSummary,
} from '@/services/builtInSummaryService'

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
  const [summaryText, setSummaryText] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async () => {
    setIsSummarizing(true)
    setError(null)

    try {
      const presetText = buildPresetSummaryText(summaryData)
      const result = await generateSummary(presetText)
      setSummaryText(result as string)
    } catch (err: any) {
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

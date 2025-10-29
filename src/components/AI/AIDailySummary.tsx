import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface AIDailySummaryProps {
  onBack: () => void
  aiSummarizer: any
  isSummarizing: boolean
  summaryText: string
  setIsSummarizing: (value: boolean) => void
  setSummaryText: (value: string) => void
}

export default function AIDailySummary({
  onBack,
  aiSummarizer,
  isSummarizing,
  summaryText,
  setIsSummarizing,
  setSummaryText
}: AIDailySummaryProps) {
  const { theme, language } = useSettingsStore()
  const { tasks } = useTaskStore()
  const [selectedSummaryLanguage, setSelectedSummaryLanguage] = useState<'zh-CN' | 'en-US' | 'ja-JP'>(language)

  const generateDailySummary = async () => {
    if (!aiSummarizer) {
      alert('AI Summarizer not available. Please check Chrome flags.')
      return
    }

    setIsSummarizing(true)
    setSummaryText('')

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime()

      const todayTasks = tasks.filter(task => task.createdAt >= todayTimestamp)
      const completedTasks = todayTasks.filter(task => task.status === 'completed')
      const totalPomodoros = todayTasks.reduce((sum, task) => sum + (task.pomodoroCount || 0), 0)
      const totalTime = todayTasks.reduce((sum, task) => sum + (task.totalTimeSpent || 0), 0)

      const summaryData = `
Today's Productivity Summary:
- Total Tasks: ${todayTasks.length}
- Completed Tasks: ${completedTasks.length}
- Completion Rate: ${todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0}%
- Total Pomodoros: ${totalPomodoros}
- Total Focus Time: ${Math.floor(totalTime / 60)} minutes

Tasks:
${todayTasks.map(task => `- ${task.title} (${task.status}): ${task.pomodoroCount || 0} pomodoros, ${Math.floor((task.totalTimeSpent || 0) / 60)} minutes`).join('\n')}

Please provide a brief, encouraging summary in ${selectedSummaryLanguage === 'zh-CN' ? 'Chinese' : selectedSummaryLanguage === 'ja-JP' ? 'Japanese' : 'English'}.
Include:
1. Overall productivity assessment
2. Key achievements
3. Suggestions for improvement
4. Motivational message for tomorrow
`

      const summary = await aiSummarizer.summarize(summaryData)
      setSummaryText(summary)
    } catch (error) {
      console.error('Failed to generate summary:', error)
      setSummaryText('Failed to generate summary. Please try again.')
    } finally {
      setIsSummarizing(false)
    }
  }

  const todayTasks = tasks.filter(task => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return task.createdAt >= today.getTime()
  })

  const completedTasks = todayTasks.filter(task => task.status === 'completed')
  const totalPomodoros = todayTasks.reduce((sum, task) => sum + (task.pomodoroCount || 0), 0)
  const totalTime = todayTasks.reduce((sum, task) => sum + (task.totalTimeSpent || 0), 0)

  return (
    <div>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pb-3 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-[#D84848]'
      }`}>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">📅 Daily Summary</h1>
            <p className="text-white/70 text-xs">AI productivity insights</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-4">
        {/* Today's Stats */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 text-sm text-white">📊 Today's Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{todayTasks.length}</div>
              <div className="text-xs text-white/70">Total Tasks</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
              <div className="text-xs text-white/70">Completed</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{totalPomodoros}</div>
              <div className="text-xs text-white/70">Pomodoros</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{Math.floor(totalTime / 60)}m</div>
              <div className="text-xs text-white/70">Focus Time</div>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 text-sm text-white">🌍 Summary Language</h3>
          <select
            value={selectedSummaryLanguage}
            onChange={(e) => setSelectedSummaryLanguage(e.target.value as 'zh-CN' | 'en-US' | 'ja-JP')}
            className="w-full p-2 rounded-lg bg-black/30 border border-white/20 text-white text-sm"
          >
            <option value="en-US">English</option>
            <option value="zh-CN">中文</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateDailySummary}
          disabled={isSummarizing || !aiSummarizer || todayTasks.length === 0}
          className="w-full p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
        >
          <div className="flex items-center justify-center gap-3">
            {isSummarizing ? (
              <RefreshCw size={20} className="text-white animate-spin" />
            ) : (
              <Sparkles size={20} className="text-white" />
            )}
            <span className="font-semibold text-white">
              {isSummarizing ? 'Generating Summary...' : 'Generate Daily Summary'}
            </span>
          </div>
        </button>

        {todayTasks.length === 0 && (
          <div className="text-center py-8 text-white/70">
            <p className="text-sm">No tasks recorded today yet.</p>
            <p className="text-xs mt-2">Start working on tasks to generate a summary!</p>
          </div>
        )}

        {/* Summary Display */}
        {summaryText && (
          <div className="bg-black/20 rounded-xl p-4 border border-white/20">
            <h3 className="font-semibold mb-3 text-sm text-white">✨ AI Summary</h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-white leading-relaxed whitespace-pre-wrap">{summaryText}</p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 mb-3 text-center text-sm text-white/70">
          💡 Tip: Summary analyzes your completed tasks and focus time
        </div>
      </div>
    </div>
  )
}

// @panpan

import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Award,
  RefreshCw,
} from 'lucide-react'
import Summary from './Summary'
import { 
  buildInsightsPrompt,
  generateInsights 
} from '@/services/builtInSummaryService'
import { getMultipleStorage } from '@/utils/storage'
import { generateDefaultInsights, parseAISummaryToInsights } from '@/utils/insightsGenerator'
import { calculateAllStatistics } from '@/utils/statisticsCalculator'
import { ModalWithBack } from '@/components/Common'

interface DailySummaryData {
  date: string
  totalFocusTime: number
  completedPomodoros: number
  completedTasks: number
  averageSessionLength: number
  productivityScore: number
  insights: string[]
}

interface AIDailySummaryProps {
  onBack: () => void
}

export default function AIDailySummary({ onBack }: AIDailySummaryProps) {
  const [summaryData, setSummaryData] = useState<DailySummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Load real summary data from storage
  useEffect(() => {
    const loadSummaryData = async () => {
      setIsLoading(true)

      try {
        // Get today's data from storage
        const { tasks, pomodoroRecords } = await getMultipleStorage([
          'tasks',
          'pomodoroRecords',
        ])

        const taskList = tasks || []
        const recordList = pomodoroRecords || []

        // Calculate all statistics
        const stats = calculateAllStatistics(taskList, recordList)

        // Generate default insights
        const insights = generateDefaultInsights(stats)

        setSummaryData({
          date: new Date().toLocaleDateString(),
          ...stats,
          insights,
        })
      } catch (error) {
        console.error('Failed to load summary data:', error)
        setSummaryData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSummaryData()
  }, [])

  const generateNewInsights = async () => {
    if (!summaryData) return

    setIsGenerating(true)

    try {
      // Build the insights prompt focused on actionable recommendations
      const insightsPrompt = buildInsightsPrompt(summaryData)

      // Call the AI service to generate actionable insights
      const aiInsights = await generateInsights(insightsPrompt)

      console.log('AI Insights generated:', aiInsights)

      // Parse the AI insights into individual recommendations
      const newInsights = parseAISummaryToInsights(aiInsights, 4)

      if (newInsights.length > 0) {
        setSummaryData({
          ...summaryData,
          insights: newInsights,
        })
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error)

      // Show error message as insight
      setSummaryData({
        ...summaryData,
        insights: [
          '⚠️ Failed to generate AI insights.',
          error instanceof Error ? error.message : 'Unknown error occurred.',
          'Please check Chrome AI setup and try again.',
        ],
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getProductivityEmoji = (score: number) => {
    if (score >= 80) return '🔥'
    if (score >= 60) return '👍'
    return '💪'
  }

  return (
    <ModalWithBack
      title={<>📅 Built-in AI Daily Summary</>}
      subtitle="Chrome AI powered insights"
      onBack={onBack}
    >
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70 text-sm">
            Analyzing your productivity data...
          </p>
        </div>
      )}

      {!isLoading && !summaryData && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Data Available
          </h3>
          <p className="text-white/70 text-sm">
            Start using the timer to see your daily summary!
          </p>
        </div>
      )}

      {!isLoading && summaryData && (
        <div className="space-y-6 mt-4">
      {/* Date Header */}
      <div className="flex items-center gap-2 text-center justify-center">
        <Calendar size={18} className="text-white/70" />
        <h2 className="text-lg font-semibold text-white">{summaryData.date}</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Clock size={20} className="text-blue-400 mx-auto mb-2" />
          <div className="font-bold text-white text-lg">
            {summaryData.totalFocusTime}m
          </div>
          <div className="text-xs text-white/70">Focus Time</div>
        </div>

        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Target size={20} className="text-orange-400 mx-auto mb-2" />
          <div className="font-bold text-white text-lg">
            {summaryData.completedPomodoros}
          </div>
          <div className="text-xs text-white/70">Pomodoros</div>
        </div>

        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Award size={20} className="text-green-400 mx-auto mb-2" />
          <div className="font-bold text-white text-lg">
            {summaryData.completedTasks}
          </div>
          <div className="text-xs text-white/70">Tasks Done</div>
        </div>

        <div className="bg-black/20 rounded-lg p-3 text-center">
          <TrendingUp size={20} className="text-purple-400 mx-auto mb-2" />
          <div className="font-bold text-white text-lg">
            {summaryData.averageSessionLength}m
          </div>
          <div className="text-xs text-white/70">Avg Session</div>
        </div>
      </div>

      {/* Productivity Score */}
      <div className="bg-black/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3 text-center">
          Productivity Score
        </h3>
        <div className="text-center">
          <div
            className={`text-3xl font-bold ${getProductivityColor(summaryData.productivityScore)} mb-2`}
          >
            {summaryData.productivityScore}%{' '}
            {getProductivityEmoji(summaryData.productivityScore)}
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${summaryData.productivityScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* AI Insights - Actionable Recommendations */}
      <div className="bg-black/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
          <button
            onClick={generateNewInsights}
            disabled={isGenerating}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Generate Actionable Recommendations"
          >
            <RefreshCw
              size={14}
              className={`text-white/70 ${isGenerating ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        <div className="space-y-2">
          {summaryData.insights.map((insight, index) => (
            <div
              key={index}
              className="text-xs text-white/80 bg-black/20 rounded-md p-2 border-l-2 border-purple-400"
            >
              {insight}
            </div>
          ))}
        </div>

        {isGenerating && (
          <div className="mt-3 text-center text-xs text-white/60">
            🧠 AI is generating personalized recommendations...
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="bg-black/20 hover:bg-black/30 text-white text-xs py-2 px-3 rounded-lg transition-colors">
          📈 Weekly Report
        </button>
        <button className="bg-black/20 hover:bg-black/30 text-white text-xs py-2 px-3 rounded-lg transition-colors">
          🎯 Set Goals
        </button>
      </div>

      {/* Tips */}
      <div className="text-center text-xs text-white/60 bg-black/20 rounded-lg p-3">
        💡 Tip: Your summary updates automatically after each session
      </div>

          {/* AI Summary */}
          <div className="w-full flex justify-center bg-black/20 rounded-lg items-center min-h-[200px]">
            <Summary summaryData={summaryData} />
          </div>
        </div>
      )}
    </ModalWithBack>
  )
}

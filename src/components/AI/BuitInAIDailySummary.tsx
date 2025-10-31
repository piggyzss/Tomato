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

interface DailySummaryData {
  date: string
  totalFocusTime: number
  completedPomodoros: number
  completedTasks: number
  averageSessionLength: number
  productivityScore: number
  insights: string[]
}

export default function AIDailySummary() {
  const [summaryData, setSummaryData] = useState<DailySummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Simulate loading summary data
  useEffect(() => {
    const loadSummaryData = async () => {
      setIsLoading(true)

      // Simulate API call
      setTimeout(() => {
        setSummaryData({
          date: new Date().toLocaleDateString(),
          totalFocusTime: 120, // minutes
          completedPomodoros: 4,
          completedTasks: 3,
          averageSessionLength: 25,
          productivityScore: 85,
          insights: [
            'Great focus this morning! 🌟 Your longest streak was 2 hours.',
            'Consider taking shorter breaks to maintain energy levels.',
            'You completed 75% of your planned tasks - excellent progress!',
            'Your productivity peaked between 10-12 AM today.',
          ],
        })
        setIsLoading(false)
      }, 1000)
    }

    loadSummaryData()
  }, [])

  const generateNewSummary = async () => {
    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      if (summaryData) {
        setSummaryData({
          ...summaryData,
          insights: [
            'Updated analysis: Your focus patterns show improvement! 📈',
            'Try the 52-17 technique for longer tasks tomorrow.',
            'Your consistency this week deserves recognition 🏆',
            'Consider adding a 5-minute meditation before work sessions.',
          ],
        })
      }
      setIsGenerating(false)
    }, 2000)
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-white/70 text-sm">
          Analyzing your productivity data...
        </p>
      </div>
    )
  }

  if (!summaryData) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Data Available
        </h3>
        <p className="text-white/70 text-sm">
          Start using the timer to see your daily summary!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* AI Insights */}
      <div className="bg-black/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">AI Insights</h3>
          <button
            onClick={generateNewSummary}
            disabled={isGenerating}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Generate New Insights"
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
            🧠 AI is analyzing your patterns...
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
      <div className='w-full flex justify-center bg-black/20 rounded-lg items-center min-h-[200px]'>
        <Summary summaryData={summaryData} />
      </div>


    </div>
  )
}

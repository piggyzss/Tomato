import { useState, useEffect } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'
import { getHistory } from '@/utils/historyManager'
import type { DailyHistory } from '@/types'
import { ModalWithBack } from '@/components/Common'

interface HistoryViewProps {
  onBack: () => void
}

export default function HistoryView({ onBack }: HistoryViewProps) {
  const [history, setHistory] = useState<DailyHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await getHistory()
        const historyArray = Object.values(historyData).sort((a, b) => 
          b.date.localeCompare(a.date)
        )
        setHistory(historyArray)
      } catch (error) {
        console.error('加载历史数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateString === today.toISOString().split('T')[0]) {
      return '今天'
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return '昨天'
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  return (
    <ModalWithBack
      title={
        <>
          <Calendar size={18} className="inline mr-2" />
          历史记录
        </>
      }
      subtitle="View your past performance"
      onBack={onBack}
    >
      <div className="space-y-3 py-4">
        {loading ? (
          <div className="text-center py-8 text-white/60">
            加载中...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <div>暂无历史数据</div>
            <div className="text-xs mt-1">完成一些任务后，数据会在每日零点自动归档</div>
          </div>
        ) : (
          history.map((day) => (
            <div
              key={day.date}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">
                    {formatDate(day.date)}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {day.date}
                  </div>
                </div>
                <TrendingUp size={16} className="text-white/40" />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-2xl font-bold text-white">
                    {day.completedPomodoros}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    番茄钟
                  </div>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(day.totalFocusTime)}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    分钟
                  </div>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-2xl font-bold text-white">
                    {day.completedTasks}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    任务
                  </div>
                </div>
              </div>

              {day.tasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-white/60 mb-2">
                    任务列表 ({day.tasks.length})
                  </div>
                  <div className="space-y-1">
                    {day.tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs text-white/80 truncate"
                      >
                        {task.status === 'completed' ? '✅' : '⏸️'} {task.title}
                      </div>
                    ))}
                    {day.tasks.length > 3 && (
                      <div className="text-xs text-white/40">
                        还有 {day.tasks.length - 3} 个任务...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ModalWithBack>
  )
}

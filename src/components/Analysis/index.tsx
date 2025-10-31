import { useSettingsStore } from '@/store/useSettingsStore'
import { useState } from 'react'
import AnalysisMainMenu from '@/components/Analysis/AnalysisMainMenu'
import TaskFinishRate from '@/components/Analysis/TaskFinishRate'
import TotalTime from '@/components/Analysis/TotalTime'
import type { AnalysisView } from '@/types'

interface AnalysisProps {
  onClose?: () => void
}

export default function Analysis({ onClose }: AnalysisProps) {
  const { theme } = useSettingsStore()

  // Navigation state
  const [currentView, setCurrentView] = useState<AnalysisView>('menu')
  const [nextView, setNextView] = useState<AnalysisView | null>(null)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')

  const handleViewChange = (view: AnalysisView) => {
    if (nextView !== null) return // 防止动画期间多次点击

    const direction = view === 'menu' ? 'right' : 'left'
    setSlideDirection(direction)
    setNextView(view)

    // 300ms 后完成切换
    setTimeout(() => {
      setCurrentView(view)
      setNextView(null)
    }, 300)
  }

  // Render current view
  const renderCurrentView = () => {
    const view = nextView || currentView

    switch (view) {
      case 'menu':
        return (
          <AnalysisMainMenu onClose={onClose} onNavigate={handleViewChange} />
        )
      case 'taskFinishRate':
        return <TaskFinishRate onBack={() => handleViewChange('menu')} />
      case 'totalTime':
        return <TotalTime onBack={() => handleViewChange('menu')} />
      default:
        return (
          <AnalysisMainMenu onClose={onClose} onNavigate={handleViewChange} />
        )
    }
  }

  return (
    <div
      className={`rounded-xl shadow-2xl overflow-hidden relative ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
      }`}
      style={{
        height: 'calc(100vh - 240px)',
        maxHeight: '600px',
      }}
    >
      <div className="max-w-md mx-auto h-full overflow-hidden text-white relative">
        {/* 只渲染一个视图，使用 key 强制重新挂载 */}
        <div
          key={nextView || currentView}
          className="absolute inset-0 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          style={{
            animation:
              nextView !== null
                ? `slideInFrom${slideDirection === 'left' ? 'Right' : 'Left'} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none',
          }}
        >
          {renderCurrentView()}
        </div>
      </div>
    </div>
  )
}

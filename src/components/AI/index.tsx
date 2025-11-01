import { useSettingsStore } from '@/store/useSettingsStore'
import { useState } from 'react'
import AIConfiguration from '@/components/AI/AIConfiguration'
import AIMainMenu from '@/components/AI/AIMainMenu'
import AISettings from '@/components/AI/AISettings'
import type { AIView } from '@/types'
import DailySummary from '@/components/AI/DailySummary'
import ChatCat from '@/components/AI/ChatCat'

interface AIProps {
  onClose?: () => void
}

export default function AI({ onClose }: AIProps) {
  const { theme } = useSettingsStore()
  const [currentView, setCurrentView] = useState<AIView>('menu')
  const [nextView, setNextView] = useState<AIView | null>(null)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')

  const handleViewChange = (view: AIView) => {
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
        return <AIMainMenu onClose={onClose} onNavigate={handleViewChange} />
      case 'catMessages':
        return <ChatCat onBack={() => handleViewChange('menu')} />
      case 'dailySummary':
        return <DailySummary onBack={() => handleViewChange('menu')} />
      case 'apiDemo':
        return (
          <AIConfiguration
            onBack={() => handleViewChange('menu')}
            onOpenSettings={() => handleViewChange('settings')}
          />
        )
      case 'settings':
        return <AISettings onBack={() => handleViewChange('menu')} />
      default:
        return <AIMainMenu onClose={onClose} onNavigate={handleViewChange} />
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
        {/* Cat Messages 需要特殊布局（固定底部输入框） */}
        {(nextView || currentView) === 'catMessages' ? (
          <div
            key={nextView || currentView}
            className="absolute inset-0 px-4 pb-4 flex flex-col"
            style={{
              animation:
                nextView !== null
                  ? `slideInFrom${slideDirection === 'left' ? 'Right' : 'Left'} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
                  : 'none',
            }}
          >
            {renderCurrentView()}
          </div>
        ) : (
          <div
            key={nextView || currentView}
            className="absolute inset-0 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            style={{
              animation:
                nextView !== null
                  ? `slideInFrom${slideDirection === 'left' ? 'Right' : 'Left'} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
                  : 'none',
            }}
          >
            {renderCurrentView()}
          </div>
        )}
      </div>
    </div>
  )
}

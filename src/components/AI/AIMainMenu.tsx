import { useSettingsStore } from '@/store/useSettingsStore'
import { ArrowLeft, MessageCircle, BarChart3, X } from 'lucide-react'
import { useState } from 'react'
import AICatMessages from "./AICatMessages"
import AIDailySummary from "./AIDailySummary"

// AI feature menu type
type AIView = 'menu' | 'catMessages' | 'dailySummary'

interface AIMainMenuProps {
  onClose?: () => void
}

export default function AIMainMenu({ onClose }: AIMainMenuProps) {
  const { theme } = useSettingsStore()

  // Navigation state
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

  // AI features menu configuration
  const aiFeatures = [
    {
      id: 'catMessages' as AIView,
      title: 'AI Cat Messages',
      description: 'Chat with your productivity companion',
      icon: MessageCircle,
      color: 'bg-purple-500',
    },
    {
      id: 'dailySummary' as AIView,
      title: 'Daily Summary',
      description: 'AI-powered productivity insights',
      icon: BarChart3,
      color: 'bg-blue-500',
    },
  ]

  // Render main menu
  const renderMainMenu = () => (
    <div>
      {/* Fixed Header with Close Button */}
      <div className={`sticky top-0 z-10 pb-3 ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-[#D84848]'
        }`}>
        <div className="flex items-center justify-between py-3">
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">🤖 AI Features</h1>
            <p className="text-white/70 text-xs">Your AI-powered productivity assistant</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} className="text-white/90" />
            </button>
          )}
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid gap-2.5">
        {aiFeatures.map(feature => {
          const Icon = feature.icon
          return (
            <button
              key={feature.id}
              onClick={() => handleViewChange(feature.id)}
              className="w-full p-2.5 rounded-lg bg-black/20 hover:bg-black/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${feature.color}`}>
                  <Icon size={18} color="white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-white">{feature.title}</div>
                  <div className="text-xs text-white/70">
                    {feature.description}
                  </div>
                </div>
                <div className="text-white/50">
                  <ArrowLeft size={16} className="rotate-180" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* AI Status Info */}
      <div className="mt-4 text-center text-xs text-white/60 bg-black/20 rounded-lg p-2.5">
        <div className="mb-1">🧠 AI Assistant v1.0</div>
        <div className="text-[10px]">Powered by Gemini Nano</div>
      </div>
    </div>
  )

  // Render AI Cat Messages
  const renderCatMessages = () => (
    <div>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pb-3 ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-[#D84848]'
        }`}>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => handleViewChange('menu')}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">AI Cat Messages</h1>
            <p className="text-white/70 text-xs">Chat with your productivity companion</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AICatMessages />
      </div>
    </div>
  )

  // Render Daily Summary
  const renderDailySummary = () => (
    <div>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pb-3 ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-[#D84848]'
        }`}>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => handleViewChange('menu')}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">Daily Summary</h1>
            <p className="text-white/70 text-xs">AI-powered productivity insights</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AIDailySummary />
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-hidden relative">
      {/* 只渲染一个视图，使用 key 强制重新挂载 */}
      <div
        key={nextView || currentView}
        className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{
          animation: nextView !== null
            ? `slideInFrom${slideDirection === 'left' ? 'Right' : 'Left'} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
            : 'none'
        }}
      >
        {(nextView || currentView) === 'menu' && renderMainMenu()}
        {(nextView || currentView) === 'catMessages' && renderCatMessages()}
        {(nextView || currentView) === 'dailySummary' && renderDailySummary()}
      </div>
    </div>
  )
}

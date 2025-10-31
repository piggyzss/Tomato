import {
  MessageCircle,
  Calendar,
  ArrowLeft,
  Sparkles,
  Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { ModalWithClose } from '@/components/Common'
import { aiService } from '@/services/aiService'

interface AIMainMenuProps {
  onClose?: () => void
  onNavigate: (
    view: 'catMessages' | 'dailySummary' | 'apiDemo' | 'settings'
  ) => void
}

export default function AIMainMenu({
  onClose,
  onNavigate,
}: AIMainMenuProps) {
  const [aiAvailable, setAiAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check AI API availability on mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true)
      const available = await aiService.checkBuiltInAvailability()
      setAiAvailable(available)
      setIsLoading(false)
    }
    checkStatus()
  }, [])
  const aiMenu = [
    {
      id: 'apiDemo' as const,
      title: 'AI API',
      description: '内置 AI / 云端 AI',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      badge: '推荐',
    },
    {
      id: 'catMessages' as const,
      title: 'Cat Messages',
      description: 'AI-generated encouragement',
      icon: MessageCircle,
      color: 'bg-pink-500',
    },
    {
      id: 'dailySummary' as const,
      title: 'Daily Summary',
      description: 'AI productivity insights',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      id: 'settings' as const,
      title: 'AI 设置',
      description: '配置 Gemini API Key',
      icon: Settings,
      color: 'bg-gray-600',
    },
  ]

  return (
    <ModalWithClose
      title={<>🤖 AI Assistant</>}
      subtitle="Enhance your productivity with AI"
      onClose={onClose}
    >
      <div className="space-y-4 mt-4">
        {/* Loading State */}
        {isLoading && (
          <div className="p-4 rounded-lg bg-black/20 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
              <span className="text-sm text-white/70">Checking AI availability...</span>
            </div>
          </div>
        )}

        {/* API Status Display */}
        {!isLoading && !aiAvailable && (
          <div className="p-4 rounded-lg bg-black/20 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="font-medium text-sm text-white">
                Gemini Nano Not Available
              </span>
            </div>
            <p className="text-xs text-white/70 mb-2">
              To use AI features, please use <strong>Chrome Canary</strong> with
              these flags enabled:
            </p>
            <ul className="text-xs space-y-1 text-white/60">
              <li>• chrome://flags/#optimization-guide-on-device-model</li>
              <li>• chrome://flags/#prompt-api-for-gemini-nano</li>
              <li>• chrome://flags/#translation-api</li>
            </ul>
          </div>
        )}

        {!isLoading && aiAvailable && (
          <div className="p-3 rounded-lg bg-black/20 border border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="font-medium text-xs text-white">
                AI Features Available
              </span>
            </div>
          </div>
        )}

        {/* AI Features Grid */}
        <div className="grid gap-2.5">
          {aiMenu.map(feature => {
            const Icon = feature.icon
            return (
              <button
                key={feature.id}
                onClick={() => onNavigate(feature.id)}
                className="w-full p-2.5 rounded-lg bg-black/20 hover:bg-black/30 transition-all relative"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${feature.color}`}>
                    <Icon size={18} color="white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      {feature.title}
                      {feature.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/30 text-yellow-200 rounded">
                          {feature.badge}
                        </span>
                      )}
                    </div>
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

        {/* Footer Info */}
        <div className="mt-4 text-center text-xs text-white/60 bg-black/20 rounded-lg p-2.5">
          <div className="mb-1">🤖 Powered by Gemini Nano</div>
          <div className="text-[10px]">On-device AI processing</div>
        </div>
      </div>
    </ModalWithClose>
  )
}

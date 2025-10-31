import { Sparkles, Settings as SettingsIcon } from 'lucide-react'
import type { AIStatus } from '@/types'

interface CloudAIConfigurationProps {
  status: AIStatus
  error?: string | null
  cloudAvailable: boolean
  onOpenSettings: () => void
}

export default function CloudAIConfiguration({
  status,
  error,
  cloudAvailable,
  onOpenSettings,
}: CloudAIConfigurationProps) {
  return (
    <>
      {/* Status */}
      {status === 'checking' && (
        <div className="p-3 bg-blue-500/20 rounded-lg flex items-center gap-2 text-sm">
          <Sparkles size={16} className="animate-pulse" />
          Checking AI availability...
        </div>
      )}

      {status === 'unavailable' && (
        <div className="p-3 bg-red-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-2">❌ Cloud AI Unavailable</div>
          <div className="text-xs opacity-90 mb-3">
            Please configure Gemini API Key to use cloud AI
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
          >
            <SettingsIcon size={14} />
            Go to Settings
          </button>
        </div>
      )}

      {status === 'error' && error && (
        <div className="p-3 bg-red-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-1">⚠️ Error</div>
          <div className="text-xs opacity-90">{error}</div>
        </div>
      )}

      {status === 'ready' && cloudAvailable && (
        <div className="p-4 bg-green-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm">✅ Chrome Cloud AI is Ready!</div>
          </div>
        </div>
      )}

      {status === 'ready' && !cloudAvailable && (
        <div className="p-3 bg-yellow-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-2">💡 Tip</div>
          <div className="text-xs opacity-90 mb-3">
            Configure API Key to use cloud AI
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
          >
            <SettingsIcon size={14} />
            Go to Settings
          </button>
        </div>
      )}
    </>
  )
}

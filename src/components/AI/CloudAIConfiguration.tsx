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
          正在检查 AI 可用性...
        </div>
      )}

      {status === 'unavailable' && (
        <div className="p-3 bg-red-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-2">❌ 云端 AI 不可用</div>
          <div className="text-xs opacity-90 mb-3">
            请配置 Gemini API Key 以使用云端 AI
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
          >
            <SettingsIcon size={14} />
            前往设置
          </button>
        </div>
      )}

      {status === 'error' && error && (
        <div className="p-3 bg-red-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-1">⚠️ 错误</div>
          <div className="text-xs opacity-90">{error}</div>
        </div>
      )}

      {status === 'ready' && cloudAvailable && (
        <div className="p-4 bg-green-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              ✅ Chrome 云端 AI 已就绪！
            </div>
          </div>
        </div>
      )}

      {status === 'ready' && !cloudAvailable && (
        <div className="p-3 bg-yellow-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-2">💡 提示</div>
          <div className="text-xs opacity-90 mb-3">
            配置 API Key 以使用云端 AI
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
          >
            <SettingsIcon size={14} />
            前往设置
          </button>
        </div>
      )}
    </>
  )
}

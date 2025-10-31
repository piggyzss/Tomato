import { Sparkles, Settings as SettingsIcon } from 'lucide-react'
import type { AIStatus, AIProvider, AIAvailability } from '@/types'

interface CloudAIConfigurationProps {
  status: AIStatus
  provider?: AIProvider | null
  error?: string | null
  cloudAvailable: boolean
  builtInAvailable: AIAvailability
  onOpenSettings: () => void
}

export default function CloudAIConfiguration({
  status,
  provider,
  error,
  cloudAvailable,
  builtInAvailable,
  onOpenSettings
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

      {status === 'ready' && (
        <>
          {/* Provider Info */}
          <div className="p-3 bg-green-500/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>使用云端 AI</span>
              </div>
              <div className="text-xs opacity-80">
                {provider === 'builtin' ? '本地运行' : 'Gemini API'}
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded-lg ${builtInAvailable === 'ready' ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={14} />
                <span className="font-medium">内置 AI</span>
              </div>
              <div className="opacity-80">
                {builtInAvailable === 'ready' ? '✅ 可用' : '❌ 不可用'}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${cloudAvailable ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={14} />
                <span className="font-medium">云端 AI</span>
              </div>
              <div className="opacity-80">
                {cloudAvailable ? '✅ 已配置' : '⚙️ 未配置'}
              </div>
            </div>
          </div>

          {/* Settings Link */}
          {!cloudAvailable && (
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
      )}
    </>
  )
}

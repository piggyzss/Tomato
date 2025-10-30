import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, AlertCircle, Settings as SettingsIcon } from 'lucide-react'
import { useAI } from '@/hooks/useAI'
import { aiService } from '@/services/aiService'
import { getStorage, setStorage } from '@/utils/storage'

interface AIAPIDemoProps {
  onBack: () => void
  onOpenSettings: () => void
}

type AIMode = 'builtin' | 'cloud'

export default function AIConfiguration({ onBack, onOpenSettings }: AIAPIDemoProps) {
  const [mode, setMode] = useState<AIMode>('builtin')
  const [builtInAvailable, setBuiltInAvailable] = useState<'checking' | 'ready' | 'unavailable'>('checking')

  const {
    status,
    provider,
    error,
    cloudAvailable,
  } = useAI(mode === 'cloud', {
    systemPrompt: '你是一只可爱的番茄猫助手，用简短、友好、鼓励的语气回答问题。',
  })

  // 加载用户偏好
  useEffect(() => {
    const loadPreference = async () => {
      const savedMode = await getStorage('aiModePreference')
      if (savedMode) {
        setMode(savedMode)
        aiService.setModePreference(savedMode)
      }
    }
    loadPreference()
  }, [])

  // 检查内置 AI 可用性
  useEffect(() => {
    const checkBuiltIn = async () => {
      if (!window.ai?.languageModel) {
        setBuiltInAvailable('unavailable')
        return
      }

      try {
        const capabilities = await window.ai.languageModel.capabilities()
        if (capabilities.available === 'readily') {
          setBuiltInAvailable('ready')
        } else {
          setBuiltInAvailable('unavailable')
        }
      } catch (error) {
        console.error('检查内置 AI 失败:', error)
        setBuiltInAvailable('unavailable')
      }
    }

    checkBuiltIn()
  }, [])

  // 保存用户偏好
  const handleModeChange = async (newMode: AIMode) => {
    setMode(newMode)
    aiService.setModePreference(newMode)
    await setStorage('aiModePreference', newMode)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles size={18} />
          AI API
        </h2>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 p-1 bg-white/10 rounded-lg">
        <button
          onClick={() => handleModeChange('builtin')}
          className={`flex-1 py-2 px-3 rounded-md transition-all text-sm font-medium ${mode === 'builtin'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white'
            }`}
        >
          Chrome 内置 AI
        </button>
        <button
          onClick={() => handleModeChange('cloud')}
          className={`flex-1 py-2 px-3 rounded-md transition-all text-sm font-medium ${mode === 'cloud'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white'
            }`}
        >
          Chrome 云端 AI
        </button>
      </div>

      {/* Info - Always visible */}
      <div className="p-3 bg-white/5 rounded-lg text-xs opacity-80">
        <div className="font-semibold mb-1">💡 智能切换</div>
        <div className="space-y-1">
          <div>• 优先使用内置 AI（免费、快速、隐私）</div>
          <div>• 自动降级到云端 AI（需要 API Key）</div>
          <div>• 统一的接口，无缝切换</div>
        </div>
      </div>

      {/* Built-in AI Mode */}
      {mode === 'builtin' && (
        <>
          {/* Status */}
          <div className={`p-4 rounded-lg ${builtInAvailable === 'ready' ? 'bg-green-500/20' :
              builtInAvailable === 'unavailable' ? 'bg-red-500/20' :
                'bg-blue-500/20'
            }`}>
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                {builtInAvailable === 'checking' && '正在检查 API 可用性...'}
                {builtInAvailable === 'ready' && '✅ Chrome 内置 AI 已就绪！'}
                {builtInAvailable === 'unavailable' && (
                  <>
                    <div className="font-semibold mb-1">❌ Chrome 内置 AI 不可用</div>
                    <div className="text-xs opacity-90">
                      请确保：
                      <br />• 使用 Chrome 127+ 版本
                      <br />• 启用实验性功能：chrome://flags/#optimization-guide-on-device-model
                      <br />• 启用：chrome://flags/#prompt-api-for-gemini-nano
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {builtInAvailable === 'ready' && (
            <>
              {/* Info */}
              <div className="p-3 bg-white/5 rounded-lg text-xs opacity-80">
                <div className="font-semibold mb-1">关于 Chrome 内置 AI：</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>使用 Gemini Nano 模型，完全在本地运行</li>
                  <li>无需网络连接，保护隐私</li>
                  <li>支持自定义系统提示词</li>
                  <li>适合快速、轻量级的 AI 交互</li>
                </ul>
                <div className="mt-2 pt-2 border-t border-white/10">
                  <a
                    href="https://developer.chrome.com/docs/ai/built-in?hl=zh-cn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline"
                  >
                    查看完整文档 →
                  </a>
                </div>
              </div>
            </>
          )}

        </>
      )}

      {/* Cloud AI Mode */}
      {mode === 'cloud' && (
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
      )}
    </div>
  )
}

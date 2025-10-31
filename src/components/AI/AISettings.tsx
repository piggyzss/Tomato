import { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, Save, ExternalLink } from 'lucide-react'
import { getStorage, setStorage } from '@/utils/storage'
import { ModalWithBack } from '@/components/Common'

interface AISettingsProps {
  onBack: () => void
  onApiKeySet?: (apiKey: string) => void
}

export default function AISettings({ onBack, onApiKeySet }: AISettingsProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)

  // 加载保存的 API Key
  useEffect(() => {
    const loadApiKey = async () => {
      const savedKey = await getStorage('geminiApiKey')
      if (savedKey) {
        setApiKey(savedKey)
      }
    }
    loadApiKey()
  }, [])

  // 保存 API Key
  const handleSave = async () => {
    if (!apiKey.trim()) {
      return
    }

    await setStorage('geminiApiKey', apiKey.trim())
    onApiKeySet?.(apiKey.trim())

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // 清除 API Key
  const handleClear = async () => {
    setApiKey('')
    await setStorage('geminiApiKey', '')
    onApiKeySet?.('')
  }

  return (
    <ModalWithBack
      title={
        <>
          <Key size={18} className="inline mr-2" />
          AI 设置
        </>
      }
      subtitle="Configure API keys and preferences"
      onBack={onBack}
    >
      <div className="space-y-4 py-4">
        {/* Header removed - now in ModalWithBack */}

        {/* Info */}
        <div className="p-3 bg-blue-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-1">💡 关于 API Key</div>
          <div className="text-xs opacity-90 space-y-1">
            <div>• 当内置 AI 不可用时，将使用云端 Gemini API</div>
            <div>• API Key 仅存储在本地，不会上传到服务器</div>
            <div>• Gemini 1.5 Flash 有免费额度可用</div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Gemini API Key</label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="输入你的 Gemini API Key"
              className="w-full p-3 pr-10 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50 text-sm"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/5 disabled:cursor-not-allowed rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Save size={16} />
            {saved ? '已保存 ✓' : '保存'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors font-medium text-sm"
          >
            清除
          </button>
        </div>

        {/* Get API Key Link */}
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-sm font-semibold mb-2">如何获取 API Key？</div>
          <ol className="text-xs space-y-1.5 opacity-90 list-decimal list-inside">
            <li>访问 Google AI Studio</li>
            <li>登录你的 Google 账号</li>
            <li>点击 "Get API Key" 按钮</li>
            <li>创建或选择一个项目</li>
            <li>复制生成的 API Key</li>
          </ol>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 underline"
          >
            前往 Google AI Studio
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Provider Status */}
        <div className="p-3 bg-white/5 rounded-lg text-xs">
          <div className="font-semibold mb-2">AI 提供商状态</div>
          <div className="space-y-1 opacity-90">
            <div className="flex items-center justify-between">
              <span>内置 AI (Chrome Built-in)</span>
              <span className="text-green-400">优先使用</span>
            </div>
            <div className="flex items-center justify-between">
              <span>云端 AI (Gemini API)</span>
              <span className={apiKey ? 'text-green-400' : 'text-yellow-400'}>
                {apiKey ? '已配置' : '备用方案'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ModalWithBack>
  )
}

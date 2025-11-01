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

  // Load saved API Key
  useEffect(() => {
    const loadApiKey = async () => {
      const savedKey = await getStorage('geminiApiKey')
      if (savedKey) {
        setApiKey(savedKey)
      }
    }
    loadApiKey()
  }, [])

  // Save API Key
  const handleSave = async () => {
    if (!apiKey.trim()) {
      return
    }

    await setStorage('geminiApiKey', apiKey.trim())
    onApiKeySet?.(apiKey.trim())

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Clear API Key
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
          AI Settings
        </>
      }
      subtitle="Configure API keys and preferences"
      onBack={onBack}
    >
      <div className="space-y-4 py-4">
        {/* Header removed - now in ModalWithBack */}

        {/* Info */}
        <div className="p-3 bg-blue-500/20 rounded-lg text-sm">
          <div className="font-semibold mb-1">💡 About API Key</div>
          <div className="text-xs opacity-90 space-y-1">
            <div>
              • When built-in AI is unavailable, cloud Gemini API will be used
            </div>
            <div>
              • API Key is only stored locally, will not be uploaded to server
            </div>
            <div>• Gemini 1.5 Flash has free quota available</div>
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
              placeholder="Enter your Gemini API Key"
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
            {saved ? 'Saved ✓' : 'Save'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors font-medium text-sm"
          >
            Clear
          </button>
        </div>

        {/* Get API Key Link */}
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-sm font-semibold mb-2">How to get API Key?</div>
          <ol className="text-xs space-y-1.5 opacity-90 list-decimal list-inside">
            <li>Visit Google AI Studio</li>
            <li>Sign in to your Google account</li>
            <li>Click the "Get API Key" button</li>
            <li>Create or select a project</li>
            <li>Copy the generated API Key</li>
          </ol>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 underline"
          >
            Go to Google AI Studio
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Provider Status */}
        <div className="p-3 bg-white/5 rounded-lg text-xs">
          <div className="font-semibold mb-2">AI Provider Status</div>
          <div className="space-y-1 opacity-90">
            <div className="flex items-center justify-between">
              <span>Built-in AI (Chrome Built-in)</span>
              <span className="text-green-400">Priority Use</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cloud AI (Gemini API)</span>
              <span className={apiKey ? 'text-green-400' : 'text-yellow-400'}>
                {apiKey ? 'Configured' : 'Backup Option'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ModalWithBack>
  )
}

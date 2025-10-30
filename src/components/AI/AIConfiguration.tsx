import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useAI } from '@/hooks/useAI'
import { aiService } from '@/services/aiService'
import { getStorage, setStorage } from '@/utils/storage'
import BuiltInAIConfiguration from './BuiltInAIConfiguration'
import CloudAIConfiguration from './CloudAIConfiguration'
import { ModalWithBack } from '@/components/Common'

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
      try {
        const availability = await aiService.getBuiltInAvailabilityStatus()
        const goodStates = ["readily", "after-download", "available"]

        if (goodStates.includes(availability)) {
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
    <ModalWithBack
      title={
        <>
          <Sparkles size={18} className="inline mr-2" />
          AI API
        </>
      }
      subtitle="Configure AI providers"
      onBack={onBack}
    >
      <div className="space-y-4 py-4">{/* Header removed - now in ModalWithBack */}

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
          <BuiltInAIConfiguration builtInAvailable={builtInAvailable} />
        )}

        {/* Cloud AI Mode */}
        {mode === 'cloud' && (
          <CloudAIConfiguration
            status={status}
            provider={provider}
            error={error}
            cloudAvailable={cloudAvailable}
            builtInAvailable={builtInAvailable}
            onOpenSettings={onOpenSettings}
          />
        )}
      </div>
    </ModalWithBack>
  )
}

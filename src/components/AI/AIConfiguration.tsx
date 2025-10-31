import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useAI } from '@/hooks/useAI'
import { aiService } from '@/services/aiService'
import { getStorage, setStorage } from '@/utils/storage'
import BuiltInAIConfiguration from './BuiltInAIConfiguration'
import CloudAIConfiguration from './CloudAIConfiguration'
import { ModalWithBack } from '@/components/Common'
import type { AIMode, AIAvailability, AIProvider } from '@/types'

interface AIAPIDemoProps {
  onBack: () => void
  onOpenSettings: () => void
}

export default function AIConfiguration({ onBack, onOpenSettings }: AIAPIDemoProps) {
  const [mode, setMode] = useState<AIMode>('cloud')
  const [builtInAvailable, setBuiltInAvailable] = useState<AIAvailability>('checking')
  const [actualProvider, setActualProvider] = useState<AIProvider | null>(null)

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
      } else {
        // 如果没有保存的偏好，使用默认值
        const defaultMode = 'cloud'
        setMode(defaultMode)
        aiService.setModePreference(defaultMode)
        await setStorage('aiModePreference', defaultMode)
      }
      
      // 检查实际可用的 provider
      const available = await aiService.getAvailableProvider()
      setActualProvider(available)
      console.log('AI 模式偏好:', savedMode || 'cloud', '实际可用:', available)
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
    
    // 重新检查实际可用的 provider
    const available = await aiService.getAvailableProvider()
    setActualProvider(available)
    console.log('切换 AI 模式到:', newMode, '实际可用:', available)
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

        {/* Status Info */}
        <div className="p-3 bg-white/5 rounded-lg text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">当前状态</span>
            {actualProvider && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                actualProvider === 'builtin' 
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {actualProvider === 'builtin' ? '使用内置 AI' : '使用云端 AI'}
              </span>
            )}
          </div>
          <div className="space-y-1 opacity-80">
            <div>• 偏好设置: {mode === 'builtin' ? 'Chrome 内置 AI' : 'Chrome 云端 AI'}</div>
            <div>• 内置 AI: {builtInAvailable === 'ready' ? '✅ 可用' : builtInAvailable === 'checking' ? '⏳ 检查中' : '❌ 不可用'}</div>
            <div>• 云端 AI: {cloudAvailable ? '✅ 已配置' : '❌ 未配置'}</div>
          </div>
        </div>
        
        {/* Warning if preference doesn't match actual */}
        {actualProvider && actualProvider !== mode && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-200">
            <div className="font-semibold mb-1">⚠️ 自动降级</div>
            <div>
              {mode === 'builtin' 
                ? '内置 AI 不可用，已自动切换到云端 AI'
                : '云端 AI 未配置，已自动切换到内置 AI'
              }
            </div>
          </div>
        )}
        
        {/* Info */}
        <div className="p-3 bg-white/5 rounded-lg text-xs opacity-80">
          <div className="font-semibold mb-1">💡 智能切换</div>
          <div className="space-y-1">
            <div>• 优先使用你选择的 AI 模式</div>
            <div>• 如果不可用，自动降级到备用模式</div>
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

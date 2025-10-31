import { useState, useEffect } from 'react'
import { Sparkles, Chrome, Cloud } from 'lucide-react'
import { useAI } from '@/hooks/useAI'
import { aiService } from '@/services/aiService'
import { useSettingsStore } from '@/store/useSettingsStore'
import BuiltInAIConfiguration from '@/components/AI/BuiltInAIConfiguration'
import CloudAIConfiguration from '@/components/AI/CloudAIConfiguration'
import { ModalWithBack } from '@/components/Common'
import type { AIProvider, AIAvailability } from '@/types'

interface AIAPIDemoProps {
  onBack: () => void
  onOpenSettings: () => void
}

export default function AIConfiguration({
  onBack,
  onOpenSettings,
}: AIAPIDemoProps) {
  const { aiProvider, updateSettings } = useSettingsStore()
  const [builtInAvailable, setBuiltInAvailable] =
    useState<AIAvailability>('checking')
  const [actualProvider, setActualProvider] = useState<AIProvider | null>(null)

  const { status, error, cloudAvailable } = useAI(false, {
    systemPrompt:
      'You are a cute tomato cat assistant, answer questions with a brief, friendly, and encouraging tone.',
  })

  // Initialize: Load from global state and sync to aiService
  useEffect(() => {
    aiService.setModePreference(aiProvider)

    // Check all availability uniformly
    const checkAvailability = async () => {
      // 1. Check built-in AI
      try {
        const availability = await aiService.getBuiltInAvailabilityStatus()
        const goodStates = ['readily', 'after-download', 'available']

        console.log('🔍 Built-in AI status:', availability)

        if (goodStates.includes(availability)) {
          setBuiltInAvailable('ready')
        } else {
          setBuiltInAvailable('unavailable')
        }
      } catch (error) {
        console.error('Failed to check built-in AI:', error)
        setBuiltInAvailable('unavailable')
      }

      // 2. Check actual available provider
      const available = await aiService.getAvailableProvider()
      setActualProvider(available)
      console.log(
        '🔍 AI mode preference:',
        aiProvider,
        'actually available:',
        available
      )
    }

    checkAvailability()
  }, [aiProvider])

  // Take effect immediately when switching provider
  const handleProviderChange = async (provider: AIProvider) => {
    // Update global state
    updateSettings({ aiProvider: provider })

    // Sync to aiService
    aiService.setModePreference(provider)

    // Re-check built-in AI availability
    try {
      const availability = await aiService.getBuiltInAvailabilityStatus()
      const goodStates = ['readily', 'after-download', 'available']

      if (goodStates.includes(availability)) {
        setBuiltInAvailable('ready')
      } else {
        setBuiltInAvailable('unavailable')
      }
    } catch (error) {
      console.error('Failed to check built-in AI:', error)
      setBuiltInAvailable('unavailable')
    }

    // Re-check actual available provider
    const available = await aiService.getAvailableProvider()
    setActualProvider(available)

    console.log(
      '💾 Switching AI mode:',
      provider,
      'actually available:',
      available
    )
  }

  // AI Provider configuration
  const providers = [
    {
      id: 'builtin' as AIProvider,
      label: 'Chrome Built-in AI',
      icon: Chrome,
      color: 'bg-green-500',
      description: "Use Chrome's built-in Gemini Nano",
      available: builtInAvailable === 'ready',
    },
    {
      id: 'cloud' as AIProvider,
      label: 'Cloud AI (Gemini)',
      icon: Cloud,
      color: 'bg-blue-500',
      description: 'Use Google Gemini API',
      available: cloudAvailable,
    },
  ]

  return (
    <ModalWithBack
      title={
        <>
          <Sparkles size={18} className="inline mr-2" />
          AI Configuration
        </>
      }
      subtitle="Choose your AI provider"
      onBack={onBack}
    >
      <div className="space-y-6 mt-4">
        {/* Provider Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Select AI Provider</h2>
          <div className="space-y-3">
            {providers.map(prov => {
              const Icon = prov.icon
              return (
                <button
                  key={prov.id}
                  onClick={() => handleProviderChange(prov.id)}
                  className={`w-full p-4 rounded-xl transition-all ${
                    aiProvider === prov.id
                      ? 'bg-black/30'
                      : 'bg-black/10 hover:bg-black/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${prov.color}`}>
                      <Icon size={20} color="white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        {prov.label}
                        {prov.available && (
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                            Available
                          </span>
                        )}
                        {!prov.available && (
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white/70">
                        {prov.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-6 bg-black/20 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-center">Current Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Current Provider:</span>
              <span className="font-mono">
                {aiProvider === 'builtin' ? 'Built-in AI' : 'Cloud AI'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Actual Provider:</span>
              <span
                className={`font-mono ${
                  actualProvider === aiProvider
                    ? 'text-green-300'
                    : 'text-yellow-300'
                }`}
              >
                {actualProvider === 'builtin'
                  ? 'Built-in AI'
                  : actualProvider === 'cloud'
                    ? 'Cloud AI'
                    : 'Checking...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Built-in AI:</span>
              <span className="font-mono">
                {builtInAvailable === 'ready'
                  ? '✅ Ready'
                  : builtInAvailable === 'checking'
                    ? '⏳ Checking'
                    : '❌ Unavailable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cloud AI:</span>
              <span className="font-mono">
                {cloudAvailable ? '✅ Configured' : '❌ Not Configured'}
              </span>
            </div>
          </div>
        </div>

        {/* Warning if preference doesn't match actual */}
        {actualProvider &&
          actualProvider !== aiProvider &&
          builtInAvailable !== 'checking' && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-200">
              <div className="font-semibold mb-1">⚠️ Auto Fallback</div>
              <div>
                {aiProvider === 'builtin'
                  ? 'Built-in AI is unavailable, will automatically switch to Cloud AI when needed'
                  : 'Cloud AI is not configured, will automatically switch to Built-in AI when needed'}
              </div>
            </div>
          )}

        {/* Configuration Details */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Configuration</h3>

          {/* Built-in AI Mode */}
          {aiProvider === 'builtin' && (
            <BuiltInAIConfiguration builtInAvailable={builtInAvailable} />
          )}

          {/* Cloud AI Mode */}
          {aiProvider === 'cloud' && (
            <CloudAIConfiguration
              status={status}
              error={error}
              cloudAvailable={cloudAvailable}
              onOpenSettings={onOpenSettings}
            />
          )}
        </div>

        {/* Info */}
        <div className="p-3 bg-white/5 rounded-lg text-xs opacity-80">
          <div className="font-semibold mb-1">💡 Smart Switching</div>
          <div className="space-y-1">
            <div>• Prioritize your selected AI provider</div>
            <div>• Auto fallback to backup if unavailable</div>
            <div>• Unified interface, seamless switching</div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-3 text-center text-sm text-white/70">
          💡 Tip: Changes apply immediately to Chat and Summary features
        </div>
      </div>
    </ModalWithBack>
  )
}

import { useSettingsStore } from '@/store/useSettingsStore'
import { playSoundEffect } from '@/utils/soundEffects'
import type { SoundType } from '@/types'
import type { SettingsPageProps } from '@/components/Settings/types'
import { ModalWithBack } from '@/components/Common'

export default function SoundSettings({ onBack }: SettingsPageProps) {
  const { soundEnabled, soundType, updateSettings } = useSettingsStore()

  const soundTypes: Array<{
    id: SoundType
    name: string
    description: string
  }> = [
    { id: 'ding', name: 'ding', description: 'Clear single tone' },
    { id: 'ding-dong', name: 'ding-dong', description: 'Two-tone chime' },
    { id: 'chord', name: 'chord', description: 'Harmonious chord' },
    {
      id: 'victory',
      name: 'victory',
      description: 'Ascending victory tune',
    },
    { id: 'soft', name: 'soft', description: 'Gentle notification' },
    { id: 'water-drop', name: 'water-drop', description: 'Water drop sound' },
    { id: 'knock', name: 'knock', description: 'Knock sound' },
  ]

  const handleSoundEnabledToggle = () => {
    const newValue = !soundEnabled
    updateSettings({ soundEnabled: newValue })
  }

  const handleSoundTypeChange = (type: SoundType) => {
    updateSettings({ soundType: type })
    // 播放预览音效
    if (soundEnabled) {
      playSoundEffect(type)
    }
  }

  return (
    <ModalWithBack
      title={<>🔊 Sound Settings</>}
      subtitle="Control audio notifications"
      onBack={onBack}
    >
      <div className="space-y-6 mt-4">
        {/* Sound Enable/Disable Toggle */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-white mb-1">
                🔊 Sound Notifications
              </h3>
              <p className="text-xs text-white/70">
                Play sound when timer completes
              </p>
            </div>
            <button
              onClick={handleSoundEnabledToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sound Type Selection */}
        <div
          className={`transition-opacity ${soundEnabled ? 'opacity-100' : 'opacity-50'}`}
        >
          <h2 className="text-lg font-semibold mb-4">Select Sound Type</h2>
          <div className="space-y-2">
            {soundTypes.map(sound => (
              <button
                key={sound.id}
                onClick={() => handleSoundTypeChange(sound.id)}
                disabled={!soundEnabled}
                className={`w-full p-3 rounded-xl transition-all ${
                  soundType === sound.id
                    ? 'bg-black/30 border-2 border-white/40'
                    : 'bg-black/10 hover:bg-black/20 border-2 border-transparent'
                } ${!soundEnabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold text-white">{sound.name}</div>
                    <div className="text-xs text-white/70">
                      {sound.description}
                    </div>
                  </div>
                  {soundType === sound.id && (
                    <div className="text-white">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 text-center text-sm text-white">
            Current Settings
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Sound Enabled:</span>
              <span className="font-semibold text-white">
                {soundEnabled ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Sound Type:</span>
              <span className="font-semibold text-white">
                {soundTypes.find(s => s.id === soundType)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 mb-3 text-center text-sm text-white/70">
          💡 Tip: Click on a sound type to preview it
        </div>
      </div>
    </ModalWithBack>
  )
}

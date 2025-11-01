import { useSettingsStore } from '@/store/useSettingsStore'
import type { SettingsPageProps } from '@/components/Settings/types'
import { ModalWithBack } from '@/components/Common'

export default function LanguageSettings({ onBack }: SettingsPageProps) {
  const { language, updateSettings } = useSettingsStore()

  const languages = [
    {
      id: 'zh-CN' as const,
      name: 'Chinese',
      nativeName: 'Simplified Chinese',
      icon: '🇨🇳',
      description: 'Simplified Chinese',
    },
    {
      id: 'en-US' as const,
      name: 'English',
      nativeName: 'English',
      icon: '🇺🇸',
      description: 'English (US)',
    },
    {
      id: 'ja-JP' as const,
      name: 'Japanese',
      nativeName: 'Japanese',
      icon: '🇯🇵',
      description: 'Japanese',
    },
  ]

  const handleLanguageChange = (newLanguage: 'zh-CN' | 'en-US' | 'ja-JP') => {
    updateSettings({ language: newLanguage })
  }

  return (
    <ModalWithBack
      title={<>🌍 Language</>}
      subtitle="Choose your preferred language"
      onBack={onBack}
    >
      <div className="space-y-6 mt-4">
        {/* Description */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <div className="space-y-2">
            <p className="text-sm text-white/90 font-medium">
              Language selection will affect AI-generated message language
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              This includes the output language for AI features such as cat
              encouragement messages, daily summaries, task analysis, and more.
              Once set, AI will communicate with you in your selected language.
            </p>
          </div>
        </div>

        {/* Language Selection Dropdown */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 text-sm text-white">
            🌍 Message Language
          </h3>
          <select
            value={language}
            onChange={e =>
              handleLanguageChange(e.target.value as 'zh-CN' | 'en-US' | 'ja-JP')
            }
            className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="en-US">🇺🇸 English</option>
            <option value="zh-CN">🇨🇳 Chinese</option>
            <option value="ja-JP">🇯🇵 Japanese</option>
          </select>
        </div>

        {/* Current Language Summary */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 text-center text-sm text-white">
            Current Language
          </h3>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {languages.find(l => l.id === language)?.icon}
            </div>
            <div className="font-semibold text-white">
              {languages.find(l => l.id === language)?.nativeName}
            </div>
            <div className="text-sm text-white/70">
              {languages.find(l => l.id === language)?.description}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 mb-3 text-center text-sm text-white/70">
          💡 Tip: Language setting affects AI-generated messages
        </div>
      </div>
    </ModalWithBack>
  )
}

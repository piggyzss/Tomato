import { Save } from 'lucide-react'
import { useState } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { SettingsPageProps } from './types'
import { ModalWithBack } from '@/components/Common'

export default function LanguageSettings({ onBack }: SettingsPageProps) {
  const { language, updateSettings } = useSettingsStore()
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [showLanguageSaved, setShowLanguageSaved] = useState(false)

  const languages = [
    {
      id: 'zh-CN' as const,
      name: '中文',
      nativeName: '简体中文',
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
      name: '日本語',
      nativeName: '日本語',
      icon: '🇯🇵',
      description: 'Japanese',
    },
  ]

  const handleSaveLanguage = () => {
    updateSettings({ language: selectedLanguage })
    setShowLanguageSaved(true)
    setTimeout(() => setShowLanguageSaved(false), 2000)
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
              选择语言将影响 AI 生成的消息语言
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              包括猫咪鼓励消息、每日总结、任务分析等 AI 功能的输出语言。设置后，AI
              将使用您选择的语言与您交流。
            </p>
          </div>
        </div>

        {/* Language Selection Dropdown */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 text-sm text-white">🌍 Message Language</h3>
          <select
            value={selectedLanguage}
            onChange={e =>
              setSelectedLanguage(e.target.value as 'zh-CN' | 'en-US' | 'ja-JP')
            }
            className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="en-US">🇺🇸 English</option>
            <option value="zh-CN">🇨🇳 中文</option>
            <option value="ja-JP">🇯🇵 日本語</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveLanguage}
          className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all font-semibold text-white flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Save Language
        </button>

        {/* Save Confirmation */}
        {showLanguageSaved && (
          <div className="bg-green-500 text-white rounded-lg p-3 text-center font-semibold text-sm">
            ✅ Language saved successfully!
          </div>
        )}

        {/* Current Language Summary */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 text-center text-sm text-white">Current Language</h3>
          <div className="text-center">
            <div className="text-3xl mb-2">{languages.find(l => l.id === language)?.icon}</div>
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

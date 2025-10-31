import { useState } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { SettingsPageProps } from './types'
import { ModalWithBack } from '@/components/Common'

export default function ThemeSettings({ onBack }: SettingsPageProps) {
  const { theme } = useSettingsStore()
  const { updateSettings } = useSettingsStore()
  const [showThemeSaved, setShowThemeSaved] = useState(false)

  const themes = [
    {
      id: 'light' as const,
      name: 'Light Mode',
      description: 'Clean and bright',
      icon: '☀️',
      color: 'bg-orange-500',
    },
    {
      id: 'dark' as const,
      name: 'Dark Mode',
      description: 'Easy on the eyes',
      icon: '🌙',
      color: 'bg-blue-500',
    },
    {
      id: 'auto' as const,
      name: 'Auto',
      description: 'Follows system',
      icon: '🔄',
      color: 'bg-purple-500',
    },
  ]

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    updateSettings({ theme: newTheme })
    setShowThemeSaved(true)
    setTimeout(() => setShowThemeSaved(false), 2000)
  }

  return (
    <ModalWithBack
      title={<>🎨 Theme Settings</>}
      subtitle="Choose your visual experience"
      onBack={onBack}
    >
      <div className="space-y-6 mt-4">
        {/* Theme Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Theme</h2>
          <div className="space-y-3">
            {themes.map(themeOption => (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`w-full p-4 rounded-xl transition-all ${
                  theme === themeOption.id
                    ? 'bg-black/30'
                    : 'bg-black/10 hover:bg-black/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${themeOption.color}`}>
                    <span className="text-xl">{themeOption.icon}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{themeOption.name}</div>
                    <div className="text-sm text-white/70">
                      {themeOption.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Theme Summary */}
        <div className="mb-6 bg-black/20 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-center">Current Theme</h3>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {themes.find(t => t.id === theme)?.icon}
            </div>
            <div className="font-semibold">
              {themes.find(t => t.id === theme)?.name}
            </div>
            <div className="text-sm text-white/70">
              {themes.find(t => t.id === theme)?.description}
            </div>
          </div>
        </div>

        {/* Save Confirmation */}
        {showThemeSaved && (
          <div className="bg-green-500 text-white rounded-lg p-3 text-center font-semibold text-sm">
            ✅ Theme saved successfully!
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 mb-3 text-center text-sm text-white/70">
          💡 Tip: Theme changes apply immediately
        </div>
      </div>
    </ModalWithBack>
  )
}

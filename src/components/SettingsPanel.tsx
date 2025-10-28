import { useState } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import {
  Save,
  Clock,
  Coffee,
  RefreshCw,
  ArrowLeft,
  Timer,
  Volume2,
  Bell,
  Palette,
  Bot,
  Globe,
} from 'lucide-react'
import { TimerMode } from './ModeSelector'

// Settings menu type
type SettingsView =
  | 'menu'
  | 'timer'
  | 'sound'
  | 'notifications'
  | 'theme'
  | 'ai'
  | 'language'

export default function SettingsPanel() {
  const {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    theme,
    updateSettings,
  } = useSettingsStore()

  // Navigation state
  const [currentView, setCurrentView] = useState<SettingsView>('menu')

  // Local state for editing timer settings
  const [selectedMode, setSelectedMode] = useState<TimerMode>('pomodoro')
  const [tempDurations, setTempDurations] = useState({
    workDuration: workDuration,
    shortBreakDuration: shortBreakDuration,
    longBreakDuration: longBreakDuration,
  })
  const [showSaved, setShowSaved] = useState(false)
  const [showThemeSaved, setShowThemeSaved] = useState(false)

  // Get current duration based on selected mode
  const getCurrentDuration = () => {
    switch (selectedMode) {
      case 'pomodoro':
        return tempDurations.workDuration
      case 'shortBreak':
        return tempDurations.shortBreakDuration
      case 'longBreak':
        return tempDurations.longBreakDuration
      default:
        return tempDurations.workDuration
    }
  }

  // Update duration for selected mode
  const handleDurationChange = (newDuration: number) => {
    switch (selectedMode) {
      case 'pomodoro':
        setTempDurations(prev => ({ ...prev, workDuration: newDuration }))
        break
      case 'shortBreak':
        setTempDurations(prev => ({ ...prev, shortBreakDuration: newDuration }))
        break
      case 'longBreak':
        setTempDurations(prev => ({ ...prev, longBreakDuration: newDuration }))
        break
    }
  }

  // Save settings to store
  const handleSave = () => {
    updateSettings(tempDurations)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  // Reset to current stored values
  const handleReset = () => {
    setTempDurations({
      workDuration: workDuration,
      shortBreakDuration: shortBreakDuration,
      longBreakDuration: longBreakDuration,
    })
  }

  // Mode configuration
  const modes = [
    {
      id: 'pomodoro' as TimerMode,
      label: 'Pomodoro',
      icon: Clock,
      color: 'bg-tomato',
      description: 'Focus work session',
    },
    {
      id: 'shortBreak' as TimerMode,
      label: 'Short Break',
      icon: Coffee,
      color: 'bg-green-500',
      description: 'Quick rest break',
    },
    {
      id: 'longBreak' as TimerMode,
      label: 'Long Break',
      icon: RefreshCw,
      color: 'bg-blue-500',
      description: 'Extended rest break',
    },
  ]

  // Settings menu configuration
  const settingsMenu = [
    {
      id: 'timer' as SettingsView,
      title: 'Timer Settings',
      description: 'Customize Pomodoro durations',
      icon: Timer,
      color: 'bg-orange-500',
    },
    {
      id: 'sound' as SettingsView,
      title: 'Sound Settings',
      description: 'Control audio notifications',
      icon: Volume2,
      color: 'bg-blue-500',
    },
    {
      id: 'notifications' as SettingsView,
      title: 'Notifications',
      description: 'Manage alert preferences',
      icon: Bell,
      color: 'bg-green-500',
    },
    {
      id: 'theme' as SettingsView,
      title: 'Theme Settings',
      description: 'Light/dark mode selection',
      icon: Palette,
      color: 'bg-purple-500',
    },
    {
      id: 'ai' as SettingsView,
      title: 'AI Features',
      description: 'AI assistant settings',
      icon: Bot,
      color: 'bg-pink-500',
    },
    {
      id: 'language' as SettingsView,
      title: 'Language',
      description: 'Choose your language',
      icon: Globe,
      color: 'bg-teal-500',
    },
  ]

  // Render main menu
  const renderMainMenu = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">⚙️ Settings</h1>
        <p className="text-white/80">Customize your Tomato experience</p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4">
        {settingsMenu.map(setting => {
          const Icon = setting.icon
          return (
            <button
              key={setting.id}
              onClick={() => setCurrentView(setting.id)}
              className="w-full p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-all border border-white/20 hover:border-white/40"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${setting.color}`}>
                  <Icon size={24} color="white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg">{setting.title}</div>
                  <div className="text-sm text-white/70">
                    {setting.description}
                  </div>
                </div>
                <div className="text-white/50">
                  <ArrowLeft size={20} className="rotate-180" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-white/70 bg-black/20 rounded-lg p-4">
        <div className="mb-2">🍅 Tomato Cat Timer v0.1.0</div>
        <div>Built with React + TypeScript + Zustand</div>
      </div>
    </div>
  )

  // Render Timer Settings (existing functionality)
  const renderTimerSettings = () => (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentView('menu')}
          className="p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Timer Settings</h1>
          <p className="text-white/80">Customize your Pomodoro durations</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Timer Mode</h2>
        <div className="space-y-3">
          {modes.map(mode => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedMode === mode.id
                    ? 'border-white bg-black/20 shadow-lg'
                    : 'border-white/30 bg-black/10 hover:bg-black/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${mode.color}`}>
                    <Icon size={20} color="white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{mode.label}</div>
                    <div className="text-sm text-white/70">
                      {mode.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Duration Setting */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Set Duration</h2>
        <div className="bg-black/20 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold font-mono mb-2">
              {getCurrentDuration()} min
            </div>
            <div className="text-white/70">
              {modes.find(m => m.id === selectedMode)?.label} Duration
            </div>
          </div>

          {/* Duration Input Range */}
          <div className="mb-4">
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={getCurrentDuration()}
              onChange={e => handleDurationChange(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-white/60 mt-2">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex gap-2 justify-center">
            {[5, 15, 25, 45].map(duration => (
              <button
                key={duration}
                onClick={() => handleDurationChange(duration)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  getCurrentDuration() === duration
                    ? 'bg-white text-tomato'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {duration}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All Durations Summary */}
      <div className="mb-6 bg-black/20 rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-center">Current Settings</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>🍅 Pomodoro:</span>
            <span className="font-mono">{tempDurations.workDuration} min</span>
          </div>
          <div className="flex justify-between">
            <span>☕ Short Break:</span>
            <span className="font-mono">
              {tempDurations.shortBreakDuration} min
            </span>
          </div>
          <div className="flex justify-between">
            <span>🔄 Long Break:</span>
            <span className="font-mono">
              {tempDurations.longBreakDuration} min
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all"
        >
          Reset
        </button>

        <button
          onClick={handleSave}
          className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            showSaved
              ? 'bg-green-500 text-white'
              : 'bg-white text-tomato hover:bg-white/90'
          }`}
        >
          {showSaved ? (
            <>✅ Saved!</>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-white/70">
        💡 Tip: Changes will apply to new timer sessions
      </div>
    </div>
  )

  // Render Theme Settings
  const renderThemeSettings = () => {
    const themes = [
      {
        id: 'light' as const,
        name: 'Light Mode',
        description: 'Clean and bright interface',
        icon: '☀️',
        preview: 'bg-gradient-to-br from-orange-100 to-red-100 text-gray-800',
        selected: 'border-orange-400 bg-orange-50',
      },
      {
        id: 'dark' as const,
        name: 'Dark Mode',
        description: 'Easy on the eyes',
        icon: '🌙',
        preview: 'bg-gradient-to-br from-gray-800 to-gray-900 text-white',
        selected: 'border-blue-400 bg-gray-800',
      },
      {
        id: 'auto' as const,
        name: 'Auto',
        description: 'Follows system preference',
        icon: '🔄',
        preview:
          'bg-gradient-to-br from-purple-200 to-indigo-300 text-gray-800',
        selected: 'border-purple-400 bg-purple-100',
      },
    ]

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
      updateSettings({ theme: newTheme })
      setShowThemeSaved(true)
      setTimeout(() => setShowThemeSaved(false), 2000)
    }

    return (
      <div className="space-y-6">
        {/* Back Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentView('menu')}
            className="p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">🎨 Theme Settings</h1>
            <p className="text-white/80">Choose your visual experience</p>
          </div>
        </div>

        {/* Current Theme Display */}
        <div className="bg-black/20 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Current Theme</h2>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {themes.find(t => t.id === theme)?.icon}
            </div>
            <div>
              <div className="font-semibold">
                {themes.find(t => t.id === theme)?.name}
              </div>
              <div className="text-sm text-white/70">
                {themes.find(t => t.id === theme)?.description}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Options */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Choose Theme</h2>
          {themes.map(themeOption => (
            <button
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                theme === themeOption.id
                  ? 'border-white bg-black/30 shadow-lg'
                  : 'border-white/30 bg-black/10 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Theme Preview */}
                <div
                  className={`w-12 h-12 rounded-lg ${themeOption.preview} flex items-center justify-center text-xl border-2 border-white/20`}
                >
                  {themeOption.icon}
                </div>

                {/* Theme Info */}
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg">
                    {themeOption.name}
                  </div>
                  <div className="text-sm text-white/70">
                    {themeOption.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {theme === themeOption.id && (
                  <div className="text-white">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-tomato"></div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Theme Preview Section */}
        <div className="bg-black/20 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Preview</h3>
          <div className="space-y-3">
            {theme === 'light' && (
              <div className="bg-white rounded-lg p-4 text-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span className="font-semibold">Light Mode Preview</span>
                </div>
                <p className="text-sm text-gray-600">
                  Clean, bright, and professional interface perfect for daytime
                  use.
                </p>
              </div>
            )}

            {theme === 'dark' && (
              <div className="bg-gray-800 rounded-lg p-4 text-white border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="font-semibold">Dark Mode Preview</span>
                </div>
                <p className="text-sm text-gray-300">
                  Easy on the eyes with reduced strain for extended use.
                </p>
              </div>
            )}

            {theme === 'auto' && (
              <div className="bg-gradient-to-r from-white to-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-purple-400 rounded"></div>
                  <span className="font-semibold text-gray-800">
                    Auto Mode Preview
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Automatically switches between light and dark based on your
                  system.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Confirmation */}
        {showThemeSaved && (
          <div className="bg-green-500 text-white rounded-lg p-4 text-center font-semibold">
            ✅ Theme saved! Changes will apply on next app restart.
          </div>
        )}

        {/* Info Section */}
        <div className="bg-black/20 rounded-xl p-4">
          <h3 className="font-semibold mb-2">💡 Theme Information</h3>
          <div className="space-y-2 text-sm text-white/80">
            <p>
              • <strong>Light Mode:</strong> Best for daytime use and bright
              environments
            </p>
            <p>
              • <strong>Dark Mode:</strong> Reduces eye strain in low-light
              conditions
            </p>
            <p>
              • <strong>Auto Mode:</strong> Follows your system's theme
              preference
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render placeholder pages for other settings
  const renderPlaceholderPage = (title: string, icon: string) => (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentView('menu')}
          className="p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-white/80">Coming soon...</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="text-center py-20">
        <div className="text-8xl mb-6">{icon}</div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-white/70 mb-8">This feature is under development</p>
        <div className="bg-black/20 rounded-xl p-6 max-w-sm mx-auto">
          <p className="text-sm text-white/80">
            We're working on bringing you amazing {title.toLowerCase()} options.
            Stay tuned for updates! 🚀
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={`p-6 min-h-screen text-white transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-tomato to-red-500'
      }`}
    >
      <div className="max-w-md mx-auto">
        {/* Render different views based on current selection */}
        {currentView === 'menu' && renderMainMenu()}
        {currentView === 'timer' && renderTimerSettings()}
        {currentView === 'sound' &&
          renderPlaceholderPage('Sound Settings', '🔊')}
        {currentView === 'notifications' &&
          renderPlaceholderPage('Notifications', '🔔')}
        {currentView === 'theme' && renderThemeSettings()}
        {currentView === 'ai' && renderPlaceholderPage('AI Features', '🤖')}
        {currentView === 'language' && renderPlaceholderPage('Language', '🌍')}
      </div>
    </div>
  )
}

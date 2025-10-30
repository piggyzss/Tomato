import { useSettingsStore } from '@/store/useSettingsStore'
import {
  ArrowLeft,
  Bell,
  Bot,
  Clock,
  Coffee,
  Globe,
  Palette,
  RefreshCw,
  Save,
  Timer,
  Volume2,
  X
} from 'lucide-react'
import { useState } from 'react'
import { TimerMode } from './ModeSelector'
import { playSoundEffect } from '@/utils/soundEffects'
import type { SoundType } from '@/types'

// Settings menu type
type SettingsView =
  | 'menu'
  | 'timer'
  | 'sound'
  | 'notifications'
  | 'theme'
  | 'ai'
  | 'language'

interface SettingsPanelProps {
  onClose?: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    theme,
    language,
    soundEnabled,
    soundType,
    updateSettings,
  } = useSettingsStore()

  // Navigation state
  const [currentView, setCurrentView] = useState<SettingsView>('menu')
  const [nextView, setNextView] = useState<SettingsView | null>(null)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')

  const handleViewChange = (view: SettingsView) => {
    if (nextView !== null) return // 防止动画期间多次点击

    const direction = view === 'menu' ? 'right' : 'left'
    setSlideDirection(direction)
    setNextView(view)

    // 300ms 后完成切换
    setTimeout(() => {
      setCurrentView(view)
      setNextView(null)
    }, 300)
  }

  // Local state for editing timer settings
  const [selectedMode, setSelectedMode] = useState<TimerMode>('pomodoro')
  const [tempDurations, setTempDurations] = useState({
    workDuration: workDuration,
    shortBreakDuration: shortBreakDuration,
    longBreakDuration: longBreakDuration,
  })

  console.log('tempDurations', tempDurations)
  const [showSaved, setShowSaved] = useState(false)
  const [showThemeSaved, setShowThemeSaved] = useState(false)
  
  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [showLanguageSaved, setShowLanguageSaved] = useState(false)

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

  // Reset to default values
  const handleReset = () => {
    const defaultDurations = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    }
    setTempDurations(defaultDurations)
    updateSettings(defaultDurations)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
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
    <div>
      {/* Fixed Header with Close Button */}
      <div className={`sticky top-0 z-10 pb-3 ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-[#D84848]'
        }`}>
        <div className="flex items-center justify-between py-3">
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">⚙️ Settings</h1>
            <p className="text-white/70 text-xs">Customize your Tomato experience</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X size={18} className="text-white/90" />
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-2.5">
        {settingsMenu.map(setting => {
          const Icon = setting.icon
          return (
            <button
              key={setting.id}
              onClick={() => handleViewChange(setting.id)}
              className="w-full p-2.5 rounded-lg bg-black/20 hover:bg-black/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${setting.color}`}>
                  <Icon size={18} color="white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-white">{setting.title}</div>
                  <div className="text-xs text-white/70">
                    {setting.description}
                  </div>
                </div>
                <div className="text-white/50">
                  <ArrowLeft size={16} className="rotate-180" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center text-xs text-white/60 bg-black/20 rounded-lg p-2.5">
        <div className="mb-1">🍅 Tomato Cat Timer v0.1.0</div>
        <div className="text-[10px]">Built with React + TypeScript + Zustand</div>
      </div>
    </div>
  )

  // Render Timer Settings (existing functionality)
  const renderTimerSettings = () => (
    <div>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pb-3 ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-[#D84848]'
        }`}>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => handleViewChange('menu')}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">Timer Settings</h1>
            <p className="text-white/70 text-xs">Customize your Pomodoro durations</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-4">

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
                  className={`w-full p-4 rounded-xl transition-all ${selectedMode === mode.id
                    ? 'bg-black/30'
                    : 'bg-black/10 hover:bg-black/20'
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
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${getCurrentDuration() === duration
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
            className="flex-1 px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all text-sm"
          >
            Reset
          </button>

          <button
            onClick={handleSave}
            className={`flex-1 px-4 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${showSaved
              ? 'bg-green-500 text-white'
              : 'bg-white text-tomato hover:bg-white/90'
              }`}
          >
            {showSaved ? (
              <>✅ Saved!</>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 mb-3 text-center text-sm text-white/70">
          💡 Tip: Changes will apply to new timer sessions
        </div>
      </div>
    </div>
  )

  // Render Theme Settings
  const renderThemeSettings = () => {
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
      <div>
        {/* Fixed Header */}
        <div className={`sticky top-0 z-10 pb-3 ${theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-[#D84848]'
          }`}>
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={() => handleViewChange('menu')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Back"
            >
              <ArrowLeft size={18} className="text-white/90" />
            </button>
            <div className="flex-1 text-left">
              <h1 className="text-base font-bold text-white mb-0.5">Theme Settings</h1>
              <p className="text-white/70 text-xs">Choose your visual experience</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-4">

          {/* Theme Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Select Theme</h2>
            <div className="space-y-3">
              {themes.map(themeOption => (
                <button
                  key={themeOption.id}
                  onClick={() => handleThemeChange(themeOption.id)}
                  className={`w-full p-4 rounded-xl transition-all ${theme === themeOption.id
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
      </div>
    )
  }

  // Render Language Settings
  const renderLanguageSettings = () => {
    const languages = [
      {
        id: 'zh-CN' as const,
        name: '中文',
        nativeName: '简体中文',
        icon: '🇨🇳',
        description: 'Simplified Chinese'
      },
      {
        id: 'en-US' as const,
        name: 'English',
        nativeName: 'English',
        icon: '🇺🇸',
        description: 'English (US)'
      },
      {
        id: 'ja-JP' as const,
        name: '日本語',
        nativeName: '日本語',
        icon: '🇯🇵',
        description: 'Japanese'
      }
    ]

    const handleSaveLanguage = () => {
      updateSettings({ language: selectedLanguage })
      setShowLanguageSaved(true)
      setTimeout(() => setShowLanguageSaved(false), 2000)
    }

    return (
      <div>
        {/* Fixed Header */}
        <div className={`sticky top-0 z-10 pb-3 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
        }`}>
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={() => handleViewChange('menu')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Back"
            >
              <ArrowLeft size={18} className="text-white/90" />
            </button>
            <div className="flex-1 text-left">
              <h1 className="text-base font-bold text-white mb-0.5">🌍 Language</h1>
              <p className="text-white/70 text-xs">Choose your preferred language</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {/* Description */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/20">
            <div className="space-y-2">
              <p className="text-sm text-white/90 font-medium">
                选择语言将影响 AI 生成的消息语言
              </p>
              <p className="text-xs text-white/70 leading-relaxed">
                包括猫咪鼓励消息、每日总结、任务分析等 AI 功能的输出语言。设置后，AI 将使用您选择的语言与您交流。
              </p>
            </div>
          </div>

          {/* Language Selection Dropdown */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/20">
            <h3 className="font-semibold mb-3 text-sm text-white">🌍 Message Language</h3>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'zh-CN' | 'en-US' | 'ja-JP')}
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
      </div>
    )
  }

  // Render Sound Settings
  const renderSoundSettings = () => {
    const soundTypes: Array<{ id: SoundType; name: string; description: string }> = [
      { id: 'ding', name: '叮', description: 'Clear single tone' },
      { id: 'ding-dong', name: '叮咚', description: 'Two-tone chime' },
      { id: 'chord', name: '三音和弦', description: 'Harmonious chord' },
      { id: 'victory', name: '游戏胜利音效', description: 'Ascending victory tune' },
      { id: 'soft', name: '柔和通知音效', description: 'Gentle notification' },
      { id: 'water-drop', name: '水滴声', description: 'Water drop sound' },
      { id: 'knock', name: '敲击声', description: 'Knock sound' },
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
      <div>
        {/* Fixed Header */}
        <div className={`sticky top-0 z-10 pb-3 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
        }`}>
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={() => handleViewChange('menu')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Back"
            >
              <ArrowLeft size={18} className="text-white/90" />
            </button>
            <div className="flex-1 text-left">
              <h1 className="text-base font-bold text-white mb-0.5">Sound Settings</h1>
              <p className="text-white/70 text-xs">Control audio notifications</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {/* Sound Enable/Disable Toggle */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-white mb-1">🔊 Sound Notifications</h3>
                <p className="text-xs text-white/70">Play sound when timer completes</p>
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
          <div className={`transition-opacity ${soundEnabled ? 'opacity-100' : 'opacity-50'}`}>
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
                      <div className="text-xs text-white/70">{sound.description}</div>
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
            <h3 className="font-semibold mb-3 text-center text-sm text-white">Current Settings</h3>
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
      </div>
    )
  }

  // Render placeholder pages for other settings
  const renderPlaceholderPage = (title: string, icon: string) => (
    <div>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pb-3 ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-[#D84848]'
        }`}>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => handleViewChange('menu')}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">{title}</h1>
            <p className="text-white/70 text-xs">Coming soon...</p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="text-center py-20">
        <div className="text-6xl mb-6">{icon}</div>
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-white/70 mb-8">This feature is under development</p>
        <div className="bg-black/20 rounded-xl p-6 max-w-sm mx-auto border border-white/20">
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
      className={`rounded-xl shadow-2xl overflow-hidden relative ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-[#D84848]'
        }`}
      style={{
        height: 'calc(100vh - 240px)',
        maxHeight: '600px'
      }}
    >
      <div
        className="max-w-md mx-auto h-full overflow-hidden text-white relative"
      >
        {/* 只渲染一个视图，使用 key 强制重新挂载 */}
        <div
          key={nextView || currentView}
          className="absolute inset-0 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          style={{
            animation: nextView !== null
              ? `slideInFrom${slideDirection === 'left' ? 'Right' : 'Left'} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
              : 'none'
          }}
        >
          {(nextView || currentView) === 'menu' && renderMainMenu()}
          {(nextView || currentView) === 'timer' && renderTimerSettings()}
          {(nextView || currentView) === 'sound' && renderSoundSettings()}
          {(nextView || currentView) === 'notifications' && renderPlaceholderPage('Notifications', '🔔')}
          {(nextView || currentView) === 'theme' && renderThemeSettings()}
          {(nextView || currentView) === 'ai' && renderPlaceholderPage('AI Features', '🤖')}
          {(nextView || currentView) === 'language' && renderLanguageSettings()}
        </div>
      </div>
    </div>
  )
}


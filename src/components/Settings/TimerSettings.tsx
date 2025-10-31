import { Clock, Coffee, RefreshCw, Save } from 'lucide-react'
import { useState } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import { TimerMode } from '@/components/ModeSelector'
import { ModalWithBack } from '@/components/Common'
import type { SettingsPageProps } from './types'

export default function TimerSettings({ onBack }: SettingsPageProps) {
  const {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    updateSettings,
  } = useSettingsStore()

  // Local state for editing timer settings
  const [selectedMode, setSelectedMode] = useState<TimerMode>('pomodoro')
  const [tempDurations, setTempDurations] = useState({
    workDuration: workDuration,
    shortBreakDuration: shortBreakDuration,
    longBreakDuration: longBreakDuration,
  })
  const [showSaved, setShowSaved] = useState(false)

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

  return (
    <ModalWithBack
      title={<>⏱️ Timer Settings</>}
      subtitle="Customize your Pomodoro durations"
      onBack={onBack}
    >
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
                  className={`w-full p-4 rounded-xl transition-all ${
                    selectedMode === mode.id
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
              <span className="font-mono">
                {tempDurations.workDuration} min
              </span>
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
            className={`flex-1 px-4 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${
              showSaved
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
    </ModalWithBack>
  )
}

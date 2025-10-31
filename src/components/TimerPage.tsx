import { useSettingsStore } from '@/store/useSettingsStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useState } from 'react'
import { BigTimer } from '@/components/BigTimer'
import { ModeSelector } from '@/components/ModeSelector'
import type { TimerMode } from '@/types'

// Parent component - contains the logic
export default function TimerPage() {
  const [currentMode, setCurrentMode] = useState<TimerMode>('pomodoro')
  const { setTotalSeconds, setStatus, setMode } = useTimerStore()
  const { workDuration, shortBreakDuration, longBreakDuration } =
    useSettingsStore()

  // THIS is where you define the actual function logic
  const handleModeChange = (newMode: TimerMode) => {
    setCurrentMode(newMode)

    // Update the timer store mode
    setMode(newMode)

    // Business logic based on mode
    switch (newMode) {
      case 'pomodoro':
        setTotalSeconds(workDuration * 60)
        break
      case 'shortBreak':
        setTotalSeconds(shortBreakDuration * 60)
        break
      case 'longBreak':
        setTotalSeconds(longBreakDuration * 60)
        break
    }

    setStatus('idle')
  }

  return (
    <div className="w-full flex items-center gap-8">
      {/* Mode Selector - Left Side, Vertical */}
      <ModeSelector mode={currentMode} onModeChange={handleModeChange} />

      {/* Timer - Right Side, Centered */}
      <div className="flex-1">
        <BigTimer />
      </div>
    </div>
  )
}

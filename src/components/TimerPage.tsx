import { useSettingsStore } from '@/store/useSettingsStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useState } from 'react'
import { BigTimer } from './BigTimer'
import { ModeSelector, TimerMode } from './ModeSelector'

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
    <div className="w-full flex flex-col">
      {/* Pass the function DOWN to child component */}
      <ModeSelector mode={currentMode} onModeChange={handleModeChange} />
      <BigTimer />
    </div>
  )
}

import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useCallback, useEffect } from 'react'

/**
 * Pomodoro timer logic Hook
 */
export function useTimer() {
  const {
    status,
    remainingSeconds,
    totalSeconds,
    setStatus,
    reset: resetTimer,
    incrementPomodoro,
    setTotalSeconds,
  } = useTimerStore()

  const { currentTaskId, updateTask } = useTaskStore()
  const {
    workDuration,
    shortBreakDuration,
    soundEnabled,
    notificationEnabled,
  } = useSettingsStore()

  // Start work timer
  const startWork = useCallback(() => {
    setTotalSeconds(workDuration * 60)
    setStatus('running')
  }, [workDuration, setTotalSeconds, setStatus])

  // Start break
  const startBreak = useCallback(() => {
    setTotalSeconds(shortBreakDuration * 60)
    setStatus('break')
  }, [shortBreakDuration, setTotalSeconds, setStatus])

  // Pause
  const pause = useCallback(() => {
    setStatus('paused')
  }, [setStatus])

  // Resume
  const resume = useCallback(() => {
    setStatus(status === 'break' ? 'break' : 'running')
  }, [status, setStatus])

  // Reset
  const reset = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  // Complete a pomodoro
  const completePomodo = useCallback(() => {
    incrementPomodoro()

    // Update current task's pomodoro count
    if (currentTaskId) {
      const currentTask = useTaskStore
        .getState()
        .tasks.find(t => t.id === currentTaskId)
      if (currentTask) {
        updateTask(currentTaskId, {
          pomodoroCount: currentTask.pomodoroCount + 1,
        })
      }
    }

    // Send notification
    if (notificationEnabled) {
      chrome.runtime.sendMessage({
        type: 'SHOW_NOTIFICATION',
        title: '🍅 Pomodoro Completed!',
        body: 'Well done! Time for a break~',
      })
    }

    // Play sound effect (if enabled)
    if (soundEnabled) {
      // TODO: Add sound effect playing logic
    }
  }, [
    currentTaskId,
    updateTask,
    incrementPomodoro,
    notificationEnabled,
    soundEnabled,
  ])

  // Handle countdown end
  useEffect(() => {
    if (remainingSeconds === 0 && status === 'running') {
      completePomodo()
      setStatus('idle')
    }
  }, [remainingSeconds, status, completePomodo, setStatus])

  return {
    status,
    remainingSeconds,
    totalSeconds,
    progress: ((totalSeconds - remainingSeconds) / totalSeconds) * 100,
    startWork,
    startBreak,
    pause,
    resume,
    reset,
  }
}

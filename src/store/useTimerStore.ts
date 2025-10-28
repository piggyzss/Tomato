import { create } from 'zustand'
import type { TimerStatus } from '@/types'

interface TimerState {
  status: TimerStatus
  remainingSeconds: number
  totalSeconds: number
  currentPomodoro: number
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' // ← Add mode tracking

  // Actions
  setStatus: (status: TimerStatus) => void
  setRemainingSeconds: (seconds: number) => void
  setTotalSeconds: (seconds: number) => void
  setMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void // ← Add mode setter
  tick: () => void
  reset: () => void
  incrementPomodoro: () => void
}

export const useTimerStore = create<TimerState>(set => ({
  status: 'idle',
  remainingSeconds: 25 * 60, // 默认 25 分钟
  totalSeconds: 25 * 60,
  currentPomodoro: 0,
  mode: 'pomodoro', // ← Default to pomodoro mode

  setStatus: status => set({ status }),

  setRemainingSeconds: seconds => set({ remainingSeconds: seconds }),

  setTotalSeconds: seconds =>
    set({ totalSeconds: seconds, remainingSeconds: seconds }),

  setMode: mode => set({ mode }), // ← Add mode setter

  tick: () =>
    set(state => {
      if (state.remainingSeconds > 0) {
        return { remainingSeconds: state.remainingSeconds - 1 }
      }
      return state
    }),

  reset: () =>
    set(state => ({
      status: 'idle',
      remainingSeconds: state.totalSeconds,
    })),

  incrementPomodoro: () =>
    set(state => ({
      currentPomodoro: state.currentPomodoro + 1,
    })),
}))

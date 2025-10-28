import type { UserSettings } from '@/types'
import { create } from 'zustand'

interface SettingsState extends UserSettings {
  // Actions
  updateSettings: (settings: Partial<UserSettings>) => void
  setSettings: (settings: UserSettings) => void
}

const defaultSettings: UserSettings = {
  workDuration: 10 / 60, // 10秒用于调试
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  soundEnabled: true,
  notificationEnabled: true,
  theme: 'light',
  language: 'zh-CN',
  aiEnabled: false
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,

  updateSettings: (updates) => set((state) => ({
    ...state,
    ...updates
  })),

  setSettings: (settings) => set(settings)
}))


import type { UserSettings } from '@/types'
import { create } from 'zustand'

interface SettingsState extends UserSettings {
  // Actions
  updateSettings: (settings: Partial<UserSettings>) => void
  setSettings: (settings: UserSettings) => void
}

const defaultSettings: UserSettings = {
  workDuration: 25, // 25 分钟
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  soundEnabled: true,
  soundType: 'ding', // 默认音效类型
  notificationEnabled: true,
  theme: 'light',
  language: 'zh-CN',
  aiEnabled: false,
  aiMessages: [], // Add support for custom AI messages
  useAIMessages: false, // Toggle to use AI messages instead of default ones
  aiProvider: 'builtin', // AI 提供商偏好：builtin 或 cloud
}

export const useSettingsStore = create<SettingsState>(set => ({
  ...defaultSettings,

  updateSettings: updates =>
    set(state => ({
      ...state,
      ...updates,
    })),

  setSettings: settings => set(settings),
}))

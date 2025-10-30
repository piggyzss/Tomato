// Settings view types
export type SettingsView =
  | 'menu'
  | 'timer'
  | 'sound'
  | 'notifications'
  | 'theme'
  | 'ai'
  | 'language'

// Common props for settings pages
export interface SettingsPageProps {
  onBack: () => void
  theme: 'light' | 'dark' | 'auto'
}

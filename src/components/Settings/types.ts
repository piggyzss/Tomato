// Settings 组件的类型定义
// SettingsView 已迁移到 @/types/index.ts，这里重新导出以保持向后兼容
export type { SettingsView } from '@/types'

// Common props for settings pages
export interface SettingsPageProps {
  onBack: () => void
  theme: 'light' | 'dark' | 'auto'
}

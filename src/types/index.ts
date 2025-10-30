// 任务状态
export type TaskStatus = 'todo' | 'in-progress' | 'completed'

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high'

// 番茄钟状态
export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'

// 任务类型
export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  pomodoroCount: number
  totalTimeSpent: number // 总耗时（秒）
  createdAt: number
  completedAt?: number
  description?: string
}

// 番茄钟配置
export interface PomodoroConfig {
  workDuration: number // 工作时长（分钟）
  shortBreakDuration: number // 短休息时长（分钟）
  longBreakDuration: number // 长休息时长（分钟）
  pomodorosUntilLongBreak: number // 几个番茄后长休息
  soundEnabled: boolean // 音效开关
  notificationEnabled: boolean // 通知开关
}

// 番茄钟记录
export interface PomodoroRecord {
  id: string
  taskId: string
  startTime: number
  endTime: number
  duration: number
  completed: boolean
}

// 统计数据
export interface Statistics {
  date: string // YYYY-MM-DD
  completedPomodoros: number
  totalFocusTime: number // 分钟
  completedTasks: number
}

// AI 生成的消息
export interface GeneratedAIMessage {
  id: string
  text: string
  context: string
  createdAt: number
}

// 用户设置
export interface UserSettings extends PomodoroConfig {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US' | 'ja-JP'
  aiEnabled: boolean
  aiMessages: GeneratedAIMessage[]
  useAIMessages: boolean
}

// 猫咪状态
export interface CatState {
  mood: 'happy' | 'working' | 'resting' | 'excited' | 'sleepy'
  message: string
}

// AI 对话历史
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Chrome Storage 数据结构
export interface StorageData {
  tasks: Task[]
  settings: UserSettings
  statistics: Statistics[]
  pomodoroRecords: PomodoroRecord[]
  aiHistory: AIMessage[]
  currentTaskId?: string
  geminiApiKey?: string
  aiModePreference?: 'builtin' | 'cloud'
}

// ============================================
// 基础类型定义
// ============================================

// 任务状态：todo-待办 | in-progress-进行中 | completed-已完成
export type TaskStatus = 'todo' | 'in-progress' | 'completed'

// 任务优先级：low-低 | medium-中 | high-高
export type TaskPriority = 'low' | 'medium' | 'high'

// 番茄钟状态：idle-空闲 | running-运行中 | paused-暂停 | break-休息
export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'

// 番茄钟模式：pomodoro-工作 | shortBreak-短休息 | longBreak-长休息
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'

// ============================================
// AI 相关类型
// ============================================

// AI 提供商类型：builtin-Chrome内置AI | cloud-云端AI
export type AIProvider = 'builtin' | 'cloud'

// AI 模式偏好（与 AIProvider 相同，用于用户设置）
export type AIMode = AIProvider

// AI 状态：checking-检查中 | ready-就绪 | unavailable-不可用 | error-错误
export type AIStatus = 'checking' | 'ready' | 'unavailable' | 'error'

// AI 可用性状态：checking-检查中 | ready-就绪 | unavailable-不可用
export type AIAvailability = 'checking' | 'ready' | 'unavailable'

// ============================================
// 视图导航类型
// ============================================

// 设置视图类型
export type SettingsView =
  | 'menu'
  | 'timer'
  | 'sound'
  | 'notifications'
  | 'theme'
  | 'ai'
  | 'language'

// AI 功能视图类型
export type AIView = 'menu' | 'catMessages' | 'dailySummary' | 'apiDemo' | 'settings'

// 分析视图类型
export type AnalysisView = 'menu' | 'taskFinishRate' | 'totalTime' | 'history'

// ============================================
// 分析相关类型
// ============================================

// 时间范围选项：day-日 | week-周 | month-月
export type TimeRange = 'day' | 'week' | 'month'

// 时间显示模式：total-总时间 | working-工作时间
export type TimeDisplayMode = 'total' | 'working'

// 任务分组方式：overall-总体 | perTask-按任务
export type TaskGrouping = 'overall' | 'perTask'

// 任务类型
export interface Task {
  id: string // 任务唯一标识符
  title: string // 任务标题
  status: TaskStatus // 任务当前状态
  priority: TaskPriority // 任务优先级
  pomodoroCount: number // 完成的番茄钟数量
  totalTimeSpent: number // 任务总耗时（秒）
  createdAt: number // 任务创建时间戳（毫秒）
  completedAt?: number // 任务完成时间戳（毫秒）
  description?: string // 任务描述
}

// 音效类型
export type SoundType =
  | 'ding'
  | 'ding-dong'
  | 'chord'
  | 'victory'
  | 'soft'
  | 'water-drop'
  | 'knock'

// 番茄钟配置
export interface PomodoroConfig {
  workDuration: number // 工作时长（分钟）
  shortBreakDuration: number // 短休息时长（分钟）
  longBreakDuration: number // 长休息时长（分钟）
  pomodorosUntilLongBreak: number // 几个番茄钟后进行长休息
  soundEnabled: boolean // 音效开关
  soundType: SoundType // 音效类型
  notificationEnabled: boolean // 通知开关
}

// 番茄钟记录
export interface PomodoroRecord {
  id: string // 记录唯一标识符
  taskId: string // 关联的任务 ID
  startTime: number // 开始时间戳（毫秒）
  endTime: number // 结束时间戳（毫秒）
  duration: number // 持续时长（秒）
  completed: boolean // 是否完整完成（未中断）
}

// 统计数据
export interface Statistics {
  date: string // 统计日期 YYYY-MM-DD
  completedPomodoros: number // 完成的番茄钟数量
  totalFocusTime: number // 总专注时长（分钟）
  completedTasks: number // 完成的任务数量
}

// AI 生成的消息
export interface GeneratedAIMessage {
  id: string // 消息唯一标识符
  text: string // 消息文本内容
  context: string // 消息生成的上下文
  createdAt: number // 创建时间戳（毫秒）
}

// AI 对话历史
export interface AIMessage {
  id: string // 消息唯一标识符
  role: 'user' | 'assistant' // 消息角色：用户或 AI 助手
  content: string // 消息内容
  timestamp: number // 消息时间戳（毫秒）
}

// 用户设置
export interface UserSettings extends PomodoroConfig {
  theme: 'light' | 'dark' | 'auto' // 主题模式
  language: 'zh-CN' | 'en-US' | 'ja-JP' // 界面语言
  aiEnabled: boolean // 是否启用 AI 功能
  aiMessages: GeneratedAIMessage[] // AI 生成的消息列表
  useAIMessages: boolean // 是否使用 AI 消息替代默认消息
}

// 猫咪状态
export interface CatState {
  mood: 'happy' | 'working' | 'resting' | 'excited' | 'sleepy' // 猫咪心情
  message: string // 显示的消息文本
}

// 每日历史数据
export interface DailyHistory {
  date: string // 日期 YYYY-MM-DD
  tasks: Task[] // 当天的所有任务
  pomodoroRecords: PomodoroRecord[] // 当天的番茄钟记录
  completedPomodoros: number // 完成的番茄钟数量
  totalFocusTime: number // 总专注时长（分钟）
  completedTasks: number // 完成的任务数量
}

// Chrome Storage 数据结构
export interface StorageData {
  tasks: Task[] // 当前任务列表
  settings: UserSettings // 用户设置
  statistics: Statistics[] // 统计数据列表
  pomodoroRecords: PomodoroRecord[] // 番茄钟记录列表
  aiHistory: AIMessage[] // AI 对话历史
  currentTaskId?: string // 当前选中的任务 ID
  geminiApiKey?: string // Google Gemini API Key
  aiModePreference?: AIMode // AI 模式偏好
  history?: Record<string, DailyHistory> // 历史数据，key 为日期字符串 YYYY-MM-DD
  lastResetDate?: string // 上次重置日期 YYYY-MM-DD
  timerState?: any // 计时器状态（用于恢复）
}

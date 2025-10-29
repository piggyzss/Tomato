import { useSettingsStore } from '@/store/useSettingsStore'
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import AIMainMenu from './AIMainMenu'

// ============================================================================
// TypeScript Definitions for Gemini Nano API
// ============================================================================

interface LanguageModelCapabilities {
  available: 'readily' | 'after-download' | 'no'
  defaultTemperature?: number
  maxTemperature?: number
  defaultTopK?: number
  maxTopK?: number
}

interface LanguageModelParams {
  defaultTemperature: number
  maxTemperature: number
  defaultTopK: number
  maxTopK: number
}

interface PromptMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: 'text' | 'image' | 'audio'; value: string | File }>
  prefix?: boolean
}

interface PromptOptions {
  signal?: AbortSignal
  responseConstraint?: object
  omitResponseConstraintInput?: boolean
}

interface SessionOptions {
  temperature?: number
  topK?: number
  signal?: AbortSignal
  monitor?: (monitor: EventTarget) => void
  initialPrompts?: PromptMessage[]
  expectedInputs?: Array<{
    type: 'text' | 'image' | 'audio'
    languages?: string[]
  }>
  expectedOutputs?: Array<{
    type: 'text'
    languages?: string[]
  }>
}

interface LanguageModelSession {
  prompt: (input: string | PromptMessage[], options?: PromptOptions) => Promise<string>
  promptStreaming: (input: string | PromptMessage[], options?: PromptOptions) => ReadableStream
  append: (messages: PromptMessage[]) => Promise<void>
  clone: (options?: { signal?: AbortSignal }) => Promise<LanguageModelSession>
  destroy: () => void
  inputUsage: number
  inputQuota: number
  measureInputUsage: (input: string | PromptMessage[], options?: PromptOptions) => Promise<number>
}

interface LanguageModel {
  availability: (options?: SessionOptions) => Promise<LanguageModelCapabilities>
  params: () => Promise<LanguageModelParams>
  create: (options?: SessionOptions) => Promise<LanguageModelSession>
}

declare global {
  interface Window {
    ai?: {
      languageModel?: LanguageModel
    }
  }
}

// ============================================================================
// AI Service Class - Core Gemini Nano Implementation
// ============================================================================

export class GeminiNanoService {
  private session: LanguageModelSession | null = null
  private capabilities: LanguageModelCapabilities | null = null
  private params: LanguageModelParams | null = null
  private isInitialized = false
  private isInitializing = false

  // Event handlers for download progress and status changes
  private onDownloadProgress?: (progress: number) => void
  private onStatusChange?: (status: 'checking' | 'downloading' | 'ready' | 'error' | 'unavailable') => void

  /**
   * Initialize the Gemini Nano service
   */
  async initialize(options?: {
    onDownloadProgress?: (progress: number) => void
    onStatusChange?: (status: 'checking' | 'downloading' | 'ready' | 'error' | 'unavailable') => void
  }): Promise<boolean> {
    if (this.isInitialized) return true
    if (this.isInitializing) return false

    this.isInitializing = true
    this.onDownloadProgress = options?.onDownloadProgress
    this.onStatusChange = options?.onStatusChange

    try {
      this.onStatusChange?.('checking')
      
      // Check if the API is available
      if (!this.isApiAvailable()) {
        console.error('❌ Gemini Nano API not available')
        this.onStatusChange?.('unavailable')
        return false
      }

      // Get model capabilities and parameters
      await this.loadCapabilitiesAndParams()

      // Check availability
      if (this.capabilities?.available === 'no') {
        console.error('❌ Gemini Nano model not available on this device')
        this.onStatusChange?.('unavailable')
        return false
      }

      // Create session
      await this.createSession()
      
      this.isInitialized = true
      this.onStatusChange?.('ready')
      console.log('✅ Gemini Nano service initialized successfully')
      return true

    } catch (error) {
      console.error('❌ Failed to initialize Gemini Nano service:', error)
      this.onStatusChange?.('error')
      return false
    } finally {
      this.isInitializing = false
    }
  }

  /**
   * Check if the Gemini Nano API is available in the browser
   */
  private isApiAvailable(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.ai?.languageModel
    )
  }

  /**
   * Load model capabilities and parameters
   */
  private async loadCapabilitiesAndParams(): Promise<void> {
    if (!window.ai?.languageModel) {
      throw new Error('LanguageModel API not available')
    }

    // Get capabilities and parameters in parallel
    const [capabilities, params] = await Promise.all([
      window.ai.languageModel.availability(),
      window.ai.languageModel.params()
    ])

    this.capabilities = capabilities
    this.params = params

    console.log('🔍 Model capabilities:', capabilities)
    console.log('🔧 Model parameters:', params)
  }

  /**
   * Create a new AI session with optimal settings
   */
  private async createSession(): Promise<void> {
    if (!window.ai?.languageModel || !this.params) {
      throw new Error('LanguageModel API or params not available')
    }

    // Use slightly higher temperature for more creative responses
    const sessionOptions: SessionOptions = {
      temperature: Math.min(this.params.defaultTemperature * 1.2, this.params.maxTemperature),
      topK: this.params.defaultTopK,
      monitor: (monitor) => {
        monitor.addEventListener('downloadprogress', (e: Event & { loaded?: number }) => {
          const progress = Math.round((e.loaded || 0) * 100)
          console.log(`📥 Download progress: ${progress}%`)
          this.onDownloadProgress?.(progress)
          
          if (progress < 100) {
            this.onStatusChange?.('downloading')
          }
        })
      },
      initialPrompts: [
        {
          role: 'system',
          content: `You are a helpful AI assistant integrated into a Pomodoro timer app called "Tomato Cat". 
          You help users with productivity, time management, and motivation. 
          Keep responses concise, friendly, and encouraging. 
          Use occasional cat-themed emojis (🐱, 😺, 😸) but don't overdo it.
          Always be supportive and positive about the user's productivity journey.`
        }
      ],
      expectedInputs: [
        { type: 'text', languages: ['en', 'zh-CN', 'ja'] }
      ],
      expectedOutputs: [
        { type: 'text', languages: ['en', 'zh-CN', 'ja'] }
      ]
    }

    if (this.capabilities?.available === 'after-download') {
      console.log('📥 Model needs to be downloaded...')
      this.onStatusChange?.('downloading')
    }

    this.session = await window.ai.languageModel.create(sessionOptions)
    console.log('✅ AI session created successfully')
  }

  /**
   * Send a prompt to the AI and get a response
   */
  async prompt(input: string | PromptMessage[], options?: PromptOptions): Promise<string> {
    if (!this.session) {
      throw new Error('AI service not initialized. Call initialize() first.')
    }

    try {
      return await this.session.prompt(input, options)
    } catch (error) {
      console.error('❌ Prompt failed:', error)
      throw error
    }
  }

  /**
   * Send a prompt and get a streaming response
   */
  promptStreaming(input: string | PromptMessage[], options?: PromptOptions): ReadableStream {
    if (!this.session) {
      throw new Error('AI service not initialized. Call initialize() first.')
    }

    try {
      return this.session.promptStreaming(input, options)
    } catch (error) {
      console.error('❌ Streaming prompt failed:', error)
      throw error
    }
  }

  /**
   * Add messages to the session context
   */
  async append(messages: PromptMessage[]): Promise<void> {
    if (!this.session) {
      throw new Error('AI service not initialized. Call initialize() first.')
    }

    try {
      return await this.session.append(messages)
    } catch (error) {
      console.error('❌ Append failed:', error)
      throw error
    }
  }

  /**
   * Clone the current session (preserves initial prompts, resets conversation)
   */
  async cloneSession(options?: { signal?: AbortSignal }): Promise<LanguageModelSession> {
    if (!this.session) {
      throw new Error('AI service not initialized. Call initialize() first.')
    }

    try {
      return await this.session.clone(options)
    } catch (error) {
      console.error('❌ Clone session failed:', error)
      throw error
    }
  }

  /**
   * Get session usage information
   */
  getUsage(): { used: number; quota: number; percentage: number } | null {
    if (!this.session) return null

    const used = this.session.inputUsage
    const quota = this.session.inputQuota
    const percentage = quota > 0 ? Math.round((used / quota) * 100) : 0

    return { used, quota, percentage }
  }

  /**
   * Measure how much input quota a prompt would use
   */
  async measureInputUsage(input: string | PromptMessage[], options?: PromptOptions): Promise<number> {
    if (!this.session) {
      throw new Error('AI service not initialized. Call initialize() first.')
    }

    try {
      return await this.session.measureInputUsage(input, options)
    } catch (error) {
      console.error('❌ Measure input usage failed:', error)
      throw error
    }
  }

  /**
   * Destroy the current session and free resources
   */
  destroy(): void {
    if (this.session) {
      this.session.destroy()
      this.session = null
    }
    this.isInitialized = false
    console.log('🗑️ AI session destroyed')
  }

  /**
   * Get current capabilities
   */
  getCapabilities(): LanguageModelCapabilities | null {
    return this.capabilities
  }

  /**
   * Get current parameters
   */
  getParams(): LanguageModelParams | null {
    return this.params
  }

  /**
   * Check if the service is ready to use
   */
  isReady(): boolean {
    return this.isInitialized && !!this.session
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.isInitializing,
      hasSession: !!this.session,
      capabilities: this.capabilities,
      params: this.params,
      usage: this.getUsage(),
      apiAvailable: this.isApiAvailable()
    }
  }
}

// ============================================================================
// React Context for AI Service
// ============================================================================

interface AIContextType {
  service: GeminiNanoService
  isReady: boolean
  isLoading: boolean
  error: string | null
  downloadProgress: number
  status: 'checking' | 'downloading' | 'ready' | 'error' | 'unavailable' | 'idle'
}

const AIContext = createContext<AIContextType | null>(null)

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

// ============================================================================
// AI Provider Component
// ============================================================================

interface AIProviderProps {
  children: ReactNode
}

export function AIProvider({ children }: AIProviderProps) {
  const [service] = useState(() => new GeminiNanoService())
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [status, setStatus] = useState<'checking' | 'downloading' | 'ready' | 'error' | 'unavailable' | 'idle'>('idle')

  useEffect(() => {
    let mounted = true

    const initializeService = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const success = await service.initialize({
          onDownloadProgress: (progress) => {
            if (mounted) setDownloadProgress(progress)
          },
          onStatusChange: (newStatus) => {
            if (mounted) setStatus(newStatus)
          }
        })

        if (mounted) {
          setIsReady(success)
          if (!success) {
            setError('Failed to initialize AI service. Please check Chrome flags and requirements.')
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred')
          setIsReady(false)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeService()

    return () => {
      mounted = false
      service.destroy()
    }
  }, [service])

  const contextValue: AIContextType = {
    service,
    isReady,
    isLoading,
    error,
    downloadProgress,
    status
  }

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  )
}

// ============================================================================
// Main AI Component
// ============================================================================

interface AIProps {
  onClose?: () => void
}

export default function AI({ onClose }: AIProps) {
  const { theme } = useSettingsStore()

  return (
    <AIProvider>
      <div
        className={`rounded-xl shadow-2xl overflow-hidden relative ${
          theme === 'dark'
            ? 'bg-gray-900'
            : 'bg-[#D84848]'
        }`}
        style={{
          height: 'calc(100vh - 240px)',
          maxHeight: '600px'
        }}
      >
        <div className="max-w-md mx-auto h-full overflow-hidden text-white relative">
          <div className="absolute inset-0 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <AIMainMenu onClose={onClose} />
          </div>
        </div>
      </div>
    </AIProvider>
  )
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a system prompt for different contexts
 */
export function createSystemPrompt(context: {
  taskTitle?: string
  timerStatus?: 'running' | 'paused' | 'idle'
  remainingMinutes?: number
  language?: 'en' | 'zh-CN' | 'ja'
}): string {
  const { taskTitle, timerStatus, remainingMinutes, language = 'en' } = context

  const languageMap = {
    'en': 'English',
    'zh-CN': 'Chinese',
    'ja': 'Japanese'
  }

  let contextInfo = ''
  if (taskTitle) {
    contextInfo += `Current task: "${taskTitle}". `
  }
  if (timerStatus && remainingMinutes !== undefined) {
    if (timerStatus === 'running') {
      contextInfo += `Timer is running with ${remainingMinutes} minutes remaining. `
    } else if (timerStatus === 'paused') {
      contextInfo += `Timer is paused. `
    } else {
      contextInfo += `Timer is idle. `
    }
  }

  return `You are a helpful AI assistant for a Pomodoro productivity app. ${contextInfo}
Respond in ${languageMap[language]}. Be encouraging, concise, and productivity-focused. 
Use cat emojis sparingly (🐱, 😺). Keep responses under 100 words unless asked for more detail.`
}

/**
 * Check if Chrome flags are properly enabled
 */
export function checkChromeFlags(): {
  isSupported: boolean
  missingFlags: string[]
  recommendations: string[]
} {
  const isSupported = !!(window.ai?.languageModel)
  
  const recommendations = [
    'Use Chrome Canary 127+ or Chrome Dev 127+',
    'Enable chrome://flags/#optimization-guide-on-device-model',
    'Enable chrome://flags/#prompt-api-for-gemini-nano',
    'Restart Chrome after enabling flags',
    'Ensure you have 22GB free storage space',
    'Ensure you have 4GB+ VRAM or 16GB+ RAM'
  ]

  const missingFlags = isSupported ? [] : [
    'chrome://flags/#optimization-guide-on-device-model',
    'chrome://flags/#prompt-api-for-gemini-nano'
  ]

  return {
    isSupported,
    missingFlags,
    recommendations
  }
}

import { useSettingsStore } from '@/store/useSettingsStore'
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react'
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
  content:
    | string
    | Array<{ type: 'text' | 'image' | 'audio'; value: string | File }>
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
  prompt: (
    input: string | PromptMessage[],
    options?: PromptOptions
  ) => Promise<string>
  promptStreaming: (
    input: string | PromptMessage[],
    options?: PromptOptions
  ) => ReadableStream
  append: (messages: PromptMessage[]) => Promise<void>
  clone: (options?: { signal?: AbortSignal }) => Promise<LanguageModelSession>
  destroy: () => void
  inputUsage: number
  inputQuota: number
  measureInputUsage: (
    input: string | PromptMessage[],
    options?: PromptOptions
  ) => Promise<number>
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

// Add global LanguageModel interface
declare global {
  interface LanguageModel {
    availability: (
      options?: SessionOptions
    ) => Promise<LanguageModelCapabilities>
    params: () => Promise<LanguageModelParams>
    create: (options?: SessionOptions) => Promise<LanguageModelSession>
  }
}

declare const LanguageModel: LanguageModel

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
  private onStatusChange?: (
    status:
      | 'checking'
      | 'downloading'
      | 'ready'
      | 'error'
      | 'unavailable'
      | 'needs-download'
  ) => void

  /**
   * Initialize the Gemini Nano service - CHECK ONLY, no auto-download
   * Following official docs: user interaction required for download
   */
  async initialize(options?: {
    onDownloadProgress?: (progress: number) => void
    onStatusChange?: (
      status:
        | 'checking'
        | 'downloading'
        | 'ready'
        | 'error'
        | 'unavailable'
        | 'needs-download'
    ) => void
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
        console.error('❌ LanguageModel API not available')
        this.onStatusChange?.('unavailable')
        return false
      }

      // Check model availability following official docs
      const availability = await this.checkAvailability()
      console.log('🔍 Availability check result:', availability)

      if (!availability) {
        console.log('❌ No availability response - setting unavailable')
        this.onStatusChange?.('unavailable')
        return false
      }

      this.capabilities = availability

      // Following official docs: check availability response
      console.log('📋 Availability status:', availability.available)

      if (availability.available === 'no') {
        console.error('❌ Gemini Nano model not available on this device')
        this.onStatusChange?.('unavailable')
        return false
      }

      if (availability.available === 'readily') {
        // Model is ready, can create session immediately
        console.log('✅ Model is readily available - creating session')
        return await this.downloadAndCreateSession()
      }

      if (availability.available === 'after-download') {
        // Model needs download - require user interaction
        console.log('📥 Model needs to be downloaded - showing download button')
        this.onStatusChange?.('needs-download')
        return false // Don't auto-download, wait for user action
      }

      console.log('❓ Unexpected availability status:', availability.available)
      return false
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
   * Following official docs: Use LanguageModel.availability()
   */
  private isApiAvailable(): boolean {
    return !!(typeof window !== 'undefined' && window.ai?.languageModel)
  }

  /**
   * Check model availability - follows official docs exactly
   */
  async checkAvailability(): Promise<LanguageModelCapabilities | null> {
    console.log('🔍 Checking API availability...')
    console.log('🔍 window.ai exists:', !!window.ai)
    console.log(
      '🔍 window.ai.languageModel exists:',
      !!window.ai?.languageModel
    )

    if (!this.isApiAvailable()) {
      console.error('❌ LanguageModel API not available')
      return null
    }

    try {
      console.log('🔍 Calling languageModel.availability()...')
      // Following official docs: const availability = await LanguageModel.availability();
      const availability = await window.ai!.languageModel!.availability()
      console.log('🔍 Model availability result:', availability)
      return availability
    } catch (error) {
      console.error('❌ Failed to check availability:', error)
      return null
    }
  }

  /**
   * Download and create model session - requires user interaction
   * Following official docs: const session = await LanguageModel.create({...});
   */
  async downloadAndCreateSession(): Promise<boolean> {
    if (!this.isApiAvailable()) {
      this.onStatusChange?.('unavailable')
      return false
    }

    try {
      this.onStatusChange?.('downloading')

      // Following official docs exactly
      const session = await window.ai!.languageModel!.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        monitor: (m: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.addEventListener('downloadprogress', (e: any) => {
            const progress = Math.round((e.loaded || 0) * 100)
            console.log(`📥 Downloaded ${progress}%`)
            this.onDownloadProgress?.(progress)
          })
        },
        temperature: 0.8,
        topK: 3,
        initialPrompts: [
          {
            role: 'system',
            content: `You are a helpful AI assistant integrated into a Pomodoro timer app called "Tomato Cat". 
            You help users with productivity, time management, and motivation. 
            Keep responses concise, friendly, and encouraging. 
            Use occasional cat-themed emojis (🐱, 😺, 😸) but don't overdo it.
            Always be supportive and positive about the user's productivity journey.`,
          },
        ],
      })

      this.session = session
      this.isInitialized = true
      this.onStatusChange?.('ready')
      console.log('✅ Model downloaded and session created successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to download/create session:', error)
      this.onStatusChange?.('error')
      return false
    }
  }

  /**
   * Send a prompt to the AI and get a response
   */
  async prompt(
    input: string | PromptMessage[],
    options?: PromptOptions
  ): Promise<string> {
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
  promptStreaming(
    input: string | PromptMessage[],
    options?: PromptOptions
  ): ReadableStream {
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
  async cloneSession(options?: {
    signal?: AbortSignal
  }): Promise<LanguageModelSession> {
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
  async measureInputUsage(
    input: string | PromptMessage[],
    options?: PromptOptions
  ): Promise<number> {
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
      apiAvailable: this.isApiAvailable(),
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
  status:
    | 'checking'
    | 'downloading'
    | 'ready'
    | 'error'
    | 'unavailable'
    | 'needs-download'
    | 'idle'
  downloadModel: () => Promise<boolean>
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
  const [status, setStatus] = useState<
    | 'checking'
    | 'downloading'
    | 'ready'
    | 'error'
    | 'unavailable'
    | 'needs-download'
    | 'idle'
  >('idle')

  // Function to download model - requires user interaction
  const downloadModel = async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await service.downloadAndCreateSession()
      if (success) {
        setIsReady(true)
      }
      return success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download model'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeService = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const success = await service.initialize({
          onDownloadProgress: progress => {
            if (mounted) setDownloadProgress(progress)
          },
          onStatusChange: newStatus => {
            if (mounted) setStatus(newStatus)
          },
        })

        if (mounted) {
          setIsReady(success)
          if (!success) {
            setError(
              'Failed to initialize AI service. Please check Chrome flags and requirements.'
            )
          }
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Unknown error occurred'
          )
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
    status,
    downloadModel,
  }

  return (
    <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>
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
          theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
        }`}
        style={{
          height: 'calc(100vh - 240px)',
          maxHeight: '600px',
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
    en: 'English',
    'zh-CN': 'Chinese',
    ja: 'Japanese',
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
  const isSupported = !!window.ai?.languageModel

  const recommendations = [
    'Use Chrome Canary 127+ or Chrome Dev 127+',
    'Enable chrome://flags/#optimization-guide-on-device-model',
    'Enable chrome://flags/#prompt-api-for-gemini-nano',
    'Restart Chrome after enabling flags',
    'Ensure you have 22GB free storage space',
    'Ensure you have 4GB+ VRAM or 16GB+ RAM',
  ]

  const missingFlags = isSupported
    ? []
    : [
        'chrome://flags/#optimization-guide-on-device-model',
        'chrome://flags/#prompt-api-for-gemini-nano',
      ]

  return {
    isSupported,
    missingFlags,
    recommendations,
  }
}

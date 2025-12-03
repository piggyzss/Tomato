import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider } from '@/types'

/**
 * AI session configuration
 */
export interface AISessionConfig {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

/**
 * AI response result
 */
export interface AIResponse {
  text: string
  provider: AIProvider
}

/**
 * AI session interface - unified abstraction layer
 */
export interface IAISession {
  prompt(input: string): Promise<string>
  promptStreaming?(input: string): ReadableStream | AsyncIterable<string>
  destroy?(): void
}

/**
 * Built-in AI session implementation
 */
class BuiltInAISession implements IAISession {
  private session: any

  constructor(session: any) {
    this.session = session
  }

  async prompt(input: string): Promise<string> {
    return await this.session.prompt(input)
  }

  promptStreaming(input: string): ReadableStream {
    return this.session.promptStreaming(input)
  }

  destroy(): void {
    // Built-in AI may need to clean up resources
    this.session = null
  }
}

/**
 * Cloud AI session implementation
 */
class CloudAISession implements IAISession {
  private model: any
  private systemPrompt?: string
  private chatSession: any

  constructor(model: any, config?: AISessionConfig) {
    this.model = model
    this.systemPrompt = config?.systemPrompt

    // Create chat session to maintain context
    this.chatSession = this.model.startChat({
      history: [],
      generationConfig: {
        temperature: config?.temperature ?? 0.9,
        maxOutputTokens: config?.maxTokens ?? 2048,
      },
    })
  }

  async prompt(input: string): Promise<string> {
    try {
      // Add system prompt on first call if available
      const fullPrompt = this.systemPrompt
        ? `${this.systemPrompt}\n\nUser: ${input}`
        : input

      const result = await this.chatSession.sendMessage(fullPrompt)
      const response = result.response
      return response.text()
    } catch (error: any) {
      console.error('Cloud AI prompt error:', error)

      // Provide more detailed error information
      if (
        error?.message?.includes('404') ||
        error?.message?.includes('not found')
      ) {
        throw new Error(
          'Model unavailable. Please check: 1) API Key is valid 2) Has permission to access Gemini API 3) Recommend using Chrome built-in AI'
        )
      }

      throw new Error(
        'Cloud AI generation failed: ' + (error?.message || 'Unknown error')
      )
    }
  }

  async *promptStreaming(input: string): AsyncIterable<string> {
    try {
      const fullPrompt = this.systemPrompt
        ? `${this.systemPrompt}\n\n用户: ${input}`
        : input

      const result = await this.chatSession.sendMessageStream(fullPrompt)

      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        if (chunkText) {
          yield chunkText
        }
      }
    } catch (error: any) {
      console.error('Cloud AI prompt error:', error)

      // Provide more detailed error information
      if (
        error?.message?.includes('404') ||
        error?.message?.includes('not found')
      ) {
        throw new Error(
          'Model unavailable. Please check: 1) API Key is valid 2) Has permission to access Gemini API 3) Recommend using Chrome built-in AI'
        )
      }

      throw new Error(
        'Cloud AI generation failed: ' + (error?.message || 'Unknown error')
      )
    }
  }

  destroy(): void {
    this.chatSession = null
    this.model = null
  }
}

/**
 * AI service - unified service layer
 */
export class AIService {
  private cloudClient?: GoogleGenerativeAI
  private apiKey?: string
  private modePreference: AIProvider = 'builtin' // Default to built-in AI

  /**
   * Set cloud API Key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
    // Initialize Google Generative AI client
    // Use default configuration, SDK will auto-select appropriate API version
    this.cloudClient = new GoogleGenerativeAI(apiKey)
  }

  /**
   * Download built-in AI model (if needed)
   */
  async downloadBuiltInModel(
    onProgress?: (percent: number) => void
  ): Promise<any> {
    try {
      const LanguageModel =
        (window as any).LanguageModel || (window as any).ai?.languageModel

      if (!LanguageModel) throw new Error('LanguageModel API not found')

      const session = await LanguageModel.create({
        monitor(monitor: any) {
          monitor.addEventListener('downloadprogress', (e: any) => {
            const percent = Math.round(e.loaded * 100)
            console.log(`Downloaded ${percent}%`)
            onProgress?.(percent)
          })
        },
      })

      console.log('✅ Gemini Nano model created successfully:', session)
      return session
    } catch (err) {
      console.error('Error creating model:', err)
      throw err
    }
  }

  /**
   * Set AI mode preference
   */
  setModePreference(mode: AIProvider): void {
    this.modePreference = mode
  }

  /**
   * Get AI mode preference
   */
  getModePreference(): AIProvider {
    return this.modePreference
  }

  /**
   * Check if built-in AI is available
   */
  async checkBuiltInAvailability(): Promise<boolean> {
    try {
      // 尝试两种可能的全局引用
      const LanguageModel =
        (window as any).LanguageModel || (window as any).ai?.languageModel

      if (!LanguageModel) {
        console.log('Built-in AI: LanguageModel API not found')
        return false
      }

      // 优先使用 capabilities() 方法（新 API）
      if (typeof LanguageModel.capabilities === 'function') {
        const capabilities = await LanguageModel.capabilities()
        console.log('Built-in AI capabilities:', capabilities)

        const availableStates = ['readily', 'after-download', 'available']
        return availableStates.includes(capabilities.available)
      }

      // 降级使用 availability() 方法（旧 API）
      if (typeof LanguageModel.availability === 'function') {
        const availability = await LanguageModel.availability()
        console.log('Built-in AI availability:', availability)

        const availableStates = ['readily', 'after-download', 'available']
        return availableStates.includes(availability)
      }

      // 如果两个方法都不存在，返回 false
      console.log('Built-in AI: No availability check method found')
      return false
    } catch (error) {
      console.error('Check built-in AI error:', error)
      return false
    }
  }

  /**
   * Get detailed availability status of built-in AI
   * Use availability() method to support different Chrome API versions
   */
  async getBuiltInAvailabilityStatus(): Promise<string> {
    try {
      // 尝试两种可能的全局引用（取决于 Chrome 版本）
      const avail =
        (await (window as any).ai?.languageModel?.availability?.()) ??
        (await (window as any).LanguageModel?.availability?.())

      console.log('Gemini Nano availability:', avail)
      return avail || 'unavailable'
    } catch (err) {
      console.error('Error checking availability:', err)
      return 'error'
    }
  }

  /**
   * Check if cloud AI is available
   */
  checkCloudAvailability(): boolean {
    return !!this.apiKey && !!this.cloudClient
  }

  /**
   * Get available AI provider
   */
  async getAvailableProvider(): Promise<AIProvider | null> {
    console.log(
      '🔍 getAvailableProvider - modePreference:',
      this.modePreference
    )

    // 根据用户偏好选择
    let result: AIProvider | null = null
    if (this.modePreference === 'builtin') {
      const builtInAvailable = await this.checkBuiltInAvailability()
      console.log('🔍 Built-in available:', builtInAvailable)

      if (builtInAvailable) {
        result = 'builtin'
      }
      // 如果内置不可用，降级到云端
      if (!result && this.checkCloudAvailability()) {
        console.log('⚠️ Built-in unavailable, fallback to cloud')
        result = 'cloud'
      }
    } else if (this.modePreference === 'cloud') {
      // 用户偏好云端，优先使用云端
      const cloudAvailable = this.checkCloudAvailability()
      console.log('🔍 Cloud available:', cloudAvailable)

      if (cloudAvailable) {
        result = 'cloud'
      }
      // 如果云端不可用，降级到内置
      if (!result) {
        const builtInAvailable = await this.checkBuiltInAvailability()
        console.log(
          '⚠️ Cloud unavailable, fallback to built-in:',
          builtInAvailable
        )
        if (builtInAvailable) {
          result = 'builtin'
        }
      }
    }

    console.log('✅ Final provider:', result)

    return result
  }

  /**
   * Create AI session
   */
  async createSession(
    config?: AISessionConfig,
    preferredProvider?: AIProvider
  ): Promise<{ session: IAISession; provider: AIProvider }> {
    console.log(
      '🔧 createSession called with preferredProvider:',
      preferredProvider
    )

    // 如果指定了提供商，尝试使用指定的
    if (preferredProvider === 'builtin') {
      console.log('🔍 Checking built-in availability...')
      const builtInAvailable = await this.checkBuiltInAvailability()
      console.log('🔍 Built-in available:', builtInAvailable)

      if (builtInAvailable) {
        console.log('✅ Creating built-in session...')
        const session = await this.createBuiltInSession(config)
        return { session, provider: 'builtin' }
      }
    }

    if (preferredProvider === 'cloud') {
      console.log('🔍 Checking cloud availability...')
      const cloudAvailable = this.checkCloudAvailability()
      console.log('🔍 Cloud available:', cloudAvailable)

      if (cloudAvailable) {
        console.log('✅ Creating cloud session...')
        const session = await this.createCloudSession(config)
        return { session, provider: 'cloud' }
      }
    }

    // 自动选择可用的提供商
    console.log(
      '🔄 Auto-selecting provider based on preference:',
      this.modePreference
    )
    const provider = await this.getAvailableProvider()
    console.log('✅ Selected provider:', provider)

    if (provider === 'builtin') {
      const session = await this.createBuiltInSession(config)
      return { session, provider: 'builtin' }
    }

    if (provider === 'cloud') {
      const session = await this.createCloudSession(config)
      return { session, provider: 'cloud' }
    }

    throw new Error('No available AI providers')
  }

  /**
   * Create built-in AI session
   * Chrome - Prompt API (languageModel)
   */

  private async createBuiltInSession(
    config?: AISessionConfig
  ): Promise<IAISession> {
    try {
      // 尝试两种可能的全局引用（取决于 Chrome 版本）
      const LanguageModel =
        (window as any).LanguageModel || (window as any).ai?.languageModel

      if (!LanguageModel) {
        throw new Error('LanguageModel API not found')
      }

      // @panpan
      const params = await LanguageModel.params()
      const session = await LanguageModel.create({
        systemPrompt: config?.systemPrompt,
        expectedOutputs: [
          {
            type: 'text',
            languages: ['en-US'],
          },
        ],
        initialPrompts: [
          {
            role: 'system',
            content:
              'You are Chat Cat 🐱, a warm, concise productivity companion who answers helpfully and keeps messages warm, kind and motivating.',
          },
          { role: 'user', content: 'Can you say something to motivate me?' },
          { role: 'assistant', content: 'You work so hard! Good job!' },
          { role: 'user', content: 'I am so tired' },
          {
            role: 'assistant',
            content: 'Have a short break and stretch! Even cats need rest. 😸',
          },
          {
            role: 'user',
            content: 'It’s late, but I still have work left.',
          },
          {
            role: 'assistant',
            content:
              'Be kind to yourself. A little rest now might make tomorrow smoother. Cats know the value of sleep. 🌙',
          },
          {
            role: 'user',
            content: 'I’m proud of myself today.',
          },
          {
            role: 'assistant',
            content:
              'As you should be! Celebrate that sparkle—you’ve earned it! ✨',
          },
        ],
        temperature: params.defaultTemperature,
        topK: params.defaultTopK,
      })

      console.log('✅ Built-in AI session created successfully')
      return new BuiltInAISession(session)
    } catch (error) {
      console.error('Create built-in session error:', error)
      throw new Error(
        'Failed to create built-in AI session: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      )
    }
  }

  /**
   * Create cloud AI session
   */
  private async createCloudSession(
    config?: AISessionConfig
  ): Promise<IAISession> {
    if (!this.cloudClient) {
      throw new Error('Cloud AI not configured, please set API Key first')
    }

    try {
      // Use latest Gemini Flash model
      // gemini-flash-latest is current recommended stable model
      const model = this.cloudClient.getGenerativeModel({
        model: 'gemini-flash-latest',
      })

      return new CloudAISession(model, config)
    } catch (error) {
      console.error('Create cloud session error:', error)
      throw new Error('Failed to create cloud AI session')
    }
  }

  /**
   * Quick generation (one-time call, no session maintained)
   */
  async generate(
    prompt: string,
    config?: AISessionConfig,
    preferredProvider?: AIProvider
  ): Promise<AIResponse> {
    const { session, provider } = await this.createSession(
      config,
      preferredProvider
    )

    try {
      const text = await session.prompt(prompt)
      return { text, provider }
    } finally {
      session.destroy?.()
    }
  }
}

// Export singleton
export const aiService = new AIService()

//one problem: buitIn AI prompt input type is not string,
// but {role: 'user', content: string},
// conflict with cloud AI which input is string.

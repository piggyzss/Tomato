import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider } from '@/types'

/**
 * AI 会话配置
 */
export interface AISessionConfig {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

/**
 * AI 响应结果
 */
export interface AIResponse {
  text: string
  provider: AIProvider
}

/**
 * AI 会话接口 - 统一的抽象层
 */
export interface IAISession {
  prompt(input: string): Promise<string>
  promptStreaming?(input: string): ReadableStream | AsyncIterable<string>
  destroy?(): void
}

/**
 * 内置 AI 会话实现
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
    // 内置 AI 可能需要清理资源
    this.session = null
  }
}

/**
 * 云端 AI 会话实现
 */
class CloudAISession implements IAISession {
  private model: any
  private systemPrompt?: string
  private chatSession: any

  constructor(model: any, config?: AISessionConfig) {
    this.model = model
    this.systemPrompt = config?.systemPrompt

    // 创建聊天会话以保持上下文
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
      // 如果有系统提示词，在第一次调用时添加
      const fullPrompt = this.systemPrompt
        ? `${this.systemPrompt}\n\n用户: ${input}`
        : input

      const result = await this.chatSession.sendMessage(fullPrompt)
      const response = result.response
      return response.text()
    } catch (error: any) {
      console.error('Cloud AI prompt error:', error)

      // 提供更详细的错误信息
      if (
        error?.message?.includes('404') ||
        error?.message?.includes('not found')
      ) {
        throw new Error(
          '模型不可用。请检查：1) API Key 是否有效 2) 是否有权限访问 Gemini API 3) 建议使用 Chrome 内置 AI'
        )
      }

      throw new Error('云端 AI 生成失败：' + (error?.message || '未知错误'))
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

      // 提供更详细的错误信息
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
          throw new Error('模型不可用。请检查：1) API Key 是否有效 2) 是否有权限访问 Gemini API 3) 建议使用 Chrome 内置 AI')
      }

      throw new Error('云端 AI 生成失败：' + (error?.message || '未知错误'))
    }
  }

  destroy(): void {
    this.chatSession = null
    this.model = null
  }
}

/**
 * AI 服务 - 统一的服务层
 */
export class AIService {
  private cloudClient?: GoogleGenerativeAI
  private apiKey?: string
  private modePreference: AIProvider = 'builtin' // 默认使用内置 AI

  /**
   * 设置云端 API Key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
    // 初始化 Google Generative AI 客户端
    // 使用默认配置，SDK 会自动选择合适的 API 版本
    this.cloudClient = new GoogleGenerativeAI(apiKey)
  }

  /**
   * 下载内置 AI 模型（如果需要）
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
   * 设置 AI 模式偏好
   */
  setModePreference(mode: AIProvider): void {
    this.modePreference = mode
  }

  /**
   * 获取 AI 模式偏好
   */
  getModePreference(): AIProvider {
    return this.modePreference
  }

  /**
   * 检查内置 AI 是否可用
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
   * 获取内置 AI 的详细可用性状态
   * 使用 availability() 方法以支持不同版本的 Chrome API
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
   * 检查云端 AI 是否可用
   */
  checkCloudAvailability(): boolean {
    return !!this.apiKey && !!this.cloudClient
  }

  /**
   * 获取可用的 AI 提供商
   */
  async getAvailableProvider(): Promise<AIProvider | null> {
    console.log('🔍 getAvailableProvider - modePreference:', this.modePreference)
    
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
        console.log('⚠️ Cloud unavailable, fallback to built-in:', builtInAvailable)
        if (builtInAvailable) {
          result = 'builtin'
        }
      }
    }

    console.log('✅ Final provider:', result)

    return result
  }

  /**
   * 创建 AI 会话
   */
  async createSession(
    config?: AISessionConfig,
    preferredProvider?: AIProvider
  ): Promise<{ session: IAISession; provider: AIProvider }> {
    console.log('🔧 createSession called with preferredProvider:', preferredProvider)
    
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
    console.log('🔄 Auto-selecting provider based on preference:', this.modePreference)
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

    throw new Error('没有可用的 AI 提供商')
  }

  /**
   * 创建内置 AI 会话
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

      const session = await LanguageModel.create({
        systemPrompt: config?.systemPrompt,
      })

      console.log('✅ Built-in AI session created successfully')
      return new BuiltInAISession(session)
    } catch (error) {
      console.error('Create built-in session error:', error)
      throw new Error('创建内置 AI 会话失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  /**
   * 创建云端 AI 会话
   */
  private async createCloudSession(
    config?: AISessionConfig
  ): Promise<IAISession> {
    if (!this.cloudClient) {
      throw new Error('云端 AI 未配置，请先设置 API Key')
    }

    try {
      // 使用最新的 Gemini Flash 模型
      // gemini-flash-latest 是当前推荐的稳定模型
      const model = this.cloudClient.getGenerativeModel({
        model: 'gemini-flash-latest',
      })

      return new CloudAISession(model, config)
    } catch (error) {
      console.error('Create cloud session error:', error)
      throw new Error('创建云端 AI 会话失败')
    }
  }

  /**
   * 快速生成（一次性调用，不保持会话）
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

// 导出单例
export const aiService = new AIService()

//one problem: buitIn AI prompt input type is not string,
// but {role: 'user', content: string},
// conflict with cloud AI which input is string.

import { useState, useEffect, useCallback } from 'react'
import { aiService, AISessionConfig, IAISession } from '@/services/aiService'
import type { AIProvider, AIStatus } from '@/types'

/**
 * useAI Hook 返回值
 */
export interface UseAIReturn {
  // 状态
  status: AIStatus
  provider: AIProvider | null
  isLoading: boolean
  error: string | null
  
  // 会话
  session: IAISession | null
  
  // 方法
  createSession: (config?: AISessionConfig) => Promise<void>
  prompt: (input: string) => Promise<string>
  generate: (input: string, config?: AISessionConfig) => Promise<string>
  setApiKey: (apiKey: string) => void
  destroySession: () => void
  
  // 可用性检查
  builtInAvailable: boolean
  cloudAvailable: boolean
}

/**
 * useAI Hook - 在组件中使用 AI 服务
 */
export function useAI(autoInit = false, config?: AISessionConfig): UseAIReturn {
  const [status, setStatus] = useState<AIStatus>('checking')
  const [provider, setProvider] = useState<AIProvider | null>(null)
  const [session, setSession] = useState<IAISession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [builtInAvailable, setBuiltInAvailable] = useState(false)
  const [cloudAvailable, setCloudAvailable] = useState(false)

  // 检查可用性
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const builtIn = await aiService.checkBuiltInAvailability()
        const cloud = aiService.checkCloudAvailability()
        
        setBuiltInAvailable(builtIn)
        setCloudAvailable(cloud)

        if (builtIn || cloud) {
          setStatus('ready')
          const availableProvider = await aiService.getAvailableProvider()
          setProvider(availableProvider)
        } else {
          setStatus('unavailable')
        }
      } catch (err) {
        console.error('Check availability error:', err)
        setStatus('error')
        setError('检查 AI 可用性失败')
      }
    }

    checkAvailability()
  }, [])

  // 自动初始化会话
  useEffect(() => {
    if (autoInit && status === 'ready' && !session) {
      createSession(config)
    }
  }, [autoInit, status, session])

  // 创建会话
  const createSession = useCallback(async (sessionConfig?: AISessionConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      const { session: newSession, provider: usedProvider } = 
        await aiService.createSession(sessionConfig)
      
      setSession(newSession)
      setProvider(usedProvider)
      setStatus('ready')
    } catch (err) {
      console.error('Create session error:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : '创建会话失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 发送提示词（使用现有会话）
  const prompt = useCallback(async (input: string): Promise<string> => {
    if (!session) {
      throw new Error('会话未创建，请先调用 createSession')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await session.prompt(input)
      return response
    } catch (err) {
      console.error('Prompt error:', err)
      const errorMsg = err instanceof Error ? err.message : '生成失败'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // 快速生成（一次性调用）
  const generate = useCallback(async (
    input: string, 
    genConfig?: AISessionConfig
  ): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await aiService.generate(input, genConfig)
      setProvider(result.provider)
      return result.text
    } catch (err) {
      console.error('Generate error:', err)
      const errorMsg = err instanceof Error ? err.message : '生成失败'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 设置 API Key
  const setApiKey = useCallback((apiKey: string) => {
    aiService.setApiKey(apiKey)
    setCloudAvailable(true)
    
    // 重新检查状态
    if (status === 'unavailable') {
      setStatus('ready')
      setProvider('cloud')
    }
  }, [status])

  // 销毁会话
  const destroySession = useCallback(() => {
    if (session) {
      session.destroy?.()
      setSession(null)
    }
  }, [session])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      destroySession()
    }
  }, [])

  return {
    status,
    provider,
    isLoading,
    error,
    session,
    createSession,
    prompt,
    generate,
    setApiKey,
    destroySession,
    builtInAvailable,
    cloudAvailable,
  }
}

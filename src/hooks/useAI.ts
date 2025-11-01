import { useState, useEffect, useCallback } from 'react'
import { aiService, AISessionConfig, IAISession } from '@/services/aiService'
import type { AIProvider, AIStatus } from '@/types'

/**
 * useAI Hook return values
 */
export interface UseAIReturn {
  // Status
  status: AIStatus
  provider: AIProvider | null
  isLoading: boolean
  error: string | null

  // Session

  session: IAISession | null
  // Methods
  createSession: (config?: AISessionConfig) => Promise<void>
  prompt: (input: string) => Promise<string>
  generate: (input: string, config?: AISessionConfig) => Promise<string>
  setApiKey: (apiKey: string) => void
  destroySession: () => void

  // Availability check
  builtInAvailable: boolean
  cloudAvailable: boolean
}

/**
 * useAI Hook - Use AI service in components
 */
export function useAI(autoInit = false, config?: AISessionConfig): UseAIReturn {
  const [status, setStatus] = useState<AIStatus>('checking')
  const [provider, setProvider] = useState<AIProvider | null>(null)
  const [session, setSession] = useState<IAISession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [builtInAvailable, setBuiltInAvailable] = useState(false)
  const [cloudAvailable, setCloudAvailable] = useState(false)

  // Check availability
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
        setError('Failed to check AI availability')
      }
    }

    checkAvailability()
  }, [])

  // Auto initialize session
  useEffect(() => {
    if (
      autoInit &&
      status === 'ready' &&
      !session &&
      (builtInAvailable || cloudAvailable)
    ) {
      createSession(config)
    }
  }, [autoInit, status, session, builtInAvailable, cloudAvailable])

  // Create session
  const createSession = useCallback(
    async (sessionConfig?: AISessionConfig) => {
      // Check if AI is available
      if (!builtInAvailable && !cloudAvailable) {
        const errorMsg =
          'No available AI provider, please configure cloud AI or enable built-in AI'
        setError(errorMsg)
        setStatus('unavailable')
        return
      }

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
        setError(
          err instanceof Error ? err.message : 'Failed to create session'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [builtInAvailable, cloudAvailable]
  )

  // Send prompt (using existing session)
  const prompt = useCallback(
    async (input: string): Promise<string> => {
      if (!session) {
        throw new Error('Session not created, please call createSession first')
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await session.prompt(input)
        return response
      } catch (err) {
        console.error('Prompt error:', err)
        const errorMsg =
          err instanceof Error ? err.message : 'Generation failed'
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [session]
  )

  // Quick generation (one-time call)
  const generate = useCallback(
    async (input: string, genConfig?: AISessionConfig): Promise<string> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await aiService.generate(input, genConfig)
        setProvider(result.provider)
        return result.text
      } catch (err) {
        console.error('Generate error:', err)
        const errorMsg =
          err instanceof Error ? err.message : 'Generation failed'
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Set API Key
  const setApiKey = useCallback(
    (apiKey: string) => {
      aiService.setApiKey(apiKey)
      setCloudAvailable(true)

      // Recheck status
      if (status === 'unavailable') {
        setStatus('ready')
        setProvider('cloud')
      }
    },
    [status]
  )

  // Destroy session
  const destroySession = useCallback(() => {
    if (session) {
      session.destroy?.()
      setSession(null)
    }
  }, [session])

  // Cleanup when component unmounts
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

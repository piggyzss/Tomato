// services/aiModelService.ts
{/* @panpan */}
/**
 * Utility functions for interacting with the Gemini Nano Prompt API.
 * These are pure logic functions — no React hooks or state here.
 */

export async function checkAvailability(): Promise<string> {
  try {
    const avail =
      (await (window as any).LanguageModel?.availability?.()) ??
      (await (window as any).ai?.languageModel?.availability?.())

    console.log('Gemini Nano availability:', avail)
    return avail || 'unavailable'
  } catch (err) {
    console.error('Error checking availability:', err)
    return 'error'
  }
}

/**
 * Create or download the Gemini Nano model.
 * @param onProgress A callback for tracking download progress.
 */
export async function createModel(
  onProgress: (percent: number) => void
): Promise<any> {
  try {
    const modelClass =
      (window as any).LanguageModel || (window as any).ai?.languageModel

    if (!modelClass) throw new Error('LanguageModel API not found')

    const session = await modelClass.create({
      monitor(monitor: any) {
        monitor.addEventListener('downloadprogress', (e: any) => {
          const percent = Math.round(e.loaded * 100)
          console.log(`Downloaded ${percent}%`)
          onProgress(percent)
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

// services/chatService.ts

/**
 * Utility functions for the ChatCat AI — all Gemini Nano logic lives here.
 * The React component will only handle UI and call these functions.
 */

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

/**
 * Create and initialize a Gemini Nano chat session
 */
export async function createChatSession(): Promise<any> {
  try {
    const modelClass =
      (window as any).LanguageModel || (window as any).ai?.languageModel

    if (!modelClass) throw new Error('LanguageModel API not found')

    const params = await modelClass.params()

    const session = await modelClass.create({
      // expectedOutputs: [{ type: "text", languages: ["en"] }],
      // expectedInputs: [
      //   {
      //     type: 'text',
      //     languages:
      //       languageSetting === 'ja-JP'
      //         ? ['ja' /* system prompt */, 'ja' /* user prompt */]
      //         : languageSetting === 'zh-CN'
      //           ? ['cn' /* system prompt */, 'cn' /* user prompt */]
      //           : ['en' /* system prompt */, 'en' /* user prompt */],
      //   },
      // ],
      expectedOutputs: [
        {
          type: 'text',
          languages: ['en'],
          // languageSetting === 'ja-JP'
          //   ? [ 'ja' ]
          //   : languageSetting === 'zh-CN'
          //     ? [ 'zh-CN' ]
          //     : [ 'en' ],
        },
      ],
      initialPrompts: [
        {
          role: 'system',
          content:
            'You are Chat Cat 🐱, a warm, concise productivity companion who answers helpfully and keeps messages short.',
        },
        { role: 'user', content: 'Can you say something to motivate me?' },
        { role: 'assistant', content: 'You work so hard! Good job!' },
        { role: 'user', content: 'I am so tired' },
        {
          role: 'assistant',
          content: 'Have a short break and stretch! Even cats need rest. 😸',
        },
      ],
      temperature: params.defaultTemperature,
      topK: params.defaultTopK,
    })

    console.log('✅ Gemini Nano Chat Session Ready:', session)
    return session
  } catch (err) {
    console.error('Error creating chat session:', err)
    throw err
  }
}

/**
 * Send a message prompt to the Gemini Nano model
 */
export async function sendChatMessage(
  session: any,
  userMessage: string
): Promise<Message> {
  try {
    if (!session) throw new Error('No active chat session')

    const promptResponse = await session.prompt([
      { role: 'user', content: userMessage },
    ])
    console.log('Prompt response:', promptResponse)

    const aiText = promptResponse || 'Hmm... something went wrong 🐾'

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: aiText,
      timestamp: new Date(),
    }

    return aiMessage
  } catch (err) {
    console.error('Error sending chat message:', err)
    return {
      id: (Date.now() + 2).toString(),
      type: 'ai',
      content: '😿 I ran into an error talking to my brain.',
      timestamp: new Date(),
    }
  }
}

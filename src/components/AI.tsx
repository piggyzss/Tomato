import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { GeneratedAIMessage } from '@/types'
import { Bot, Sparkles, RefreshCw, Save, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

// Types for Gemini Nano API
interface AIWriter {
  write: (prompt: string) => Promise<string>
}

interface AICapabilities {
  available: 'readily' | 'after-download' | 'no'
}

interface WindowAI {
  ai: {
    writer: {
      capabilities: () => Promise<AICapabilities>
      create: () => Promise<AIWriter>
    }
  }
}

declare global {
  interface Window extends WindowAI {}
}

export default function AI() {
  const { theme, aiMessages, updateSettings, useAIMessages } = useSettingsStore()
  const { status, mode, remainingSeconds } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [aiWriter, setAIWriter] = useState<AIWriter | null>(null)
  
  // Initialize Gemini Nano Writer API
  useEffect(() => {
    const initializeAI = async () => {
      try {
        // Check if AI is available
        if ('ai' in window && 'writer' in window.ai) {
          const capabilities = await window.ai.writer.capabilities()
          if (capabilities.available === 'readily') {
            const writer = await window.ai.writer.create()
            setAIWriter(writer)
            console.log('Gemini Nano initialized successfully')
            return
          }
        }
        console.log('Gemini Nano not available, will use fallback generation')
      } catch (error) {
        console.log('Gemini Nano initialization failed:', error)
      }
    }
    
    initializeAI()
  }, [])

  // Get current context for AI generation
  const getCurrentContext = () => {
    const currentTask = tasks.find(t => t.id === currentTaskId)
    const timeLeft = Math.ceil(remainingSeconds / 60)
    
    let context = ''
    
    if (status === 'running' && mode === 'pomodoro') {
      context = `User is working on a Pomodoro session${currentTask ? ` on task "${currentTask.title}"` : ''}. ${timeLeft} minutes remaining. Need encouragement to stay focused.`
    } else if (status === 'running' && mode === 'shortBreak') {
      context = `User is on a short break. ${timeLeft} minutes remaining. Need relaxing, refreshing message.`
    } else if (status === 'running' && mode === 'longBreak') {
      context = `User is on a long break. ${timeLeft} minutes remaining. Need restorative, peaceful message.`
    } else if (status === 'paused') {
      context = `User paused their session. Need gentle motivation to continue.`
    } else if (status === 'idle' && remainingSeconds === 0) {
      context = `Session just finished. Need celebration and transition message.`
    } else {
      context = `User is ready to start. Need motivational startup message.`
    }
    
    return context
  }

  // Fallback message templates
  const getRandomTemplate = (context: string) => {
    const templates = {
      working: [
        "🐾 You're in your focus zone! Just like a cat stalking its prey, stay concentrated and catch your goals! 💪",
        "😸 Purrfect focus! You're doing great - keep that productivity flowing like a contented cat's purr! ✨",
        "🐱 Sharp focus, just like a cat! You've got this - stay determined and make every minute count! 🎯",
        "😺 Working hard like a busy cat! Your dedication is impressive - keep going, you're almost there! 🌟"
      ],
      shortBreak: [
        "😴 Time to stretch like a sleepy cat! Take a moment to relax and recharge your energy~ ☕",
        "🐾 Break time! Just like cats need their rest, you deserve this peaceful moment to breathe~ 🌸",
        "😸 Purr-fect timing for a break! Stretch, hydrate, and get ready for your next productive session! 💆‍♀️",
        "🐱 Cat nap time! Well, not literally - but do take a moment to rest and refresh yourself~ ✨"
      ],
      longBreak: [
        "🐾 Long break, just like a cat's afternoon nap! Take your time to truly rest and restore~ 🌙",
        "😴 Extended relaxation time! Like a content cat in a sunny spot, enjoy this peaceful break~ ☀️",
        "🐱 This is your time to recharge completely! Think of it as a cat's leisurely grooming session~ 💅",
        "😸 Long break well deserved! Unwind like a happy cat and come back refreshed and ready! 🌟"
      ],
      paused: [
        "⏸️ Taking a pause, like a cat deciding its next move! When you're ready, jump back in~ 🐾",
        "😸 Sometimes even cats pause to think! Take your time, and continue when you feel ready~ ✨",
        "🐱 A thoughtful pause, just like a wise cat! Your focus will be even sharper when you return~ 💭",
        "🐾 Perfectly fine to pause! Even the most active cats take breaks between their adventures~ 🌟"
      ],
      finished: [
        "🎉 Mission accomplished! You've been as dedicated as a cat with its favorite toy! Time to celebrate~ ✨",
        "😸 Fantastic work! You've shown the determination of a cat - focused, persistent, and successful! 🏆",
        "🐾 Session complete! Just like a satisfied cat after a good hunt, you should be proud! 🌟",
        "🐱 Purrfect completion! You've earned a well-deserved break and maybe a little celebration~ 🎊"
      ],
      ready: [
        "👋 Ready to begin? Like a cat preparing to pounce, let's focus and make this session amazing! 🐾",
        "😸 Time to start your productive journey! Channel your inner cat - alert, focused, and ready! ⚡",
        "🐱 Let's get started! With cat-like determination, you're about to accomplish something great! 💪",
        "🐾 Ready for action? Just like an eager cat, you're prepared to focus and succeed! ✨"
      ]
    }

    let category = 'ready'
    if (context.includes('working') || context.includes('Pomodoro')) category = 'working'
    else if (context.includes('short break')) category = 'shortBreak'
    else if (context.includes('long break')) category = 'longBreak'
    else if (context.includes('paused')) category = 'paused'
    else if (context.includes('finished')) category = 'finished'

    const messages = templates[category as keyof typeof templates] || templates.ready
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Generate AI message using Gemini Nano or fallback
  const generateMessage = async () => {
    setIsGenerating(true)
    
    try {
      const context = getCurrentContext()
      
      if (aiWriter) {
        // Use Gemini Nano if available
        const prompt = `Write a short, encouraging message (max 50 words) from a friendly cat companion for a Pomodoro timer app. Context: ${context}. 

Requirements:
- Warm, supportive tone
- Use cat-related expressions occasionally (but not too much)
- Be specific to the situation
- Include appropriate emoji
- Keep it personal and motivating`

        const response = await aiWriter.write(prompt)
        setGeneratedMessage(response.trim())
      } else {
        // Use fallback template system
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate AI thinking
        const fallbackMessage = getRandomTemplate(context)
        setGeneratedMessage(fallbackMessage)
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      // Even if Gemini Nano fails, use fallback
      const context = getCurrentContext()
      const fallbackMessage = getRandomTemplate(context)
      setGeneratedMessage(fallbackMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  // Save generated message
  const saveMessage = () => {
    if (!generatedMessage) return
    
    const newMessage: GeneratedAIMessage = {
      id: Date.now().toString(),
      text: generatedMessage,
      context: getCurrentContext(),
      createdAt: Date.now()
    }
    
    updateSettings({
      aiMessages: [newMessage, ...aiMessages]
    })
    setGeneratedMessage('')
  }

  // Delete saved message
  const deleteMessage = (id: string) => {
    updateSettings({
      aiMessages: aiMessages.filter(msg => msg.id !== id)
    })
  }

  // Toggle using AI messages
  const toggleAIMessages = () => {
    updateSettings({
      useAIMessages: !useAIMessages
    })
  }

  return (
    <div
      className={`w-full max-w-lg mx-auto mt-4 rounded-xl p-6 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/90 backdrop-blur border border-gray-700'
          : 'bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
        }`}>
          <Bot className={`w-5 h-5 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        <div>
          <h3 className={`font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            AI Cat Messages
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Generate personalized motivational messages
          </p>
        </div>
      </div>

      {/* Current Context */}
      <div className={`p-3 rounded-lg mb-4 ${
        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <strong>Current Context:</strong> {getCurrentContext()}
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateMessage}
        disabled={isGenerating}
        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-300 ${
          isGenerating
            ? theme === 'dark'
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isGenerating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isGenerating ? 'Generating...' : 'Generate Message'}
      </button>

      <div className={`text-xs mt-2 text-center ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {aiWriter ? (
          <p className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            ✨ Gemini Nano AI active - Advanced generation enabled
          </p>
        ) : (
          <p>
            🤖 Using smart template system - Works without Gemini Nano
          </p>
        )}
      </div>

      {/* Generated Message */}
      {generatedMessage && (
        <div className={`mt-4 p-4 rounded-lg border-2 border-dashed ${
          theme === 'dark' 
            ? 'border-green-400 bg-green-900/20' 
            : 'border-green-300 bg-green-50'
        }`}>
          <p className={`text-sm mb-3 ${
            theme === 'dark' ? 'text-green-300' : 'text-green-800'
          }`}>
            {generatedMessage}
          </p>
          <div className="flex gap-2">
            <button
              onClick={saveMessage}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Save className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={() => setGeneratedMessage('')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              <Trash2 className="w-3 h-3" />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Toggle AI Messages */}
      <div className={`mt-4 p-3 rounded-lg border ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-700/30' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useAIMessages}
            onChange={toggleAIMessages}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Use AI messages for cat companion
          </span>
        </label>
        <p className={`text-xs mt-1 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Replace default cat messages with your AI-generated ones
        </p>
      </div>

      {/* Saved Messages */}
      {aiMessages.length > 0 && (
        <div className="mt-6">
          <h4 className={`font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Saved Messages ({aiMessages.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {aiMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-700/30'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {message.text}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
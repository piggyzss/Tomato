import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { ArrowLeft, Send, Trash2, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  id: string
  content: string
  timestamp: number
}

interface AILanguageModelSession {
  prompt: (input: string) => Promise<string>
  promptStreaming: (input: string) => ReadableStream
  destroy: () => void
}

interface AICatMessagesProps {
  onBack: () => void
  aiSession: AILanguageModelSession | null
  isGenerating: boolean
  generatedMessage: string
  setIsGenerating: (value: boolean) => void
  setGeneratedMessage: (value: string) => void
}

export default function AICatMessages({
  onBack,
  aiSession,
  isGenerating,
  generatedMessage: _generatedMessage,
  setIsGenerating,
  setGeneratedMessage: _setGeneratedMessage,
}: AICatMessagesProps) {
  const { theme, language } = useSettingsStore()
  const { status, remainingSeconds } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()
  const [selectedMessageLanguage, setSelectedMessageLanguage] = useState<
    'zh-CN' | 'en-US' | 'ja-JP'
  >(language)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentTask = tasks.find(t => t.id === currentTaskId)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Load chat history from storage on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const result = await chrome.storage.local.get(['chatHistory'])
        if (result.chatHistory) {
          setChatHistory(result.chatHistory)
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
    loadChatHistory()
  }, [])

  // Save chat history to storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      chrome.storage.local.set({ chatHistory })
    }
  }, [chatHistory])

  const sendMessage = async () => {
    if (!userInput.trim() || isGenerating) return

    if (!aiSession) {
      alert(
        'AI Session not available. Please check:\n1. Chrome flags are enabled\n2. Using Chrome Canary 127+\n3. Extension has proper permissions'
      )
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput.trim(),
      timestamp: Date.now(),
    }

    // Add user message to chat
    setChatHistory(prev => [...prev, userMessage])
    setUserInput('')
    setIsGenerating(true)

    try {
      // Create context for AI
      const taskContext = currentTask
        ? `The user is currently working on a task: "${currentTask.title}"`
        : 'The user has no active task selected'

      const timerContext =
        status === 'running'
          ? `Timer is running with ${Math.floor(remainingSeconds / 60)} minutes remaining in this Pomodoro session`
          : status === 'paused'
            ? 'Timer is paused - the user is taking a break'
            : 'Timer is idle - ready to start a new session'

      // Create conversation context from recent messages
      const recentMessages = chatHistory
        .slice(-3)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const systemPrompt = `You are a cute, encouraging cat companion for a Pomodoro timer app. 
Current context: ${taskContext}. ${timerContext}.
Language: Respond in ${selectedMessageLanguage === 'zh-CN' ? 'Chinese' : selectedMessageLanguage === 'ja-JP' ? 'Japanese' : 'English'}.

Recent conversation:
${recentMessages}

User just said: "${userInput}"

Respond as a friendly, supportive cat companion. Use cat-themed emojis occasionally (🐱, 😺, 😸, 🎉, 💪, ✨). 
Be helpful with productivity advice, encourage breaks when needed, and maintain a warm, positive tone. 
Keep responses concise but meaningful.`

      const response = await aiSession.prompt(systemPrompt)

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      setChatHistory(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Oops! I had trouble understanding that. Could you try again? 🐱',
        timestamp: Date.now(),
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const clearChat = () => {
    setChatHistory([])
    chrome.storage.local.remove(['chatHistory'])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div
        className={`sticky top-0 z-10 pb-3 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
        }`}
      >
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">
              🐱 Chat with Cat
            </h1>
            <p className="text-white/70 text-xs">Your AI companion</p>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={16} className="text-white/70" />
            </button>
          )}
        </div>

        {/* Language Selection */}
        <div className="bg-black/20 rounded-lg p-3 mb-3">
          <select
            value={selectedMessageLanguage}
            onChange={e =>
              setSelectedMessageLanguage(
                e.target.value as 'zh-CN' | 'en-US' | 'ja-JP'
              )
            }
            className="w-full p-2 rounded-md bg-black/30 border border-white/20 text-white text-xs"
          >
            <option value="en-US">🇺🇸 English</option>
            <option value="zh-CN">🇨🇳 中文</option>
            <option value="ja-JP">🇯🇵 日本語</option>
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🐱</div>
            <p className="text-white/70 text-sm mb-2">
              Hello! I'm your cat companion!
            </p>
            <p className="text-white/50 text-xs">
              Ask me anything about productivity, take breaks, or just chat!
            </p>
          </div>
        ) : (
          chatHistory.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm">
                  🐱
                </div>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-black/30 text-white border border-white/10'
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>
                <div className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isGenerating && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm">
              �
            </div>
            <div className="bg-black/30 text-white border border-white/10 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isGenerating || !aiSession}
            className="flex-1 p-3 bg-black/20 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '100px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!userInput.trim() || isGenerating || !aiSession}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>

        {!aiSession && (
          <p className="text-xs text-red-400 mt-2">
            AI not available. Please check Chrome flags and permissions.
          </p>
        )}

        <p className="text-xs text-white/50 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

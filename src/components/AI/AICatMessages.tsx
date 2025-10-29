import { useState } from 'react'
import { Send, Cat, User } from 'lucide-react'
import { useAI } from './index'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function AICatMessages() {
  const { service, isReady, error } = useAI()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! 🐱 I\'m your AI productivity companion. How can I help you stay focused today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      let aiResponseContent: string

      if (!isReady || error) {
        // Fallback when AI is not available
        aiResponseContent = `I'm having trouble connecting to the AI service right now 😿 But I'm here to help! Try asking about productivity tips, time management strategies, or motivation techniques. Meanwhile, keep up the great work with your Pomodoro sessions! 🍅`
      } else {
        // Use actual AI service
        aiResponseContent = await service.prompt(
          `User message: "${messageToSend}"\n\nRespond as a helpful productivity companion cat. Keep it concise, encouraging, and use a cat emoji occasionally. Focus on productivity, time management, or motivation advice.`
        )
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (aiError) {
      console.error('AI response error:', aiError)
      
      // Fallback response on error
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Oops! I had a little cat-astrophe 😸 Let me try to help anyway! Could you tell me more about what you'd like assistance with regarding your productivity or focus sessions?`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent space-y-3 mb-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Cat size={16} className="text-white" />
                </div>
              </div>
            )}
            
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-white text-gray-800'
                  : 'bg-black/20 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Cat size={16} className="text-white" />
              </div>
            </div>
            <div className="bg-black/20 text-white px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Status Indicator */}
      {(!isReady || error) && (
        <div className="mb-2 text-center text-xs">
          {error ? (
            <div className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30">
              ⚠️ AI service unavailable - using fallback responses
            </div>
          ) : (
            <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-lg border border-yellow-500/30">
              🔄 AI service starting up...
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 bg-black/20 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none text-sm"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-center text-xs text-white/60">
        💡 Ask me about productivity tips, motivation, or time management
      </div>
    </div>
  )
}


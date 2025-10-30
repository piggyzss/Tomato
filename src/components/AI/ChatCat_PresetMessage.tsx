import { useState } from 'react'
import { Send, Cat, User } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function ChatCat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Meow! 🐱 Welcome to Chat Cat! I\'m your productivity companion. How can I help you stay focused and motivated today?',
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

    // Simulate AI response (you can integrate with the actual AI service here)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Purr-fect question! 😸 ${getCatResponse(messageToSend)}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  // Simple cat-themed responses (you can replace this with actual AI integration)
  const getCatResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('focus') || message.includes('concentrate')) {
      return "Try the Pomodoro technique! 🍅 Work for 25 minutes, then take a 5-minute break. I'll keep you company during your sessions!"
    }
    
    if (message.includes('tired') || message.includes('exhausted')) {
      return "Time for a cat nap? 😴 Even productive cats need rest! Take a 10-minute break and stretch like a cat."
    }
    
    if (message.includes('motivation') || message.includes('motivated')) {
      return "You're already amazing for trying! 🌟 Remember, even small steps count. Let's tackle one task at a time, just like how cats hunt - with patience and precision!"
    }
    
    if (message.includes('task') || message.includes('work')) {
      return "Let's break that big task into smaller, mouse-sized pieces! 🐭 What's the first tiny step you can take right meow?"
    }
    
    return "That's interesting! 🤔 As your productivity cat, I'm here to help with focus, motivation, and time management. What would you like to work on together?"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-96">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent space-y-3 mb-4 max-h-80">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
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
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
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

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your productivity cat anything..."
          className="flex-1 px-3 py-2 bg-black/20 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none text-sm"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-center text-xs text-white/60">
        🐱 Ask about focus tips, motivation, or time management!
      </div>
    </div>
  )
}
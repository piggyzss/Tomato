import { useSettingsStore } from '@/store/useSettingsStore'
import { Cat, Laugh, Send, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAI } from '@/hooks/useAI'
import { ModalWithBack } from '@/components/Common'

interface Message {
  id: string
  text: string
  sender: 'user' | 'cat'
  timestamp: number
}

interface AICatMessagesProps {
  onBack: () => void
}

export default function AICatMessages({
  onBack,
}: AICatMessagesProps) {
  const { language } = useSettingsStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)
  const hasGeneratedWelcome = useRef(false)

  // Use AI hook with cat personality
  const {
    status,
    isLoading,
    prompt,
  } = useAI(true, {
    systemPrompt: language === 'zh-CN'
      ? '你是一只可爱、鼓励人心的番茄猫助手。用简短、温暖、友好的语气回答问题（1-2句话）。适当使用猫咪相关的表情符号如 🐱, 😺, 😸, 🎉, 💪, ✨。'
      : language === 'ja-JP'
        ? 'あなたは可愛くて励ましてくれるトマト猫のアシスタントです。短く、温かく、フレンドリーな口調で答えてください（1-2文）。猫に関連する絵文字を適度に使ってください 🐱, 😺, 😸, 🎉, 💪, ✨。'
        : 'You are a cute, encouraging tomato cat assistant. Respond in a brief, warm, and friendly tone (1-2 sentences). Use cat-themed emojis appropriately like 🐱, 😺, 😸, 🎉, 💪, ✨.',
  })

  // Generate initial welcome message - only once
  useEffect(() => {
    if (hasGeneratedWelcome.current) return

    const generateWelcome = async () => {
      if (status !== 'ready') {
        setIsInitializing(false)
        return
      }

      hasGeneratedWelcome.current = true

      try {
        const welcomePrompt = language === 'zh-CN'
          ? '生成一句简短的欢迎语，询问用户是否需要陪伴聊天（因为工作可能累了）'
          : language === 'ja-JP'
            ? '短い歓迎メッセージを生成してください。仕事で疲れているかもしれないので、チャットで付き添いが必要か尋ねてください'
            : 'Generate a brief welcome message asking if the user needs company to chat (since they might be tired from work)'

        const welcomeText = await prompt(welcomePrompt)

        setMessages([{
          id: '1',
          text: welcomeText,
          sender: 'cat',
          timestamp: Date.now()
        }])
      } catch (error) {
        console.error('Failed to generate welcome message:', error)
        // Fallback welcome message
        const fallbackMessage = language === 'zh-CN'
          ? '😺 工作累了吧？需要我陪你聊天吗？'
          : language === 'ja-JP'
            ? '😺 仕事で疲れましたか？一緒にチャットしませんか？'
            : '😺 Tired from work? Would you like me to chat with you?'

        setMessages([{
          id: '1',
          text: fallbackMessage,
          sender: 'cat',
          timestamp: Date.now()
        }])
      } finally {
        setIsInitializing(false)
      }
    }

    generateWelcome()
  }, [status, language, prompt])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputMessage,
      sender: 'user',
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')

    // Get AI response
    try {
      const response = await prompt(currentInput)

      const catMessage: Message = {
        id: crypto.randomUUID(),
        text: response,
        sender: 'cat',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, catMessage])
    } catch (error) {
      console.error('Failed to generate response:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: language === 'zh-CN'
          ? '😿 抱歉，我现在无法回复。请稍后再试。'
          : language === 'ja-JP'
            ? '😿 申し訳ありません、今は返信できません。後でもう一度お試しください。'
            : '😿 Sorry, I can\'t respond right now. Please try again later.',
        sender: 'cat',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ModalWithBack
        title={<>💬 Cat Chat</>}
        subtitle="Chat with your AI companion"
        onBack={onBack}
      >
        {/* Date Divider */}
        <div className="text-center py-2">
          <span className="text-xs text-white/70">Today</span>
        </div>
      </ModalWithBack>

      {/* Messages Area - 可滚动 */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.sender === 'cat'
              ? 'bg-purple-200'
              : 'bg-purple-400'
              }`}>
              {message.sender === 'cat' ? (
                <Cat size={20} className="text-purple-600" />
              ) : (
                <Laugh size={20} className="text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 ${message.sender === 'cat'
                ? 'bg-pink-100 text-gray-800'
                : 'bg-purple-400 text-white'
                }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
              <span className="text-xs text-white/70 mt-1 px-2">
                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Indicator - only show when waiting for AI response, not during initialization */}
        {isLoading && !isInitializing && messages.length > 0 && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
              <Cat size={20} className="text-purple-600" />
            </div>
            <div className="bg-pink-100 rounded-2xl px-4 py-3 flex items-center justify-center min-h-[44px]">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Initial Loading - only show when initializing and no messages */}
        {isInitializing && messages.length === 0 && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
              <Cat size={20} className="text-purple-600" />
            </div>
            <div className="bg-pink-100 rounded-2xl px-4 py-3 flex items-center justify-center min-h-[44px]">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - 固定在底部 */}
      <div className="flex-shrink-0 border-t border-white/20 p-4 bg-black/10">
        <div className="flex items-center gap-2">
          {/* Input Field */}
          <div className="flex-1 bg-white/90 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message"
              disabled={isLoading}
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <Send size={20} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

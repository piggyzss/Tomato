import { useEffect, useState } from 'react'
import { Send, Cat, Laugh, Loader2 } from 'lucide-react'
import { createChatSession, sendChatMessage } from '../../services/buildInAiService.ts'
import { useSettingsStore } from '@/store/useSettingsStore.ts'
import { ModalWithBack } from '@/components/Common'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ChatCatProps {
  onBack: () => void
}

export default function ChatCat({ onBack }: ChatCatProps) {
  const { language } = useSettingsStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<any | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // ✅ Initialize Gemini Nano session
  useEffect(() => {
    const initSession = async () => {
      try {
        const s = await createChatSession()
        setSession(s)
        setIsInitializing(false)

        // Initial welcome message
        const welcome =
          language === 'zh-CN'
            ? '😺 工作累了吧？需要我陪你聊聊天吗？'
            : language === 'ja-JP'
              ? '😺 仕事で疲れましたか？一緒にチャットしませんか？'
              : '😺 Tired from work? Would you like me to chat with you?'

        setMessages([
          {
            id: '1',
            type: 'ai',
            content: welcome,
            timestamp: new Date(),
          },
        ])
      } catch (err) {
        console.error('Failed to initialize ChatCat:', err)
        setIsInitializing(false)
      }
    }
    initSession()
  }, [language])

  // 🚀 Send user message
  const handleSend = async () => {
    if (!inputMessage.trim() || !session) return

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiReply = await sendChatMessage(session, inputMessage)
      setMessages(prev => [...prev, aiReply])
    } catch (err) {
      console.error('AI reply failed:', err)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content:
            language === 'zh-CN'
              ? '😿 抱歉，我现在无法回复。请稍后再试。'
              : language === 'ja-JP'
                ? '😿 申し訳ありません、今は返信できません。後でもう一度お試しください。'
                : "😿 Sorry, I can't respond right now. Please try again later.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ModalWithBack
        title={<>💬 Chat Cat</>}
        subtitle="Your cozy AI companion"
        onBack={onBack}
      >
        <div className="text-center py-2">
          <span className="text-xs text-white/70">Today</span>
        </div>
      </ModalWithBack>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                m.type === 'ai' ? 'bg-purple-200' : 'bg-purple-400'
              }`}
            >
              {m.type === 'ai' ? (
                <Cat size={20} className="text-purple-600" />
              ) : (
                <Laugh size={20} className="text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[70%] flex flex-col ${
                m.type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  m.type === 'ai'
                    ? 'bg-pink-100 text-gray-800'
                    : 'bg-purple-400 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </p>
              </div>
              <span className="text-xs text-white/70 mt-1 px-2">
                {m.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading bubbles */}
        {(isLoading || isInitializing) && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
              <Cat size={20} className="text-purple-600" />
            </div>
            <div className="bg-pink-100 rounded-2xl px-4 py-3 flex items-center justify-center min-h-[44px]">
              <div className="flex gap-1 items-center">
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-white/20 p-4 bg-black/10">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/90 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something to Chat Cat..."
              disabled={isLoading}
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading || !session}
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

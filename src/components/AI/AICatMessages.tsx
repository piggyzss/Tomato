import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { ArrowLeft, Sparkles, RefreshCw, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface AICatMessagesProps {
  onBack: () => void
  aiWriter: any
  isGenerating: boolean
  generatedMessage: string
  setIsGenerating: (value: boolean) => void
  setGeneratedMessage: (value: string) => void
}

export default function AICatMessages({
  onBack,
  aiWriter,
  isGenerating,
  generatedMessage,
  setIsGenerating,
  setGeneratedMessage
}: AICatMessagesProps) {
  const { theme, aiMessages, updateSettings, language } = useSettingsStore()
  const { status, remainingSeconds } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()
  const [selectedMessageLanguage, setSelectedMessageLanguage] = useState<'zh-CN' | 'en-US' | 'ja-JP'>(language)

  const currentTask = tasks.find(t => t.id === currentTaskId)

  const generateCatMessage = async () => {
    if (!aiWriter) {
      alert('AI Writer not available. Please check Chrome flags.')
      return
    }

    setIsGenerating(true)
    setGeneratedMessage('')

    try {
      const taskContext = currentTask ? `working on "${currentTask.title}"` : 'ready to start'
      const timeContext = status === 'running' 
        ? `${Math.floor(remainingSeconds / 60)} minutes remaining`
        : status === 'paused'
        ? 'taking a break'
        : 'ready to begin'

      const prompt = `You are a cute, encouraging cat companion for a Pomodoro timer app. 
Generate a short, warm, and motivating message (1-2 sentences) for a user who is ${taskContext} and ${timeContext}.
The message should be in ${selectedMessageLanguage === 'zh-CN' ? 'Chinese' : selectedMessageLanguage === 'ja-JP' ? 'Japanese' : 'English'}.
Use cat-themed emojis like 🐱, 😺, 😸, 🎉, 💪, ✨.
Keep it friendly, positive, and brief.`

      const message = await aiWriter.write(prompt)
      setGeneratedMessage(message)
    } catch (error) {
      console.error('Failed to generate message:', error)
      setGeneratedMessage('Oops! Failed to generate message. Please try again. 🐱')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveMessage = () => {
    if (!generatedMessage) return
    
    const newMessage = {
      id: crypto.randomUUID(),
      text: generatedMessage,
      context: currentTask ? `Task: ${currentTask.title}` : 'General encouragement',
      createdAt: Date.now()
    }
    
    const updatedMessages = [...(aiMessages || []), newMessage]
    updateSettings({ aiMessages: updatedMessages })
    setGeneratedMessage('')
  }

  const deleteMessage = (id: string) => {
    const updatedMessages = (aiMessages || []).filter(msg => msg.id !== id)
    updateSettings({ aiMessages: updatedMessages })
  }

  return (
    <div>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pb-3 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-[#D84848]'
      }`}>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} className="text-white/90" />
          </button>
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">🐱 Cat Messages</h1>
            <p className="text-white/70 text-xs">AI-generated encouragement</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-4">
        {/* Language Selection */}
        <div className="bg-black/20 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm text-white">🌍 Message Language</h3>
          <select
            value={selectedMessageLanguage}
            onChange={(e) => setSelectedMessageLanguage(e.target.value as 'zh-CN' | 'en-US' | 'ja-JP')}
            className="w-full p-2 rounded-lg bg-black/30 border border-white/20 text-white text-sm"
          >
            <option value="en-US">English</option>
            <option value="zh-CN">中文</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateCatMessage}
          disabled={isGenerating || !aiWriter}
          className="w-full p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
        >
          <div className="flex items-center justify-center gap-3">
            {isGenerating ? (
              <RefreshCw size={20} className="text-white animate-spin" />
            ) : (
              <Sparkles size={20} className="text-white" />
            )}
            <span className="font-semibold text-white">
              {isGenerating ? 'Generating...' : 'Generate Cat Message'}
            </span>
          </div>
        </button>

        {/* Generated Message Display */}
        {generatedMessage && (
          <div className="bg-black/20 rounded-xl p-4 border border-white/20">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-sm text-white">✨ Generated Message</h3>
              <div className="flex gap-2">
                <button
                  onClick={saveMessage}
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={() => setGeneratedMessage('')}
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-white leading-relaxed">{generatedMessage}</p>
          </div>
        )}

        {/* Saved Messages */}
        {aiMessages && aiMessages.length > 0 && (
          <div className="bg-black/20 rounded-xl p-4 border border-white/20">
            <h3 className="font-semibold mb-3 text-sm text-white">💾 Saved Messages</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiMessages.map((message) => (
                <div key={message.id} className="bg-black/30 rounded-lg p-3 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-white/60">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-white text-sm">{message.text}</p>
                  {message.context && (
                    <p className="text-white/50 text-xs mt-1">{message.context}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 mb-3 text-center text-sm text-white/70">
          💡 Tip: Messages are personalized based on your current task and timer status
        </div>
      </div>
    </div>
  )
}

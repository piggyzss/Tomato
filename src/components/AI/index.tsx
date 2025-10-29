import { useSettingsStore } from '@/store/useSettingsStore'
import { useState, useEffect } from 'react'
import AIMainMenu from './AIMainMenu'
import AICatMessages from './AICatMessages'
import AIDailySummary from './AIDailySummary'

// AI view navigation type
type AIView = 'menu' | 'catMessages' | 'dailySummary'

// Types for Gemini Nano API
interface AIWriter {
  write: (prompt: string) => Promise<string>
}

interface AISummarizer {
  summarize: (text: string) => Promise<string>
}

declare global {
  interface Window {
    ai?: {
      writer?: {
        create: () => Promise<AIWriter>
      }
      summarizer?: {
        create: () => Promise<AISummarizer>
      }
    }
  }
}

interface AIProps {
  onClose?: () => void
}

export default function AI({ onClose }: AIProps) {
  const { theme } = useSettingsStore()
  
  // Navigation state
  const [currentView, setCurrentView] = useState<AIView>('menu')

  // API availability state
  const [apiStatus, setApiStatus] = useState({
    aiAvailable: false,
    writerAvailable: false,
    summarizerAvailable: false,
  })

  // AI instances
  const [aiWriter, setAIWriter] = useState<AIWriter | null>(null)
  const [aiSummarizer, setAISummarizer] = useState<AISummarizer | null>(null)

  // Cat Messages states
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessage, setGeneratedMessage] = useState('')

  // Daily Summary states
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryText, setSummaryText] = useState('')

  // Check API availability and initialize
  useEffect(() => {
    const checkAPI = async () => {
      const hasAI = typeof window !== 'undefined' && 'ai' in window && window.ai
      
      if (hasAI) {
        try {
          // Initialize Writer
          if (window.ai?.writer) {
            const writer = await window.ai.writer.create()
            setAIWriter(writer)
          }
          
          // Initialize Summarizer
          if (window.ai?.summarizer) {
            const summarizer = await window.ai.summarizer.create()
            setAISummarizer(summarizer)
          }

          setApiStatus({
            aiAvailable: true,
            writerAvailable: !!window.ai?.writer,
            summarizerAvailable: !!window.ai?.summarizer,
          })
        } catch (error) {
          console.error('Failed to initialize AI:', error)
          setApiStatus({
            aiAvailable: false,
            writerAvailable: false,
            summarizerAvailable: false,
          })
        }
      } else {
        setApiStatus({
          aiAvailable: false,
          writerAvailable: false,
          summarizerAvailable: false,
        })
      }
    }
    checkAPI()
  }, [])

  return (
    <div
      className={`rounded-xl shadow-2xl overflow-hidden relative ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-[#D84848]'
      }`}
      style={{
        height: 'calc(100vh - 240px)',
        maxHeight: '600px'
      }}
    >
      <div className="max-w-md mx-auto h-full overflow-hidden text-white relative">
        <div className="absolute inset-0 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {currentView === 'menu' && (
            <AIMainMenu 
              onClose={onClose}
              onNavigate={setCurrentView}
              apiStatus={apiStatus}
            />
          )}
          {currentView === 'catMessages' && (
            <AICatMessages
              onBack={() => setCurrentView('menu')}
              aiWriter={aiWriter}
              isGenerating={isGenerating}
              generatedMessage={generatedMessage}
              setIsGenerating={setIsGenerating}
              setGeneratedMessage={setGeneratedMessage}
            />
          )}
          {currentView === 'dailySummary' && (
            <AIDailySummary
              onBack={() => setCurrentView('menu')}
              aiSummarizer={aiSummarizer}
              isSummarizing={isSummarizing}
              summaryText={summaryText}
              setIsSummarizing={setIsSummarizing}
              setSummaryText={setSummaryText}
            />
          )}
        </div>
      </div>
    </div>
  )
}

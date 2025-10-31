import { useSettingsStore } from '@/store/useSettingsStore'
import { useEffect, useState } from 'react'
import AIConfiguration from '@/components/AI/AIConfiguration'
import AIMainMenu from '@/components/AI/AIMainMenu'
import AISettings from '@/components/AI/AISettings'
import type { AIView } from '@/types'
import BuiltInAIDailySummary from '@/components/AI/BuitInAIDailySummary'
import ChatCat from '@/components/AI/ChatCat'

interface AIProps {
  onClose?: () => void
}

export default function AI({ onClose }: AIProps) {
  const { theme } = useSettingsStore()
  const [currentView, setCurrentView] = useState<AIView>('menu')
  const [apiStatus, setApiStatus] = useState({
    aiAvailable: false,
    writerAvailable: false,
    summarizerAvailable: false,
  })
  
  // const {builtInAvailable} = useAI();

  // AI state for daily summary
  // const [aiSummarizer, setAiSummarizer] = useState<any>(null)
  // const [isSummarizing, setIsSummarizing] = useState(false)
  // const [summaryText, setSummaryText] = useState('')

  // Check AI API availability
  useEffect(() => {
    const checkAIAvailability = async () => {
      try {
        const ai = (window as any).ai
        setApiStatus({
          aiAvailable: !!ai?.languageModel,
          writerAvailable: !!ai?.writer,
          summarizerAvailable: !!ai?.summarizer,
        })

        // Initialize AI services
        // if (ai?.summarizer) {
        //   setAiSummarizer(ai.summarizer)
        // }
      } catch (error) {
        console.error('Error checking AI availability:', error)
      }
    }
    checkAIAvailability()
  }, [])

  return (
    <div
      className={`rounded-xl shadow-2xl overflow-hidden relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
        }`}
      style={{
        height: 'calc(100vh - 240px)',
        maxHeight: '600px',
      }}
    >
      <div className="max-w-md mx-auto h-full overflow-hidden text-white relative">
        {/* Cat Messages 需要特殊布局（固定底部输入框） */}
        {currentView === 'catMessages' ? (
          <div className="absolute inset-0 px-4 flex flex-col">
             {/* @panpan */}
            {/* {builtInAvailable ? <ChatCat/> : <AICatMessages onBack={() => setCurrentView('menu')} />} */}
            {/* <AICatMessages onBack={() => setCurrentView('menu')} /> */}
           <ChatCat onBack={() => setCurrentView('menu')}/>
            
          </div>
        ) : (
          <div className="absolute inset-0 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {currentView === 'menu' && (
              <AIMainMenu
                onClose={onClose}
                onNavigate={setCurrentView}
                apiStatus={apiStatus}
              />
            )}

            {/* @panpan */}
            {currentView === 'dailySummary' && (
              <BuiltInAIDailySummary onBack={() => setCurrentView('menu')} />
            )}
            {currentView === 'apiDemo' && (
              <AIConfiguration
                onBack={() => setCurrentView('menu')}
                onOpenSettings={() => setCurrentView('settings')}
              />
            )}
            {currentView === 'settings' && (
              <AISettings onBack={() => setCurrentView('menu')} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

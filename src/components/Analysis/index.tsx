import { useSettingsStore } from '@/store/useSettingsStore'
import { useState } from 'react'
import AnalysisMainMenu from '@/components/Analysis/AnalysisMainMenu'
import TaskFinishRate from '@/components/Analysis/TaskFinishRate'
import TotalTime from '@/components/Analysis/TotalTime'
import HistoryView from '@/components/Analysis/HistoryView'
import type { AnalysisView } from '@/types'

interface AnalysisProps {
  onClose?: () => void
}

export default function Analysis({ onClose }: AnalysisProps) {
  const { theme } = useSettingsStore()

  // Navigation state
  const [currentView, setCurrentView] = useState<AnalysisView>('menu')

  return (
    <div
      className={`rounded-xl shadow-2xl overflow-hidden relative ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
      }`}
      style={{
        height: 'calc(100vh - 240px)',
        maxHeight: '600px',
      }}
    >
      <div className="max-w-md mx-auto h-full overflow-hidden text-white relative">
        <div className="absolute inset-0 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {currentView === 'menu' && (
            <AnalysisMainMenu onClose={onClose} onNavigate={setCurrentView} />
          )}
          {currentView === 'taskFinishRate' && (
            <TaskFinishRate onBack={() => setCurrentView('menu')} />
          )}
          {currentView === 'totalTime' && (
            <TotalTime onBack={() => setCurrentView('menu')} />
          )}
          {currentView === 'history' && (
            <HistoryView
              onBack={() => setCurrentView('menu')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

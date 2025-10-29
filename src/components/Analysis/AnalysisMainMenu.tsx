import { useSettingsStore } from '@/store/useSettingsStore'
import { ArrowLeft, CheckCircle, Clock, X } from 'lucide-react'
import type { AnalysisView } from './index'

interface AnalysisMainMenuProps {
  onClose?: () => void
  onNavigate: (view: AnalysisView) => void
}

export default function AnalysisMainMenu({ onClose, onNavigate }: AnalysisMainMenuProps) {
  const { theme } = useSettingsStore()

  // Analysis menu configuration
  const analysisMenu = [
    {
      id: 'taskFinishRate' as AnalysisView,
      title: 'Task Finish Rate',
      description: 'Track completion rates with time range and task filters',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      id: 'totalTime' as AnalysisView,
      title: 'Total Time',
      description: 'Analyze working time with flexible filtering options',
      icon: Clock,
      color: 'bg-blue-500',
    },
  ]

  return (
    <div>
      {/* Fixed Header with Close Button */}
      <div className={`sticky top-0 z-10 pb-3 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-[#D84848]'
      }`}>
        <div className="flex items-center justify-between py-3">
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">📊 Analysis</h1>
            <p className="text-white/70 text-xs">Insights into your productivity</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X size={18} className="text-white/90" />
          </button>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid gap-2.5">
        {analysisMenu.map(feature => {
          const Icon = feature.icon
          return (
            <button
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="w-full p-2.5 rounded-lg bg-black/20 hover:bg-black/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${feature.color}`}>
                  <Icon size={18} color="white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-white">{feature.title}</div>
                  <div className="text-xs text-white/70">
                    {feature.description}
                  </div>
                </div>
                <div className="text-white/50">
                  <ArrowLeft size={16} className="rotate-180" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useSettingsStore } from '@/store/useSettingsStore'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalWithBackProps {
  title: ReactNode
  subtitle?: string
  onBack: () => void
  children: ReactNode
}

/**
 * 二级弹框组件 - 左上角带返回按钮
 */
export default function ModalWithBack({
  title,
  subtitle,
  onBack,
  children,
}: ModalWithBackProps) {
  const { theme } = useSettingsStore()

  return (
    <div>
      {/* Fixed Header with Back Button */}
      <div
        className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
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
            <h1 className="text-base font-bold text-white mb-0.5">{title}</h1>
            {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

import { useSettingsStore } from '@/store/useSettingsStore'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalWithCloseProps {
  title: ReactNode
  subtitle?: string
  onClose?: () => void
  children: ReactNode
}

/**
 * 一级弹框组件 - 右上角带关闭按钮
 */
export default function ModalWithClose({
  title,
  subtitle,
  onClose,
  children,
}: ModalWithCloseProps) {
  const { theme } = useSettingsStore()

  return (
    <div>
      {/* Fixed Header with Close Button */}
      <div
        className={`sticky top-0 z-10 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-[#D84848]'
        }`}
      >
        <div className="flex items-center justify-between py-3">
          <div className="flex-1 text-left">
            <h1 className="text-base font-bold text-white mb-0.5">{title}</h1>
            {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
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

      {/* Content */}
      {children}
    </div>
  )
}

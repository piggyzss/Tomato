import type { SettingsPageProps } from '@/components/Settings/types'
import { ModalWithBack } from '@/components/Common'

interface PlaceholderProps extends SettingsPageProps {
  title: string
  icon: string
}

export default function SettingsPlaceholder({
  onBack,
  title,
  icon,
}: PlaceholderProps) {
  return (
    <ModalWithBack title={title} subtitle="Coming soon..." onBack={onBack}>
      {/* Placeholder Content */}
      <div className="text-center py-20">
        <div className="text-6xl mb-6">{icon}</div>
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-white/70 mb-8">This feature is under development</p>
        <div className="bg-black/20 rounded-xl p-6 max-w-sm mx-auto border border-white/20">
          <p className="text-sm text-white/80">
            We're working on bringing you amazing {title.toLowerCase()} options.
            Stay tuned for updates! 🚀
          </p>
        </div>
      </div>
    </ModalWithBack>
  )
}

import { useSettingsStore } from '@/store/useSettingsStore'
import { ArrowLeft, Bell, Bot, Globe, Palette, Timer, Volume2 } from 'lucide-react'
import { useState } from 'react'
import TimerSettings from './Settings/TimerSettings'
import SoundSettings from './Settings/SoundSettings'
import ThemeSettings from './Settings/ThemeSettings'
import LanguageSettings from './Settings/LanguageSettings'
import SettingsPlaceholder from './Settings/SettingsPlaceholder'
import { ModalWithClose } from './Common'
import type { SettingsView } from './Settings/types'

interface SettingsPanelProps {
    onClose?: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
    const { theme } = useSettingsStore()

    // Navigation state
    const [currentView, setCurrentView] = useState<SettingsView>('menu')
    const [nextView, setNextView] = useState<SettingsView | null>(null)
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')

    const handleViewChange = (view: SettingsView) => {
        if (nextView !== null) return // 防止动画期间多次点击

        const direction = view === 'menu' ? 'right' : 'left'
        setSlideDirection(direction)
        setNextView(view)

        // 300ms 后完成切换
        setTimeout(() => {
            setCurrentView(view)
            setNextView(null)
        }, 300)
    }

    // Settings menu configuration
    const settingsMenu = [
        {
            id: 'timer' as SettingsView,
            title: 'Timer Settings',
            description: 'Customize Pomodoro durations',
            icon: Timer,
            color: 'bg-orange-500',
        },
        {
            id: 'sound' as SettingsView,
            title: 'Sound Settings',
            description: 'Control audio notifications',
            icon: Volume2,
            color: 'bg-blue-500',
        },
        {
            id: 'notifications' as SettingsView,
            title: 'Notifications',
            description: 'Manage alert preferences',
            icon: Bell,
            color: 'bg-green-500',
        },
        {
            id: 'theme' as SettingsView,
            title: 'Theme Settings',
            description: 'Light/dark mode selection',
            icon: Palette,
            color: 'bg-purple-500',
        },
        {
            id: 'ai' as SettingsView,
            title: 'AI Features',
            description: 'AI assistant settings',
            icon: Bot,
            color: 'bg-pink-500',
        },
        {
            id: 'language' as SettingsView,
            title: 'Language',
            description: 'Choose your language',
            icon: Globe,
            color: 'bg-teal-500',
        },
    ]

    // Render main menu
    const renderMainMenu = () => (
        <ModalWithClose
            title={<>⚙️ Settings</>}
            subtitle="Customize your Tomato experience"
            onClose={onClose}
        >
            {/* Settings Grid */}
            <div className="grid gap-2.5">
                {settingsMenu.map(setting => {
                    const Icon = setting.icon
                    return (
                        <button
                            key={setting.id}
                            onClick={() => handleViewChange(setting.id)}
                            className="w-full p-2.5 rounded-lg bg-black/20 hover:bg-black/30 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${setting.color}`}>
                                    <Icon size={18} color="white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-sm text-white">{setting.title}</div>
                                    <div className="text-xs text-white/70">{setting.description}</div>
                                </div>
                                <div className="text-white/50">
                                    <ArrowLeft size={16} className="rotate-180" />
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Footer Info */}
            <div className="mt-4 text-center text-xs text-white/60 bg-black/20 rounded-lg p-2.5">
                <div className="mb-1">🍅 Tomato Cat Timer v0.1.0</div>
                <div className="text-[10px]">Built with React + TypeScript + Zustand</div>
            </div>
        </ModalWithClose>
    )

    // Render current view
    const renderCurrentView = () => {
        const view = nextView || currentView
        const commonProps = {
            onBack: () => handleViewChange('menu'),
            theme,
        }

        switch (view) {
            case 'menu':
                return renderMainMenu()
            case 'timer':
                return <TimerSettings {...commonProps} />
            case 'sound':
                return <SoundSettings {...commonProps} />
            case 'theme':
                return <ThemeSettings {...commonProps} />
            case 'language':
                return <LanguageSettings {...commonProps} />
            case 'notifications':
                return <SettingsPlaceholder {...commonProps} title="Notifications" icon="🔔" />
            case 'ai':
                return <SettingsPlaceholder {...commonProps} title="AI Features" icon="🤖" />
            default:
                return renderMainMenu()
        }
    }

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
                {/* 只渲染一个视图，使用 key 强制重新挂载 */}
                <div
                    key={nextView || currentView}
                    className="absolute inset-0 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                    style={{
                        animation:
                            nextView !== null
                                ? `slideInFrom${slideDirection === 'left' ? 'Right' : 'Left'} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
                                : 'none',
                    }}
                >
                    {renderCurrentView()}
                </div>
            </div>
        </div>
    )
}

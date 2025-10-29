import clsx from 'clsx'

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'

interface ModeSelectorProps {
  mode: TimerMode
  onModeChange: (mode: TimerMode) => void
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-3 mb-8 justify-center">
      <button
        onClick={() => onModeChange('pomodoro')}
        className={clsx(
          'px-3 py-1.5 rounded-lg font-semibold transition-all text-sm whitespace-nowrap',
          mode === 'pomodoro'
            ? 'bg-black/20 text-white'
            : 'text-white/70 hover:text-white'
        )}
      >
        Pomodoro
      </button>

      <button
        onClick={() => onModeChange('shortBreak')}
        className={clsx(
          'px-3 py-1.5 rounded-lg font-semibold transition-all text-sm whitespace-nowrap',
          mode === 'shortBreak'
            ? 'bg-black/20 text-white'
            : 'text-white/70 hover:text-white'
        )}
      >
        Short Break
      </button>

      <button
        onClick={() => onModeChange('longBreak')}
        className={clsx(
          'px-3 py-1.5 rounded-lg font-semibold transition-all text-sm whitespace-nowrap',
          mode === 'longBreak'
            ? 'bg-black/20 text-white'
            : 'text-white/70 hover:text-white'
        )}
      >
        Long Break
      </button>
    </div>
  )
}

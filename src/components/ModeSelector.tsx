import clsx from 'clsx'

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'

interface ModeSelectorProps {
  mode: TimerMode
  onModeChange: (mode: TimerMode) => void
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onModeChange('pomodoro')}
        className={clsx(
          'px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap',
          mode === 'pomodoro'
            ? 'bg-black/20 text-white'
            : 'text-white/70 hover:text-white hover:bg-black/10'
        )}
      >
        Pomodoro
      </button>

      <button
        onClick={() => onModeChange('shortBreak')}
        className={clsx(
          'px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap',
          mode === 'shortBreak'
            ? 'bg-black/20 text-white'
            : 'text-white/70 hover:text-white hover:bg-black/10'
        )}
      >
        Short Break
      </button>

      <button
        onClick={() => onModeChange('longBreak')}
        className={clsx(
          'px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap',
          mode === 'longBreak'
            ? 'bg-black/20 text-white'
            : 'text-white/70 hover:text-white hover:bg-black/10'
        )}
      >
        Long Break
      </button>
    </div>
  )
}

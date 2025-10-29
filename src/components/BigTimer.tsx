import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { formatTime } from '@/utils/time'
import { TimerReset } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// 定义计时器状态接口
interface TimerPersistState {
  status: 'idle' | 'running' | 'paused'
  remainingSeconds: number
  startTime: number // 开始时间戳
  pausedTime: number // 暂停时剩余的秒数
  currentTaskId: string | null
}

export function BigTimer() {
  const {
    status,
    remainingSeconds,
    mode,
    setStatus,
    tick,
    reset,
    setRemainingSeconds,
  } = useTimerStore()

  const { currentTaskId, updateTask, tasks, setCurrentTask } = useTaskStore()
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const hasLoadedRef = useRef(false)
  const [showNoTaskToast, setShowNoTaskToast] = useState(false)

  // 组件挂载时从 chrome.storage 恢复状态
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    chrome.storage.local.get(['timerState'], result => {
      const savedState = result.timerState as TimerPersistState | undefined

      if (savedState && savedState.status === 'running') {
        // 计算经过的时间
        const elapsed = Math.floor((Date.now() - savedState.startTime) / 1000)
        const newRemaining = Math.max(0, savedState.remainingSeconds - elapsed)

        setRemainingSeconds(newRemaining)
        setStatus('running')
        if (savedState.currentTaskId) {
          setCurrentTask(savedState.currentTaskId)
        }
      } else if (savedState && savedState.status === 'paused') {
        setRemainingSeconds(savedState.pausedTime)
        setStatus('paused')
        if (savedState.currentTaskId) {
          setCurrentTask(savedState.currentTaskId)
        }
      }
    })
  }, [])

  // 保存状态到 chrome.storage
  const saveTimerState = (state: TimerPersistState) => {
    chrome.storage.local.set({ timerState: state })
  }

  // 倒计时逻辑和任务时间记录
  useEffect(() => {
    if (status !== 'running') {
      // 停止时清理定时器
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      return
    }

    // 记录开始时间
    startTimeRef.current = Date.now()

    const interval = setInterval(() => {
      tick()

      // 只在番茄钟模式下更新当前任务的时间
      if (currentTaskId && mode === 'pomodoro') {
        const currentTask = tasks.find(t => t.id === currentTaskId)
        if (currentTask) {
          updateTask(currentTaskId, {
            totalTimeSpent: currentTask.totalTimeSpent + 1,
          })
        }
      }

      if (remainingSeconds <= 1) {
        setStatus('idle')

        // 番茄钟完成，增加计数
        if (currentTaskId) {
          const currentTask = tasks.find(t => t.id === currentTaskId)
          if (currentTask) {
            updateTask(currentTaskId, {
              pomodoroCount: currentTask.pomodoroCount + 1,
            })
          }
        }

        // 清除保存的状态
        saveTimerState({
          status: 'idle',
          remainingSeconds: 0,
          startTime: 0,
          pausedTime: 0,
          currentTaskId: null,
        })

        // 发送通知
        chrome.runtime.sendMessage({
          type: 'SHOW_NOTIFICATION',
          title: "🍅 Time's up!",
          body: 'Take a break~',
        })
      }
    }, 1000)

    timerIntervalRef.current = interval

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [
    status,
    remainingSeconds,
    tick,
    setStatus,
    currentTaskId,
    tasks,
    updateTask,
  ])

  const handleStart = () => {
    // 检查是否选中了任务
    if (!currentTaskId) {
      setShowNoTaskToast(true)
      setTimeout(() => setShowNoTaskToast(false), 3000)
      return
    }
    setStatus('running')

    // 保存状态
    saveTimerState({
      status: 'running',
      remainingSeconds: remainingSeconds,
      startTime: Date.now(),
      pausedTime: 0,
      currentTaskId: currentTaskId,
    })
  }

  const handleStop = () => {
    setStatus('paused')

    // 保存暂停状态
    saveTimerState({
      status: 'paused',
      remainingSeconds: 0,
      startTime: 0,
      pausedTime: remainingSeconds,
      currentTaskId: currentTaskId,
    })
  }

  const handleReset = () => {
    reset()
    setStatus('idle')

    // 清除保存的状态
    saveTimerState({
      status: 'idle',
      remainingSeconds: 0,
      startTime: 0,
      pausedTime: 0,
      currentTaskId: null,
    })
  }

  // 判断计时是否结束
  const isTimeUp = remainingSeconds === 0
  // 显示重置按钮的条件：正在运行、暂停或计时结束（时间为0）
  const showResetButton = status !== 'idle' || isTimeUp

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Toast Notification */}
      {showNoTaskToast && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-tomato px-4 py-2 rounded-lg shadow-lg text-sm font-semibold animate-bounce z-50">
          Please select a task first!
        </div>
      )}

      {/* Timer Display */}
      <div className="text-[48px] font-bold text-white leading-none mb-4 tracking-tight">
        {formatTime(remainingSeconds)}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        {status === 'running' ? (
          <button
            onClick={handleStop}
            className="px-14 py-3.5 bg-white text-tomato text-base font-bold rounded-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg tracking-wide"
          >
            PAUSE
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isTimeUp}
            className="px-14 py-3.5 bg-white text-tomato text-base font-bold rounded-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:scale-100"
          >
            {status === 'paused' ? 'RESUME' : 'START'}
          </button>
        )}

        {showResetButton && (
          <button
            onClick={handleReset}
            className="p-3 text-white/70 hover:text-white transition-colors"
            title="Reset"
          >
            <TimerReset size={22} />
          </button>
        )}
      </div>
    </div>
  )
}

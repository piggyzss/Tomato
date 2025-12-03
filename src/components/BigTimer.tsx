import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { formatTime } from '@/utils/time'
import { getStorage, setStorage } from '@/utils/storage'
import type { PomodoroRecord } from '@/types'
import { TimerReset, Play, Pause, ChevronsUp, ChevronsDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// 定义计时器状态接口
interface TimerPersistState {
  status: 'idle' | 'running' | 'paused'
  remainingSeconds: number
  startTime: number // 开始时间戳
  pausedTime: number // 暂停时剩余的秒数
  currentTaskId: string | null
  pomodoroStartTime?: number // 番茄钟开始时间（用于记录）
  totalSeconds?: number // 番茄钟总时长（用于记录）
}

export function BigTimer() {
  const {
    status,
    remainingSeconds,
    totalSeconds,
    mode,
    setStatus,
    tick,
    reset,
    setRemainingSeconds,
    setTimerFinished,
  } = useTimerStore()

  const { currentTaskId, updateTask, tasks, setCurrentTask } = useTaskStore()
  const { updateSettings } = useSettingsStore()
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pomodoroStartTimeRef = useRef<number>(0) // 番茄钟开始时间
  const hasLoadedRef = useRef(false)
  const [showNoTaskToast, setShowNoTaskToast] = useState(false)
  const [showResetToast, setShowResetToast] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const timerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const startSecondsRef = useRef<number>(0)

  // 组件挂载时从 chrome.storage 恢复状态
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadTimerState = async () => {
      const savedState = (await getStorage('timerState')) as
        | TimerPersistState
        | undefined
      console.log('Loading timer state:', savedState)

      if (savedState && savedState.status === 'running') {
        // 计算经过的时间
        const elapsed = Math.floor((Date.now() - savedState.startTime) / 1000)
        const newRemaining = Math.max(0, savedState.remainingSeconds - elapsed)

        console.log('Restoring running timer:', { elapsed, newRemaining })
        setRemainingSeconds(newRemaining)
        setStatus('running')
        if (savedState.currentTaskId) {
          setCurrentTask(savedState.currentTaskId)
        }
        // 恢复番茄钟开始时间
        if (savedState.pomodoroStartTime) {
          pomodoroStartTimeRef.current = savedState.pomodoroStartTime
        }
      } else if (savedState && savedState.status === 'paused') {
        console.log('Restoring paused timer:', savedState.pausedTime)
        setRemainingSeconds(savedState.pausedTime)
        setStatus('paused')
        if (savedState.currentTaskId) {
          setCurrentTask(savedState.currentTaskId)
        }
        // 恢复番茄钟开始时间
        if (savedState.pomodoroStartTime) {
          pomodoroStartTimeRef.current = savedState.pomodoroStartTime
        }
      }
    }

    loadTimerState()

    // 清理函数：组件卸载时不重置 hasLoadedRef
    return () => {
      // hasLoadedRef 保持为 true，防止重新加载
    }
  }, [setRemainingSeconds, setStatus, setCurrentTask])

  // 保存状态到 chrome.storage
  const saveTimerState = (state: TimerPersistState) => {
    setStorage('timerState', state)
  }

  // 保存番茄钟记录
  const savePomodoroRecord = async (completed: boolean) => {
    if (!currentTaskId) return

    try {
      const pomodoroRecord: PomodoroRecord = {
        id: crypto.randomUUID(),
        taskId: currentTaskId,
        startTime: pomodoroStartTimeRef.current,
        endTime: Date.now(),
        duration: totalSeconds,
        completed: completed,
      }

      // 获取现有记录
      const existingRecords = (await getStorage('pomodoroRecords')) || []
      
      // 添加新记录
      await setStorage('pomodoroRecords', [...existingRecords, pomodoroRecord])

      console.log('番茄钟记录已保存:', pomodoroRecord)
    } catch (error) {
      console.error('保存番茄钟记录失败:', error)
    }
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
        setTimerFinished(true) // ← 设置计时器完成标志

        // 只在番茄钟模式下保存记录和增加计数
        if (mode === 'pomodoro') {
          // 保存番茄钟记录（完成）
          savePomodoroRecord(true)

          // 番茄钟完成，增加计数
          if (currentTaskId) {
            const currentTask = tasks.find(t => t.id === currentTaskId)
            if (currentTask) {
              updateTask(currentTaskId, {
                pomodoroCount: currentTask.pomodoroCount + 1,
              })
            }
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

        // 发送通知到 background
        chrome.runtime.sendMessage({
          type: 'SHOW_NOTIFICATION',
          title: '🎉 时间到！',
          body: 'Great job! Time to take a break and stretch~',
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
    mode,
    totalSeconds,
  ])

  const handleStart = () => {
    // 检查时间是否为0
    if (isTimeUp) {
      setShowResetToast(true)
      setTimeout(() => setShowResetToast(false), 3000)
      return
    }
    
    // 检查是否选中了任务
    if (!currentTaskId) {
      setShowNoTaskToast(true)
      setTimeout(() => setShowNoTaskToast(false), 3000)
      return
    }
    
    // 记录番茄钟开始时间（用于保存记录）
    pomodoroStartTimeRef.current = Date.now()
    
    setStatus('running')

    // 保存状态
    saveTimerState({
      status: 'running',
      remainingSeconds: remainingSeconds,
      startTime: Date.now(),
      pausedTime: 0,
      currentTaskId: currentTaskId,
      pomodoroStartTime: pomodoroStartTimeRef.current,
      totalSeconds: totalSeconds,
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
      pomodoroStartTime: pomodoroStartTimeRef.current,
      totalSeconds: totalSeconds,
    })
  }

  const handleReset = () => {
    // 如果是在番茄钟模式下重置，且有开始时间，保存未完成的记录
    if (mode === 'pomodoro' && pomodoroStartTimeRef.current > 0 && (status === 'running' || status === 'paused')) {
      savePomodoroRecord(false) // 未完成
    }

    reset()
    setStatus('idle')

    // 重置番茄钟开始时间
    pomodoroStartTimeRef.current = 0

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

  // 滚动调整时间
  const handleWheel = (e: React.WheelEvent) => {
    // 只在 idle 或 paused 状态下允许调整
    if (status === 'running') return
    
    e.preventDefault()
    const delta = e.deltaY > 0 ? -60 : 60 // 每次滚动调整1分钟
    const newSeconds = Math.max(60, Math.min(3600, remainingSeconds + delta)) // 限制在1-60分钟
    setRemainingSeconds(newSeconds)
    
    // 同步到设置中（转换为分钟）
    const newMinutes = Math.round(newSeconds / 60)
    updateSettings({ workDuration: newMinutes })
  }

  // 触摸滑动调整时间
  const handleTouchStart = (e: React.TouchEvent) => {
    // 只在 idle 或 paused 状态下允许调整
    if (status === 'running') return
    setIsAdjusting(true)
    startYRef.current = e.touches[0].clientY
    startSecondsRef.current = remainingSeconds
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isAdjusting || status === 'running') return
    
    const deltaY = startYRef.current - e.touches[0].clientY
    const deltaSeconds = Math.floor(deltaY / 2) * 60 // 每2px调整1分钟
    const newSeconds = Math.max(60, Math.min(3600, startSecondsRef.current + deltaSeconds))
    setRemainingSeconds(newSeconds)
  }

  const handleTouchEnd = () => {
    setIsAdjusting(false)
    
    // 触摸结束时同步到设置中（转换为分钟）
    const newMinutes = Math.round(remainingSeconds / 60)
    updateSettings({ workDuration: newMinutes })
  }

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* Toast Notifications - 放在时钟下方，完全居中 */}
      {showNoTaskToast && (
        <div className="absolute top-20 left-0 right-0 mx-auto w-fit bg-white text-tomato px-4 py-2 rounded-lg shadow-lg text-sm font-semibold animate-bounce z-50">
          Please select a task first!
        </div>
      )}
      
      {showResetToast && (
        <div className="absolute top-20 left-0 right-0 mx-auto w-fit bg-white text-tomato px-4 py-2 rounded-lg shadow-lg text-sm font-semibold animate-bounce z-50">
          Please click the reset button first!
        </div>
      )}

      {/* Timer Display with Adjustment Indicators */}
      <div className="flex items-center justify-center mb-4 w-full -ml-8">
        <div className="relative group flex items-center gap-3">
          {/* Left Arrow Indicator (Up) - 可点击增加时间 */}
          {status !== 'running' && (
            <button
              onClick={() => {
                const newSeconds = Math.min(3600, remainingSeconds + 60) // 增加1分钟，最多60分钟
                setRemainingSeconds(newSeconds)
                const newMinutes = Math.round(newSeconds / 60)
                updateSettings({ workDuration: newMinutes })
              }}
              className="opacity-30 hover:opacity-100 flex-shrink-0 transition-opacity cursor-pointer"
              title="Increase 1 minute"
            >
              <ChevronsUp size={20} className="text-white" strokeWidth={2} />
            </button>
          )}
          
          {/* Timer */}
          <div 
            ref={timerRef}
            className={`text-5xl font-bold text-white leading-none tracking-tight select-none transition-all ${
              status !== 'running' ? 'cursor-ns-resize hover:scale-105' : ''
            }`}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {formatTime(remainingSeconds)}
          </div>
          
          {/* Right Arrow Indicator (Down) - 可点击减少时间 */}
          {status !== 'running' && (
            <button
              onClick={() => {
                const newSeconds = Math.max(60, remainingSeconds - 60) // 减少1分钟，最少1分钟
                setRemainingSeconds(newSeconds)
                const newMinutes = Math.round(newSeconds / 60)
                updateSettings({ workDuration: newMinutes })
              }}
              className="opacity-30 hover:opacity-100 flex-shrink-0 transition-opacity cursor-pointer"
              title="Decrease 1 minute"
            >
              <ChevronsDown size={20} className="text-white" strokeWidth={2} />
            </button>
          )}
          
          {/* Tooltip */}
          {status !== 'running' && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white/90 text-tomato text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Click arrows or scroll to adjust time
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        {status === 'running' ? (
          <div className="relative group">
            <button
              onClick={handleStop}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full active:scale-95 transition-all hover:scale-110"
            >
              <Pause size={24} className="text-white" fill="white" />
            </button>
            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white/90 text-tomato text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Pause
            </div>
          </div>
        ) : (
          <div className="relative group">
            <button
              onClick={handleStart}
              disabled={isTimeUp}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full active:scale-95 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/20 disabled:active:scale-100 disabled:hover:scale-100"
            >
              <Play size={24} className="text-white" fill="white" />
            </button>
            {/* Tooltip */}
            {!isTimeUp && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white/90 text-tomato text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {status === 'paused' ? 'Resume' : 'Start'}
              </div>
            )}
          </div>
        )}

        {showResetButton && (
          <div className="relative group">
            <button
              onClick={handleReset}
              className="p-2 transition-all hover:scale-110"
            >
              <TimerReset size={24} className="text-white/60 group-hover:text-white transition-colors" />
            </button>
            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white/90 text-tomato text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Reset
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

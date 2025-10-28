import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useCallback, useEffect } from 'react'

/**
 * 番茄钟计时器逻辑 Hook
 */
export function useTimer() {
  const { 
    status, 
    remainingSeconds, 
    totalSeconds,
    setStatus, 
    reset: resetTimer,
    incrementPomodoro,
    setTotalSeconds
  } = useTimerStore()
  
  const { currentTaskId, updateTask } = useTaskStore()
  const { workDuration, shortBreakDuration, soundEnabled, notificationEnabled } = useSettingsStore()

  // 开始工作计时
  const startWork = useCallback(() => {
    setTotalSeconds(workDuration * 60)
    setStatus('running')
  }, [workDuration, setTotalSeconds, setStatus])

  // 开始休息
  const startBreak = useCallback(() => {
    setTotalSeconds(shortBreakDuration * 60)
    setStatus('break')
  }, [shortBreakDuration, setTotalSeconds, setStatus])

  // 暂停
  const pause = useCallback(() => {
    setStatus('paused')
  }, [setStatus])

  // 继续
  const resume = useCallback(() => {
    setStatus(status === 'break' ? 'break' : 'running')
  }, [status, setStatus])

  // 重置
  const reset = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  // 完成一个番茄钟
  const completePomodo = useCallback(() => {
    incrementPomodoro()
    
    // 更新当前任务的番茄数
    if (currentTaskId) {
      const currentTask = useTaskStore.getState().tasks.find(t => t.id === currentTaskId)
      if (currentTask) {
        updateTask(currentTaskId, {
          pomodoroCount: currentTask.pomodoroCount + 1
        })
      }
    }

    // 发送通知
    if (notificationEnabled) {
      chrome.runtime.sendMessage({
        type: 'SHOW_NOTIFICATION',
        title: '🍅 番茄钟完成！',
        body: '干得漂亮！休息一下吧~'
      })
    }

    // 播放音效（如果启用）
    if (soundEnabled) {
      // TODO: 添加音效播放逻辑
    }
  }, [currentTaskId, updateTask, incrementPomodoro, notificationEnabled, soundEnabled])

  // 倒计时结束处理
  useEffect(() => {
    if (remainingSeconds === 0 && status === 'running') {
      completePomodo()
      setStatus('idle')
    }
  }, [remainingSeconds, status, completePomodo, setStatus])

  return {
    status,
    remainingSeconds,
    totalSeconds,
    progress: ((totalSeconds - remainingSeconds) / totalSeconds) * 100,
    startWork,
    startBreak,
    pause,
    resume,
    reset
  }
}


// Background Service Worker for Chrome Extension
import {
  setMultipleStorage,
  getMultipleStorage,
  setStorage,
} from '@/utils/storage'

// 监听插件安装
chrome.runtime.onInstalled.addListener(async details => {
  console.log('番茄猫插件已安装:', details.reason)

  if (details.reason === 'install') {
    // 获取当前日期
    const today = new Date().toISOString().split('T')[0]

    // 首次安装，初始化默认数据
    await setMultipleStorage({
      tasks: [],
      statistics: [],
      pomodoroRecords: [],
      aiHistory: [],
      history: {},
      lastResetDate: today,
      aiModePreference: 'builtin', // 默认使用内置 AI
      settings: {
        workDuration: 25, // 25分钟
        shortBreakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
        soundEnabled: true,
        soundType: 'ding',
        notificationEnabled: true,
        theme: 'light',
        language: 'en-US', // 默认英文
        aiEnabled: false,
        aiMessages: [],
        useAIMessages: false,
        aiProvider: 'builtin', // 默认使用内置 AI
      },
    })

    console.log('初始化完成，默认 AI 模式: builtin')
  }

  // 设置每日零点定时任务
  setupDailyResetAlarm()
})

// 监听来自页面的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('收到消息:', message)

  switch (message.type) {
    case 'START_TIMER':
      handleStartTimer(message.duration)
      break
    case 'STOP_TIMER':
      handleStopTimer()
      break
    case 'SHOW_NOTIFICATION':
      showNotification(message.title, message.body)
      break
    default:
      console.warn('未知消息类型:', message.type)
  }

  sendResponse({ success: true })
  return true
})

// 处理定时器开始
function handleStartTimer(duration: number) {
  chrome.alarms.create('pomodoro', { delayInMinutes: duration })
  console.log(`番茄钟已启动，时长: ${duration} 分钟`)
}

// 处理定时器停止
function handleStopTimer() {
  chrome.alarms.clear('pomodoro')
  console.log('番茄钟已停止')
}

// 监听定时器结束
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'pomodoro') {
    console.log('番茄钟时间到！')
    showNotification('🍅 时间到！', '是时候休息一下了，干得漂亮！')

    // 通知所有打开的页面
    chrome.runtime.sendMessage({ type: 'TIMER_FINISHED' })
  } else if (alarm.name === 'dailyReset') {
    console.log('每日重置定时任务触发')
    handleDailyReset()
  }
})

// 设置每日零点定时任务
function setupDailyResetAlarm() {
  // 清除旧的定时任务
  chrome.alarms.clear('dailyReset', () => {
    // 计算到下一个零点的时间
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const delayInMinutes = (tomorrow.getTime() - now.getTime()) / (1000 * 60)

    // 创建定时任务，每24小时重复一次
    chrome.alarms.create('dailyReset', {
      delayInMinutes: delayInMinutes,
      periodInMinutes: 24 * 60, // 每24小时
    })

    console.log(
      `每日重置定时任务已设置，将在 ${delayInMinutes.toFixed(2)} 分钟后首次触发`
    )
  })
}

// 处理每日重置
async function handleDailyReset(forceArchive = false) {
  try {
    console.log('开始执行每日重置', forceArchive ? '(强制归档)' : '')

    const today = new Date().toISOString().split('T')[0]

    const { tasks, pomodoroRecords, history, lastResetDate } =
      await getMultipleStorage([
        'tasks',
        'pomodoroRecords',
        'history',
        'lastResetDate',
      ])

    // 如果已经重置过了，跳过（除非强制归档）
    if (!forceArchive && lastResetDate === today) {
      console.log('今天已经重置过了，跳过')
      return
    }

    // 归档数据
    const tasksList = tasks || []
    const recordsList = pomodoroRecords || []

    // 只有在有数据时才归档
    if (tasksList.length > 0 || recordsList.length > 0) {
      const historyData = history || {}

      // 决定使用哪个日期作为归档 key
      // 如果是强制归档，使用今天；否则使用 lastResetDate
      const archiveDate = forceArchive ? today : lastResetDate || today

      // 计算统计数据
      const completedPomodoros = recordsList.filter(
        (r: any) => r.completed
      ).length
      const totalFocusTime = recordsList.reduce((sum: number, r: any) => {
        return r.completed ? sum + r.duration / 60 : sum
      }, 0)
      const completedTasks = tasksList.filter(
        (t: any) => t.status === 'completed'
      ).length

      // 创建历史记录
      historyData[archiveDate] = {
        date: archiveDate,
        tasks: tasksList,
        pomodoroRecords: recordsList,
        completedPomodoros,
        totalFocusTime,
        completedTasks,
      }

      console.log('归档数据到日期:', archiveDate, '任务数:', tasksList.length)

      // 清理超过90天的数据
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 90)
      const cutoffDateString = cutoffDate.toISOString().split('T')[0]

      const cleanedHistory: any = {}
      for (const [date, data] of Object.entries(historyData)) {
        if (date >= cutoffDateString) {
          cleanedHistory[date] = data
        }
      }

      // 保存历史记录
      await setStorage('history', cleanedHistory)
      console.log(
        '历史记录已保存，共',
        Object.keys(cleanedHistory).length,
        '天'
      )
    } else {
      console.log('没有数据需要归档')
    }

    // 重置当天数据
    console.log('开始清空当天数据...')
    await setMultipleStorage({
      tasks: [],
      pomodoroRecords: [],
      currentTaskId: undefined,
      timerState: undefined, // 清除计时器状态
      lastResetDate: today,
    })

    // 验证数据已清空
    const { tasks: verifyTasks, history: verifyHistory } =
      await getMultipleStorage(['tasks', 'history'])
    console.log('重置后验证 - 任务数:', verifyTasks?.length || 0)
    console.log(
      '重置后验证 - 历史记录:',
      Object.keys(verifyHistory || {}).length,
      '天'
    )

    console.log('=== 每日重置完成 ===')

    // 通知所有打开的页面
    chrome.runtime.sendMessage({ type: 'DAILY_RESET' }).catch(() => {
      // 忽略错误（可能没有页面在监听）
      console.log('没有页面在监听 DAILY_RESET 消息')
    })
  } catch (error) {
    console.error('每日重置失败:', error)
    throw error
  }
}

// 显示通知
function showNotification(title: string, message: string) {
  // 使用简单的数据 URI 作为图标（一个番茄色的圆形）
  const iconDataUrl =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2MCIgZmlsbD0iI0ZGNjM0NyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjM1ZW0iIGZvbnQtc2l6ZT0iNjAiPvCfkK88L3RleHQ+PC9zdmc+'

  const notificationId = 'tomato-timer-' + Date.now()

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: iconDataUrl,
    title: title,
    message: message,
    priority: 2,
    requireInteraction: true, // 通知不会自动消失，需要用户交互
  })
}

// 监听通知点击事件
chrome.notifications.onClicked.addListener(async notificationId => {
  console.log('通知被点击:', notificationId)

  // 关闭通知
  chrome.notifications.clear(notificationId)

  // 获取当前活动的标签页
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs[0]?.id) {
    // 打开侧边栏
    await chrome.sidePanel.open({ tabId: tabs[0].id })
  }
})

// 监听点击插件图标
chrome.action.onClicked.addListener(async tab => {
  // 打开侧边栏
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id })
  }
})

// 保持 service worker 活跃（可选）
let keepAliveInterval: number | undefined

function startKeepAlive() {
  keepAliveInterval = setInterval(() => {
    console.log('保持活跃...')
  }, 20000) as unknown as number
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = undefined
  }
}

// 当有连接时保持活跃
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    startKeepAlive()
    port.onDisconnect.addListener(() => {
      stopKeepAlive()
    })
  }
})

console.log('番茄猫 Service Worker 已启动')

// Background Service Worker for Chrome Extension

// 监听插件安装
chrome.runtime.onInstalled.addListener(details => {
  console.log('番茄猫插件已安装:', details.reason)

  if (details.reason === 'install') {
    // 首次安装，初始化默认数据
    chrome.storage.local.set({
      tasks: [],
      statistics: [],
      pomodoroRecords: [],
      aiHistory: [],
      settings: {
        workDuration: 10 / 60, // 10秒，方便调试
        shortBreakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
        soundEnabled: true,
        soundType: 'ding',
        notificationEnabled: true,
        theme: 'light',
        language: 'zh-CN',
        aiEnabled: false,
        aiMessages: [],
        useAIMessages: false,
      },
    })
  }
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
  }
})

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

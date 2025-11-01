// 清除 Chrome Storage 的脚本
// 在 Chrome DevTools Console 中运行此代码

console.log('Clearing Chrome Storage...')

chrome.storage.local.clear(() => {
  console.log('Storage cleared!')
  console.log('Please refresh the extension.')
})

// 或者只更新设置
chrome.storage.local.set({
  settings: {
    workDuration: 25, // 25分钟
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    soundEnabled: true,
    notificationEnabled: true,
    theme: 'light',
    language: 'zh-CN',
    aiEnabled: false
  }
}, () => {
  console.log('Settings updated to 25 minutes!')
})


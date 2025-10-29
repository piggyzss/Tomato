import React from 'react'
import ReactDOM from 'react-dom/client'
import { FloatingWidget } from './FloatingWidget'

// Content Script - 在页面中注入悬浮组件

let widgetContainer: HTMLDivElement | null = null
let shadowRoot: ShadowRoot | null = null
let widgetRoot: ReactDOM.Root | null = null

// 创建悬浮窗口容器（使用 Shadow DOM 隔离样式）
async function createFloatingContainer(): Promise<ShadowRoot> {
  console.log('🚀 Creating floating container...')
  
  // 创建容器
  const container = document.createElement('div')
  container.id = 'tomato-cat-floating-widget'
  container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2147483647;'
  
  // 确保body存在
  if (!document.body) {
    console.error('❌ document.body is null, waiting...')
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve)
      } else {
        resolve(null)
      }
    })
  }
  
  document.body.appendChild(container)
  console.log('✅ Container appended to body')
  
  widgetContainer = container
  
  // 创建 Shadow DOM
  const shadow = container.attachShadow({ mode: 'open' })
  console.log('✅ Shadow DOM created')
  
  // 获取并注入样式到 Shadow DOM
  try {
    const cssUrl = chrome.runtime.getURL('content.css')
    console.log('📦 Attempting to load CSS from:', cssUrl)
    console.log('📦 Extension ID:', chrome.runtime.id)
    
    const response = await fetch(cssUrl)
    console.log('📦 Fetch response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const cssText = await response.text()
    console.log(`📝 CSS loaded successfully: ${cssText.length} characters`)
    
    const style = document.createElement('style')
    style.textContent = cssText
    shadow.appendChild(style)
    
    console.log('🎨 CSS injected successfully into Shadow DOM')
  } catch (error) {
    console.error('❌ Failed to load CSS:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // 即使CSS加载失败，也添加一些基本样式
    const fallbackStyle = document.createElement('style')
    fallbackStyle.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .bg-white { background-color: white; }
      .rounded-xl { border-radius: 0.75rem; }
      .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
      .p-4 { padding: 1rem; }
      .w-80 { width: 20rem; }
      .flex { display: flex; }
      .items-center { align-items: center; }
      .gap-3 { gap: 0.75rem; }
      .text-gray-700 { color: rgb(55, 65, 81); }
      .font-medium { font-weight: 500; }
      .text-xs { font-size: 0.75rem; }
      .text-2xl { font-size: 1.5rem; }
      .font-bold { font-weight: 700; }
      .cursor-pointer { cursor: pointer; }
      .border { border: 1px solid rgb(229, 231, 235); }
    `
    shadow.appendChild(fallbackStyle)
    console.log('⚠️ Using fallback CSS')
  }
  
  // 创建 React 根容器
  const reactRoot = document.createElement('div')
  reactRoot.id = 'tomato-cat-root'
  shadow.appendChild(reactRoot)
  console.log('✅ React root container created')
  
  return shadow
}

// 显示悬浮组件
async function showFloatingWidget() {
  if (widgetContainer && shadowRoot) {
    widgetContainer.style.display = 'block'
    return
  }

  // 创建 Shadow DOM 容器（包含样式）
  shadowRoot = await createFloatingContainer()
  
  // 渲染 React 组件
  const reactRoot = shadowRoot.querySelector('#tomato-cat-root')
  if (reactRoot) {
    widgetRoot = ReactDOM.createRoot(reactRoot)
    widgetRoot.render(
      <React.StrictMode>
        <FloatingWidget onClose={hideFloatingWidget} />
      </React.StrictMode>
    )
    console.log('🐱 Floating widget rendered')
  }
}

// 隐藏悬浮组件
function hideFloatingWidget() {
  if (widgetContainer) {
    widgetContainer.style.display = 'none'
  }
}

// 移除悬浮组件
function removeFloatingWidget() {
  if (widgetRoot) {
    widgetRoot.unmount()
    widgetRoot = null
  }
  if (widgetContainer) {
    widgetContainer.remove()
    widgetContainer = null
  }
  shadowRoot = null
}

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Content Script 收到消息:', message)
  
  switch (message.type) {
    case 'SHOW_FLOATING_WIDGET':
      showFloatingWidget()
      sendResponse({ success: true })
      break
    case 'HIDE_FLOATING_WIDGET':
      hideFloatingWidget()
      sendResponse({ success: true })
      break
    case 'REMOVE_FLOATING_WIDGET':
      removeFloatingWidget()
      sendResponse({ success: true })
      break
    default:
      sendResponse({ success: false, error: 'Unknown message type' })
  }
  
  return true
})

console.log('🍅 Tomato Cat - Content Script loaded')

// Content Script 加载后，主动询问 background 是否应该显示悬浮组件
// 等待页面完全加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndShowWidget)
} else {
  checkAndShowWidget()
}

function checkAndShowWidget() {
  setTimeout(() => {
    console.log('🔍 Checking if floating widget should be shown...')
    chrome.runtime.sendMessage({ type: 'CHECK_SIDE_PANEL_STATUS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to check side panel status:', chrome.runtime.lastError)
        // 如果无法连接到background，默认显示悬浮组件
        console.log('⚠️ Cannot connect to background, showing widget by default')
        showFloatingWidget()
        return
      }
      
      if (response && response.shouldShowWidget) {
        console.log('✅ Side panel is closed, showing floating widget')
        showFloatingWidget()
      } else {
        console.log('ℹ️ Side panel is open, not showing floating widget')
      }
    })
  }, 500) // 500ms后检查
}


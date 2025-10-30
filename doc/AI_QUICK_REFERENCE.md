# AI 服务快速参考

## 🚀 快速开始

```typescript
import { useAI } from '@/hooks/useAI'

function MyComponent() {
  const { prompt, provider, status, isLoading } = useAI(true, {
    systemPrompt: '你是一只可爱的番茄猫助手'
  })

  const handleSend = async () => {
    const response = await prompt('你好')
    console.log(response)
  }

  return (
    <div>
      <div>状态: {status}</div>
      <div>提供商: {provider}</div>
      <button onClick={handleSend} disabled={isLoading}>
        发送
      </button>
    </div>
  )
}
```

---

## 📋 API 速查

### useAI Hook

```typescript
const {
  // 状态
  status,           // 'checking' | 'ready' | 'unavailable' | 'error'
  provider,         // 'builtin' | 'cloud' | null
  isLoading,        // boolean
  error,            // string | null
  
  // 会话
  session,          // IAISession | null
  
  // 方法
  createSession,    // (config?) => Promise<void>
  prompt,           // (input: string) => Promise<string>
  generate,         // (input, config?) => Promise<string>
  setApiKey,        // (key: string) => void
  destroySession,   // () => void
  
  // 可用性
  builtInAvailable, // boolean
  cloudAvailable,   // boolean
} = useAI(
  autoInit?,        // 是否自动初始化会话
  config?           // 会话配置
)
```

### AIService

```typescript
import { aiService } from '@/services/aiService'

// 设置 API Key
aiService.setApiKey('your-gemini-api-key')

// 检查可用性
const builtIn = await aiService.checkBuiltInAvailability()
const cloud = aiService.checkCloudAvailability()
const provider = await aiService.getAvailableProvider()

// 创建会话
const { session, provider } = await aiService.createSession({
  systemPrompt: '你是助手',
  temperature: 0.9,
  maxTokens: 2048,
})

// 发送提示词
const response = await session.prompt('你好')

// 快速生成（一次性）
const result = await aiService.generate('写一首诗', {
  systemPrompt: '你是诗人'
})
console.log(result.text, result.provider)

// 清理
session.destroy()
```

---

## 🎯 常用场景

### 1. 简单对话
```typescript
const { prompt } = useAI(true)
const response = await prompt('你好')
```

### 2. 带人设的对话
```typescript
const { prompt } = useAI(true, {
  systemPrompt: '你是番茄猫，用可爱的语气回答',
  temperature: 0.9,
})

const response = await prompt('我完成了 5 个番茄钟')
```

### 3. 检查可用性
```typescript
const { 
  status, 
  builtInAvailable, 
  cloudAvailable,
  setApiKey 
} = useAI()

if (status === 'unavailable') {
  if (!cloudAvailable) {
    // 提示用户设置 API Key
    setApiKey('user-api-key')
  }
}
```

### 4. 强制使用云端
```typescript
const { session } = await aiService.createSession(
  { systemPrompt: '...' },
  'cloud'  // 强制使用云端
)
```

### 5. 错误处理
```typescript
const { prompt, error } = useAI(true)

try {
  const response = await prompt('你好')
} catch (err) {
  console.error('生成失败:', error)
}
```

---

## 🔧 配置管理

### API Key 设置

#### 方式 1：通过 UI
```
AI 菜单 → AI 设置 → 输入 API Key → 保存
```

#### 方式 2：通过代码
```typescript
import { setStorage } from '@/utils/storage'
await setStorage('geminiApiKey', 'your-key')
aiService.setApiKey('your-key')
```

#### 方式 3：通过 Hook
```typescript
const { setApiKey } = useAI()
setApiKey('your-key')
```

### 获取 API Key

1. 访问 https://aistudio.google.com/app/apikey
2. 登录 Google 账号
3. 创建 API Key
4. 复制并保存到应用中

---

## 📊 提供商对比

| 特性 | 内置 AI (Gemini Nano) | 云端 AI (Gemini 1.5 Flash) |
|------|----------------------|---------------------------|
| 费用 | 免费 | 有免费额度 |
| 速度 | 快 | 中等 |
| 网络 | 离线可用 | 需要网络 |
| 能力 | 基础对话 | 更强大 |
| 隐私 | 完全本地 | 发送到 Google |
| 配置 | Chrome flags | API Key |
| 优先级 | 高（优先使用） | 低（备用） |

---

## 💡 最佳实践

### 1. 优先使用 useAI Hook
```typescript
// ✅ 推荐 - 自动管理状态和资源
const { prompt } = useAI(true)

// ❌ 不推荐 - 需要手动管理
const session = await aiService.createSession()
```

### 2. 设置合适的系统提示词
```typescript
// ✅ 好的系统提示词
systemPrompt: '你是一只可爱的番茄猫助手，用简短、友好、鼓励的语气回答问题。'

// ❌ 不好的系统提示词
systemPrompt: '你是助手'  // 太简单，缺乏个性
```

### 3. 根据提供商显示不同 UI
```typescript
const { provider } = useAI(true)

if (provider === 'builtin') {
  // 显示"本地 AI"图标
} else if (provider === 'cloud') {
  // 显示"云端 AI"图标
}
```

### 4. 处理加载和错误状态
```typescript
const { prompt, isLoading, error } = useAI(true)

if (isLoading) {
  return <div>生成中...</div>
}

if (error) {
  return <div>错误: {error}</div>
}
```

---

## 🏗️ 架构概览

```
React Components
       ↓
   useAI Hook
       ↓
   AIService (统一服务层)
       ↓
   ┌───────┴───────┐
   ↓               ↓
BuiltInAI      CloudAI
Session        Session
   ↓               ↓
window.ai    @google/generative-ai
```

**智能切换逻辑：**
1. 优先检查内置 AI 是否可用
2. 如果不可用，降级到云端 AI
3. 如果都不可用，返回 unavailable 状态

---

## 🔗 相关文档

- [Chrome 内置 AI 配置指南](./CHROME_AI_SETUP.md)
- [Gemini API Key 设置指南](./GEMINI_API_KEY_SETUP.md)
- [AI 功能用户指南](./AI_FEATURES_USER_GUIDE.md)

---

**版本**: v1.0.0  
**更新日期**: 2025-10-30

# Chrome 内置 AI 配置指南

## 🚀 快速配置（5 分钟）

### 步骤 1：安装 Chrome Canary

下载地址：
- Windows/Mac/Linux: https://www.google.com/chrome/canary/
- 或使用 Chrome Dev: https://www.google.com/chrome/dev/

> **版本要求**：Chrome 127+

### 步骤 2：启用 AI 功能

复制以下地址到 Chrome 地址栏，逐个启用：

**1. Prompt API for Gemini Nano**
```
chrome://flags/#prompt-api-for-gemini-nano
```
👉 设置为：**Enabled**

**2. Optimization Guide On Device Model**
```
chrome://flags/#optimization-guide-on-device-model
```
👉 设置为：**Enabled BypassPerfRequirement**

> 💡 `BypassPerfRequirement` 可在低配设备上使用

### 步骤 3：重启浏览器

点击页面底部的 "Relaunch" 按钮

### 步骤 4：触发模型下载

打开 DevTools（F12），在 Console 运行：

```javascript
(async () => {
  const session = await ai.languageModel.create();
  console.log('✅ 模型准备完成！');
})();
```

**检查状态：**
```javascript
(async () => {
  const status = await ai.languageModel.capabilities();
  console.log('AI 状态:', status.available);
  // 'readily' | 'after-download' | 'no'
})();
```

如果显示 "after-download"，等待模型下载（约 1.7GB）

### 步骤 5：测试

```bash
npm run dev
```

打开插件 → 点击 🤖 AI 按钮 → 选择 "Chrome 内置 AI Demo"

---

## ✅ 验证清单

- [ ] Chrome 版本 >= 127
- [ ] Flags 已启用并重启
- [ ] 模型已下载（约 1.7GB）
- [ ] Console 测试成功
- [ ] Demo 显示绿色"已就绪"

---

## 📱 界面说明

### 状态指示器

**✅ 就绪（绿色）**
```
┌─────────────────────────────────┐
│ ✅ Chrome 内置 AI 已就绪！      │
└─────────────────────────────────┘
```
模型已加载，可以使用

**⏳ 下载中（黄色）**
```
┌─────────────────────────────────┐
│ ⏳ AI 模型正在下载中，请稍候... │
└─────────────────────────────────┘
```
首次使用，等待下载完成

**❌ 不可用（红色）**
```
┌─────────────────────────────────┐
│ ❌ Chrome 内置 AI 不可用         │
│ 请检查 Chrome 版本和 flags      │
└─────────────────────────────────┘
```
需要配置或升级浏览器

---

## 🔧 技术实现

### API 使用

```typescript
// 检查可用性
const capabilities = await window.ai.languageModel.capabilities();

if (capabilities.available === 'readily') {
  // 创建会话
  const session = await window.ai.languageModel.create({
    systemPrompt: '你是助手'
  });
  
  // 发送提示词
  const response = await session.prompt('你好');
  console.log(response);
}
```

### TypeScript 类型

```typescript
interface AILanguageModel {
  prompt: (input: string) => Promise<string>
  promptStreaming: (input: string) => ReadableStream
}

interface Window {
  ai?: {
    languageModel?: {
      capabilities: () => Promise<{
        available: 'readily' | 'after-download' | 'no'
      }>
      create: (options?: { 
        systemPrompt?: string 
      }) => Promise<AILanguageModel>
    }
  }
}
```

---

## 💡 使用技巧

### 提示词优化

**✅ 好的提示词**
- "用一句话总结番茄工作法"
- "给我 3 个提高专注力的建议"
- "写一首 4 行的关于学习的小诗"

**❌ 避免**
- 过于复杂的多步骤任务
- 需要实时数据的问题
- 超长文本生成（建议 < 200 字）

### 响应时间

- 首次响应：1-2 秒
- 后续响应：0.5-1 秒
- 长文本：2-3 秒

---

## ❓ 常见问题

### Q: 为什么显示不可用？
**A:** 检查：
1. Chrome 版本 >= 127
2. Flags 已启用
3. 已重启浏览器

### Q: 下载需要多久？
**A:** 模型约 1.7GB，取决于网速，通常几分钟到十几分钟

### Q: 如何查看下载进度？
**A:** DevTools → Network 标签页

### Q: 模型存储在哪？
**A:** Chrome 本地缓存，不占用项目空间

### Q: 需要网络吗？
**A:** 首次下载需要，之后完全离线

### Q: 支持哪些语言？
**A:** 中文、英文、日文等多种语言

### Q: 设备要求？
**A:** 
- 内存：建议 8GB+ RAM
- 存储：约 1.7GB
- CPU：现代多核处理器

---

## 📊 性能指标

- **模型大小**：~1.7GB
- **内存占用**：1-2GB RAM
- **响应延迟**：0.5-2 秒
- **离线可用**：✅
- **隐私保护**：✅ 完全本地

---

## 🔗 参考资料

- [Chrome Built-in AI 官方文档](https://developer.chrome.com/docs/ai/built-in?hl=zh-cn)
- [Prompt API 文档](https://developer.chrome.com/docs/ai/built-in-apis?hl=zh-cn#prompt_api)
- [Gemini Nano 介绍](https://deepmind.google/technologies/gemini/nano/)

---

## 🎯 测试建议

试试这些问题：
- "给我一句鼓励的话"
- "用一句话总结番茄工作法"
- "写一首关于专注的俳句"
- "如何克服拖延症？"
- "解释什么是心流状态"

---

**版本**: v1.0.0  
**更新日期**: 2025-10-29

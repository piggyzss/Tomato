# Chrome 内置 AI 配置指南

## 🚀 快速配置

### 步骤 1：安装 Chrome Canary

下载地址：https://www.google.com/chrome/canary/

> **版本要求**：Chrome 127+

### 步骤 2：启用 Chrome Flags

访问以下地址并启用：

**1. Prompt API**
```
chrome://flags/#prompt-api-for-gemini-nano
```
设置为：**Enabled**

**2. Summarization API**
```
chrome://flags/#summarization-api-for-gemini-nano
```
设置为：**Enabled**

**3. Optimization Guide**
```
chrome://flags/#optimization-guide-on-device-model
```
设置为：**Enabled BypassPerfRequirement**

> 💡 `BypassPerfRequirement` 允许在低配设备上使用

### 步骤 3：重启浏览器

点击页面底部的 "Relaunch" 按钮

### 步骤 4：下载 Gemini Nano 模型

#### **4-1、手动下载（可查看进度）：**

1. 访问：`chrome://components/`
2. 找到 "Optimization Guide On Device Model"
3. 点击 "检查是否有更新" 按钮
4. 等待下载完成（10-30 分钟，约 1.5GB）

**工作原理：**

这是 Chrome 的组件更新系统
直接下载 Gemini Nano 模型
可以看到下载进度和状态
下载完成后，所有 Built-in AI API 都可以使用

**优点：**
可以看到下载进度
可以主动控制下载时机
下载失败时更容易排查
用户体验更好

**缺点：**
需要手动操作
用户需要知道这个步骤

#### **4-2、自动下载（代码触发）：**

打开 DevTools（F12），在 Console 运行：
```javascript
(async () => {
  const session = await ai.languageModel.create();
  console.log('✅ 模型准备完成！');
})();

// 说明：调用任何 create() 方法都会触发下载
await window.ai.languageModel.create()  // Prompt API
await window.ai.summarizer.create()     // Summarizer API
await window.ai.writer.create()         // Writer API
await window.ai.rewriter.create()       // Rewriter API

```

**工作原理：**

当你首次调用 create() 时
Chrome 检测到模型不存在
自动在后台开始下载 Gemini Nano 模型
create() 会一直等待，直到下载完成（可能等很久！）
下载完成后，create() 返回实例

**优点：**
自动化，无需手动操作
代码驱动

**缺点：**
create() 会阻塞很长时间（10-30 分钟）
用户体验差，看起来像卡住了
无法看到下载进度
如果网络中断，可能失败

> ⚠️ 自动下载会阻塞代码执行，推荐使用手动方式

**验证下载状态：**
```javascript
// 检查 Prompt API
await ai.languageModel.capabilities()
// 返回 { available: 'readily' } 表示已就绪

// 检查 Summarizer API
await ai.summarizer.availability()
// 返回 'readily' 表示已就绪
```

### 步骤 5：测试

```bash
npm run dev
```

打开插件 → 点击 🤖 AI 按钮 → 测试 AI 功能

---

## ✅ 验证清单

- [ ] Chrome 版本 >= 127
- [ ] 所有 Flags 已启用并重启
- [ ] `chrome://components/` 显示模型版本号（非 0.0.0.0）
- [ ] Console 测试返回 `'readily'`
- [ ] 插件 AI 功能正常工作

---

## �  核心概念

### 统一的 Gemini Nano 模型

Chrome Built-in AI 使用 **单一的 Gemini Nano 模型**（约 1.5GB），所有 API 共享：

```
Gemini Nano 模型
    ↓
    ├─ Prompt API (对话生成)
    ├─ Summarizer API (文本摘要)
    ├─ Writer API (写作辅助)
    └─ Rewriter API (文本改写)
```

**重要：下载一次模型后，所有 Built-in AI API 都可使用！**

### Availability 状态说明

| 状态 | 含义 | 操作 |
|------|------|------|
| `readily` | ✅ 立即可用 | 直接使用 |
| `after-download` | ⏳ 下载中 | 等待完成 |
| `downloadable` | 📥 可下载但未下载 | 需要触发下载 |
| `no` | ❌ 不可用 | 检查设备/Flags |

### 两种下载方式对比

| 方式 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **手动下载**<br>`chrome://components/` | • 可查看进度<br>• 可控制时机<br>• 失败易排查 | • 需手动操作 | ⭐⭐⭐⭐⭐ |
| **自动下载**<br>`create()` 触发 | • 代码自动化 | • 阻塞执行<br>• 无进度显示<br>• 体验差 | ⭐⭐ |


---

## 🔧 API 使用示例

### Prompt API（对话生成）

```typescript
// 检查可用性
const capabilities = await window.ai.languageModel.capabilities();

if (capabilities.available === 'readily') {
  // 创建会话
  const session = await window.ai.languageModel.create({
    systemPrompt: '你是一个专注力助手'
  });
  
  // 发送提示词
  const response = await session.prompt('给我一句鼓励的话');
  console.log(response);
}
```

### Summarizer API（文本摘要）

```typescript
// 检查可用性
const status = await window.ai.summarizer.availability();

if (status === 'readily') {
  // 创建摘要器
  const summarizer = await window.ai.summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium'
  });
  
  // 生成摘要
  const summary = await summarizer.summarize('长文本内容...');
  console.log(summary);
}
```

---

## 💡 最佳实践

### 提示词优化

**✅ 推荐**
- 简洁明确的指令
- 单一任务请求
- 适中的输出长度（< 500 字）

**❌ 避免**
- 多步骤复杂任务
- 需要实时数据
- 超长文本生成

### 性能优化

- 首次调用：1-2 秒
- 后续调用：0.5-1 秒
- 使用流式输出提升体验
- 合理设置超时时间（30-60 秒）

---

## ❓ 常见问题

### Q: 为什么显示 "downloadable" 状态？
**A:** 模型未下载。访问 `chrome://components/` 手动触发下载。

### Q: 显示 "更新错误" 怎么办？
**A:** 
1. 检查网络连接

2. 手动触发模型下载
访问： chrome://components/
找到： "Optimization Guide On Device Model"
点击： 该条目下的 "检查是否有更新" 按钮
观察状态变化：
应该从 "更新错误" 变为 "正在下载..."
如果还是显示错误，继续下一步

3. 确认 Flags 已正确启用
检查并重新启用 Chrome Flags
访问： chrome://flags/#optimization-guide-on-device-model
设置为：Enabled BypassPerfRequirement
访问： chrome://flags/#summarization-api-for-gemini-nano
设置为：Enabled
重启 Chrome
再次访问 chrome://components/ 并点击 "检查是否有更新"

4. 如果还是失败，尝试清理并重试
在 Chrome 控制台（任意标签页 F12）执行：
```
// 清理可能的缓存问题
chrome.storage.local.clear()
// 然后重启 Chrome，再次尝试下载
```

5. 验证下载是否成功
下载完成后，chrome://components/ 应该显示：

Optimization Guide On Device Model
版本：2024.xx.xx.xxxx  (不再是 0.0.0.0)
状态：组件已更新
然后在控制台测试：
```
window.ai.summarizer.availability().then(console.log)
// 应该返回 "readily" 而不是 "downloadable"
```

### Q: 下载需要多久？
**A:** 模型约 1.5GB，通常 10-30 分钟（取决于网速）

### Q: 如何确认下载完成？
**A:** `chrome://components/` 中 "Optimization Guide On Device Model" 显示版本号（非 0.0.0.0）

### Q: 代码调用 create() 一直卡住？
**A:** 可能模型正在下载。建议先手动下载完成后再使用。

### Q: 需要为每个 API 单独下载模型吗？
**A:** 不需要！所有 Built-in AI API 共享同一个 Gemini Nano 模型。

### Q: 模型存储在哪？
**A:** Chrome 本地缓存，不占用项目空间

### Q: 需要联网吗？
**A:** 首次下载需要，之后完全离线可用

### Q: 设备要求？
**A:** 
- 内存：8GB+ RAM
- 存储：约 1.5GB
- CPU：现代多核处理器

---

## 📊 技术规格

- **模型**：Gemini Nano
- **大小**：~1.5GB
- **内存占用**：1-2GB RAM
- **响应延迟**：0.5-2 秒
- **离线可用**：✅
- **隐私保护**：✅ 完全本地运行
- **支持语言**：中文、英文、日文等

---

## 🔗 参考资料

- [Chrome Built-in AI 官方文档](https://developer.chrome.com/docs/ai/built-in?hl=zh-cn)
- [Prompt API 文档](https://developer.chrome.com/docs/ai/built-in-apis?hl=zh-cn#prompt_api)
- [Gemini Nano 介绍](https://deepmind.google/technologies/gemini/nano/)

---

## 🎯 快速测试

在 Console 中运行：

```javascript
// 测试 Prompt API
const session = await ai.languageModel.create();
await session.prompt('给我一句鼓励的话');

// 测试 Summarizer API
const summarizer = await ai.summarizer.create();
await summarizer.summarize('今天完成了3个任务，专注了120分钟');
```

---

**版本**: v1.1.0  
**更新日期**: 2025-10-31

# 🐱 悬浮组件测试指南

## 📋 测试步骤

### 1️⃣ 重新加载扩展（必须！）
```
1. 打开 chrome://extensions/
2. 找到「番茄猫 - Tomato Cat Timer」
3. 点击刷新图标 🔄

⚠️ 重要：每次构建后都必须刷新扩展！
```

### 2️⃣ 打开一个普通网页
```
⚠️ 重要：不要在以下页面测试：
- chrome:// 开头的页面（如 chrome://extensions/）
- edge:// 开头的页面
- 浏览器内置页面

✅ 建议测试页面：
- https://www.baidu.com
- https://www.google.com
- https://github.com
- 任何普通网站
```

### 3️⃣ 刷新测试页面
```
按 F5 或 Cmd+R 刷新页面
这样 Content Script 才会被注入到页面中
```

### 4️⃣ 打开侧边栏
```
点击浏览器工具栏上的番茄猫图标 🍅
侧边栏会从右侧滑出
```

### 5️⃣ 关闭侧边栏
```
点击侧边栏的关闭按钮 ×
侧边栏关闭后，页面右上角应该会出现悬浮组件
```

---

## 🔍 调试步骤

如果看不到悬浮组件，请按以下步骤调试：

### 步骤 1：检查 Console 日志

**打开页面的开发者工具：**
```
1. 在测试页面按 F12
2. 切换到 Console 标签
3. 查找以下日志：
   - 🍅 Tomato Cat - Content Script loaded
   - Content Script 收到消息: {type: 'SHOW_FLOATING_WIDGET'}
```

**打开 Service Worker 控制台：**
```
1. 打开 chrome://extensions/
2. 找到番茄猫扩展
3. 点击「Service Worker」旁边的「检查视图」
4. 查找以下日志：
   - 🐱 Background: Side panel closed, showing widget
   - 🐱 Sending SHOW_FLOATING_WIDGET to tab: xxx
```

**打开侧边栏控制台：**
```
1. 打开侧边栏
2. 在侧边栏页面右键 → 检查
3. 查找以下日志：
   - 🐱 Side panel opened
   - 🐱 Side panel closing
```

---

### 步骤 2：手动测试消息发送

**在页面 Console 中运行：**
```javascript
// 检查 Content Script 是否加载
console.log('Testing...')

// 手动触发显示悬浮组件
chrome.runtime.sendMessage({ type: 'SHOW_FLOATING_WIDGET' })
```

**在页面 Console 中检查元素：**
```javascript
// 检查悬浮组件容器是否存在
document.getElementById('tomato-cat-floating-widget')
```

---

### 步骤 3：检查页面权限

**某些页面不允许注入 Content Script：**
- ❌ chrome:// 页面
- ❌ edge:// 页面
- ❌ chrome.google.com/webstore
- ✅ 普通网站（http:// 或 https://）

---

## 🐛 常见问题

### Q1: 关闭侧边栏后没有看到悬浮组件
**原因：** Content Script 可能还没有加载
**解决：** 
1. 刷新页面（F5）
2. 确保不是在 chrome:// 页面
3. 打开控制台查看是否有错误

### Q2: 悬浮组件一闪而过
**原因：** 侧边栏可能又自动打开了
**解决：** 确保完全关闭侧边栏

### Q3: Console 显示 "Failed to send message"
**原因：** Content Script 还未注入
**解决：** 
1. 确认页面已刷新
2. 确认不是在受限页面
3. 重新加载扩展

---

## 📊 预期行为

### 正常流程：
```
1. 打开侧边栏
   → 页面上的悬浮组件隐藏（如果有的话）
   
2. 关闭侧边栏
   → 500ms 后，页面右上角出现悬浮组件
   
3. 点击悬浮组件
   → 侧边栏重新打开
   → 悬浮组件自动隐藏
   
4. 点击悬浮组件的 X 按钮
   → 悬浮组件隐藏（但不删除）
```

### 悬浮组件样式：
- 位置：页面右上角（top: 20px, right: 20px）
- 大小：宽度 320px，高度自适应
- 背景：白色半透明 + 毛玻璃效果
- 内容：猫咪图标 + 提示文案 + 倒计时 + 关闭按钮

---

## 💡 开发建议

**推荐测试环境：**
1. 新开一个普通网页（如 https://www.example.com）
2. 打开 3 个控制台同时查看日志：
   - 页面控制台（F12）
   - Service Worker 控制台
   - 侧边栏控制台
3. 观察日志流动，确认消息传递正常

**快速重置：**
```javascript
// 在页面 Console 中运行，移除悬浮组件
const widget = document.getElementById('tomato-cat-floating-widget')
if (widget) widget.remove()
```

---

## 📝 反馈

如果按照以上步骤仍然无法看到悬浮组件，请提供：
1. Console 中的完整错误日志
2. 测试的页面 URL
3. Chrome 版本号


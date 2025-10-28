# 🛠️ 开发指南

完整的番茄猫插件开发指南，包含从零开始到高级调试的所有内容。

---

## 🚀 快速开始

### 5 分钟上手

#### 第一步：安装依赖

```bash
npm install
npm run dev
```

**注意**：开发模式会启动 Vite 开发服务器，但由于这是 Chrome 插件，你需要手动构建并加载到浏览器中进行测试。

#### 第二步：构建插件

```bash
npm run build
```

构建完成后，你会看到 `dist/` 目录被创建。

#### 第三步：加载到 Chrome

1. 打开 Chrome 浏览器
2. 地址栏输入：`chrome://extensions/` 并回车
3. 开启右上角的 **「开发者模式」** 开关
4. 点击 **「加载已解压的扩展程序」**
5. 选择项目的 `dist` 目录（⚠️注意：不是项目根目录！）
```
❌ 错误：选择 ~/tomato
✅ 正确：选择 ~/tomato/dist
```
6. 看到番茄猫插件出现在列表中 ✅

#### 第四步：开始使用

**方式 1：点击插件图标（推荐）**
- 点击浏览器工具栏上的番茄猫图标（默认是拼图图标 🧩）
- 侧边栏会直接打开

**方式 2：固定到工具栏**
- 点击浏览器右上角的拼图图标 🧩
- 找到「番茄猫 - Tomato Cat Timer」
- 点击右侧的图钉 📌 固定到工具栏
- 图标会一直显示，更方便访问

**方式 3：右键菜单**
- 右键点击番茄猫图标
- 选择「打开侧边面板」

7. 修改代码后如何更新

每次修改代码后：

```bash
# 1. 重新构建
npm run build

# 2. 在 chrome://extensions/ 页面找到番茄猫
# 3. 点击「刷新」按钮（圆形箭头 ⟳）
# 4. 重新打开侧边栏查看更新
```

### 其他命令

```bash
npm run format      # 格式化代码
npm run lint        # 检查代码规范
npm run lint:fix    # 自动修复规范问题
npm run type-check  # TypeScript 类型检查
npm run clean       # 清理构建产物
```

### 📁 dist 目录结构

正确的 dist 目录应该包含：

```
dist/
├── manifest.json          ← 必须存在！
├── index.html            ← 侧边栏页面
├── background.js         ← 后台服务
└── assets/
    ├── *.js              ← 编译后的 JavaScript
    └── *.css             ← 编译后的样式
```

---

## 🐛 调试技巧

### 1. 查看 Service Worker 日志

1. 访问 `chrome://extensions/`
2. 找到番茄猫插件
3. 点击「Service Worker」链接
4. 打开 DevTools 查看后台日志

### 2. 调试侧边栏/弹窗

在侧边栏或弹窗中：
1. 右键点击空白区域
2. 选择「检查」
3. 打开 DevTools 进行调试

### 3. 查看存储数据

在 DevTools Console 中执行：
```javascript
chrome.storage.local.get(null, (data) => console.log(data))
```

### 4. 清空存储数据

```javascript
chrome.storage.local.clear()
```

### ⚠️ 重要：清除旧数据

当你更新了默认配置（如番茄钟时长）后，Chrome Storage 中可能仍保留旧数据，导致配置不生效。需要手动清除存储数据：

#### 快速清除方法

**步骤：**

1. **刷新插件**
   - 访问 `chrome://extensions/`
   - 点击番茄钟插件的刷新图标 🔄

2. **打开插件侧边栏**
   - 点击插件图标打开侧边栏

3. **打开开发者工具**
   - 在侧边栏空白处 **右键点击**
   - 选择 **"检查"** 或 **"Inspect"**

4. **执行清除命令**
   - 在 Console 标签页中，输入以下命令：
   
   ```javascript
   chrome.storage.local.clear(() => location.reload())
   ```
   
   - 按 **回车键**

5. **验证**
   - 页面会自动刷新
   - 所有设置恢复为代码中的默认值

#### 常见需要清除数据的情况

- ✅ 修改了默认番茄钟时长（如调试时改为 10 秒）
- ✅ 更新了默认设置项
- ✅ 数据结构发生变化
- ✅ 出现 `NaN` 或 `undefined` 等异常显示
- ✅ 功能行为与预期不符

#### 仅更新设置（保留任务数据）

如果只想更新设置而保留任务数据：

```javascript
chrome.storage.local.set({
  settings: {
    workDuration: 10 / 60, // 10秒用于调试
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
  console.log('Settings updated!')
  location.reload()
})
```

---

## ❓ 常见错误解决

### 错误 1：清单文件缺失或不可读取

**原因**：你加载的是项目根目录而不是 dist 目录

**解决**：
```
❌ ~/shanshan/code/tomato  （错误）
✅ ~/shanshan/code/tomato/dist  （正确）
```

### 错误 2：dist 目录不存在

**原因**：还没有运行构建命令

**解决**：
```bash
cd ~/shanshan/code/tomato
npm run build
```

### 错误 3：Service Worker 注册失败

**原因**：background.js 加载失败

**解决**：
1. 点击插件的「Service Worker」链接查看错误
2. 检查控制台中的错误信息
3. 重新构建项目

### 错误 4：任务时间显示 NaN:NaN

**原因**：Chrome Storage 中有旧的数据结构

**解决**：
参考上面的「清除旧数据」部分，执行清除命令。

### 错误 5：倒计时仍然是 25 分钟

**原因**：Chrome Storage 中保留了旧的设置

**解决**：
1. 确认代码中 `workDuration` 已设为 `10 / 60`
2. 清除 Chrome Storage（参考「清除旧数据」）
3. 刷新插件

### 错误 6：侧边栏打不开

**原因**：manifest.json 配置或权限问题

**解决**：
1. 检查插件是否已启用（开关是打开状态）
2. 确认 manifest.json 中的 `side_panel` 配置正确
3. 查看 Service Worker 是否有错误
4. 尝试刷新插件

---

## 🔍 开发注意事项

### Manifest V3

本项目使用 Chrome Extension Manifest V3：
- 使用 Service Worker 而非 Background Page
- 使用 `chrome.alarms` 而非 `setTimeout`
- 需要明确声明所有权限

### 热重载

Chrome 插件不支持完全的热重载。每次修改后需要：
1. 重新构建 (`npm run build`)
2. 刷新插件
3. 重新打开侧边栏

### TypeScript 配置

- 启用了严格模式
- 使用路径别名 `@/` 指向 `src/`
- 包含 Chrome 类型定义

### 数据持久化

- 所有任务和设置自动保存到 Chrome Storage
- 关闭浏览器再打开，数据依然在
- 数据存储在本地，安全可靠
- 不要清除浏览器数据时选择"扩展程序数据"

---

## 🎯 快速验证清单

在加载插件前，确保：

- [ ] 已运行 `npm install` 安装依赖
- [ ] 已运行 `npm run build` 构建项目
- [ ] `dist` 目录存在
- [ ] `dist/manifest.json` 文件存在
- [ ] 在 Chrome 中选择的是 `dist` 目录

---

## 📝 代码规范

### 提交规范

使用 Conventional Commits：
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具链更新
```

### 代码格式化

```bash
npm run format      # 格式化代码
npm run lint        # 检查代码规范
npm run lint:fix    # 自动修复规范问题
```

---

## 📚 资源链接

- [Chrome Extension 文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/migrating/)
- [React 文档](https://react.dev/)
- [Zustand 文档](https://docs.pmnd.rs/zustand/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [Vite 文档](https://vitejs.dev/)

---

## 💡 提示

- 开发时可以使用 `npm run build:watch` 自动构建（如果配置了）
- 每次更新只需刷新插件，不需要重新加载
- 固定插件到工具栏方便快速访问
- 遇到问题先查看 Service Worker 和 Console 日志

---

Happy Coding! 🍅🐱

# 🍅🐱 番茄猫 - Tomato Cat Timer

基于番茄工作法的学习工作陪伴 Chrome 插件，可爱的猫咪陪你专注每一刻。

## ✨ 特性

- 🍅 **番茄工作法**：科学的时间管理，25 分钟工作 + 5 分钟休息
- 🐱 **猫咪陪伴**：可爱的虚拟猫咪，根据状态变化表情和对话
- 📝 **任务管理**：清晰的任务清单，支持优先级和状态管理
- 📊 **数据统计**：记录专注时长和任务完成情况
- 🎨 **现代设计**：温暖的番茄红 + 奶油白配色，圆润可爱的界面
- 🤖 **AI 增强**：（开发中）智能生成鼓励语、日报总结等

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5.x
- **状态管理**：Zustand
- **样式方案**：TailwindCSS
- **动画库**：Framer Motion
- **图标库**：Lucide React

## 📦 安装依赖

```bash
npm install

## 🚀 开发

```bash
npm run dev
```

构建插件：

```bash
npm run build
```

构建完成后，在 Chrome 浏览器中：
1. 打开 `chrome://extensions/`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目的 `dist` 目录
5. 点击插件图标（或拼图图标 🧩 → 番茄猫）即可打开侧边栏

## 📁 项目结构

```
tomato/
├── index.html          # 主页面入口（侧边栏）
├── public/             # 静态资源
│   └── manifest.json   # Chrome 插件配置
├── src/
│   ├── components/     # React 组件
│   │   ├── BigTimer.tsx       # 番茄钟计时器
│   │   ├── CurrentTask.tsx    # 当前任务显示
│   │   ├── TaskListNew.tsx    # 任务列表
│   │   └── ModeSelector.tsx   # 模式选择器
│   ├── pages/         # 页面组件
│   │   ├── App.tsx    # 主应用组件
│   │   └── main.tsx   # React 入口
│   ├── store/         # Zustand 状态管理
│   │   ├── useTimerStore.ts     # 计时器状态
│   │   ├── useTaskStore.ts      # 任务状态
│   │   └── useSettingsStore.ts  # 设置状态
│   ├── utils/         # 工具函数
│   ├── types/         # TypeScript 类型
│   ├── styles/        # 全局样式
│   └── background/    # Service Worker
│       └── index.ts   # 后台服务
├── doc/               # 项目文档
├── dist/              # 构建输出
└── ...配置文件
```

## 🎯 核心功能

### 1. 番茄钟
- 自定义工作时长（默认 25 分钟）
- 自定义休息时长（短休息 5 分钟，长休息 15 分钟）
- 暂停、继续、重置功能
- 完成提醒通知

### 2. 任务清单
- 添加、编辑、删除任务
- 任务状态管理（待办/进行中/已完成）
- 任务优先级标记
- 番茄钟计数

### 3. 猫咪陪伴
- 根据状态显示不同表情和对话
- 呼吸动画效果
- 随机鼓励语句

### 4. 数据持久化
- 使用 Chrome Storage API 保存数据
- 自动同步任务和设置

## 💡 使用技巧

### 番茄工作法原则

1. **选择任务** - 挑选一个要完成的任务
2. **开始专注** - 设置 25 分钟倒计时
3. **专心工作** - 直到计时器响起
4. **短暂休息** - 休息 5 分钟
5. **重复循环** - 每 4 个番茄钟后，休息 15-30 分钟

### 基本操作

#### 1. 添加任务
在任务清单区域：
- 输入任务名称
- 点击「Add Task」按钮或按回车添加

#### 2. 开始番茄钟
- 点击任务选中它（左边框变红，背景变灰）
- 点击「START」按钮
- 专心工作！（默认 10 秒用于调试）

#### 3. 暂停/重置
- 工作中可以随时「PAUSE」
- 点击跳过图标可以结束当前番茄钟

#### 4. 完成任务
- 点击任务前的复选框标记为完成
- 已完成的任务会显示删除线和灰色文字

#### 5. 删除任务
- 点击任务右侧的三个点
- 选择「Delete」

## 📊 状态管理

使用 Zustand 进行状态管理，分为三个 Store：

### useTimerStore
管理番茄钟状态：
- 计时器状态（idle/running/paused/break）
- 剩余时间
- 番茄数计数

### useTaskStore
管理任务列表：
- 任务列表
- 当前选中任务
- 任务 CRUD 操作

### useSettingsStore
管理用户设置：
- 番茄钟时长配置
- 音效和通知开关
- 主题和语言设置

## 💾 数据持久化

使用 Chrome Storage API 存储数据：
- 自动保存任务列表
- 保存用户设置
- 保存统计数据

**工具函数**: `src/utils/storage.ts`

## 🔮 开发路线图

- [x] Phase 1: 基础框架搭建 + 番茄钟核心功能
- [ ] Phase 2: 完善任务清单功能
- [ ] Phase 3: 优化猫咪 UI 和动画
- [ ] Phase 4: 集成 Google AI API
- [ ] Phase 5: 数据统计和可视化

## 📝 注意事项

### 更多文档

详细文档位于 `doc/` 目录：
- `DEVELOPMENT.md` - 完整开发指南（包含快速开始和加载教程）
- `HOW_TO_VIEW_COMPONENTS.md` - 组件查看和调试指南
- `PROJECT_SUMMARY.md` - 项目总结
- `TODO.md` - 开发任务清单
- `CHANGELOG.md` - 版本更新日志

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

## 💖 致谢

感谢所有为开源社区做出贡献的开发者们！

---

Made with ❤️ and 🍅


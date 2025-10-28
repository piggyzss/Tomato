# 📁 项目结构说明

## 总览

```
tomato/
├── index.html              # 主页面入口（侧边栏）
├── public/                 # 静态资源
│   └── manifest.json       # Chrome 插件配置
├── src/                    # 源代码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   ├── styles/            # 样式文件
│   └── background/        # 后台服务
├── doc/                   # 项目文档
├── dist/                  # 构建输出
└── ...配置文件
```

---

## 详细说明

### 📄 根目录文件

#### `index.html`
- **作用：** 主页面 HTML 入口
- **用途：** 侧边栏（Side Panel）的 HTML 模板
- **说明：** 点击插件图标时加载的页面

#### `public/manifest.json`
- **作用：** Chrome 扩展配置文件
- **关键配置：**
  - `side_panel.default_path`: 指向 `index.html`
  - `background.service_worker`: 后台服务 `background.js`
  - `permissions`: 权限列表（storage, sidePanel, alarms, notifications）

---

### 📂 src/ 源代码目录

#### `src/components/` - React 组件

```
components/
├── BigTimer.tsx           # 番茄钟主计时器
│   ├─ 倒计时显示
│   ├─ START/PAUSE/RESET 控制
│   ├─ 状态持久化
│   └─ 任务时间追踪
│
├── CurrentTask.tsx        # 当前任务显示组件
│   └─ 显示正在工作的任务
│
├── TaskListNew.tsx        # 任务列表组件
│   ├─ 任务列表展示
│   ├─ 添加任务
│   ├─ 完成任务（复选框）
│   ├─ 删除任务（三个点菜单）
│   └─ 任务时间显示
│
└── ModeSelector.tsx       # 模式选择器（已移除显示）
    └─ Pomodoro/休息模式切换
```

#### `src/pages/` - 页面组件

```
pages/
├── App.tsx               # 主应用组件
│   ├─ 组合所有子组件
│   ├─ 加载和保存数据
│   └─ 全局状态管理
│
└── main.tsx             # React 入口文件
    └─ 渲染 App 到 DOM
```

#### `src/store/` - Zustand 状态管理

```
store/
├── useTimerStore.ts      # 计时器状态
│   ├─ status: 'idle' | 'running' | 'paused'
│   ├─ remainingSeconds: 剩余秒数
│   └─ 计时器操作方法
│
├── useTaskStore.ts       # 任务状态
│   ├─ tasks: Task[]
│   ├─ currentTaskId: 当前选中任务
│   └─ 任务 CRUD 操作
│
└── useSettingsStore.ts   # 设置状态
    ├─ workDuration: 番茄钟时长
    ├─ 休息时长配置
    └─ 通知、音效等开关
```

#### `src/utils/` - 工具函数

```
utils/
├── storage.ts            # Chrome Storage API 封装
│   ├─ getStorage() - 读取数据
│   └─ setStorage() - 保存数据
│
└── time.ts              # 时间格式化工具
    └─ formatTime() - 秒数转 MM:SS
```

#### `src/types/` - TypeScript 类型定义

```
types/
└── index.ts             # 全局类型定义
    ├─ Task - 任务类型
    ├─ TimerStatus - 计时器状态
    ├─ UserSettings - 用户设置
    └─ 其他接口
```

#### `src/styles/` - 样式文件

```
styles/
└── global.css           # 全局样式
    ├─ TailwindCSS 导入
    ├─ Google Fonts
    └─ 自定义样式
```

#### `src/background/` - 后台服务

```
background/
└── index.ts             # Service Worker
    ├─ 监听插件安装
    ├─ 处理消息通信
    ├─ 发送桌面通知
    ├─ 管理定时器
    └─ 保持活跃
```

---

### 📚 doc/ 文档目录

```
doc/
├── DEVELOPMENT.md              # 开发指南
├── HOW_TO_VIEW_COMPONENTS.md   # 组件查看和调试
├── PROJECT_STRUCTURE.md        # 本文件（项目结构）
├── PROJECT_SUMMARY.md          # 项目总结
├── TODO.md                     # 任务清单
└── CHANGELOG.md                # 更新日志
```

---

### 🏗️ dist/ 构建输出目录

```
dist/
├── manifest.json        # 复制的插件配置
├── index.html          # 编译后的主页面
├── background.js       # 编译后的后台服务
└── assets/            # 静态资源
    ├── index-[hash].js   # 编译后的主 JS
    ├── index-[hash].css  # 编译后的样式
    └── ...其他资源
```

**加载插件时选择 `dist` 目录**

---

## 🔄 数据流

```
用户操作
  ↓
React 组件 (src/components/)
  ↓
Zustand Store (src/store/)
  ↓
Chrome Storage API (src/utils/storage.ts)
  ↓
持久化存储

Background Service Worker (src/background/)
  ↓
通知、定时器等后台任务
```

---

## 📦 构建流程

```
npm run build
  ↓
1. TypeScript 编译 (tsc)
2. Vite 构建
   ├─ 处理 index.html
   ├─ 编译 React/TS 代码
   ├─ 打包 background.js
   └─ 复制 manifest.json
  ↓
生成 dist/ 目录
  ↓
加载到 Chrome
```

---

## 🎯 关键文件说明

| 文件 | 作用 | 重要性 |
|------|------|--------|
| `index.html` | 侧边栏页面入口 | ⭐⭐⭐ |
| `manifest.json` | 插件配置 | ⭐⭐⭐ |
| `background/index.ts` | 后台服务 | ⭐⭐⭐ |
| `pages/App.tsx` | 主应用组件 | ⭐⭐⭐ |
| `components/BigTimer.tsx` | 主计时器 | ⭐⭐⭐ |
| `components/TaskListNew.tsx` | 任务列表 | ⭐⭐⭐ |
| `store/useTimerStore.ts` | 计时器状态 | ⭐⭐ |
| `store/useTaskStore.ts` | 任务状态 | ⭐⭐ |
| `utils/storage.ts` | 存储工具 | ⭐⭐ |
| `vite.config.ts` | 构建配置 | ⭐ |

---

## 🚀 快速定位

### 修改主应用组件
→ `src/pages/App.tsx`

### 修改计时器逻辑
→ `src/components/BigTimer.tsx`

### 修改任务列表
→ `src/components/TaskListNew.tsx`

### 修改状态管理
→ `src/store/useTimerStore.ts` 或 `useTaskStore.ts`

### 修改后台服务
→ `src/background/index.ts`

### 修改插件配置
→ `public/manifest.json`

### 修改构建配置
→ `vite.config.ts`

---

Happy Coding! 🍅🐱

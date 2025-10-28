1、产品简介
基于番茄钟功能的一款学习工作陪伴chrome插件
它结合了时间管理（Pomodoro Technique）+ 可爱交互（虚拟猫咪）+ AI 功能

2、产品功能
一个以「番茄工作法」为核心、结合猫咪陪伴与任务清单的 Chrome 插件。
打开插件时，以 浏览器右侧抽屉面板（side panel） 展示主要界面。
┌──────────────────────────────┐
│ 🐱 LOGO区（番茄猫头像 + 名称） │
│──────────────────────────────│
│ ⏰ 番茄钟模块（倒计时 + 控制按钮） │
│──────────────────────────────│
│ 🗒️ 任务清单模块（任务列表 + 编辑） │
│──────────────────────────────│
│ 💭 猫咪语气区（提示/鼓励/对话） │
│──────────────────────────────│
│ ⚙️ 底部导航（设置 | 历史数据 | AI模式） │
└──────────────────────────────┘

3、界面风格
主色调	番茄红 (#FF6347) + 奶油白 (#FFF9F3)
字体	Rounded / 可爱风格（如 Poppins Rounded）
动效	柔和缩放 + 猫咪呼吸动效
圆角风格	统一使用 border-radius: 16px
阴影	阴影轻柔、温暖风格（box-shadow: 0 2px 8px rgba(0,0,0,0.1))


4、功能逻辑流程图

[用户点击插件图标]
       ↓
[抽屉面板展开]
       ↓
[显示猫咪问候语] → AI生成
       ↓
[任务列表] → 用户选择当前任务
       ↓
[点击开始]
       ↓
[倒计时运行中]
       ↓
[时间结束] → 猫咪提醒休息
       ↓
[更新任务状态]
       ↓
[继续下一轮 or 进入总结模式（如每天固定晚上八点）]

5、Google AI API 的集成思路
模块	功能名称	使用的 Google AI API	主要场景
AI 提示引擎	Prompt 模块	Prompt API	动态生成猫咪提示语、任务描述、对话内容（支持语音/图像输入）
AI 日报总结	Summarizer 模块	Summarizer API	分析用户浏览内容（例如编程页面 / 新闻 / 社交媒体），每日自动生成工作总结、学习日报
AI 多语言猫	Translator 模块	Translator API	支持中英日等多语言互动、语音切换
AI 作文猫	Writer 模块	Writer API	为用户生成激励语、任务计划、诗句

6、技术栈
前端框架	React 18 + TypeScript
构建工具	Vite 5.x
状态管理	Zustand（轻量级状态管理）
样式方案	TailwindCSS + CSS Modules
UI组件	自定义组件 + Lucide React Icons
数据存储	Chrome Storage API（chrome.storage.local）
AI集成	Google AI SDK + Chrome Built-in AI APIs
动画库	Framer Motion
时间处理	date-fns

7、数据存储方案
用户配置数据	番茄钟时长、休息时长、音效开关、主题设置
任务列表数据	任务名称、状态、创建时间、完成时间、关联番茄数
统计数据	每日完成番茄数、任务完成数、累计专注时长
AI对话历史	最近10条猫咪对话记录

8、开发规范
代码风格	ESLint + Prettier
提交规范	Conventional Commits
组件命名	PascalCase（组件）、camelCase（函数）
文件组织	按功能模块划分

9、项目结构
```
tomato/
├── src/
│   ├── components/     # 公共组件
│   ├── pages/         # 页面（sidepanel、popup、options）
│   ├── hooks/         # 自定义 Hooks
│   ├── store/         # Zustand 状态管理
│   ├── utils/         # 工具函数
│   ├── services/      # API 服务
│   ├── assets/        # 静态资源
│   └── types/         # TypeScript 类型定义
├── public/
│   ├── icons/         # 插件图标
│   └── manifest.json  # Chrome 插件配置
└── dist/              # 构建输出
```

10、核心功能实现细节

10.1 番茄钟模块
- 支持自定义工作时长（默认 25 分钟）
- 支持自定义休息时长（短休息 5 分钟，长休息 15 分钟）
- 倒计时精确到秒
- 支持暂停、继续、重置
- 完成时播放提示音效
- 后台运行时使用 Chrome Alarms API

10.2 任务清单模块
- 支持添加、编辑、删除任务
- 支持任务状态切换（待办/进行中/已完成）
- 支持任务优先级标记
- 支持拖拽排序
- 关联番茄钟记录

10.3 猫咪陪伴模块
- 根据不同状态显示不同表情（工作中/休息中/完成）
- 呼吸动画效果
- 随机鼓励语句（可选 AI 生成）
- 点击互动反馈

10.4 数据统计模块
- 每日番茄数统计
- 专注时长趋势图
- 任务完成率分析
- 周/月数据对比

11、Chrome 插件配置要点
manifest版本	Manifest V3
权限申请	storage、sidePanel、alarms、notifications
侧边栏配置	default_path: sidepanel.html
后台服务	service_worker（用于定时器和通知）

12、开发里程碑
Phase 1	基础框架搭建 + 番茄钟核心功能（Week 1）
Phase 2	任务清单 + 数据持久化（Week 2）
Phase 3	猫咪 UI + 动画效果（Week 3）
Phase 4	AI 功能集成（Week 4）
Phase 5	数据统计 + 优化完善（Week 5）
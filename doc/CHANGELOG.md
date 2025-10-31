# 更新日志

## v0.2.2 - 2024-10-31

### 🐛 Bug 修复

#### Chat Cat 消息发送问题
- ✅ 修复 `buildInAiService.ts` 中的 JSX 注释语法错误
- ✅ 修复 `session.prompt()` 调用方式，改为直接传递字符串而非数组
- ✅ 简化 `createChatSession()` 配置，使用标准的 `systemPrompt` 参数
- ✅ 移除不必要的复杂配置（expectedOutputs, initialPrompts 等）

### 🔧 架构优化

#### AI 状态管理重构
- ✅ 移除 AI/index.tsx 中未使用的 apiStatus 状态和 useEffect
- ✅ 添加加载状态显示，提升用户体验
- ✅ 导出 `AIAPIStatus` 类型供其他组件使用

#### 代码规范优化
- ✅ 统一所有相对路径导入为 `@/` 绝对路径（共 20 个文件）
- ✅ 提升代码可维护性和可读性
- ✅ 遵循单一职责原则，服务层负责数据获取

## v0.2.1 - 2024-10-31

### 🎨 功能优化

#### AI Insights 与 AI Summary 区分
- ✅ **AI Insights（AI 建议）**：专注于生成可操作的生产力建议
  - 提供时间管理策略
  - 任务优先级技巧
  - 休息和能量管理建议
  - 专注力提升方法
- ✅ **AI Summary（AI 总结）**：提供整体的激励性总结
  - 全面回顾当天表现
  - 包含统计数据和默认 insights
  - 更详细的叙述性总结
- ✅ 两个功能使用不同的 prompt，避免内容重复
- ✅ 优化默认 insights 文案，引导用户使用 AI 功能

### 🔧 技术改进
- 新增 `buildInsightsPrompt()` 函数用于生成建议型 prompt
- 新增 `generateInsights()` 函数专门处理建议生成
- 保持 `buildPresetSummaryText()` 和 `generateSummary()` 用于总结功能

## v0.2.0 - 2024-10-31

### 🎉 新功能

#### 历史数据管理
- ✅ 自动每日归档：每天零点自动归档当天数据并重置
- ✅ 历史数据存储：保留最近 90 天的历史记录
- ✅ 历史数据查看：在分析面板中查看过往表现
- ✅ 跨天检测：启动时自动检测并处理跨天情况
- ✅ 计时器重置：归档时自动重置计时器状态到初始状态

#### AI 模式管理优化
- ✅ 修复 aiModePreference 值不正确的问题
- ✅ 首次安装时智能设置默认 AI 模式
- ✅ 启动时自动同步 AI 配置到服务
- ✅ 显示实际使用的 AI provider
- ✅ 自动降级提示和警告

### 🔧 技术改进

#### 数据结构
- 新增 `DailyHistory` 类型定义
- 扩展 `StorageData` 支持历史数据和重置日期
- 添加 `unlimitedStorage` 权限支持更大存储
- 优化 `DailyHistory` 结构，删除冗余的 `statistics.date` 字段
- 为所有核心类型添加详细的 JSDoc 注释（Task, PomodoroRecord, Statistics 等）

#### 核心模块
- 新增 `historyManager.ts` 历史数据管理工具
- 更新 `background/index.ts` 支持每日定时任务
- 更新 `App.tsx` 支持跨天检测和 AI 初始化
- 更新 `AIConfiguration.tsx` 显示实际 AI 状态

#### 新组件
- `HistoryView.tsx`: 历史数据查看组件
- 更新 `AnalysisMainMenu.tsx`: 添加历史记录入口

### 📝 文档
- 新增 `HISTORY_MANAGEMENT.md`: 历史数据管理功能文档
- 新增 `TYPE_DEFINITIONS.md`: 详细的类型定义文档
- 新增 `DEBUG_RESET_ISSUE.md`: 重置功能调试指南
- 新增 `TESTING_RESET.md`: 重置功能测试指南
- 更新 `CHANGELOG.md`: 更新日志

### 🐛 Bug 修复
- 修复 AI 模式偏好设置不生效的问题
- 修复 AI 模式与实际使用不一致的问题
- 修复首次安装时缺少默认配置的问题

### 🎨 UI 改进
- AI 配置页面显示当前状态和实际 provider
- 历史记录页面美化，支持日期格式化

---

## v0.1.0 - 2024-10-30

### 初始版本
- 番茄钟计时器
- 任务管理
- AI 助手集成
- 数据分析
- 主题切换
- 多语言支持

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划中
- 数据统计和可视化图表
- Google AI API 集成
- 音效系统
- 深色模式支持
- 多语言切换（中文/英文/日文）
- 数据导出/导入功能
- 云端同步（可选）

## [0.1.0] - 2024-01-XX

### 新增
- ✨ 基础项目框架搭建
- 🍅 番茄钟核心功能
  - 25 分钟工作倒计时
  - 暂停/继续/重置功能
  - 圆形进度条显示
  - 倒计时结束通知
- 🐱 猫咪陪伴功能
  - 可爱的猫咪头像
  - 根据状态变化的对话气泡
  - 呼吸动画效果
- 📝 任务清单管理
  - 添加/编辑/删除任务
  - 任务状态切换（待办/已完成）
  - 任务优先级标记
  - 番茄数统计
- 💾 数据持久化
  - 使用 Chrome Storage API
  - 自动保存任务和设置
- 🎨 UI/UX
  - 番茄红 + 奶油白配色方案
  - 响应式布局
  - 流畅的过渡动画
- 🏗️ 技术架构
  - React 18 + TypeScript
  - Vite 5.x 构建工具
  - Zustand 状态管理
  - TailwindCSS 样式方案
  - Framer Motion 动画库

### 技术细节
- Chrome Extension Manifest V3
- 侧边栏面板（Side Panel）支持
- Service Worker 后台处理
- Chrome Alarms API 定时器
- Chrome Notifications API 通知

### 开发工具
- ESLint + Prettier 代码规范
- TypeScript 类型检查
- 热重载开发环境
- 图标生成脚本

---

## 版本说明

### [未发布]
- 正在开发中的功能

### [0.1.0]
- 初始版本，包含基础功能

---

📝 注意：版本号格式为 [主版本号.次版本号.修订号]
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正


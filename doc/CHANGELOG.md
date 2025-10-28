# 更新日志

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


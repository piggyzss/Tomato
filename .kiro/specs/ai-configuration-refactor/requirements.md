# Requirements Document

## Introduction

重构 AIConfiguration 组件，将其拆分为两个独立的子组件：BuiltInAIConfiguration 和 CloudAIConfiguration。这样可以提高代码的可维护性、可读性和可测试性，同时保持现有功能不变。

## Glossary

- **AIConfiguration**: 主配置组件，负责模式切换和渲染对应的子组件
- **BuiltInAIConfiguration**: 内置 AI 配置子组件，显示 Chrome 内置 AI 的状态和可用性检查
- **CloudAIConfiguration**: 云端 AI 配置子组件，显示云端 AI 的状态和设置选项
- **AvailabilityCheck**: 可用性检查组件，用于检测 Gemini Nano 的可用性
- **checkAvailability**: 检查 Chrome AI 可用性的工具函数

## Requirements

### Requirement 1

**User Story:** 作为开发者，我希望将 AIConfiguration 组件拆分为更小的子组件，以便更容易维护和测试代码

#### Acceptance Criteria

1. WHEN 重构完成后，THE AIConfiguration 组件 SHALL 只负责模式切换和子组件渲染
2. THE BuiltInAIConfiguration 组件 SHALL 包含所有内置 AI 相关的 UI 和逻辑
3. THE CloudAIConfiguration 组件 SHALL 包含所有云端 AI 相关的 UI 和逻辑
4. THE 重构后的组件 SHALL 保持与原组件完全相同的功能和用户体验

### Requirement 2

**User Story:** 作为开发者，我希望共享的工具函数和组件被提取到独立文件中，以便在多个组件中复用

#### Acceptance Criteria

1. THE checkAvailability 函数 SHALL 被提取到独立的工具文件中
2. THE AvailabilityCheck 组件 SHALL 被提取到独立的组件文件中
3. WHEN 其他组件需要使用这些功能时，THE 系统 SHALL 允许通过导入来复用

### Requirement 3

**User Story:** 作为用户，我希望重构后的界面与之前完全一致，不影响我的使用体验

#### Acceptance Criteria

1. THE 重构后的组件 SHALL 保持相同的视觉样式和布局
2. THE 模式切换功能 SHALL 继续正常工作
3. THE 用户偏好保存和加载 SHALL 继续正常工作
4. THE 所有状态显示和交互 SHALL 与重构前保持一致

### Requirement 4

**User Story:** 作为开发者，我希望组件之间的依赖关系清晰明确，便于理解代码结构

#### Acceptance Criteria

1. THE AIConfiguration 组件 SHALL 通过 props 向子组件传递必要的回调函数
2. THE 子组件 SHALL 接收明确定义的 props 接口
3. THE 组件文件结构 SHALL 遵循项目的组织规范
4. THE 每个组件文件 SHALL 只包含与其职责相关的代码

# 公共弹框组件

## ModalWithClose - 一级弹框组件

右上角带关闭按钮的弹框，用于主菜单页面。

### 使用示例

```tsx
import { ModalWithClose } from '@/components/Common'

function MyMainMenu({ onClose }: { onClose?: () => void }) {
  return (
    <ModalWithClose
      title="⚙️ Settings"
      subtitle="Customize your Tomato experience"
      onClose={onClose}
    >
      {/* 你的内容 */}
      <div className="space-y-4 mt-4">
        <p>Main menu content here...</p>
      </div>
    </ModalWithClose>
  )
}
```

### Props

- `title`: string - 标题（必填）
- `subtitle`: string - 副标题（可选）
- `onClose`: () => void - 关闭回调（可选）
- `children`: ReactNode - 内容区域（必填）

---

## ModalWithBack - 二级弹框组件

左上角带返回按钮的弹框，用于子页面。

### 使用示例

```tsx
import { ModalWithBack } from '@/components/Common'

function MySubPage({ onBack }: { onBack: () => void }) {
  return (
    <ModalWithBack
      title="Timer Settings"
      subtitle="Customize your Pomodoro durations"
      onBack={onBack}
    >
      {/* 你的内容 */}
      <div className="space-y-6 mt-4">
        <p>Sub page content here...</p>
      </div>
    </ModalWithBack>
  )
}
```

### Props

- `title`: string - 标题（必填）
- `subtitle`: string - 副标题（可选）
- `onBack`: () => void - 返回回调（必填）
- `children`: ReactNode - 内容区域（必填）

---

## 特性

- ✅ 自动适配主题（light/dark）
- ✅ Sticky header，滚动时固定在顶部
- ✅ 统一的样式和间距
- ✅ 响应式设计
- ✅ 无需手动管理 header 样式

## 注意事项

1. 内容区域建议添加 `mt-4` 来与 header 保持间距
2. 组件会自动从 `useSettingsStore` 获取当前主题
3. Header 会自动 sticky 在顶部，无需额外配置

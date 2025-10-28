import { useTaskStore } from '@/store/useTaskStore'

export function CurrentTask() {
  const { tasks, currentTaskId } = useTaskStore()
  const currentTask = tasks.find(t => t.id === currentTaskId)

  if (!currentTask) {
    return (
      <div className="text-center py-5">
        <div className="text-white/50 text-xs mb-1.5 uppercase tracking-widest font-semibold">Working On</div>
        <div className="text-white/70 font-medium">Select a task to start</div>
      </div>
    )
  }

  return (
    <div className="text-center py-5">
      <div className="text-white/70 text-xs mb-1.5 uppercase tracking-widest font-semibold">Working On</div>
      <div className="text-white text-lg font-semibold">{currentTask.title}</div>
    </div>
  )
}


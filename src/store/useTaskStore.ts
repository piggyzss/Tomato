import type { Task } from '@/types'
import { create } from 'zustand'

interface TaskState {
  tasks: Task[]
  currentTaskId: string | null

  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setCurrentTask: (id: string | null) => void
  setTasks: (tasks: Task[]) => void
}

export const useTaskStore = create<TaskState>(set => ({
  tasks: [],
  currentTaskId: null,

  addTask: taskData =>
    set(state => ({
      tasks: [
        ...state.tasks,
        {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        },
      ],
    })),

  updateTask: (id, updates) =>
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  deleteTask: id =>
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id),
      currentTaskId: state.currentTaskId === id ? null : state.currentTaskId,
    })),

  setCurrentTask: id => set({ currentTaskId: id }),

  setTasks: tasks => set({ tasks }),
}))

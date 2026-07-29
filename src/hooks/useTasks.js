import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

let nextId = Date.now()
let nextSubtaskId = Date.now() + 1000000

export const CATEGORIES = [
  { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30', dot: 'bg-blue-500' },
  { value: 'personal', label: 'Personal', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/30', dot: 'bg-purple-500' },
  { value: 'health', label: 'Health', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/30', dot: 'bg-emerald-500' },
  { value: 'learning', label: 'Learning', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30', dot: 'bg-amber-500' },
  { value: 'finance', label: 'Finance', color: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/30', dot: 'bg-rose-500' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', dot: 'bg-slate-400' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

export const RECURRING_OPTIONS = [
  { value: null, label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function createTask(text, priority = 'medium', category = 'other', dueDate = null, notes = '', subtasks = [], recurring = null) {
  return {
    id: String(nextId++),
    text,
    completed: false,
    priority,
    category,
    dueDate,
    notes,
    subtasks,
    recurring,
    status: 'todo',
    order: nextId,
    createdAt: Date.now(),
  }
}

export function createSubtask(text) {
  return { id: String(nextSubtaskId++), text, completed: false }
}

function computeNextDueDate(recurring, currentDue) {
  if (!recurring || !currentDue) return null
  const d = new Date(currentDue + 'T00:00:00')
  switch (recurring) {
    case 'daily':
      d.setDate(d.getDate() + 1)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    default:
      return null
  }
  return d.toISOString().split('T')[0]
}

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage('todo-tasks-v3', [])

  const addTask = useCallback(
    (text, priority, category, dueDate, notes, subtasks, recurring) => {
      setTasks((prev) => [createTask(text, priority, category, dueDate, notes, subtasks || [], recurring), ...prev])
    },
    [setTasks],
  )

  const addTasks = useCallback(
    (newTasks) => {
      setTasks((prev) => [
        ...newTasks.map((t) => ({
          ...createTask(t.text, t.priority || 'medium', t.category || 'other', t.dueDate || null, t.notes || '', t.subtasks || [], t.recurring || null),
          id: t.id || undefined,
          createdAt: t.createdAt || undefined,
        })),
        ...prev,
      ])
    },
    [setTasks],
  )

  const toggleTask = useCallback(
    (id) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const newCompleted = !t.completed
          const updates = { ...t, completed: newCompleted, status: newCompleted ? 'done' : 'todo' }
          if (newCompleted && t.recurring && t.dueDate) {
            const nextDue = computeNextDueDate(t.recurring, t.dueDate)
            return {
              ...updates,
              _createRecurring: { text: t.text, priority: t.priority, category: t.category, dueDate: nextDue, notes: t.notes, subtasks: t.subtasks.map((s) => ({ ...s, completed: false, id: String(nextSubtaskId++) })), recurring: t.recurring },
            }
          }
          return updates
        }),
      )
    },
    [setTasks],
  )

  const editTask = useCallback(
    (id, updates) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      )
    },
    [setTasks],
  )

  const deleteTask = useCallback(
    (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    },
    [setTasks],
  )

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed))
  }, [setTasks])

  const reorderTasks = useCallback(
    (orderedIds) => {
      setTasks((prev) => {
        const map = new Map(prev.map((t) => [t.id, t]))
        return orderedIds.map((id) => map.get(id)).filter(Boolean)
      })
    },
    [setTasks],
  )

  const moveTask = useCallback(
    (taskId, newStatus, targetIndex) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId)
        if (!task) return prev
        const others = prev.filter((t) => t.id !== taskId)
        const updated = { ...task, status: newStatus, completed: newStatus === 'done' }
        if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= others.length) {
          others.splice(targetIndex, 0, updated)
          return others
        }
        return [...others, updated]
      })
    },
    [setTasks],
  )

  const addSubtask = useCallback(
    (taskId, text) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), createSubtask(text)] } : t,
        ),
      )
    },
    [setTasks],
  )

  const toggleSubtask = useCallback(
    (taskId, subtaskId) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: (t.subtasks || []).map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)) }
            : t,
        ),
      )
    },
    [setTasks],
  )

  const deleteSubtask = useCallback(
    (taskId, subtaskId) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId) } : t,
        ),
      )
    },
    [setTasks],
  )

  const importTasks = useCallback(
    (importedTasks) => {
      setTasks((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const newTasks = importedTasks
          .filter((t) => !existingIds.has(t.id))
          .map((t) => ({
            ...t,
            id: t.id || String(nextId++),
            createdAt: t.createdAt || Date.now(),
            subtasks: (t.subtasks || []).map((s) => ({ ...s, id: s.id || String(nextSubtaskId++) })),
          }))
        return [...newTasks, ...prev]
      })
    },
    [setTasks],
  )

  const replaceAllTasks = useCallback(
    (newTasks) => {
      setTasks(newTasks)
    },
    [setTasks],
  )

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const active = total - completed
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.completed) return false
      const due = new Date(t.dueDate)
      due.setHours(0, 0, 0, 0)
      return due < today
    }).length
    const dueToday = tasks.filter((t) => {
      if (!t.dueDate || t.completed) return false
      const due = new Date(t.dueDate)
      due.setHours(0, 0, 0, 0)
      return due.getTime() === today.getTime()
    }).length
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length
    return { total, completed, active, overdue, dueToday, inProgress, todo: active - inProgress }
  }, [tasks])

  return {
    tasks, addTask, addTasks, toggleTask, editTask, deleteTask, clearCompleted,
    reorderTasks, moveTask, addSubtask, toggleSubtask, deleteSubtask,
    importTasks, replaceAllTasks, stats,
  }
}

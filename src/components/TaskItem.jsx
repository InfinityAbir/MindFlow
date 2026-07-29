import { useState, useRef, useEffect } from 'react'
import CategoryBadge from './CategoryBadge'
import DatePicker from './DatePicker'
import SubtaskList from './SubtaskList'
import { CATEGORIES, RECURRING_OPTIONS } from '../hooks/useTasks'

const PRIORITY_STYLES = {
  low: { dot: 'bg-emerald-500', active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
  medium: { dot: 'bg-amber-500', active: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300' },
  high: { dot: 'bg-rose-500', active: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300' },
}

function getDueInfo(dueDate) {
  if (!dueDate) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diff = due - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return { type: 'overdue', text: `${Math.abs(days)}d overdue`, style: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50' }
  if (days === 0) return { type: 'today', text: 'Due today', style: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50' }
  if (days === 1) return { type: 'tomorrow', text: 'Tomorrow', style: 'text-surface-500 bg-surface-100 dark:text-surface-400 dark:bg-surface-800' }
  if (days <= 7) return { type: 'upcoming', text: `${days}d left`, style: 'text-surface-500 bg-surface-100 dark:text-surface-400 dark:bg-surface-800' }
  return { type: 'future', text: formatDate(dueDate), style: 'text-surface-400 bg-surface-100 dark:text-surface-500 dark:bg-surface-800' }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskItem({ task, onToggle, onEdit, onDelete, onAddSubtask, onToggleSubtask, onDeleteSubtask, onDragStart: handleDrag, onDragOver: handleDragOver, onDrop: handleDrop, onStatusChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editCategory, setEditCategory] = useState(task.category || 'other')
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '')
  const [editNotes, setEditNotes] = useState(task.notes || '')
  const [editRecurring, setEditRecurring] = useState(task.recurring || null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const dueInfo = getDueInfo(task.dueDate)
  const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
  const subtaskCount = task.subtasks?.length || 0
  const subtaskDone = task.subtasks?.filter((s) => s.completed).length || 0

  const handleDelete = () => {
    setIsRemoving(true)
    setTimeout(() => onDelete(task.id), 250)
  }

  const handleSaveEdit = () => {
    const trimmed = editText.trim()
    if (!trimmed) return
    onEdit(task.id, {
      text: trimmed,
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate || null,
      notes: editNotes,
      recurring: editRecurring || null,
    })
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setEditText(task.text)
      setEditPriority(task.priority)
      setEditCategory(task.category || 'other')
      setEditDueDate(task.dueDate || '')
      setEditNotes(task.notes || '')
      setEditRecurring(task.recurring || null)
      setIsEditing(false)
    }
  }

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    handleDrag?.(task.id)
  }

  if (isRemoving) {
    return (
      <div className="animate-slide-out overflow-hidden rounded-xl border border-surface-100 bg-surface-50 dark:border-surface-800 dark:bg-surface-900/50">
        <div className="flex items-center gap-3 px-4 py-3 opacity-30">
          <div className="h-5 w-5 rounded-full border-2 border-surface-300" />
          <span className="text-sm text-surface-500 line-through">{task.text}</span>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="animate-scale-in rounded-xl border-2 border-accent-300 bg-white p-4 shadow-lg shadow-accent-100/50 dark:border-accent-700 dark:bg-surface-900 dark:shadow-accent-900/30">
        <div className="space-y-3">
          <input ref={inputRef} type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm font-medium text-surface-800 outline-none focus:border-accent-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:focus:border-accent-600" placeholder="Task name" />
          <div className="flex flex-wrap gap-2">
            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1.5 text-xs font-medium text-surface-600 outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1.5 text-xs font-medium text-surface-600 outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
              {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
            <DatePicker value={editDueDate} onChange={setEditDueDate} />
            <select value={editRecurring || ''} onChange={(e) => setEditRecurring(e.target.value || null)} className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1.5 text-xs font-medium text-surface-600 outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
              {RECURRING_OPTIONS.map((o) => (<option key={o.value || 'once'} value={o.value || ''}>{o.label}</option>))}
            </select>
          </div>
          <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Add notes..." rows={2} className="w-full resize-none rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-xs text-surface-600 outline-none focus:border-accent-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:focus:border-accent-600" />
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="flex-1 rounded-lg bg-surface-900 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-surface-800 active:scale-[0.98] dark:bg-white dark:text-surface-900 dark:hover:bg-surface-200">Save changes</button>
            <button onClick={() => setIsEditing(false)} className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-medium text-surface-500 transition-all hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800">Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => { e.preventDefault(); handleDragOver?.(task.id) }}
      onDrop={(e) => { e.preventDefault(); handleDrop?.(task.id) }}
      className="animate-slide-in group rounded-xl border border-surface-100 bg-white transition-all duration-200 hover:border-surface-200 hover:shadow-md dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex shrink-0 cursor-grab items-center gap-1 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <svg className="h-3.5 w-3.5 text-surface-300 dark:text-surface-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 100-4 2 2 0 000 4zM8 14a2 2 0 100-4 2 2 0 000 4zM8 22a2 2 0 100-4 2 2 0 000 4zM16 6a2 2 0 100-4 2 2 0 000 4zM16 14a2 2 0 100-4 2 2 0 000 4zM16 22a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>

        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            task.completed
              ? 'border-emerald-500 bg-emerald-500 animate-check'
              : 'border-surface-300 hover:border-accent-400 dark:border-surface-600 dark:hover:border-accent-500'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium transition-all duration-200 ${task.completed ? 'text-surface-400 line-through dark:text-surface-500' : 'text-surface-800 dark:text-surface-100'}`}>
              {task.text}
            </span>
            <CategoryBadge category={task.category || 'other'} size="xs" />
            <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ps.active}`}>
              {task.priority}
            </span>
            {task.recurring && (
              <span className="inline-flex items-center rounded-md border border-info/20 bg-info/5 px-1.5 py-0.5 text-[10px] font-medium text-info dark:border-info/30 dark:bg-info/10">
                {task.recurring}
              </span>
            )}
            {task.status === 'in-progress' && !task.completed && (
              <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                In progress
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {dueInfo && (
              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${dueInfo.style}`}>
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m4 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dueInfo.text}
              </span>
            )}
            {task.notes && (
              <button onClick={() => setShowSubtasks(!showSubtasks)} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors ${showSubtasks ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300' : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'}`}>
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Notes
              </button>
            )}
            {subtaskCount > 0 && (
              <button onClick={() => setShowSubtasks(!showSubtasks)} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors ${showSubtasks ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300' : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'}`}>
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {subtaskDone}/{subtaskCount}
              </button>
            )}
            {!task.completed && !task.notes && subtaskCount === 0 && (
              <button onClick={() => setShowSubtasks(true)} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-surface-300 transition-colors hover:text-surface-500 dark:text-surface-600 dark:hover:text-surface-400">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Subtasks
              </button>
            )}
          </div>

          {showSubtasks && (
            <div className="mt-2 space-y-2 rounded-lg border border-accent-100 bg-accent-50/30 px-3 py-2.5 dark:border-accent-900 dark:bg-accent-950/20">
              {task.notes && (
                <p className="text-xs leading-relaxed text-surface-600 dark:text-surface-400">{task.notes}</p>
              )}
              <SubtaskList
                subtasks={task.subtasks || []}
                onToggle={(sid) => onToggleSubtask?.(task.id, sid)}
                onDelete={(sid) => onDeleteSubtask?.(task.id, sid)}
                onAdd={(text) => onAddSubtask?.(task.id, text)}
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-0.5 pt-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {!task.completed && onStatusChange && (
            <button
              onClick={() => onStatusChange(task.id, task.status === 'in-progress' ? 'todo' : 'in-progress')}
              className={`rounded-lg p-1.5 transition-colors ${
                task.status === 'in-progress'
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  : 'text-surface-300 hover:bg-surface-100 hover:text-amber-500 dark:hover:bg-surface-800 dark:hover:text-amber-400'
              }`}
              aria-label={task.status === 'in-progress' ? 'Pause task' : 'Start task'}
              title={task.status === 'in-progress' ? 'Pause' : 'Start working'}
            >
              {task.status === 'in-progress' ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              )}
            </button>
          )}
          <button onClick={() => {
            setEditText(task.text)
            setEditPriority(task.priority)
            setEditCategory(task.category || 'other')
            setEditDueDate(task.dueDate || '')
            setEditNotes(task.notes || '')
            setEditRecurring(task.recurring || null)
            setIsEditing(true)
          }} className="rounded-lg p-1.5 text-surface-300 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-400" aria-label="Edit task">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={handleDelete} className="rounded-lg p-1.5 text-surface-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/50 dark:hover:text-rose-400" aria-label="Delete task">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

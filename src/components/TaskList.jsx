import { useState, useCallback } from 'react'
import TaskItem from './TaskItem'

export default function TaskList({ tasks, onToggle, onEdit, onDelete, onReorder, onAddSubtask, onToggleSubtask, onDeleteSubtask, onStatusChange, filter, categoryFilter, emptyMessage, onLoadDemo }) {
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const handleDragStart = useCallback((id) => setDragId(id), [])
  const handleDragOver = useCallback((id) => setDragOverId(id), [])

  const handleDrop = useCallback(
    (targetId) => {
      if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
      const ids = tasks.map((t) => t.id)
      const fromIdx = ids.indexOf(dragId)
      const toIdx = ids.indexOf(targetId)
      if (fromIdx === -1 || toIdx === -1) { setDragId(null); setDragOverId(null); return }
      ids.splice(fromIdx, 1)
      ids.splice(toIdx, 0, dragId)
      onReorder?.(ids)
      setDragId(null)
      setDragOverId(null)
    },
    [dragId, tasks, onReorder],
  )

  const handleDragEnd = useCallback(() => {
    setDragId(null)
    setDragOverId(null)
  }, [])

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-100 dark:bg-surface-800">
          <svg className="h-10 w-10 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            {filter === 'completed' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                {filter === 'active' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" />}
              </>
            )}
          </svg>
        </div>
        <p className="text-sm font-medium text-surface-400 dark:text-surface-500">{emptyMessage}</p>
        {categoryFilter !== 'all' && (
          <p className="mt-1 text-xs text-surface-300 dark:text-surface-600">Try selecting a different category</p>
        )}
        {filter === 'all' && categoryFilter === 'all' && onLoadDemo && (
          <button onClick={onLoadDemo} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-dashed border-surface-300 bg-white px-4 py-2.5 text-sm font-medium text-surface-500 transition-all hover:border-accent-400 hover:text-accent-600 hover:shadow-sm dark:border-surface-600 dark:bg-surface-900 dark:text-surface-400 dark:hover:border-accent-500 dark:hover:text-accent-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Load demo data
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2" onDragEnd={handleDragEnd}>
      {tasks.map((task, index) => (
        <div key={task.id} style={{ animationDelay: `${index * 30}ms` }} className={dragOverId === task.id ? 'ring-2 ring-accent-400 rounded-xl' : ''}>
          <TaskItem
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onStatusChange={onStatusChange}
          />
        </div>
      ))}
    </div>
  )
}

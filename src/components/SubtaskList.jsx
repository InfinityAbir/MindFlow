import { useState } from 'react'

export default function SubtaskList({ subtasks, onToggle, onDelete, onAdd }) {
  const [newText, setNewText] = useState('')

  const completed = subtasks.filter((s) => s.completed).length
  const total = subtasks.length
  const hasSubtasks = total > 0

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newText.trim()) return
    onAdd(newText.trim())
    setNewText('')
  }

  return (
    <div className="space-y-2">
      {hasSubtasks && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-500"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-medium text-surface-400 tabular-nums">
              {completed}/{total}
            </span>
          </div>
          {subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50">
              <button
                onClick={() => onToggle(s.id)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
                  s.completed
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-surface-300 hover:border-accent-400 dark:border-surface-600'
                }`}
              >
                {s.completed && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-xs ${s.completed ? 'text-surface-400 line-through' : 'text-surface-600 dark:text-surface-300'}`}>
                {s.text}
              </span>
              <button
                onClick={() => onDelete(s.id)}
                className="rounded p-0.5 text-surface-300 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-dashed border-surface-300 dark:border-surface-600" />
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={hasSubtasks ? 'Add subtask...' : 'Add subtasks...'}
          className="min-w-0 flex-1 bg-transparent text-xs text-surface-600 placeholder-surface-400 outline-none dark:text-surface-400 dark:placeholder-surface-500"
        />
      </form>
    </div>
  )
}

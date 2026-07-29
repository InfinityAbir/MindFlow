const FILTERS = {
  all: { label: 'All', value: 'all', icon: null },
  active: { label: 'Active', value: 'active', icon: null },
  completed: { label: 'Done', value: 'completed', icon: null },
}

const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Priority', value: 'priority' },
  { label: 'Due date', value: 'dueDate' },
]

const CATEGORY_FILTERS = [
  { label: 'All categories', value: 'all' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Health', value: 'health' },
  { label: 'Learning', value: 'learning' },
  { label: 'Finance', value: 'finance' },
  { label: 'Other', value: 'other' },
]

export default function FilterBar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  categoryFilter,
  onCategoryFilterChange,
  stats,
  onClearCompleted,
  focusMode,
  onToggleFocusMode,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
          {Object.values(FILTERS).map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === f.value
                  ? 'bg-white text-surface-800 shadow-sm dark:bg-surface-700 dark:text-surface-100'
                  : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'
              }`}
            >
              {f.label}
              {stats && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-200 px-1 text-[10px] font-semibold text-surface-500 dark:bg-surface-600 dark:text-surface-300">
                  {f.value === 'all' ? stats.total : f.value === 'active' ? stats.active : stats.completed}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 outline-none transition-colors focus:border-accent-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:focus:border-accent-600"
          >
            {CATEGORY_FILTERS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 outline-none transition-colors focus:border-accent-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:focus:border-accent-600"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              focusMode
                ? 'border-accent-300 bg-accent-50 text-accent-700 dark:border-accent-700 dark:bg-accent-950 dark:text-accent-300'
                : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:border-surface-600'
            }`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Focus
          </button>
        )}
        {stats.completed > 0 && (
          <button
            onClick={onClearCompleted}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-surface-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-surface-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          >
            Clear done
          </button>
        )}
      </div>
    </div>
  )
}

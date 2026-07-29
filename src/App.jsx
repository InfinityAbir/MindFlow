import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTasks } from './hooks/useTasks'
import { useDarkMode } from './hooks/useDarkMode'
import { useKeyboard } from './hooks/useKeyboard'
import { useNotifications } from './hooks/useNotifications'
import { DEMO_TASKS } from './data/demoTasks'
import { dailyBriefing } from './services/ai'
import ThemeToggle from './components/ThemeToggle'
import AddTaskForm from './components/AddTaskForm'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import KanbanBoard from './components/KanbanBoard'
import AIAssistant from './components/AIAssistant'
import CommandPalette from './components/CommandPalette'
import ExportImport from './components/ExportImport'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function sortTasks(tasks, sort) {
  const sorted = [...tasks]
  switch (sort) {
    case 'newest': return sorted.sort((a, b) => b.createdAt - a.createdAt)
    case 'oldest': return sorted.sort((a, b) => a.createdAt - b.createdAt)
    case 'priority': return sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    case 'dueDate':
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
    default: return sorted
  }
}

function App() {
  const {
    tasks, addTask, addTasks, toggleTask, editTask, deleteTask, clearCompleted,
    reorderTasks, moveTask, addSubtask, toggleSubtask, deleteSubtask,
    importTasks, replaceAllTasks, stats,
  } = useTasks()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [aiOpen, setAiOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [briefingText, setBriefingText] = useState(null)
  const [view, setView] = useState('list')
  const fileRef = useRefForImport()

  useNotifications(tasks)

  useEffect(() => {
    const toCreate = []
    tasks.forEach((t) => {
      if (t._createRecurring) toCreate.push(t)
    })
    if (toCreate.length === 0) return
    toCreate.forEach((t) => {
      addTask(t._createRecurring.text, t._createRecurring.priority, t._createRecurring.category, t._createRecurring.dueDate, t._createRecurring.notes, t._createRecurring.subtasks, t._createRecurring.recurring)
      editTask(t.id, { _createRecurring: undefined })
    })
  }, [tasks, addTask, editTask])

  const handleAddTask = useCallback((text, priority, category, dueDate, notes, subtasks, recurring) => {
    addTask(text, priority, category, dueDate, notes, subtasks, recurring)
  }, [addTask])

  const handleAddAITasks = useCallback((aiTasks) => {
    const formatted = aiTasks.map((t) => ({
      ...t,
      dueDate: parseDueSuggestion(t.dueSuggestion),
    }))
    addTasks(formatted)
    setAiOpen(false)
  }, [addTasks])

  const handleShowBriefing = useCallback((text) => setBriefingText(text), [])

  const handleLoadDemo = useCallback(() => {
    replaceAllTasks(DEMO_TASKS)
  }, [replaceAllTasks])

  const handleStatusChange = useCallback((id, status) => {
    editTask(id, { status })
  }, [editTask])

  const handleExport = useCallback(() => {
    const data = JSON.stringify(tasks, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindflow-tasks-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [tasks])

  const handleCommand = useCallback((action) => {
    switch (action) {
      case 'focus-add': document.querySelector('input[type="text"]')?.focus(); break
      case 'ai': setAiOpen(true); break
      case 'theme': toggleDarkMode(); break
      case 'view-list': setView('list'); break
      case 'view-board': setView('board'); break
      case 'focus': setFocusMode((v) => !v); break
      case 'clear-done': clearCompleted(); break
      case 'export': handleExport(); break
      case 'import': fileRef.current?.click(); break
      case 'demo': handleLoadDemo(); break
      case 'briefing':
        dailyBriefing(tasks).then(setBriefingText).catch(() => {})
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleDarkMode, clearCompleted, handleExport, handleLoadDemo, tasks])

  useKeyboard([
    { key: 'k', modifier: 'ctrl', handler: () => setCmdOpen((v) => !v) },
    { key: 'n', modifier: 'ctrl', handler: () => document.querySelector('input[type="text"]')?.focus() },
    { key: 'f', modifier: 'ctrl', handler: () => setFocusMode((v) => !v) },
    { key: 'Escape', handler: () => { setAiOpen(false); setBriefingText(null); setCmdOpen(false) } },
  ])

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks
    if (filter === 'active') filtered = filtered.filter((t) => !t.completed)
    else if (filter === 'completed') filtered = filtered.filter((t) => t.completed)
    if (focusMode) filtered = filtered.filter((t) => !t.completed)
    if (categoryFilter !== 'all') filtered = filtered.filter((t) => (t.category || 'other') === categoryFilter)
    return sortTasks(filtered, sort)
  }, [tasks, filter, categoryFilter, sort, focusMode])

  const emptyMessages = {
    all: 'No tasks yet. Add one above, use AI, or ask for help!',
    active: 'All caught up! Time for a break or a new challenge.',
    completed: 'Nothing completed yet. You got this!',
  }

  const completedPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-surface-400 dark:text-surface-500">{greeting}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50 sm:text-3xl">My Tasks</h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              {stats.total === 0 ? 'Ready to get started?' : stats.active === 0 ? 'All done -- great work!' : `${stats.active} of ${stats.total} tasks remaining`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-surface-100 px-3 py-2 text-xs font-medium text-surface-500 transition-all hover:bg-surface-200 hover:text-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200" title="Command palette (Ctrl+K)">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="hidden sm:inline">Commands</span>
            </button>
            <button onClick={() => setAiOpen(true)} className="animate-pulse-glow flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-accent-500/25 transition-all hover:from-accent-600 hover:to-accent-700 active:scale-95">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI
            </button>
            <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
          </div>
        </div>

        {briefingText && (
          <div className="mt-4 animate-slide-in rounded-xl border border-accent-200 bg-gradient-to-r from-accent-50 to-white p-4 dark:border-accent-800 dark:from-accent-950/50 dark:to-surface-900">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">AI Briefing</p>
                <p className="mt-1 text-sm leading-relaxed text-surface-700 dark:text-surface-300">{briefingText}</p>
              </div>
              <button onClick={() => setBriefingText(null)} className="shrink-0 rounded-lg p-1 text-surface-300 transition-colors hover:text-surface-500 dark:hover:text-surface-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {stats.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-surface-400 dark:text-surface-500">
              <span>Progress</span>
              <span className="font-mono tabular-nums">{completedPercentage}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800">
              <div className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400 transition-all duration-700 ease-out" style={{ width: `${completedPercentage}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {stats.overdue > 0 && <p className="text-[11px] font-semibold text-rose-500">{stats.overdue} overdue</p>}
              {stats.dueToday > 0 && <p className="text-[11px] font-semibold text-amber-500">{stats.dueToday} due today</p>}
              {stats.inProgress > 0 && <p className="text-[11px] font-semibold text-info">{stats.inProgress} in progress</p>}
            </div>
          </div>
        )}
      </header>

      <main className="space-y-4">
        <AddTaskForm onAdd={handleAddTask} />

        {tasks.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FilterBar
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              stats={stats}
              onClearCompleted={clearCompleted}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode(!focusMode)}
            />
            <div className="flex items-center gap-1.5">
              <div className="flex rounded-lg border border-surface-200 bg-surface-50 p-0.5 dark:border-surface-700 dark:bg-surface-800">
                <button onClick={() => setView('list')} className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-all ${view === 'list' ? 'bg-white text-surface-800 shadow-sm dark:bg-surface-700 dark:text-surface-100' : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'}`}>
                  List
                </button>
                <button onClick={() => setView('board')} className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-all ${view === 'board' ? 'bg-white text-surface-800 shadow-sm dark:bg-surface-700 dark:text-surface-100' : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'}`}>
                  Board
                </button>
              </div>
              <ExportImport onImport={importTasks} tasks={tasks} />
            </div>
          </div>
        )}

        {view === 'list' ? (
          <TaskList
            tasks={filteredAndSortedTasks}
            onToggle={toggleTask}
            onEdit={editTask}
            onDelete={deleteTask}
            onReorder={reorderTasks}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
            onStatusChange={handleStatusChange}
            filter={filter}
            categoryFilter={categoryFilter}
            emptyMessage={emptyMessages[filter]}
            onLoadDemo={handleLoadDemo}
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            onMoveTask={moveTask}
          />
        )}
      </main>

      {tasks.length > 0 && !focusMode && view === 'list' && (
        <footer className="mt-16 border-t border-surface-100 pt-6 text-center dark:border-surface-800">
          <p className="text-[11px] text-surface-300 dark:text-surface-600">
            <kbd className="rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-surface-700 dark:bg-surface-800">Ctrl+N</kbd> add &middot;{' '}
            <kbd className="rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-surface-700 dark:bg-surface-800">Ctrl+K</kbd> commands &middot;{' '}
            <kbd className="rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-surface-700 dark:bg-surface-800">Ctrl+F</kbd> focus &middot; drag to reorder
          </p>
          <button onClick={handleLoadDemo} className="mt-2 text-[10px] text-surface-300 underline-offset-2 transition-colors hover:text-accent-500 hover:underline dark:text-surface-600 dark:hover:text-accent-400">
            Reload demo data
          </button>
        </footer>
      )}

      <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} tasks={tasks} onAddTasks={handleAddAITasks} onShowBriefing={handleShowBriefing} />
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} onExecute={handleCommand} currentView={view} />
    </div>
  )
}

function parseDueSuggestion(suggestion) {
  if (!suggestion || suggestion === 'none') return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const match = suggestion.match(/in (\d+) days?/)
  if (match) { const d = new Date(now); d.setDate(d.getDate() + parseInt(match[1])); return d.toISOString().split('T')[0] }
  if (suggestion.toLowerCase().includes('today')) return now.toISOString().split('T')[0]
  if (suggestion.toLowerCase().includes('tomorrow')) { const d = new Date(now); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }
  if (suggestion.toLowerCase().includes('next week')) { const d = new Date(now); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0] }
  return null
}

function useRefForImport() {
  const ref = { current: null }
  return ref
}

export default App

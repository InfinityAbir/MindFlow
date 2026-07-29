import { useState, useRef, useEffect } from 'react'

const COMMANDS = [
  { id: 'add-task', label: 'Add new task', icon: 'plus', shortcut: 'Ctrl+N', action: 'focus-add' },
  { id: 'ai-assistant', label: 'Open AI Assistant', icon: 'sparkles', shortcut: 'Ctrl+Shift+K', action: 'ai' },
  { id: 'toggle-theme', label: 'Toggle dark mode', icon: 'moon', shortcut: '', action: 'theme' },
  { id: 'list-view', label: 'Switch to List view', icon: 'list', shortcut: '', action: 'view-list' },
  { id: 'board-view', label: 'Switch to Board view', icon: 'columns', shortcut: '', action: 'view-board' },
  { id: 'focus-mode', label: 'Toggle Focus mode', icon: 'eye', shortcut: 'Ctrl+F', action: 'focus' },
  { id: 'clear-done', label: 'Clear completed tasks', icon: 'trash', shortcut: '', action: 'clear-done' },
  { id: 'export', label: 'Export tasks as JSON', icon: 'download', shortcut: '', action: 'export' },
  { id: 'import', label: 'Import tasks from file', icon: 'upload', shortcut: '', action: 'import' },
  { id: 'load-demo', label: 'Load demo data', icon: 'database', shortcut: '', action: 'demo' },
  { id: 'daily-briefing', label: 'Get AI daily briefing', icon: 'calendar', shortcut: '', action: 'briefing' },
]

const ICONS = {
  plus: 'M12 4.5v15m7.5-7.5h-15',
  sparkles: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
  moon: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
  eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  list: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  columns: 'M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z',
  trash: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  download: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
  upload: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
  database: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
}

export default function CommandPalette({ isOpen, onClose, onExecute, currentView }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const viewAwareCommands = COMMANDS.map((c) => {
    if (c.id === 'list-view' && currentView === 'list') return null
    if (c.id === 'board-view' && currentView === 'board') return null
    return c
  }).filter(Boolean)

  const filtered = query.trim()
    ? viewAwareCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : viewAwareCommands

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        onExecute(filtered[selectedIndex].action)
        onClose()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-[15%] z-[201] mx-auto w-full max-w-lg animate-scale-in px-4">
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-700 dark:bg-surface-900">
          <div className="flex items-center gap-3 border-b border-surface-100 px-4 py-3 dark:border-surface-800">
            <svg className="h-4 w-4 shrink-0 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-sm text-surface-800 placeholder-surface-400 outline-none dark:text-surface-200 dark:placeholder-surface-500"
            />
            <kbd className="hidden rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] text-surface-400 sm:inline-block dark:border-surface-700 dark:bg-surface-800">
              esc
            </kbd>
          </div>
          <div className="max-h-72 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-surface-400">No commands found</div>
            ) : (
              filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => { onExecute(cmd.action); onClose() }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    i === selectedIndex
                      ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
                      : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    i === selectedIndex ? 'bg-accent-100 text-accent-600 dark:bg-accent-800 dark:text-accent-400' : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
                  }`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[cmd.icon]} />
                    </svg>
                  </div>
                  <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] text-surface-400 dark:border-surface-700 dark:bg-surface-800">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

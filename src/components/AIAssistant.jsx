import { useState, useRef, useEffect } from 'react'
import { breakdownGoal, dailyBriefing, suggestTasks } from '../services/ai'

export default function AIAssistant({ isOpen, onClose, tasks, onAddTasks, onShowBriefing }) {
  const [mode, setMode] = useState('menu')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [briefing, setBriefing] = useState(null)
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, mode])

  const handleBreakdown = async () => {
    if (!goal.trim()) return
    setLoading(true)
    setError(null)
    try {
      const tasks = await breakdownGoal(goal)
      setResults(tasks)
      setSelectedTasks(new Set(tasks.map((_, i) => i)))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const suggestions = await suggestTasks(tasks)
      setResults(suggestions)
      setSelectedTasks(new Set(suggestions.map((_, i) => i)))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBriefing = async () => {
    setBriefingLoading(true)
    setError(null)
    try {
      const text = await dailyBriefing(tasks)
      setBriefing(text)
      onShowBriefing?.(text)
    } catch (e) {
      setError(e.message)
    } finally {
      setBriefingLoading(false)
    }
  }

  const handleAddSelected = () => {
    const selected = results.filter((_, i) => selectedTasks.has(i))
    onAddTasks(selected)
    setResults(null)
    setGoal('')
    setMode('menu')
  }

  const toggleTask = (i) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity dark:bg-black/50" onClick={onClose} />

      <div className="animate-drawer-in fixed bottom-0 right-0 z-50 flex max-h-[90dvh] w-full flex-col rounded-t-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-700 dark:bg-surface-900 sm:bottom-auto sm:right-4 sm:top-4 sm:w-[420px] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-sm shadow-accent-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">AI Assistant</h3>
              <p className="text-[11px] text-surface-400 dark:text-surface-500">Powered by Groq</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-xs font-medium text-danger dark:border-danger/30 dark:bg-danger/10">
              {error}
            </div>
          )}

          {results && (
            <div className="animate-scale-in space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                  {results.length} tasks found
                </h4>
                <button
                  onClick={() => { setSelectedTasks(new Set(results.map((_, i) => i))) }}
                  className="text-[11px] font-medium text-accent-500 hover:text-accent-600"
                >
                  Select all
                </button>
              </div>

              <div className="space-y-1.5">
                {results.map((t, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 transition-all ${
                      selectedTasks.has(i)
                        ? 'border-accent-300 bg-accent-50/50 dark:border-accent-700 dark:bg-accent-900/20'
                        : 'border-surface-200 bg-white hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-surface-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(i)}
                      onChange={() => toggleTask(i)}
                      className="mt-0.5 h-4 w-4 rounded border-surface-300 text-accent-500 focus:ring-accent-400 dark:border-surface-600 dark:bg-surface-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{t.text}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          t.priority === 'high' ? 'bg-danger/10 text-danger' :
                          t.priority === 'low' ? 'bg-success/10 text-success' :
                          'bg-warning/10 text-warning'
                        }`}>{t.priority}</span>
                        {t.category && (
                          <span className="rounded-md bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-500 dark:bg-surface-700 dark:text-surface-400">{t.category}</span>
                        )}
                        {t.dueSuggestion && t.dueSuggestion !== 'none' && (
                          <span className="text-[10px] text-surface-400">{t.dueSuggestion}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddSelected}
                  disabled={selectedTasks.size === 0}
                  className="flex-1 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-600 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-accent-500"
                >
                  Add {selectedTasks.size > 0 ? `(${selectedTasks.size})` : ''}
                </button>
                <button
                  onClick={() => { setResults(null); setGoal(''); setMode('menu') }}
                  className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {briefing && !results && (
            <div className="animate-scale-in space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Daily Briefing</h4>
              <div className="rounded-xl border border-accent-200 bg-gradient-to-br from-accent-50 to-white p-4 dark:border-accent-800 dark:from-accent-950 dark:to-surface-900">
                <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">{briefing}</p>
              </div>
              <button
                onClick={() => { setBriefing(null); setMode('menu') }}
                className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
              >
                Back
              </button>
            </div>
          )}

          {!results && !briefing && mode === 'menu' && (
            <div className="animate-scale-in space-y-3">
              <button
                onClick={() => setMode('breakdown')}
                className="flex w-full items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 text-left transition-all hover:border-accent-300 hover:shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:hover:border-accent-600"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Break Down Goal</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500">Describe a goal, AI creates tasks for you</p>
                </div>
                <svg className="ml-auto h-4 w-4 shrink-0 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleSuggestions}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 text-left transition-all hover:border-accent-300 hover:shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:hover:border-accent-600 disabled:opacity-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Smart Suggestions</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500">Get related task ideas based on your list</p>
                </div>
                {loading && <div className="ml-auto flex gap-1"><span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent-400" /><span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent-400" /><span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent-400" /></div>}
              </button>

              <button
                onClick={handleBriefing}
                disabled={briefingLoading}
                className="flex w-full items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 text-left transition-all hover:border-accent-300 hover:shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:hover:border-accent-600 disabled:opacity-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Daily Briefing</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500">Get a motivational summary of your day</p>
                </div>
                {briefingLoading && <div className="ml-auto flex gap-1"><span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent-400" /><span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent-400" /><span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent-400" /></div>}
              </button>
            </div>
          )}

          {mode === 'breakdown' && !results && (
            <div className="animate-scale-in space-y-4">
              <button
                onClick={() => setMode('menu')}
                className="flex items-center gap-1 text-xs font-medium text-surface-400 transition-colors hover:text-surface-600 dark:hover:text-surface-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div>
                <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Break Down a Goal</h4>
                <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">Describe what you want to accomplish and AI will create actionable tasks.</p>
              </div>

              <textarea
                ref={inputRef}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Launch my portfolio website by next week..."
                rows={3}
                className="w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-sm text-surface-800 placeholder-surface-400 outline-none transition-colors focus:border-accent-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200 dark:placeholder-surface-500 dark:focus:border-accent-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleBreakdown()
                  }
                }}
              />

              <button
                onClick={handleBreakdown}
                disabled={!goal.trim() || loading}
                className="w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-500/25 transition-all hover:from-accent-600 hover:to-accent-700 active:scale-[0.98] disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-white/80" />
                    <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-white/80" />
                    <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-white/80" />
                  </span>
                ) : (
                  'Generate Tasks'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

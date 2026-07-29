import { useState, useRef } from 'react'
import { CATEGORIES, RECURRING_OPTIONS } from '../hooks/useTasks'
import DatePicker from './DatePicker'
import { parseNaturalLanguage } from '../services/ai'

const PRIORITIES = [
  { value: 'low', label: 'Low', active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/30' },
  { value: 'medium', label: 'Medium', active: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30' },
  { value: 'high', label: 'High', active: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/30' },
]

export default function AddTaskForm({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('other')
  const [dueDate, setDueDate] = useState('')
  const [recurring, setRecurring] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [nlpLoading, setNlpLoading] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      return
    }
    onAdd(trimmed, priority, category, dueDate || null, '', [], recurring || null)
    setText('')
    setPriority('medium')
    setCategory('other')
    setDueDate('')
    setRecurring('')
    setIsExpanded(false)
  }

  const handleSmartParse = async () => {
    const trimmed = text.trim()
    if (!trimmed || nlpLoading) return
    setNlpLoading(true)
    try {
      const parsed = await parseNaturalLanguage(trimmed)
      if (parsed) {
        if (parsed.text) setText(parsed.text)
        if (parsed.priority) setPriority(parsed.priority)
        if (parsed.category) setCategory(parsed.category)
        if (parsed.dueDate) setDueDate(parsed.dueDate)
      }
    } catch {
      /* fall back to manual */
    } finally {
      setNlpLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border bg-white p-3.5 transition-all duration-300 dark:border-surface-700 dark:bg-surface-900 ${
        isShaking ? 'animate-shake border-rose-300 dark:border-rose-700' : 'border-surface-200 hover:border-surface-300 dark:hover:border-surface-600'
      } ${isExpanded ? 'shadow-lg shadow-surface-200/50 dark:shadow-black/20' : 'shadow-sm'}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-surface-300 dark:border-surface-600" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="What needs to be done? Try: Buy groceries tomorrow high priority"
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-surface-800 placeholder-surface-300 outline-none dark:text-surface-100 dark:placeholder-surface-600"
        />
        <button
          type="button"
          onClick={handleSmartParse}
          disabled={nlpLoading || !text.trim()}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95 ${
            nlpLoading
              ? 'bg-accent-100 text-accent-500'
              : 'text-surface-300 hover:bg-accent-50 hover:text-accent-500 dark:hover:bg-accent-950/50 dark:hover:text-accent-400'
          }`}
          title="AI Smart Parse"
          aria-label="AI Smart Parse"
        >
          {nlpLoading ? (
            <div className="flex gap-0.5">
              <span className="animate-typing-dot h-1 w-1 rounded-full bg-accent-400" />
              <span className="animate-typing-dot h-1 w-1 rounded-full bg-accent-400" />
              <span className="animate-typing-dot h-1 w-1 rounded-full bg-accent-400" />
            </div>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-surface-300 transition-all duration-200 hover:bg-surface-100 hover:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-400 ${
            isExpanded ? 'rotate-45 bg-surface-100 dark:bg-surface-800' : ''
          }`}
          aria-label="Toggle options"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          type="submit"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-900 text-white transition-all hover:bg-surface-800 active:scale-95 dark:bg-white dark:text-surface-900 dark:hover:bg-surface-200"
          aria-label="Add task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
      </div>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-surface-100 pt-3 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-surface-400">Priority</span>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button key={p.value} type="button" onClick={() => setPriority(p.value)} className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${priority === p.value ? p.active : 'border-surface-200 bg-surface-50 text-surface-400 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-500 dark:hover:border-surface-600'}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-surface-400">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-surface-600 outline-none transition-colors focus:border-accent-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:focus:border-accent-600">
                {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-surface-400">Due</span>
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-surface-400">Repeat</span>
              <select value={recurring} onChange={(e) => setRecurring(e.target.value)} className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-surface-600 outline-none transition-colors focus:border-accent-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:focus:border-accent-600">
                {RECURRING_OPTIONS.map((o) => (<option key={o.value || 'once'} value={o.value || ''}>{o.label}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

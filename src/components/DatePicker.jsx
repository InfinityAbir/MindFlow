import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getToday() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }
}

function isSameDate(y, m, d, dateStr) {
  if (!dateStr) return false
  const parts = dateStr.split('-')
  return parseInt(parts[0]) === y && parseInt(parts[1]) - 1 === m && parseInt(parts[2]) === d
}

function formatDisplay(dateStr, locale) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const { year: ty, month: tm, day: td } = getToday()
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const todayDate = new Date(ty, tm, td)
  const diff = Math.round((target - todayDate) / (1000 * 60 * 60 * 24))

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'

  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: d.getFullYear() !== ty ? 'numeric' : undefined })
}

export default function DatePicker({ value, onChange, placeholder = 'Set due date', className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => value ? parseInt(value.split('-')[0]) : getToday().year)
  const [viewMonth, setViewMonth] = useState(() => value ? parseInt(value.split('-')[1]) - 1 : getToday().month)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const popupRef = useRef(null)
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'

  useEffect(() => {
    if (!isOpen) return

    const updatePos = () => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const popupHeight = 320
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      let top = rect.bottom + 6
      if (spaceBelow < popupHeight && spaceAbove > popupHeight) {
        top = rect.top - popupHeight - 6
      }

      setPopupPos({
        top: Math.max(8, Math.min(top, window.innerHeight - popupHeight - 8)),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 260)),
      })
    }

    updatePos()
    window.addEventListener('resize', updatePos)
    window.addEventListener('scroll', updatePos, true)
    return () => {
      window.removeEventListener('resize', updatePos)
      window.removeEventListener('scroll', updatePos, true)
    }
  }, [isOpen, viewMonth, viewYear])

  useEffect(() => {
    if (!isOpen) return

    const handler = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) return
      if (triggerRef.current && triggerRef.current.contains(e.target)) return
      setIsOpen(false)
    }

    const keyHandler = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setViewMonth((m) => {
          if (m === 0) { setViewYear((y) => y - 1); return 11 }
          return m - 1
        })
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setViewMonth((m) => {
          if (m === 11) { setViewYear((y) => y + 1); return 0 }
          return m + 1
        })
      }
    }

    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [isOpen])

  const selectDate = useCallback(
    (y, m, d) => {
      const month = String(m + 1).padStart(2, '0')
      const day = String(d).padStart(2, '0')
      onChange(`${y}-${month}-${day}`)
      setIsOpen(false)
    },
    [onChange],
  )

  const { year: todayYear, month: todayMonth, day: todayDay } = getToday()

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7

  const cells = []
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstDayOfWeek + 1
    cells.push({ day: day >= 1 && day <= daysInMonth ? day : null, index: i })
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (value) {
            setViewYear(parseInt(value.split('-')[0]))
            setViewMonth(parseInt(value.split('-')[1]) - 1)
          } else {
            setViewYear(todayYear)
            setViewMonth(todayMonth)
          }
          setIsOpen((v) => !v)
        }}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${className} ${
          value
            ? 'border-accent-300 bg-accent-50 text-accent-700 dark:border-accent-700 dark:bg-accent-950/50 dark:text-accent-300'
            : 'border-surface-200 bg-surface-50 text-surface-400 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-500 dark:hover:border-surface-600'
        }`}
      >
        <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDisplay(value, locale) || placeholder}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange('') } }}
            className="-mr-0.5 ml-0.5 rounded p-0.5 transition-colors hover:bg-accent-200 dark:hover:bg-accent-800"
            aria-label="Clear date"
          >
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <div
          ref={popupRef}
          className="animate-scale-in fixed z-[100] w-[248px] rounded-xl border border-surface-200 bg-white p-3 shadow-2xl dark:border-surface-700 dark:bg-surface-900"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11 } return m - 1 })}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-surface-800 dark:text-surface-200">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0 } return m + 1 })}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <div key={d} className="flex h-7 items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map(({ day, index }) => {
              if (!day) return <div key={`e-${index}`} className="h-8" />

              const selected = isSameDate(viewYear, viewMonth, day, value)
              const todayCell = viewYear === todayYear && viewMonth === todayMonth && day === todayDay

              return (
                <button
                  key={`d-${day}`}
                  type="button"
                  onClick={() => selectDate(viewYear, viewMonth, day)}
                  className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    selected
                      ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/30'
                      : todayCell
                        ? 'bg-accent-100 text-accent-700 ring-1 ring-accent-300 dark:bg-accent-900/40 dark:text-accent-300 dark:ring-accent-700'
                        : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                  }`}
                >
                  {day}
                  {todayCell && !selected && (
                    <span className="absolute -bottom-px left-1/2 h-0.5 w-1 -translate-x-1/2 rounded-full bg-accent-400" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-surface-100 pt-2.5 dark:border-surface-800">
            <button
              type="button"
              onClick={() => selectDate(todayYear, todayMonth, todayDay)}
              className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-accent-600 transition-colors hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-950/50"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false) }}
                className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

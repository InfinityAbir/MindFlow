import { useRef, useCallback } from 'react'

export default function ExportImport({ onImport, tasks }) {
  const fileRef = useRef(null)

  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(tasks, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindflow-tasks-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [tasks])

  const handleExportCSV = useCallback(() => {
    const headers = ['id', 'text', 'completed', 'priority', 'category', 'dueDate', 'notes', 'status', 'recurring']
    const rows = tasks.map((t) =>
      headers.map((h) => {
        const val = t[h]
        if (val === null || val === undefined) return ''
        if (typeof val === 'boolean') return val ? 'yes' : 'no'
        if (Array.isArray(val)) return JSON.stringify(val)
        return String(val).replace(/"/g, '""')
      }).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindflow-tasks-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [tasks])

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          if (Array.isArray(data)) {
            onImport(data)
          }
        } catch {
          /* invalid file */
        }
      }
      reader.readAsText(file)
      if (fileRef.current) fileRef.current.value = ''
    },
    [onImport],
  )

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleExportJSON}
        className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        title="Export JSON"
      >
        JSON
      </button>
      <button
        onClick={handleExportCSV}
        className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        title="Export CSV"
      >
        CSV
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        title="Import JSON"
      >
        Import
      </button>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
    </div>
  )
}

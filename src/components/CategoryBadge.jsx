export default function CategoryBadge({ category, size = 'sm' }) {
  const configs = {
    work: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', ring: 'ring-blue-200 dark:ring-blue-700/30', dot: 'bg-blue-500' },
    personal: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', ring: 'ring-purple-200 dark:ring-purple-700/30', dot: 'bg-purple-500' },
    health: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-700/30', dot: 'bg-emerald-500' },
    learning: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-200 dark:ring-amber-700/30', dot: 'bg-amber-500' },
    finance: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-200 dark:ring-rose-700/30', dot: 'bg-rose-500' },
    other: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-700', dot: 'bg-slate-400' },
  }

  const c = configs[category] || configs.other
  const label = category.charAt(0).toUpperCase() + category.slice(1)

  if (size === 'xs') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.bg} ${c.text} ring-1 ring-inset ${c.ring}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
        {label}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium ${c.bg} ${c.text} ring-1 ring-inset ${c.ring}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {label}
    </span>
  )
}

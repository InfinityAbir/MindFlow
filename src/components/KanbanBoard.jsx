import { useState } from 'react'

function KanbanColumn({ title, status, tasks, onMoveTask, color }) {
  const [dragOver, setDragOver] = useState(false)
  const count = tasks.length

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) onMoveTask(taskId, status)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-[200px] flex-col rounded-2xl border-2 transition-all ${
        dragOver
          ? 'border-accent-400 bg-accent-50/50 dark:border-accent-600 dark:bg-accent-950/20'
          : 'border-dashed border-surface-200 bg-surface-50/50 dark:border-surface-700 dark:bg-surface-900/30'
      }`}
    >
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">{title}</h3>
        <span className="ml-auto rounded-full bg-surface-200 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-surface-500 dark:bg-surface-700 dark:text-surface-400">
          {count}
        </span>
      </div>

      <div className="flex-1 space-y-2 p-2">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[10px] text-surface-300 dark:text-surface-600">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanCard({ task }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const subtaskProgress = task.subtasks?.length
    ? `${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length}`
    : null

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="animate-slide-in cursor-grab rounded-xl border border-surface-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing dark:border-surface-700 dark:bg-surface-800"
    >
      <p className={`text-xs font-medium ${task.completed ? 'text-surface-400 line-through' : 'text-surface-800 dark:text-surface-200'}`}>
        {task.text}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
          task.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
          task.priority === 'low' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        }`}>{task.priority}</span>
        {task.category && task.category !== 'other' && (
          <span className="rounded-md bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-500 dark:bg-surface-700 dark:text-surface-400">
            {task.category}
          </span>
        )}
        {task.dueDate && (
          <span className="text-[10px] text-surface-400">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        )}
        {subtaskProgress && (
          <span className="rounded-md bg-accent-50 px-1.5 py-0.5 text-[10px] font-medium text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
            {subtaskProgress}
          </span>
        )}
        {task.recurring && (
          <span className="rounded-md bg-info-light px-1.5 py-0.5 text-[10px] font-medium text-info dark:bg-info/10 dark:text-info">
            {task.recurring}
          </span>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, onMoveTask }) {
  const columns = [
    { title: 'To Do', status: 'todo', color: 'bg-surface-400' },
    { title: 'In Progress', status: 'in-progress', color: 'bg-amber-400' },
    { title: 'Done', status: 'done', color: 'bg-emerald-400' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {columns.map((col) => (
        <KanbanColumn
          key={col.status}
          title={col.title}
          status={col.status}
          color={col.color}
          tasks={tasks.filter((t) => {
            const s = t.status || (t.completed ? 'done' : 'todo')
            return s === col.status
          })}
          onMoveTask={onMoveTask}
        />
      ))}
    </div>
  )
}

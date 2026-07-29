import { useEffect, useRef } from 'react'

export function useNotifications(tasks) {
  const notifiedRef = useRef(new Set())

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'denied') return

    const requestPermission = async () => {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }
    requestPermission()

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const interval = setInterval(() => {
      if (Notification.permission !== 'granted') return

      tasks.forEach((task) => {
        if (task.completed) return
        if (!task.dueDate) return
        if (notifiedRef.current.has(task.id + task.dueDate)) return

        const due = new Date(task.dueDate + 'T00:00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

        if (diff < 0) {
          notifiedRef.current.add(task.id + task.dueDate)
          new Notification('Overdue Task', {
            body: `"${task.text}" is ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} overdue`,
            icon: '/favicon.svg',
            tag: task.id,
          })
        } else if (diff === 0) {
          notifiedRef.current.add(task.id + task.dueDate)
          new Notification('Task Due Today', {
            body: `"${task.text}" is due today`,
            icon: '/favicon.svg',
            tag: task.id,
          })
        }
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [tasks])
}

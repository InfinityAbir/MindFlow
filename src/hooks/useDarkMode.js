import { useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useDarkMode() {
  const [darkMode, setDarkMode] = useLocalStorage('todo-dark-mode', () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [setDarkMode])

  return { darkMode, toggleDarkMode }
}

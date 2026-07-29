import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : (typeof initialValue === 'function' ? initialValue() : initialValue)
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const newValue = typeof value === 'function' ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue))
        } catch { /* quota exceeded, ignore */ }
        return newValue
      })
    },
    [key],
  )

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  return [storedValue, setValue]
}

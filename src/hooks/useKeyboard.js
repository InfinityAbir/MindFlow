import { useEffect, useRef } from 'react'

export function useKeyboard(bindings) {
  const savedBindings = useRef(bindings)
  savedBindings.current = bindings

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          const binding = savedBindings.current.find(
            (b) => b.key === 'Escape' && (!b.modifier || (b.modifier === 'ctrl' && (e.ctrlKey || e.metaKey))),
          )
          if (binding) {
            e.preventDefault()
            binding.handler(e)
          }
        }
        return
      }

      for (const { key, modifier, handler } of savedBindings.current) {
        const modMatch =
          (!modifier) ||
          (modifier === 'ctrl' && (e.ctrlKey || e.metaKey)) ||
          (modifier === 'shift' && e.shiftKey)

        if (e.key.toLowerCase() === key.toLowerCase() && modMatch) {
          e.preventDefault()
          handler(e)
          return
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

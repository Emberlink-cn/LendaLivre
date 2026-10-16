import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'lendalivre_reading'
const SCALES = [0.94, 1.08, 1.24]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { scaleIndex: 1, last: null }
    const parsed = JSON.parse(raw)
    const scaleIndex = SCALES[parsed.scaleIndex] ? parsed.scaleIndex : 1
    return { scaleIndex, last: parsed.last ?? null }
  } catch {
    return { scaleIndex: 1, last: null }
  }
}

const ReadingContext = createContext(null)

export function ReadingProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setScaleIndex = useCallback((scaleIndex) => {
    setState((current) => ({ ...current, scaleIndex }))
  }, [])

  const remember = useCallback((workId, chapterId) => {
    setState((current) => {
      if (current.last?.workId === workId && current.last?.chapterId === chapterId) return current
      return { ...current, last: { workId, chapterId } }
    })
  }, [])

  const value = useMemo(
    () => ({
      scales: SCALES,
      scaleIndex: state.scaleIndex,
      fontScale: SCALES[state.scaleIndex],
      last: state.last,
      setScaleIndex,
      remember,
    }),
    [state, setScaleIndex, remember],
  )

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>
}

// O hook precisa ficar junto do provider para o estado da leitura.
// eslint-disable-next-line react-refresh/only-export-components
export function useReading() {
  const ctx = useContext(ReadingContext)
  if (!ctx) throw new Error('useReading deve ser usado dentro de ReadingProvider')
  return ctx
}

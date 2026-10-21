import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

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
  const { user, ready } = useAuth()
  const [state, setState] = useState(load)
  const remoteApplied = useRef(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    remoteApplied.current = false
  }, [user?.id])

  useEffect(() => {
    if (!ready || !user?.id) return undefined
    let alive = true
    supabase
      .from('reading_state')
      .select('chapters(slug, work_id)')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive || error || remoteApplied.current || !data?.chapters?.slug) return
        remoteApplied.current = true
        setState((current) => ({
          ...current,
          last: { workId: data.chapters.work_id, chapterId: data.chapters.slug },
        }))
      })
    return () => {
      alive = false
    }
  }, [ready, user?.id])

  const setScaleIndex = useCallback((scaleIndex) => {
    setState((current) => ({ ...current, scaleIndex }))
  }, [])

  const remember = useCallback((workId, chapterId, chapterDbId) => {
    remoteApplied.current = true
    setState((current) => {
      if (current.last?.workId === workId && current.last?.chapterId === chapterId) return current
      return { ...current, last: { workId, chapterId } }
    })
    if (!user?.id || !chapterDbId) return
    supabase.from('reading_state').upsert(
      { user_id: user.id, last_chapter_id: chapterDbId },
      { onConflict: 'user_id' },
    )
  }, [user])

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

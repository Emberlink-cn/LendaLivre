import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BASE_ITEMS, BASE_MUSIC } from '../data/collectibles'
import { listWorks } from '../data/catalog'

function coverUrl(file) {
  return `/midias/catalog-page/livros/${encodeURIComponent(file)}`
}

const STORAGE_KEY = 'lendalivre_library'

function loadLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { works: [], chapters: {}, workPatches: {} }
    const parsed = JSON.parse(raw)
    return {
      works: Array.isArray(parsed.works) ? parsed.works : [],
      chapters: parsed.chapters && typeof parsed.chapters === 'object' ? parsed.chapters : {},
      workPatches: parsed.workPatches && typeof parsed.workPatches === 'object' ? parsed.workPatches : {},
    }
  } catch {
    return { works: [], chapters: {}, workPatches: {} }
  }
}

function applyPatch(item, patches) {
  return { ...item, ...(patches?.[item.id] ?? {}) }
}

function resolveTracks(key, extra) {
  const removed = new Set(extra.removedTrackIds ?? [])
  const patches = extra.trackPatches ?? {}
  const base = BASE_MUSIC[key] ? [applyPatch({ id: `base_${key}`, ...BASE_MUSIC[key] }, patches)] : []
  const legacy = extra.music
    ? [applyPatch({ id: extra.music.id || 'custom', title: extra.music.title, embedUrl: extra.music.embedUrl }, patches)]
    : []
  const added = (extra.tracks ?? []).map((track) => applyPatch(track, patches))
  return [...base, ...legacy, ...added].filter((track) => track.embedUrl && !removed.has(track.id))
}

function resolveItems(key, extra) {
  const removed = new Set(extra.removedItemIds ?? [])
  const patches = extra.itemPatches ?? {}
  return [...(BASE_ITEMS[key] ?? []), ...(extra.items ?? [])]
    .map((item) => applyPatch(item, patches))
    .filter((item) => !removed.has(item.id))
}

function buildChapter(work, chapterId, extra = {}) {
  if (extra.removed) return null
  const key = `${work.id}:${chapterId}`
  const base = (work.chapters ?? []).find((chapter) => chapter.id === chapterId) ?? {
    id: chapterId,
    title: work.title,
    paragraphs: [],
  }
  const text = extra.text ?? {}
  const tracks = resolveTracks(key, extra)
  return {
    ...base,
    title: text.title || base.title,
    paragraphs: text.paragraphs ?? base.paragraphs,
    note: text.note ?? base.note,
    items: resolveItems(key, extra),
    tracks,
    music: tracks[0] ?? null,
  }
}

function decorate(work, chapters) {
  const prefix = `${work.id}:`
  const ids = (work.chapters ?? []).map((chapter) => chapter.id)
  for (const key of Object.keys(chapters)) {
    if (!key.startsWith(prefix)) continue
    const chapterId = key.slice(prefix.length)
    if (chapterId && !ids.includes(chapterId)) ids.push(chapterId)
  }
  return {
    ...work,
    cover: work.file ? coverUrl(work.file) : work.cover || null,
    chapters: ids.map((chapterId) => buildChapter(work, chapterId, chapters[`${work.id}:${chapterId}`])).filter(Boolean),
  }
}

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState(loadLibrary)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
  }, [library])

  const works = useMemo(
    () =>
      [
        ...listWorks().map((work) => {
          const moods = library.workPatches?.[work.id]?.moods
          return { ...work, source: 'base', moods: Array.isArray(moods) ? moods : work.moods }
        }),
        ...library.works.map((work) => ({ ...work, source: 'local' })),
      ].map((work) => decorate(work, library.chapters)),
    [library],
  )

  const getWork = useCallback((id) => works.find((work) => work.id === id) ?? null, [works])

  const addWork = useCallback((work) => {
    setLibrary((current) => ({ ...current, works: [...current.works, work] }))
  }, [])

  const updateWorkMoods = useCallback((workId, moods) => {
    setLibrary((current) => {
      if (current.works.some((work) => work.id === workId)) {
        return {
          ...current,
          works: current.works.map((work) => (work.id === workId ? { ...work, moods } : work)),
        }
      }
      return {
        ...current,
        workPatches: {
          ...(current.workPatches ?? {}),
          [workId]: { ...(current.workPatches?.[workId] ?? {}), moods },
        },
      }
    })
  }, [])

  const addItem = useCallback((workId, chapterId, item) => {
    const key = `${workId}:${chapterId}`
    setLibrary((current) => {
      const chapter = current.chapters[key] ?? { items: [] }
      return {
        ...current,
        chapters: {
          ...current.chapters,
          [key]: { ...chapter, items: [...(chapter.items ?? []), item] },
        },
      }
    })
  }, [])

  const patchChapter = useCallback((workId, chapterId, recipe) => {
    const key = `${workId}:${chapterId}`
    setLibrary((current) => {
      const chapter = current.chapters[key] ?? { items: [] }
      return {
        ...current,
        chapters: {
          ...current.chapters,
          [key]: recipe(chapter),
        },
      }
    })
  }, [])

  const setChapterText = useCallback((workId, chapterId, text) => {
    patchChapter(workId, chapterId, (chapter) => ({ ...chapter, removed: false, text }))
  }, [patchChapter])

  const removeChapter = useCallback((workId, chapterId) => {
    const key = `${workId}:${chapterId}`
    setLibrary((current) => {
      const ownsWork = current.works.some((work) => work.id === workId)
      if (ownsWork) {
        const chapters = { ...current.chapters }
        delete chapters[key]
        return {
          works: current.works.map((work) =>
            work.id === workId
              ? { ...work, chapters: (work.chapters ?? []).filter((chapter) => chapter.id !== chapterId) }
              : work,
          ),
          chapters,
        }
      }
      return {
        ...current,
        chapters: {
          ...current.chapters,
          [key]: { ...(current.chapters[key] ?? {}), removed: true },
        },
      }
    })
  }, [])

  const updateItem = useCallback((workId, chapterId, itemId, patch) => {
    patchChapter(workId, chapterId, (chapter) => {
      const extras = chapter.items ?? []
      if (extras.some((item) => item.id === itemId)) {
        return {
          ...chapter,
          items: extras.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
        }
      }
      return {
        ...chapter,
        itemPatches: {
          ...(chapter.itemPatches ?? {}),
          [itemId]: { ...(chapter.itemPatches?.[itemId] ?? {}), ...patch },
        },
      }
    })
  }, [patchChapter])

  const removeItem = useCallback((workId, chapterId, itemId) => {
    patchChapter(workId, chapterId, (chapter) => {
      const extras = chapter.items ?? []
      if (extras.some((item) => item.id === itemId)) {
        return { ...chapter, items: extras.filter((item) => item.id !== itemId) }
      }
      return {
        ...chapter,
        removedItemIds: [...new Set([...(chapter.removedItemIds ?? []), itemId])],
      }
    })
  }, [patchChapter])

  const addTrack = useCallback((workId, chapterId, track) => {
    patchChapter(workId, chapterId, (chapter) => ({
      ...chapter,
      tracks: [...(chapter.tracks ?? []), track],
    }))
  }, [patchChapter])

  const updateTrack = useCallback((workId, chapterId, trackId, patch) => {
    patchChapter(workId, chapterId, (chapter) => {
      const extras = chapter.tracks ?? []
      if (extras.some((track) => track.id === trackId) || (chapter.music && (chapter.music.id || 'custom') === trackId)) {
        return {
          ...chapter,
          music: chapter.music && (chapter.music.id || 'custom') === trackId ? { ...chapter.music, ...patch, id: trackId } : chapter.music,
          tracks: extras.map((track) => (track.id === trackId ? { ...track, ...patch } : track)),
        }
      }
      return {
        ...chapter,
        trackPatches: {
          ...(chapter.trackPatches ?? {}),
          [trackId]: { ...(chapter.trackPatches?.[trackId] ?? {}), ...patch },
        },
      }
    })
  }, [patchChapter])

  const removeTrack = useCallback((workId, chapterId, trackId) => {
    patchChapter(workId, chapterId, (chapter) => ({
      ...chapter,
      music: chapter.music && (chapter.music.id || 'custom') === trackId ? null : chapter.music,
      tracks: (chapter.tracks ?? []).filter((track) => track.id !== trackId),
      removedTrackIds: [...new Set([...(chapter.removedTrackIds ?? []), trackId])],
    }))
  }, [patchChapter])

  const value = useMemo(
    () => ({
      works,
      getWork,
      addWork,
      updateWorkMoods,
      addItem,
      setChapterText,
      removeChapter,
      updateItem,
      removeItem,
      addTrack,
      updateTrack,
      removeTrack,
    }),
    [works, getWork, addWork, updateWorkMoods, addItem, setChapterText, removeChapter, updateItem, removeItem, addTrack, updateTrack, removeTrack],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary deve ser usado dentro de LibraryProvider')
  return ctx
}

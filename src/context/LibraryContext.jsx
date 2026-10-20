import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BASE_ITEMS, BASE_MUSIC } from '../data/collectibles'
import { listWorks } from '../data/catalog'

function findSourceKey(library, workId, chapterId) {
  const base = listWorks().find((work) => work.id === workId)
  const local = library.works.find((work) => work.id === workId)
  const known = [...(base?.chapters ?? []), ...(local?.chapters ?? [])].find((chapter) => chapter.id === chapterId)
  return known?.sourceKey || `${workId}:${chapterId}`
}

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

function buildChapter(work, chapterId, chaptersStore, workPatches) {
  const base = (work.chapters ?? []).find((chapter) => chapter.id === chapterId) ?? {
    id: chapterId,
    title: 'Capítulo',
    name: 'Capítulo',
    paragraphs: [],
    moods: [],
    number: 0,
  }
  const key = base.sourceKey || `${work.id}:${chapterId}`
  const extra = chaptersStore[key] ?? {}
  if (extra.removed) return null
  const meta = extra.meta ?? {}
  const text = extra.text ?? {}
  const legacyMoods = base.legacyWorkId ? workPatches?.[base.legacyWorkId]?.moods : null
  const moods = Array.isArray(meta.moods) ? meta.moods : Array.isArray(legacyMoods) ? legacyMoods : base.moods ?? []
  const file = meta.file || base.file
  const cover = meta.cover || (file ? coverUrl(file) : base.cover || null)
  const tracks = resolveTracks(key, extra)
  const number = Number(meta.number ?? base.number)
  return {
    ...base,
    title: text.title || meta.title || base.title,
    name: meta.name || base.name || text.title || base.title,
    number: Number.isFinite(number) && number > 0 ? number : 0,
    line: meta.line ?? base.line ?? '',
    moods,
    file,
    cover,
    paragraphs: text.paragraphs ?? base.paragraphs ?? [],
    note: text.note ?? base.note ?? '',
    items: resolveItems(key, extra),
    tracks,
    music: tracks[0] ?? null,
  }
}

function decorate(work, chapters, workPatches) {
  const prefix = `${work.id}:`
  const ids = (work.chapters ?? []).map((chapter) => chapter.id)
  for (const key of Object.keys(chapters)) {
    if (!key.startsWith(prefix)) continue
    const chapterId = key.slice(prefix.length)
    if (chapterId && !ids.includes(chapterId)) ids.push(chapterId)
  }
  const built = ids
    .map((chapterId) => buildChapter(work, chapterId, chapters, workPatches))
    .filter(Boolean)
    .sort((a, b) => (a.number || 999) - (b.number || 999) || a.name.localeCompare(b.name, 'pt'))
  const moods = [...new Set(built.flatMap((chapter) => chapter.moods))]
  return {
    ...work,
    moods: moods.length ? moods : work.moods,
    cover: work.cover || (work.file ? coverUrl(work.file) : null),
    chapters: built,
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
          const patch = library.workPatches?.[work.id] ?? {}
          return {
            ...work,
            source: 'base',
            title: patch.title || work.title,
            line: patch.line ?? work.line,
            cover: patch.cover || (work.file ? coverUrl(work.file) : work.cover || null),
          }
        }),
        ...library.works.map((work) => ({ ...work, source: 'local' })),
      ].map((work) => decorate(work, library.chapters, library.workPatches)),
    [library],
  )

  const getWork = useCallback((id) => works.find((work) => work.id === id) ?? null, [works])

  const addWork = useCallback((work) => {
    setLibrary((current) => ({ ...current, works: [...current.works, work] }))
  }, [])

  const updateWorkDetails = useCallback((workId, details) => {
    setLibrary((current) => {
      if (current.works.some((work) => work.id === workId)) {
        return {
          ...current,
          works: current.works.map((work) => (work.id === workId ? { ...work, ...details } : work)),
        }
      }
      return {
        ...current,
        workPatches: {
          ...(current.workPatches ?? {}),
          [workId]: { ...(current.workPatches?.[workId] ?? {}), ...details },
        },
      }
    })
  }, [])

  const updateChapterMeta = useCallback((workId, chapterId, meta) => {
    setLibrary((current) => {
      const key = findSourceKey(current, workId, chapterId)
      const chapter = current.chapters[key] ?? {}
      return {
        ...current,
        chapters: {
          ...current.chapters,
          [key]: { ...chapter, meta: { ...(chapter.meta ?? {}), ...meta } },
        },
      }
    })
  }, [])

  const addChapter = useCallback((workId, chapter) => {
    setLibrary((current) => {
      const key = `${workId}:${chapter.id}`
      const stored = {
        ...(current.chapters[key] ?? {}),
        text: {
          title: chapter.title,
          paragraphs: chapter.paragraphs ?? [],
          note: chapter.note ?? '',
        },
        meta: {
          name: chapter.name || chapter.title,
          title: chapter.title,
          number: chapter.number,
          line: chapter.line ?? '',
          moods: chapter.moods ?? [],
          cover: chapter.cover || '',
        },
      }
      const ownsWork = current.works.some((work) => work.id === workId)
      if (ownsWork) {
        return {
          ...current,
          works: current.works.map((work) =>
            work.id === workId ? { ...work, chapters: [...(work.chapters ?? []), { ...chapter, sourceKey: null }] } : work,
          ),
          chapters: { ...current.chapters, [key]: stored },
        }
      }
      return { ...current, chapters: { ...current.chapters, [key]: stored } }
    })
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
    setLibrary((current) => {
      const key = findSourceKey(current, workId, chapterId)
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
    setLibrary((current) => {
      const key = findSourceKey(current, workId, chapterId)
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
    setLibrary((current) => {
      const key = findSourceKey(current, workId, chapterId)
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
      updateWorkDetails,
      updateChapterMeta,
      addChapter,
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
    [works, getWork, addWork, updateWorkDetails, updateChapterMeta, addChapter, updateWorkMoods, addItem, setChapterText, removeChapter, updateItem, removeItem, addTrack, updateTrack, removeTrack],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary deve ser usado dentro de LibraryProvider')
  return ctx
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BASE_ITEMS, BASE_MUSIC } from '../data/collectibles'
import { listWorks } from '../data/catalog'
import {
  publishNewWork,
  removeChapterRecord,
  removeItemRecord,
  removeTrackRecord,
  saveChapterRecord,
  saveItemRecord,
  saveTrackRecord,
  saveWorkRecord,
} from '../lib/publish'
import { loadRemoteWorks } from '../lib/remoteCatalog'
import { useAuth } from './AuthContext'

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

function resolveTracks(key, extra, seeded) {
  const removed = new Set(extra.removedTrackIds ?? [])
  const patches = extra.trackPatches ?? {}
  const base = seeded ?? (BASE_MUSIC[key] ? [{ id: `base_${key}`, ...BASE_MUSIC[key] }] : [])
  const legacy = extra.music
    ? [{ id: extra.music.id || 'custom', title: extra.music.title, embedUrl: extra.music.embedUrl }]
    : []
  const seen = new Set()
  const tracks = []
  for (const track of [...base, ...legacy, ...(extra.tracks ?? [])]) {
    const next = applyPatch(track, patches)
    if (!next?.id || !next.embedUrl || removed.has(next.id) || seen.has(next.id)) continue
    seen.add(next.id)
    tracks.push(next)
  }
  return tracks
}

function resolveItems(key, extra, seeded) {
  if (seeded) return seeded.filter((item) => item?.id)
  const removed = new Set(extra.removedItemIds ?? [])
  const patches = extra.itemPatches ?? {}
  const seen = new Set()
  const items = []
  for (const item of [...(BASE_ITEMS[key] ?? []), ...(extra.items ?? [])]) {
    const next = applyPatch(item, patches)
    if (!next?.id || removed.has(next.id) || seen.has(next.id)) continue
    seen.add(next.id)
    items.push(next)
  }
  return items
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
  const cover = meta.cover || base.cover || (file ? coverUrl(file) : null)
  const seededTracks = base.fromDatabase ? base.tracks ?? [] : null
  const seededItems = base.fromDatabase ? base.items ?? [] : null
  const tracks = resolveTracks(key, extra, seededTracks)
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
    items: resolveItems(key, extra, seededItems),
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
  const { user, ready } = useAuth()
  const [library, setLibrary] = useState(loadLibrary)
  const [remote, setRemote] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
  }, [library])

  useEffect(() => {
    if (!ready) return undefined
    let alive = true
    function pull() {
      loadRemoteWorks().then((next) => {
        if (alive && next?.length) setRemote(next)
      })
    }
    pull()
    function onShow() {
      if (document.visibilityState === 'visible') pull()
    }
    document.addEventListener('visibilitychange', onShow)
    return () => {
      alive = false
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [ready, user?.id])

  const works = useMemo(() => {
    const catalog = remote?.length ? remote : listWorks()
    const publishedIds = new Set(catalog.map((work) => work.id))
    return [
      ...catalog.map((work) => {
        const patch = library.workPatches?.[work.id] ?? {}
        return {
          ...work,
          source: work.fromDatabase ? 'database' : 'base',
          title: patch.title || work.title,
          line: patch.line ?? work.line,
          cover: patch.cover || work.cover || (work.file ? coverUrl(work.file) : null),
        }
      }),
      ...library.works.filter((work) => !publishedIds.has(work.id)).map((work) => ({ ...work, source: 'local' })),
    ].map((work) => decorate(work, library.chapters, library.workPatches))
  }, [library, remote])

  const getWork = useCallback((id) => works.find((work) => work.id === id) ?? null, [works])

  const refreshCatalog = useCallback(async () => {
    const next = await loadRemoteWorks()
    if (!next?.length) throw new Error('Salvei, mas a tela não atualizou. Recarregue a página.')
    setRemote(next)
  }, [])

  const chapterRecord = useCallback((workId, chapterId) => {
    const work = works.find((item) => item.id === workId)
    return work?.chapters.find((item) => item.id === chapterId) ?? null
  }, [works])

  const forgetChapter = useCallback((workId, chapterId) => {
    setLibrary((current) => {
      const keys = [findSourceKey(current, workId, chapterId), `${workId}:${chapterId}`]
      const chapters = { ...current.chapters }
      for (const key of keys) delete chapters[key]
      return { ...current, chapters }
    })
  }, [])

  const addWork = useCallback(async (work) => {
    await publishNewWork(work)
    await refreshCatalog()
  }, [refreshCatalog])

  const updateWorkDetails = useCallback(async (workId, details) => {
    await saveWorkRecord({ id: workId, title: details.title, line: details.line, cover: details.cover })
    await refreshCatalog()
    setLibrary((current) => {
      const workPatches = { ...(current.workPatches ?? {}) }
      delete workPatches[workId]
      return {
        ...current,
        works: current.works.filter((work) => work.id !== workId),
        workPatches,
      }
    })
  }, [refreshCatalog])

  const updateChapterMeta = useCallback(async (workId, chapterId, meta) => {
    const chapter = chapterRecord(workId, chapterId)
    await saveChapterRecord({
      dbId: chapter?.dbId,
      workId,
      slug: chapterId,
      sourceKey: chapter?.sourceKey,
      changes: meta,
    })
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const addChapter = useCallback(async (workId, chapter) => {
    await saveChapterRecord({
      workId,
      slug: chapter.id,
      sourceKey: `${workId}:${chapter.id}`,
      changes: {
        number: chapter.number,
        name: chapter.name,
        title: chapter.title,
        line: chapter.line,
        moods: chapter.moods,
        paragraphs: chapter.paragraphs,
        note: chapter.note,
        cover: chapter.cover,
      },
    })
    await refreshCatalog()
  }, [refreshCatalog])

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

  const addItem = useCallback(async (workId, chapterId, item) => {
    const chapter = chapterRecord(workId, chapterId)
    if (!chapter?.dbId) throw new Error('Não encontrei este capítulo no catálogo. Recarregue a página.')
    await saveItemRecord({
      chapterDbId: chapter.dbId,
      item,
      position: chapter.items?.length ?? 0,
    })
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const setChapterText = useCallback(async (workId, chapterId, text) => {
    const chapter = chapterRecord(workId, chapterId)
    await saveChapterRecord({
      dbId: chapter?.dbId,
      workId,
      slug: chapterId,
      sourceKey: chapter?.sourceKey,
      changes: text,
    })
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const removeChapter = useCallback(async (workId, chapterId) => {
    const chapter = chapterRecord(workId, chapterId)
    await removeChapterRecord(chapter?.dbId)
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const updateItem = useCallback(async (workId, chapterId, itemId, patch) => {
    const chapter = chapterRecord(workId, chapterId)
    if (!chapter?.dbId) throw new Error('Não encontrei este capítulo no catálogo. Recarregue a página.')
    const current = chapter.items?.find((item) => item.id === itemId) ?? { id: itemId }
    const index = chapter.items?.findIndex((item) => item.id === itemId) ?? -1
    await saveItemRecord({
      chapterDbId: chapter.dbId,
      item: { ...current, ...patch, id: itemId },
      position: index >= 0 ? index : 0,
    })
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const removeItem = useCallback(async (workId, chapterId, itemId) => {
    const chapter = chapterRecord(workId, chapterId)
    await removeItemRecord({ chapterDbId: chapter?.dbId, itemId })
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const addTrack = useCallback(async (workId, chapterId, track) => {
    const chapter = chapterRecord(workId, chapterId)
    if (!chapter?.dbId) throw new Error('Não encontrei este capítulo no catálogo. Recarregue a página.')
    await saveTrackRecord({
      chapterDbId: chapter.dbId,
      track,
      position: chapter.tracks?.length ?? 0,
    })
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const updateTrack = useCallback(async (workId, chapterId, trackId, patch) => {
    const chapter = chapterRecord(workId, chapterId)
    if (!chapter?.dbId) throw new Error('Não encontrei este capítulo no catálogo. Recarregue a página.')
    const current = chapter.tracks?.find((track) => track.id === trackId) ?? { id: trackId }
    const index = chapter.tracks?.findIndex((track) => track.id === trackId) ?? -1
    await saveTrackRecord({
      chapterDbId: chapter.dbId,
      track: { ...current, ...patch, id: trackId },
      position: index >= 0 ? index : 0,
    })
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [chapterRecord, refreshCatalog, forgetChapter])

  const removeTrack = useCallback(async (workId, chapterId, trackId) => {
    await removeTrackRecord(trackId)
    await refreshCatalog()
    forgetChapter(workId, chapterId)
  }, [refreshCatalog, forgetChapter])

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

const KEY = 'lendalivre_reading_place'

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (!parsed || typeof parsed !== 'object' || !parsed.users || typeof parsed.users !== 'object') {
      return { users: {} }
    }
    return parsed
  } catch {
    return { users: {} }
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* a leitura segue mesmo sem gravar o ponto */
  }
}

function recordOf(store, userId) {
  const current = store.users[userId]
  const chapters = current?.chapters && typeof current.chapters === 'object' ? current.chapters : {}
  const resume = typeof current?.resume === 'string' ? current.resume : null
  return { resume, chapters }
}

const bootStore = readStore()

export function bootResume(userId) {
  if (!userId) return null
  const resume = recordOf(bootStore, userId).resume
  return resume && /^\/ler\/[^/]+\/[^/]+$/.test(resume) ? resume : null
}

export function chapterSpot(userId, workId, chapterId) {
  if (!userId || !workId || !chapterId) return null
  const spot = recordOf(readStore(), userId).chapters[`${workId}/${chapterId}`]
  if (!spot || typeof spot !== 'object') return null
  const index = Number(spot.index)
  const ratio = Number(spot.ratio)
  if (!Number.isInteger(index) || index < 0 || !Number.isFinite(ratio)) return null
  return {
    index,
    ratio: Math.min(1, Math.max(0, ratio)),
    atStart: spot.atStart === true,
  }
}

export function rememberOpenChapter(userId, workId, chapterId) {
  if (!userId || !workId || !chapterId) return
  const store = readStore()
  const record = recordOf(store, userId)
  record.resume = `/ler/${workId}/${chapterId}`
  store.users[userId] = record
  writeStore(store)
}

export function saveChapterSpot(userId, workId, chapterId, spot) {
  if (!userId || !workId || !chapterId || !spot) return
  const store = readStore()
  const record = recordOf(store, userId)
  record.chapters[`${workId}/${chapterId}`] = {
    index: spot.index,
    ratio: Math.min(1, Math.max(0, spot.ratio)),
    atStart: spot.atStart === true,
  }
  record.resume = `/ler/${workId}/${chapterId}`
  store.users[userId] = record
  writeStore(store)
}

export function clearResume(userId) {
  if (!userId) return
  const store = readStore()
  const record = recordOf(store, userId)
  if (!record.resume) return
  record.resume = null
  store.users[userId] = record
  writeStore(store)
}

function readingAnchor() {
  const header = document.querySelector('header')
  return (header?.getBoundingClientRect().height || 0) + 8
}

export function captureReadingSpot() {
  const nodes = document.querySelectorAll('[data-read-paragraph]')
  if (!nodes.length) return null
  const anchor = readingAnchor()
  const first = nodes[0].getBoundingClientRect()
  if (first.top >= anchor - 1) return { index: 0, ratio: 0, atStart: true }
  let index = 0
  let ratio = 0
  for (const node of nodes) {
    const rect = node.getBoundingClientRect()
    index = Number(node.dataset.readParagraph) || 0
    if (rect.bottom > anchor + 1) {
      ratio = rect.height > 0 ? (anchor - rect.top) / rect.height : 0
      break
    }
    ratio = 1
  }
  return { index, ratio: Math.min(1, Math.max(0, ratio)), atStart: false }
}

export function revealReadingSpot(spot) {
  if (!spot || spot.atStart) {
    window.scrollTo(0, 0)
    return
  }
  const node = document.querySelector(`[data-read-paragraph="${spot.index}"]`)
  if (!node) {
    window.scrollTo(0, 0)
    return
  }
  const rect = node.getBoundingClientRect()
  const top = window.scrollY + rect.top - readingAnchor() + spot.ratio * rect.height
  window.scrollTo(0, Math.max(0, top))
}

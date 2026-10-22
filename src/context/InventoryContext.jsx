import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { mediaUrl } from '../lib/remoteCatalog'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const DEMO_INVENTORY_IDS = ['user_nara', 'user_criador']
const DEMO_RESET_MARK = 'lendalivre_demo_inventory_reset'

function storageKey(userId) {
  return `lendalivre_inventory_${userId || 'visitante'}`
}

function resetDemoInventories() {
  try {
    if (localStorage.getItem(DEMO_RESET_MARK) === '1') return false
    for (const id of DEMO_INVENTORY_IDS) localStorage.removeItem(storageKey(id))
    localStorage.setItem(DEMO_RESET_MARK, '1')
    return true
  } catch {
    return false
  }
}

function load(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function cardFromRow(row) {
  const item = row.items
  if (!item?.id) return null
  const image = mediaUrl(item.image)
  return {
    id: item.id,
    name: item.name,
    word: item.word,
    type: item.type,
    rarity: item.rarity || 'comum',
    atmosphere: item.atmosphere || '',
    ...(Array.isArray(item.atmospheres) ? { atmospheres: item.atmospheres } : {}),
    ...(item.image_zoom == null ? {} : { imageZoom: item.image_zoom }),
    ...(item.image_x == null ? {} : { imageX: item.image_x }),
    ...(item.image_y == null ? {} : { imageY: item.image_y }),
    ...(item.frame ? { frame: item.frame } : {}),
    ...(image ? { image } : {}),
    passive: item.passive || '',
    stats: {
      energia: item.energia ?? 0,
      ataque: item.ataque ?? 0,
      defesa: item.defesa ?? 0,
      sorte: item.sorte ?? 0,
      azar: item.azar ?? 0,
    },
    workTitle: row.chapters?.works?.title || '',
    chapterTitle: row.chapters?.name || '',
    collectedAt: row.collected_at,
  }
}

const ITEM_COLUMNS =
  'collected_at, items(id, name, word, type, rarity, atmosphere, atmospheres, image_zoom, image_x, image_y, frame, passive, energia, ataque, defesa, sorte, azar, image:media!items_image_id_fkey(bucket, path)), chapters(name, works(title))'
const ITEM_COLUMNS_BASIC =
  'collected_at, items(id, name, word, type, rarity, atmosphere, frame, passive, energia, ataque, defesa, sorte, azar, image:media!items_image_id_fkey(bucket, path)), chapters(name, works(title))'

function missingItemColumns(error) {
  const message = String(error?.message || '')
  return /atmospheres|image_zoom|image_x|image_y|schema cache/i.test(message)
}

function rememberedItems(userId) {
  const own = load(userId)
  if (userId === 'visitante') return own
  const guest = load('visitante')
  const seen = new Set(own.map((item) => item?.id).filter(Boolean))
  return [...own, ...guest.filter((item) => item?.id && !seen.has(item.id))]
}

async function readAccountItems(accountId) {
  let listed = await supabase.from('user_items').select(ITEM_COLUMNS).eq('user_id', accountId)
  if (listed.error && missingItemColumns(listed.error)) {
    listed = await supabase.from('user_items').select(ITEM_COLUMNS_BASIC).eq('user_id', accountId)
  }
  if (listed.error) return null
  return (listed.data ?? []).map(cardFromRow).filter(Boolean)
}

async function storeAccountItem(accountId, item) {
  const row = {
    user_id: accountId,
    item_id: item.id,
    collected_at: item.collectedAt || new Date().toISOString(),
  }
  if (item.chapterDbId) row.chapter_id = item.chapterDbId
  let result = await supabase.from('user_items').insert(row)
  if (result.error?.code === '23503' && row.chapter_id) {
    delete row.chapter_id
    result = await supabase.from('user_items').insert(row)
  }
  return !result.error || result.error.code === '23505'
}

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const { user, ready } = useAuth()
  const userId = user?.id ?? 'visitante'
  const [activeUserId, setActiveUserId] = useState(userId)
  const [items, setItems] = useState(() => {
    const reset = resetDemoInventories()
    if (reset && DEMO_INVENTORY_IDS.includes(userId)) return []
    return load(userId)
  })

  if (userId !== activeUserId) {
    setActiveUserId(userId)
    setItems(load(userId))
  }

  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
    localStorage.setItem(storageKey(activeUserId), JSON.stringify(items))
  }, [items, activeUserId])

  useEffect(() => {
    if (!ready || !user?.id) return undefined
    let alive = true
    const accountId = user.id

    async function sync() {
      const remote = await readAccountItems(accountId)
      if (!alive || !remote) return
      const have = new Set(remote.map((item) => item.id))
      const pending = [...itemsRef.current, ...rememberedItems(accountId)]
      for (const item of pending) {
        if (!item?.id || have.has(item.id)) continue
        const saved = await storeAccountItem(accountId, item)
        if (saved) have.add(item.id)
      }
      const fresh = await readAccountItems(accountId)
      if (!alive || !fresh) return
      const ids = new Set(fresh.map((item) => item.id))
      setItems((current) => {
        const extras = current.filter((item) => item?.id && !ids.has(item.id))
        return [...fresh, ...extras]
      })
      const guestIds = load('visitante').map((item) => item?.id).filter(Boolean)
      if (guestIds.every((id) => ids.has(id))) localStorage.removeItem(storageKey('visitante'))
    }

    sync()
    function onShow() {
      if (document.visibilityState === 'visible') sync()
    }
    document.addEventListener('visibilitychange', onShow)
    return () => {
      alive = false
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [ready, user?.id])

  const has = useCallback((itemId) => items.some((item) => item.id === itemId), [items])

  const collect = useCallback((item, origin) => {
    const collectedAt = new Date().toISOString()
    const stored = {
      ...item,
      workTitle: origin.workTitle,
      chapterTitle: origin.chapterTitle,
      chapterDbId: origin.chapterDbId || null,
      collectedAt,
    }
    setItems((current) => (current.some((entry) => entry.id === item.id) ? current : [...current, stored]))
    if (!user?.id) return Promise.resolve('local')
    return storeAccountItem(user.id, stored)
  }, [user])

  const value = useMemo(() => ({ items, has, collect, userId }), [items, has, collect, userId])

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory deve ser usado dentro de InventoryProvider')
  return ctx
}

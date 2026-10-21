import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
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
  return {
    id: item.id,
    name: item.name,
    word: item.word,
    type: item.type,
    rarity: item.rarity || 'comum',
    atmosphere: item.atmosphere || '',
    ...(item.frame ? { frame: item.frame } : {}),
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

  useEffect(() => {
    localStorage.setItem(storageKey(activeUserId), JSON.stringify(items))
  }, [items, activeUserId])

  useEffect(() => {
    if (!ready || !user?.id) return undefined
    let alive = true
    const accountId = user.id
    supabase
      .from('user_items')
      .select(
        'collected_at, items(id, name, word, type, rarity, atmosphere, frame, passive, energia, ataque, defesa, sorte, azar), chapters(name, works(title))',
      )
      .eq('user_id', accountId)
      .then(({ data, error }) => {
        if (!alive || error) return
        const remoteCards = (data ?? []).map(cardFromRow).filter(Boolean)
        const remoteIds = new Set(remoteCards.map((item) => item.id))
        for (const item of load(accountId)) {
          if (!item?.id || remoteIds.has(item.id)) continue
          supabase.from('user_items').insert({
            user_id: accountId,
            item_id: item.id,
            collected_at: item.collectedAt || new Date().toISOString(),
          })
        }
        setItems((current) => {
          const extras = current.filter((item) => item?.id && !remoteIds.has(item.id))
          return [...remoteCards, ...extras]
        })
      })
    return () => {
      alive = false
    }
  }, [ready, user?.id])

  const has = useCallback((itemId) => items.some((item) => item.id === itemId), [items])

  const collect = useCallback((item, origin) => {
    const collectedAt = new Date().toISOString()
    setItems((current) => {
      if (current.some((entry) => entry.id === item.id)) return current
      return [
        ...current,
        {
          ...item,
          workTitle: origin.workTitle,
          chapterTitle: origin.chapterTitle,
          collectedAt,
        },
      ]
    })
    if (!user?.id) return
    supabase.from('user_items').insert({
      user_id: user.id,
      item_id: item.id,
      chapter_id: origin.chapterDbId || null,
      collected_at: collectedAt,
    })
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

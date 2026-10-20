import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
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

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const { user } = useAuth()
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
    if (!resetDemoInventories()) return
    if (DEMO_INVENTORY_IDS.includes(activeUserId)) setItems([])
  }, [activeUserId])

  useEffect(() => {
    localStorage.setItem(storageKey(activeUserId), JSON.stringify(items))
  }, [items, activeUserId])

  const has = useCallback((itemId) => items.some((item) => item.id === itemId), [items])

  const collect = useCallback((item, origin) => {
    setItems((current) => {
      if (current.some((entry) => entry.id === item.id)) return current
      return [
        ...current,
        {
          ...item,
          workTitle: origin.workTitle,
          chapterTitle: origin.chapterTitle,
          collectedAt: new Date().toISOString(),
        },
      ]
    })
  }, [])

  const value = useMemo(() => ({ items, has, collect, userId }), [items, has, collect, userId])

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory deve ser usado dentro de InventoryProvider')
  return ctx
}

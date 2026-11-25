export const DECK_LIMIT = 5
export const DECK_SIZE = 30

function storageKey(userId) {
  return `lendalivre_decks_${userId || 'visitante'}`
}

function activeKey(userId) {
  return `lendalivre_match_deck_${userId || 'visitante'}`
}

function emptyDecks() {
  return Array.from({ length: DECK_LIMIT }, (_, index) => ({
    id: `deck-${index + 1}`,
    name: `Deck ${index + 1}`,
    cardIds: [],
  }))
}

function cleanIds(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const ids = []
  for (const id of value) {
    if (typeof id !== 'string' || !id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
    if (ids.length >= DECK_SIZE) break
  }
  return ids
}

export function loadDecks(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    const parsed = raw ? JSON.parse(raw) : null
    return emptyDecks().map((slot, index) => {
      const saved = Array.isArray(parsed) ? parsed[index] : null
      if (!saved || typeof saved !== 'object') return slot
      const name = typeof saved.name === 'string' ? saved.name.trim().slice(0, 32) : ''
      return {
        ...slot,
        name: name || slot.name,
        cardIds: cleanIds(saved.cardIds),
      }
    })
  } catch {
    return emptyDecks()
  }
}

export function saveDecks(userId, decks) {
  localStorage.setItem(storageKey(userId), JSON.stringify(decks))
}

export function rememberMatchDeck(userId, deckId) {
  localStorage.setItem(activeKey(userId), deckId)
}

export function cardsForMatch(userId, inventory) {
  try {
    const deckId = localStorage.getItem(activeKey(userId))
    if (!deckId) return null
    const deck = loadDecks(userId).find((item) => item.id === deckId)
    if (!deck?.cardIds.length) return null
    const byId = new Map(inventory.map((card) => [card.id, card]))
    const cards = deck.cardIds.map((id) => byId.get(id)).filter(Boolean)
    return cards.length ? cards : null
  } catch {
    return null
  }
}

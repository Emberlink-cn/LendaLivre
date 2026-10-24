import { useMemo } from 'react'
import { presentCard } from '../../data/cardTraits'
import { BASE_ITEMS } from '../../data/collectibles'
import { useInventory } from '../../context/InventoryContext'

function samples() {
  return Object.values(BASE_ITEMS)
    .flat()
    .map((item) => presentCard({ ...item, workTitle: 'Terras Invisíveis' }))
}

export function usePilotDeck() {
  const { items } = useInventory()
  return useMemo(() => {
    const collected = items.map((item) => presentCard(item))
    if (collected.length) return { cards: collected, usingSamples: false }
    return { cards: samples(), usingSamples: true }
  }, [items])
}

export const LANES = [
  { id: 'xipaia', name: 'Xipaia', line: 'Feira e palácio' },
  { id: 'areia', name: 'Areia', line: 'Dunas e portões' },
  { id: 'mata', name: 'Mata', line: 'Noite fechada' },
]

export function dealPreview(cards) {
  return {
    lanes: LANES.map((lane, index) => ({ ...lane, card: cards[index] || null })),
    hand: cards.slice(3, 7),
  }
}

export const RARITIES = [
  { id: 'comum', label: 'Comum' },
  { id: 'incomum', label: 'Incomum' },
  { id: 'raro', label: 'Raro' },
  { id: 'epico', label: 'Épico' },
  { id: 'lendario', label: 'Lendário' },
]

export const FRAMES = [
  { id: 'gold', label: 'Ouro' },
  { id: 'white', label: 'Branco' },
  { id: 'black', label: 'Preto' },
  { id: 'green', label: 'Verde' },
  { id: 'blue', label: 'Azul' },
  { id: 'red', label: 'Vermelho' },
]

export const ATTRIBUTES = [
  { id: 'energia', label: 'Energia', short: 'Ene' },
  { id: 'ataque', label: 'Ataque', short: 'Atq' },
  { id: 'defesa', label: 'Defesa', short: 'Def' },
  { id: 'sorte', label: 'Sorte', short: 'Sor' },
  { id: 'azar', label: 'Azar', short: 'Aza' },
]

export const TYPE_FRAME = {
  animal: 'green',
  planta: 'green',
  inseto: 'green',
  ingrediente: 'green',
  arma: 'red',
  magia: 'blue',
  maldicao: 'black',
  frasco: 'blue',
  bebida: 'blue',
  moeda: 'gold',
  relic: 'gold',
  vestimenta: 'white',
  texto: 'white',
  local: 'white',
  personagem: 'gold',
  montaria: 'green',
}

function clamp(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

export function atmospheresOf(item = {}) {
  if (Array.isArray(item.atmospheres) && item.atmospheres.length) {
    return item.atmospheres.map((mood) => String(mood).trim()).filter(Boolean)
  }
  if (Array.isArray(item.atmosphere) && item.atmosphere.length) {
    return item.atmosphere.map((mood) => String(mood).trim()).filter(Boolean)
  }
  return String(item.atmosphere || '')
    .split('·')
    .map((mood) => mood.trim())
    .filter(Boolean)
}

export function imageFrameOf(item = {}) {
  return {
    zoom: clamp(item.imageZoom ?? item.image_zoom, 1, 3, 1),
    x: clamp(item.imageX ?? item.image_x, 0, 100, 50),
    y: clamp(item.imageY ?? item.image_y, 0, 100, 50),
  }
}

export const EMPTY_STATS = {
  energia: 0,
  ataque: 0,
  defesa: 0,
  sorte: 0,
  azar: 0,
}

export function rarityLabel(id) {
  return RARITIES.find((item) => item.id === id)?.label || 'Comum'
}

export function frameLabel(id) {
  return FRAMES.find((item) => item.id === id)?.label || 'Ouro'
}

export function presentCard(item = {}) {
  const stats = { ...EMPTY_STATS, ...(item.stats || {}) }
  for (const key of Object.keys(EMPTY_STATS)) {
    const value = Number(stats[key])
    stats[key] = Number.isFinite(value) ? value : 0
  }
  const atmospheres = atmospheresOf(item)
  const frame = imageFrameOf(item)
  return {
    ...item,
    atmospheres,
    atmosphere: atmospheres.join(' · '),
    rarity: item.rarity || 'comum',
    frame: item.frame || TYPE_FRAME[item.type] || 'gold',
    passive: item.passive || '',
    imageZoom: frame.zoom,
    imageX: frame.x,
    imageY: frame.y,
    stats,
  }
}

export function faceStats(card) {
  return ATTRIBUTES.map((attribute) => ({
    label: attribute.short,
    value: card.stats[attribute.id],
  }))
}

export function matchesCardFilters(item, filters) {
  const card = presentCard(item)
  if (filters.atmosphere && !card.atmospheres.includes(filters.atmosphere)) return false
  if (filters.type && item.type !== filters.type) return false
  if (filters.rarity && card.rarity !== filters.rarity) return false
  if (filters.frame && card.frame !== filters.frame) return false
  if (filters.attribute && Number(card.stats[filters.attribute]) <= 0) return false
  if (filters.passive === 'com' && !card.passive) return false
  if (filters.passive === 'sem' && card.passive) return false
  return true
}

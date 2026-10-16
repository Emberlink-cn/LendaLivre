export function normalizeWord(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export const BASE_ITEMS = {
  'lazaro:lenda': [
    { id: 'item_moeda', word: 'moeda', name: 'Moeda de Xipaia', type: 'moeda' },
    { id: 'item_cachimbo_cogaua', word: 'cachimbo', name: 'Cachimbo de Cogaua', type: 'frasco' },
    { id: 'item_faca', word: 'faca', name: 'Faca de Lázaro', type: 'arma' },
    { id: 'item_lagarto', word: 'lagarto', name: 'Rabo de lagarto', type: 'relic' },
  ],
  'portoes:portoes': [
    { id: 'item_babacu', word: 'babaçu', name: 'Babaçu d’água', type: 'planta' },
    { id: 'item_linho', word: 'linho', name: 'Saco de linho', type: 'relic' },
    { id: 'item_lanca', word: 'lança', name: 'Lança de vidro azul', type: 'arma' },
  ],
  'bamboo:bamboo': [
    { id: 'item_cafe', word: 'café', name: 'Xícara de café', type: 'frasco' },
    { id: 'item_flecha', word: 'flecha', name: 'Flecha do baile', type: 'arma' },
  ],
  'couro:couro': [
    { id: 'item_hidromel', word: 'hidromel', name: 'Hidromel do Último Gole', type: 'frasco' },
    { id: 'item_caneca', word: 'caneca', name: 'Caneca de Durigan', type: 'relic' },
    { id: 'item_serpente', word: 'serpente', name: 'Marca da serpente', type: 'relic' },
  ],
  'vagalumes:vagalumes': [
    { id: 'item_flor', word: 'flor', name: 'Flor de vagalume', type: 'planta' },
    { id: 'item_cantil', word: 'cantil', name: 'Cantil de couro', type: 'frasco' },
  ],
  'ultima:geracao': [
    { id: 'item_lagarto_anahi', word: 'lagarto', name: 'Lagarto de Anahí', type: 'relic' },
    { id: 'item_cachimbo_metuk', word: 'cachimbo', name: 'Cachimbo de Metuk', type: 'frasco' },
  ],
}

export const BASE_MUSIC = {
  'portoes:portoes': {
    title: 'Areia e portões',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator',
  },
  'vagalumes:vagalumes': {
    title: 'Noite na mata',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZd79rJ6a7lp?utm_source=generator',
  },
}

export function toSpotifyEmbed(input) {
  const trimmed = input.trim()
  const fromIframe = trimmed.match(/src=["']([^"']+)["']/i)
  const candidate = fromIframe ? fromIframe[1] : trimmed
  if (candidate.startsWith('https://open.spotify.com/embed/')) return candidate
  const match = candidate.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|track|album|episode)\/([A-Za-z0-9]+)/)
  if (!match) return ''
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`
}

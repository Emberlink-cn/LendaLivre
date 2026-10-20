export function normalizeWord(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function carta(item) {
  return {
    rarity: 'comum',
    atmosphere: 'Noite',
    stats: { energia: 1, ataque: 0, defesa: 0, sorte: 0, azar: 0 },
    passive: '',
    ...item,
  }
}

export const BASE_ITEMS = {
  'lazaro:lenda': [
    carta({
      id: 'item_moeda',
      word: 'moeda',
      name: 'Moeda de Xipaia',
      type: 'moeda',
      rarity: 'incomum',
      atmosphere: 'Noite',
      stats: { energia: 1, ataque: 0, defesa: 1, sorte: 3, azar: 0 },
      passive: 'Compra passagem onde o ouro comum não entra.',
    }),
    carta({
      id: 'item_cachimbo_cogaua',
      word: 'cachimbo',
      name: 'Cachimbo de Cogaua',
      type: 'frasco',
      atmosphere: 'Mito',
      stats: { energia: 2, ataque: 0, defesa: 1, sorte: 1, azar: 1 },
    }),
    carta({
      id: 'item_faca',
      word: 'faca',
      name: 'Faca de Lázaro',
      type: 'arma',
      rarity: 'raro',
      atmosphere: 'Sertão',
      stats: { energia: 2, ataque: 4, defesa: 1, sorte: 0, azar: 1 },
      passive: 'Corta o que o ferro recusa.',
    }),
    carta({
      id: 'item_lagarto',
      word: 'lagarto',
      name: 'Rabo de lagarto',
      type: 'relic',
      atmosphere: 'Mata',
      stats: { energia: 1, ataque: 1, defesa: 2, sorte: 2, azar: 0 },
    }),
  ],
  'portoes:portoes': [
    carta({
      id: 'item_babacu',
      word: 'babaçu',
      name: 'Babaçu d’água',
      type: 'planta',
      atmosphere: 'Sertão',
      frame: 'green',
      stats: { energia: 3, ataque: 0, defesa: 2, sorte: 1, azar: 0 },
      passive: 'Mata a sede de quem atravessa a areia.',
    }),
    carta({
      id: 'item_linho',
      word: 'linho',
      name: 'Saco de linho',
      type: 'relic',
      atmosphere: 'Sertão',
      stats: { energia: 1, ataque: 0, defesa: 2, sorte: 0, azar: 0 },
    }),
    carta({
      id: 'item_lanca',
      word: 'lança',
      name: 'Lança de vidro azul',
      type: 'arma',
      rarity: 'epico',
      atmosphere: 'Água',
      stats: { energia: 3, ataque: 5, defesa: 1, sorte: 1, azar: 2 },
      passive: 'O golpe atravessa o que a luz revela.',
    }),
  ],
  'bamboo:bamboo': [
    carta({
      id: 'item_cafe',
      word: 'café',
      name: 'Xícara de café',
      type: 'frasco',
      atmosphere: 'Cidade',
      stats: { energia: 2, ataque: 0, defesa: 0, sorte: 1, azar: 0 },
    }),
    carta({
      id: 'item_flecha',
      word: 'flecha',
      name: 'Flecha do baile',
      type: 'arma',
      rarity: 'incomum',
      atmosphere: 'Noite',
      stats: { energia: 2, ataque: 3, defesa: 0, sorte: 2, azar: 1 },
    }),
  ],
  'couro:couro': [
    carta({
      id: 'item_hidromel',
      word: 'hidromel',
      name: 'Hidromel do Último Gole',
      type: 'frasco',
      rarity: 'raro',
      atmosphere: 'Mito',
      stats: { energia: 2, ataque: 1, defesa: 1, sorte: 2, azar: 2 },
      passive: 'O último gole muda o rumo da briga.',
    }),
    carta({
      id: 'item_caneca',
      word: 'caneca',
      name: 'Caneca de Durigan',
      type: 'relic',
      atmosphere: 'Cidade',
      stats: { energia: 1, ataque: 0, defesa: 2, sorte: 1, azar: 0 },
    }),
    carta({
      id: 'item_serpente',
      word: 'serpente',
      name: 'Marca da serpente',
      type: 'relic',
      rarity: 'epico',
      atmosphere: 'Mito',
      frame: 'black',
      stats: { energia: 3, ataque: 2, defesa: 2, sorte: 0, azar: 4 },
      passive: 'Quem carrega a marca atrai o que deveria temer.',
    }),
  ],
  'vagalumes:vagalumes': [
    carta({
      id: 'item_flor',
      word: 'flor',
      name: 'Flor de vagalume',
      type: 'planta',
      rarity: 'incomum',
      atmosphere: 'Mata',
      stats: { energia: 2, ataque: 0, defesa: 1, sorte: 3, azar: 0 },
      passive: 'Acende o caminho quando a noite fecha.',
    }),
    carta({
      id: 'item_cantil',
      word: 'cantil',
      name: 'Cantil de couro',
      type: 'frasco',
      atmosphere: 'Sertão',
      stats: { energia: 2, ataque: 0, defesa: 1, sorte: 0, azar: 0 },
    }),
  ],
  'ultima:geracao': [
    carta({
      id: 'item_lagarto_anahi',
      word: 'lagarto',
      name: 'Lagarto de Anahí',
      type: 'relic',
      rarity: 'raro',
      atmosphere: 'Mata',
      stats: { energia: 2, ataque: 1, defesa: 3, sorte: 1, azar: 1 },
    }),
    carta({
      id: 'item_cachimbo_metuk',
      word: 'cachimbo',
      name: 'Cachimbo de Metuk',
      type: 'frasco',
      atmosphere: 'Mito',
      stats: { energia: 2, ataque: 0, defesa: 1, sorte: 2, azar: 1 },
    }),
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

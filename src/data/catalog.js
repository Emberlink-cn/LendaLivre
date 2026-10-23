import chapters from './chapters.json'

function cover(file) {
  return `/midias/catalog-page/livros/${encodeURIComponent(file)}`
}

export const HERO_IMAGE = cover('cardbook.jpg')

export const ATMOSPHERES = ['Noite', 'Sertão', 'Mata', 'Mito', 'Cidade', 'Dia', 'Céu', 'Água']

export const MOODS = ['Todos', ...ATMOSPHERES]

const CHAPTER_SOURCES = [
  {
    legacyId: 'lazaro',
    title: 'Lázaro',
    file: 'cardbook-Lazaro.jpg',
    moods: ['Noite', 'Sertão'],
    line: 'Lázaro sobe ao trono de Cogaua e parte sozinho de Xipaia, atrás do irmão e de Anahí.',
  },
  {
    legacyId: 'portoes',
    title: 'Os Portões da Areia',
    file: 'cardbook-Os Portões da Areia.jpg',
    moods: ['Sertão'],
    line: 'Um forasteiro atravessa as dunas com um saco de linho, até as portas de pedra se abrirem.',
  },
  {
    legacyId: 'bamboo',
    title: 'Bamboo',
    file: 'cardbook-Bamboo.jpeg',
    moods: ['Noite', 'Mata'],
    line: 'Noite de baile. Floria cuida de Babu, e Anahí não chega com as mercadorias.',
  },
  {
    legacyId: 'couro',
    title: 'Couro e Escamas',
    file: 'cardbook-Couro e Escamas.jpg',
    moods: ['Mito', 'Sertão'],
    line: 'No bar O Último Gole, uma ordem de Cogaua aponta para a toca da serpente.',
  },
  {
    legacyId: 'vagalumes',
    title: 'Vagalumes',
    file: 'cardbook-Vagalumes.jpg',
    moods: ['Noite', 'Mata'],
    line: 'Dois homens colhem flores de vagalume na margem do rio, e depois correm.',
  },
  {
    legacyId: 'cogaua',
    title: 'Cogaua',
    file: 'cardbook-Saci.jpg',
    moods: ['Mito'],
    line: 'Rei de Xipaia. O trono no salão de pedra, o cachimbo e a ordem que manda partir sozinho.',
  },
  {
    legacyId: 'anahi',
    title: 'Anahí',
    file: 'cardbook-Anahi.jpg',
    moods: ['Mata'],
    line: 'Uma mulher numa canoa, machado às costas, rio e pinheiros na luz baixa.',
  },
  {
    legacyId: 'morro',
    title: 'Morro do Diabo',
    file: 'cardbook-Morro-do-Diabo.jpg',
    moods: ['Sertão'],
    line: 'Um paredão de pedra acima do rio, caminho de gente pequena e céu de fim de tarde.',
  },
  {
    legacyId: 'ancestrais',
    title: 'Ancestrais',
    file: 'cardbook-Ancestrais.jpg',
    moods: ['Mito', 'Mata'],
    line: 'Um besouro enorme atravessa a cachoeira. Lá embaixo, viajantes cabem na escala da pata.',
  },
  {
    legacyId: 'antes',
    title: 'Antes de Tudo',
    file: 'cardbook-Antes de Tudo.png',
    moods: ['Mito'],
    line: 'Uma nebulosa. Poeira e estrela, antes de haver chão.',
  },
  {
    legacyId: 'ultima',
    title: 'A última de sua geração',
    file: 'cardbook-A-última-da-geração.jpeg',
    moods: ['Mata'],
    line: 'Anahí, ainda criança entre os Yukopás, segue um lagarto até o rio. O dia não acaba em brincadeira.',
  },
  {
    legacyId: 'babu',
    title: 'Babu',
    file: 'cardbook-Babu.jpg',
    moods: ['Mata'],
    line: 'Um homem de terno branco num trapiche, rio verde e mata fechada atrás do riso.',
  },
  {
    legacyId: 'caramuru',
    title: 'Caramuru',
    file: 'cardbook-Caramuru.jpg',
    moods: ['Mata'],
    line: 'Um homem de chapéu largo acende o cachimbo encostado numa casa, com ocas ao fundo.',
  },
  {
    legacyId: 'gods',
    title: 'Gods Games',
    file: 'cardbook-Gods games.jpg',
    moods: ['Mito'],
    line: 'Exércitos e penhascos sob uma lua enorme.',
  },
  {
    legacyId: 'xipaia',
    title: 'Xipaia',
    file: 'cardbook-Xipaia.jpeg',
    moods: ['Cidade'],
    line: 'A cidade de Cogaua: feiras, areia e gente demais para caber numa rua só.',
  },
  {
    legacyId: 'damato',
    title: 'Damato',
    moods: [],
    line: 'O nome já está no conjunto. O capítulo ainda não foi escrito no arquivo.',
  },
  {
    legacyId: 'batalha',
    title: 'Batalha dos Espólios',
    moods: [],
    line: 'O nome já está no conjunto. O capítulo ainda não foi escrito no arquivo.',
  },
]

function asChapter(source, index) {
  const written = chapters[source.legacyId]
  const id = written?.id || source.legacyId
  return {
    id,
    legacyWorkId: source.legacyId,
    sourceKey: written ? `${source.legacyId}:${written.id}` : null,
    number: index + 1,
    name: source.title,
    title: written?.title || source.title,
    file: source.file,
    moods: source.moods,
    line: source.line,
    paragraphs: written?.paragraphs ?? [],
    note: written?.note ?? '',
  }
}

export const WORKS = [
  {
    id: 'terras',
    title: 'Terras Invisíveis',
    collects: true,
    file: 'cardbook.jpg',
    line: 'Xipaia, a mata e o que a areia esconde. Os capítulos desta terra.',
    moods: [],
    chapters: CHAPTER_SOURCES.map(asChapter),
  },
]

export const LEGACY_WORKS = Object.fromEntries(
  CHAPTER_SOURCES.map((source) => {
    const written = chapters[source.legacyId]
    return [source.legacyId, { workId: 'terras', chapterId: written?.id || source.legacyId }]
  }),
)

export function legacyRead(workId, chapterId) {
  const hit = LEGACY_WORKS[workId]
  if (!hit) return null
  if (chapterId && chapterId !== hit.chapterId) return null
  return hit
}

export function withCover(work) {
  return { ...work, cover: work.file ? cover(work.file) : null }
}

export function getWork(id) {
  const work = WORKS.find((item) => item.id === id)
  return work ? withCover(work) : null
}

export function listWorks() {
  return WORKS.map(withCover)
}

export const FIRST_READ = { workId: 'terras', chapterId: 'lenda' }

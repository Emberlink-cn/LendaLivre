import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Card, CardBack } from '../../components/card/Card'
import { Avatar, ItemIcon } from '../../components/common/Marks'
import { useReadToolsSlot } from '../../components/layout/Shell'
import { useAuth } from '../../context/AuthContext'
import { useInventory } from '../../context/InventoryContext'
import { useLibrary } from '../../context/LibraryContext'
import { ATTRIBUTES, FRAMES, RARITIES, faceStats, frameLabel, matchesCardFilters, presentCard, rarityLabel } from '../../data/cardTraits'
import { ATMOSPHERES } from '../../data/catalog'
import styles from './InventoryPage.module.css'

const TYPE_LABELS = {
  animal: 'Animal',
  arma: 'Arma',
  bebida: 'Bebida',
  ferramenta: 'Ferramenta',
  frasco: 'Frasco',
  habilidade: 'Habilidade',
  ingrediente: 'Ingrediente',
  inseto: 'Inseto',
  magia: 'Magia',
  maldicao: 'Maldição',
  material: 'Material',
  moeda: 'Moeda',
  objeto: 'Objeto',
  planta: 'Planta',
  refeicao: 'Refeição',
  relic: 'Relíquia',
  texto: 'Texto',
  veiculo: 'Veículo',
  vestimenta: 'Vestimenta',
  local: 'Local',
  personagem: 'Personagem',
  montaria: 'Montaria',
}

const EMPTY_FILTERS = {
  atmosphere: '',
  type: '',
  rarity: '',
  frame: '',
}

const SORTS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'nome', label: 'Nome' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'obra', label: 'Obra' },
  { id: 'coletados', label: 'Coletados' },
]

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 979px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 979px)')
    const onChange = () => setNarrow(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return narrow
}

function catalogItems(works) {
  const list = []
  const seen = new Set()
  for (const work of works) {
    for (const chapter of work.chapters ?? []) {
      for (const item of chapter.items ?? []) {
        if (!item?.id || seen.has(item.id)) continue
        seen.add(item.id)
        list.push({ ...item, workTitle: work.title, chapterTitle: chapter.title })
      }
    }
  }
  return list
}

function ownedCard(owned, source) {
  if (!source) return owned
  return {
    ...owned,
    ...source,
    collectedAt: owned.collectedAt,
  }
}

function readerSince(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 16.2 L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function FriendsList() {
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [query, setQuery] = useState('')
  const friends = []
  const shown = friends.filter((friend) => {
    if (onlineOnly && !friend.online) return false
    if (!query.trim()) return true
    return friend.name.toLocaleLowerCase('pt').includes(query.trim().toLocaleLowerCase('pt'))
  })
  const empty = query.trim()
    ? 'Nenhum amigo encontrado.'
    : onlineOnly
      ? 'Nenhum amigo online.'
      : 'Nenhum amigo ainda.'

  return (
    <section className={styles.friends} aria-label="Amigos">
      <header className={styles.friendsHead}>
        <h2>
          Amigos <span>{friends.length}</span>
        </h2>
        <button
          type="button"
          className={onlineOnly ? styles.onlineOn : styles.online}
          aria-pressed={onlineOnly}
          aria-label="Apenas online"
          onClick={() => setOnlineOnly((current) => !current)}
        >
          <span className={styles.dot} />
        </button>
      </header>
      <label className={styles.friendSearch}>
        <SearchIcon />
        <input
          type="search"
          value={query}
          placeholder="Buscar amigos"
          aria-label="Buscar amigos"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {shown.length === 0 ? <p className={styles.friendsEmpty}>{empty}</p> : null}
    </section>
  )
}

function ProfilePanel({ profile, readOnly }) {
  return (
    <>
      <header className={styles.identity}>
        <Avatar name={profile.name} face={profile.avatar} size={72} />
        <div>
          <h2>{profile.name}</h2>
          <p>Nível {profile.level}</p>
          {readOnly ? (
            <p>
              Visitante. <Link to="/entrar">Entrar</Link>
            </p>
          ) : (
            <p>Leitor desde {readerSince(profile.since)}</p>
          )}
        </div>
      </header>
      <section className={styles.slot} aria-label="Personagem">
        <p>Personagem</p>
      </section>
      <section className={`${styles.slot} ${styles.stats}`} aria-label="Estatísticas">
        <p>Estatísticas</p>
      </section>
      <FriendsList />
    </>
  )
}

function sortedCards(cards, sort) {
  const list = [...cards]
  const byName = (a, b) => a.item.name.localeCompare(b.item.name, 'pt')
  if (sort === 'nome') return list.sort(byName)
  if (sort === 'tipo') {
    return list.sort((a, b) => {
      const type = (TYPE_LABELS[a.item.type] || '').localeCompare(TYPE_LABELS[b.item.type] || '', 'pt')
      return type || byName(a, b)
    })
  }
  if (sort === 'obra') {
    return list.sort((a, b) => {
      const work = (a.item.workTitle || '').localeCompare(b.item.workTitle || '', 'pt')
      return work || byName(a, b)
    })
  }
  if (sort === 'coletados') return list.sort((a, b) => Number(b.owned) - Number(a.owned) || byName(a, b))
  return list
}

function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const current = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return undefined
    function onPointer(event) {
      if (!(event.target instanceof Node)) return
      if (rootRef.current?.contains(event.target)) return
      setOpen(false)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`${styles.filterSelect} ${open ? styles.filterSelectOpen : ''}`} ref={rootRef}>
      <span>{label}</span>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((currentOpen) => !currentOpen)}>
        <span>{current?.label}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <ul role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.value || 'todas'}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function FilterFields({ filters, onChange }) {
  const dirty = Object.values(filters).some(Boolean)

  return (
    <div className={styles.filterFields}>
      <FilterSelect
        label="Atmosfera"
        value={filters.atmosphere}
        onChange={(atmosphere) => onChange({ ...filters, atmosphere })}
        options={[{ value: '', label: 'Todas' }, ...ATMOSPHERES.map((mood) => ({ value: mood, label: mood }))]}
      />
      <FilterSelect
        label="Tipo"
        value={filters.type}
        onChange={(type) => onChange({ ...filters, type })}
        options={[
          { value: '', label: 'Todos' },
          ...Object.entries(TYPE_LABELS).map(([id, label]) => ({ value: id, label })),
        ]}
      />
      <FilterSelect
        label="Raridade"
        value={filters.rarity}
        onChange={(rarity) => onChange({ ...filters, rarity })}
        options={[{ value: '', label: 'Todas' }, ...RARITIES.map((option) => ({ value: option.id, label: option.label }))]}
      />
      <FilterSelect
        label="Moldura"
        value={filters.frame}
        onChange={(frame) => onChange({ ...filters, frame })}
        options={[{ value: '', label: 'Todas' }, ...FRAMES.map((option) => ({ value: option.id, label: option.label }))]}
      />
      <button type="button" className={styles.clearFilters} disabled={!dirty} onClick={() => onChange(EMPTY_FILTERS)}>
        Limpar
      </button>
    </div>
  )
}

function CardFacts({ card }) {
  return (
    <div className={styles.facts}>
      <p>
        <span>Atmosfera</span>
        <b>{card.atmospheres.length ? card.atmospheres.join(' · ') : '—'}</b>
      </p>
      <p>
        <span>Tipo</span>
        <b>{TYPE_LABELS[card.type] || card.type || 'Item'}</b>
      </p>
      <p>
        <span>Raridade</span>
        <b>{rarityLabel(card.rarity)}</b>
      </p>
      <p>
        <span>Moldura</span>
        <b>{frameLabel(card.frame)}</b>
      </p>
      {ATTRIBUTES.map((attribute) => (
        <p key={attribute.id}>
          <span>{attribute.label}</span>
          <b>{card.stats[attribute.id]}</b>
        </p>
      ))}
      <p className={styles.factWide}>
        <span>Habilidade passiva</span>
        <b>{card.passive || 'Nenhuma'}</b>
      </p>
      <p className={styles.factNote}>Sorte e azar podem alterar qualquer outro atributo.</p>
    </div>
  )
}

function cardProps(entry) {
  const card = presentCard(entry.item)
  return {
    title: card.name,
    image: card.image,
    imageFrame: { zoom: card.imageZoom, x: card.imageX, y: card.imageY },
    fallback: <ItemIcon type={card.type} />,
    type: TYPE_LABELS[card.type] || card.type || 'Item',
    origin: card.workTitle || 'LendaLivre',
    description: card.passive.trim() || undefined,
    color: card.frame,
    stats: faceStats(card),
  }
}

function tipPosition(rect) {
  const width = 260
  const height = 320
  const gap = 14
  let left = rect.right + gap
  if (left + width > window.innerWidth - 12) left = Math.max(12, rect.left - gap - width)
  let top = rect.top
  if (top + height > window.innerHeight - 12) top = Math.max(12, window.innerHeight - 12 - height)
  return { left, top }
}

function OwnedCard({ item, narrow, onOpen }) {
  const [tip, setTip] = useState(null)
  const card = presentCard(item)

  useEffect(() => {
    if (!tip) return undefined
    const hide = () => setTip(null)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [tip])

  return (
    <li
      className={styles.owned}
      onMouseEnter={(event) => {
        if (!narrow) setTip(tipPosition(event.currentTarget.getBoundingClientRect()))
      }}
      onMouseLeave={() => setTip(null)}
    >
      <button
        type="button"
        className={styles.cardBtn}
        onClick={() => {
          setTip(null)
          onOpen(item.id)
        }}
      >
        <Card {...cardProps({ item })} />
      </button>
      {tip
        ? createPortal(
            <div className={styles.tip} role="tooltip" style={{ left: tip.left, top: tip.top }}>
              <strong>{card.name}</strong>
              <CardFacts card={card} />
            </div>,
            document.body,
          )
        : null}
    </li>
  )
}

function InventoryChrome({ sort, onSort, filters, onFilters, slot }) {
  const [open, setOpen] = useState(null)
  const barRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(null)
    }
    const onPointer = (event) => {
      if (!(event.target instanceof Node)) return
      if (barRef.current?.contains(event.target)) return
      setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  if (!slot) return null

  return createPortal(
    <div ref={barRef} className={styles.tools}>
      <div className={styles.toolMenu}>
        <button
          type="button"
          className={open === 'filtros' ? styles.floatOn : styles.floatBtn}
          aria-expanded={open === 'filtros'}
          onClick={() => setOpen((current) => (current === 'filtros' ? null : 'filtros'))}
        >
          Filtros
        </button>
        {open === 'filtros' ? (
          <div className={styles.filterSheet} aria-label="Filtros">
            <FilterFields filters={filters} onChange={onFilters} />
          </div>
        ) : null}
      </div>
      <div className={styles.toolMenu}>
        <button
          type="button"
          className={open === 'ordenar' ? styles.floatOn : styles.floatBtn}
          aria-expanded={open === 'ordenar'}
          onClick={() => setOpen((current) => (current === 'ordenar' ? null : 'ordenar'))}
        >
          Ordenar
        </button>
        {open === 'ordenar' ? (
          <div className={styles.chooser} role="radiogroup" aria-label="Ordenação">
            {SORTS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={sort === option.id ? styles.floatOn : styles.floatBtn}
                role="radio"
                aria-checked={sort === option.id}
                onClick={() => {
                  onSort(option.id)
                  setOpen(null)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    slot,
  )
}

export default function InventoryPage() {
  const { user } = useAuth()
  const { items } = useInventory()
  const { works } = useLibrary()
  const slot = useReadToolsSlot()
  const narrow = useNarrow()
  const [sort, setSort] = useState('catalogo')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [panel, setPanel] = useState(false)
  const [openId, setOpenId] = useState(null)
  const catalog = catalogItems(works)
  const ownedById = new Map(items.map((item) => [item.id, item]))
  const cards = [
    ...catalog.map((item) => {
      const owned = ownedById.get(item.id)
      return { item: owned ? ownedCard(owned, item) : item, owned: Boolean(owned) }
    }),
    ...items.filter((item) => !catalog.some((entry) => entry.id === item.id)).map((item) => ({ item, owned: true })),
  ]
  const visible = sortedCards(
    cards.filter(({ item }) => matchesCardFilters(item, filters)),
    sort,
  )
  const opened = openId ? visible.find((entry) => entry.item.id === openId && entry.owned) : null
  const openedCard = opened ? presentCard(opened.item) : null
  const readOnly = !user
  const profile = user
    ? {
        name: user.name,
        avatar: user.avatar || 'leaf',
        level: user.level ?? 1,
        since: user.since,
      }
    : { name: 'Visitante', avatar: 'leaf', level: 1, since: null }

  useEffect(() => {
    document.title = `${profile.name} · LendaLivre`
  }, [profile.name])

  useEffect(() => {
    if (!openId) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpenId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId])

  useEffect(() => {
    if (!narrow || !panel) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setPanel(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [narrow, panel])

  return (
    <div className={styles.page}>
      {narrow ? (
        <InventoryChrome sort={sort} onSort={setSort} filters={filters} onFilters={setFilters} slot={slot} />
      ) : null}
      {narrow ? (
        <button
          type="button"
          className={panel ? styles.stripOn : styles.strip}
          aria-expanded={panel}
          onClick={() => setPanel((current) => !current)}
        >
          <Avatar name={profile.name} face={profile.avatar} size={40} />
          <span>
            <strong>{profile.name}</strong>
            <small>Nível {profile.level}</small>
          </span>
        </button>
      ) : null}
      <div className={styles.stage}>
        <aside
          className={narrow ? (panel ? styles.overlay : styles.boardOff) : styles.board}
          aria-label="Perfil"
          data-mode={readOnly ? 'leitura' : 'dono'}
          hidden={narrow && !panel}
        >
          <ProfilePanel profile={profile} readOnly={readOnly} />
        </aside>
      <section className={styles.filters} aria-label="Filtros">
        <FilterFields filters={filters} onChange={setFilters} />
      </section>
      <aside className={styles.sort} aria-label="Ordenação">
        <p>Ordenar</p>
        <div role="radiogroup">
          {SORTS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={sort === option.id}
              onClick={() => setSort(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </aside>
      <section className={styles.collection} aria-label="Inventário">
        {cards.length === 0 ? (
          <p className={styles.empty}>
            Nada coletado ainda. Na leitura, abra Itens e digite uma palavra do capítulo.{' '}
            <Link to="/ler/lazaro/lenda">Experimentar em Lázaro</Link> com a palavra “moeda”.
          </p>
        ) : visible.length === 0 ? (
          <p className={styles.empty}>Nenhuma carta com esses filtros.</p>
        ) : (
          <ul className={styles.grid}>
            {visible.map(({ item, owned }) =>
              owned ? (
                <OwnedCard key={item.id} item={item} narrow={narrow} onOpen={setOpenId} />
              ) : (
                <li key={item.id}>
                  <div className="tcg-locked" role="img" aria-label="Item não coletado">
                    <CardBack />
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
        {openedCard ? (
          narrow ? (
            <div className={styles.sheet} role="dialog" aria-label={openedCard.name}>
              <header>
                <strong>{openedCard.name}</strong>
                <button type="button" onClick={() => setOpenId(null)}>
                  Fechar
                </button>
              </header>
              <CardFacts card={openedCard} />
            </div>
          ) : (
            <div className={styles.detail} role="dialog" aria-label={openedCard.name} onClick={() => setOpenId(null)}>
              <div className={styles.detailPanel} onClick={(event) => event.stopPropagation()}>
                <button type="button" className={styles.detailClose} onClick={() => setOpenId(null)}>
                  Fechar
                </button>
                <div className={styles.detailCard}>
                  <Card {...cardProps(opened)} />
                </div>
                <div className={styles.detailBody}>
                  <h2>{openedCard.name}</h2>
                  <p>
                    {opened.item.workTitle || 'LendaLivre'}
                    {opened.item.chapterTitle ? ` · ${opened.item.chapterTitle}` : ''}
                  </p>
                  <CardFacts card={openedCard} />
                </div>
              </div>
            </div>
          )
        ) : null}
      </section>
      </div>
    </div>
  )
}

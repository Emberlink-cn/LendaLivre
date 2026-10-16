import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { CardBack, CardFlip } from '../../components/card/Card'
import { Avatar, ItemIcon } from '../../components/common/Marks'
import { useReadToolsSlot } from '../../components/layout/Shell'
import { useAuth } from '../../context/AuthContext'
import { useInventory } from '../../context/InventoryContext'
import { useLibrary } from '../../context/LibraryContext'
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
}

const TYPE_COLOR = {
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

function InventoryChrome({ sort, onSort, slot }) {
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
        {open === 'filtros' ? <div className={styles.filterSheet} aria-label="Filtros" /> : null}
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
  const { items, userId } = useInventory()
  const { works } = useLibrary()
  const slot = useReadToolsSlot()
  const narrow = useNarrow()
  const [sort, setSort] = useState('catalogo')
  const catalog = catalogItems(works)
  const ownedIds = new Set(items.map((item) => item.id))
  const ownedById = new Map(items.map((item) => [item.id, item]))
  const cards = [
    ...catalog.map((item) => ({ item: ownedById.get(item.id) ?? item, owned: ownedIds.has(item.id) })),
    ...items.filter((item) => !catalog.some((entry) => entry.id === item.id)).map((item) => ({ item, owned: true })),
  ]
  const visible = sortedCards(cards, sort)
  const profile = user
    ? { name: user.name, avatar: user.avatar || 'leaf', level: user.level ?? 1, rank: user.rank ?? 'Leitor' }
    : { name: 'Visitante', avatar: 'leaf', level: 1, rank: 'Visitante' }

  useEffect(() => {
    document.title = `${profile.name} · LendaLivre`
  }, [profile.name])

  return (
    <div className={styles.page}>
      {narrow ? <InventoryChrome sort={sort} onSort={setSort} slot={slot} /> : null}
      <aside className={styles.profile}>
        <Avatar name={profile.name} face={profile.avatar} size={narrow ? 46 : 84} />
        <h1>{profile.name}</h1>
        <p className={styles.meta}>
          <span>{profile.rank}</span>
          <span>Nível {profile.level}</span>
        </p>
        {userId === 'visitante' ? (
          <p className={styles.note}>
            Este perfil ainda é de visitante. <Link to="/entrar">Entrar</Link>
          </p>
        ) : (
          <p className={styles.note}>Perfil público do leitor. Nível e rank ainda são provisórios.</p>
        )}
      </aside>
      <section className={styles.filters} aria-label="Filtros">
        <p>Filtros</p>
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
        {visible.length === 0 ? (
          <p className={styles.empty}>
            Nada coletado ainda. Na leitura, abra Itens e digite uma palavra do capítulo.{' '}
            <Link to="/ler/lazaro/lenda">Experimentar em Lázaro</Link> com a palavra “moeda”.
          </p>
        ) : (
          <ul className={styles.grid}>
            {visible.map(({ item, owned }) =>
              owned ? (
                <li key={item.id}>
                  <CardFlip
                    title={item.name}
                    image={item.image}
                    fallback={<ItemIcon type={item.type} />}
                    type={TYPE_LABELS[item.type] || item.type || 'Item'}
                    origin={item.workTitle || 'LendaLivre'}
                    description={item.chapterTitle ? `Coletado em ${item.chapterTitle}.` : item.workTitle}
                    color={TYPE_COLOR[item.type] || 'gold'}
                    backText={item.workTitle || 'LendaLivre'}
                  />
                </li>
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
      </section>
    </div>
  )
}

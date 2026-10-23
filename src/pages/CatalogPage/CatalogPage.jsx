import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchIconButton, useNarrow } from '../../components/common/SearchToggle'
import { useInventory } from '../../context/InventoryContext'
import { useLibrary } from '../../context/LibraryContext'
import { ATMOSPHERES } from '../../data/catalog'
import styles from './CatalogPage.module.css'

const CATALOG_VIEW_KEY = 'lendalivre_catalog_view'
const CATALOG_FILTERS_KEY = 'lendalivre_catalog_filters'

const WORK_SORTS = [
  { id: 'title-asc', label: 'Título: A > Z' },
  { id: 'title-desc', label: 'Título: Z > A' },
  { id: 'date-asc', label: 'Data de lançamento: crescente' },
  { id: 'date-desc', label: 'Data de lançamento: decrescente' },
]

const CHAPTER_SORTS = [
  ...WORK_SORTS,
  { id: 'number-asc', label: 'Numeração do capítulo: crescente' },
  { id: 'number-desc', label: 'Numeração do capítulo: decrescente' },
]

function loadCatalogView() {
  try {
    return localStorage.getItem(CATALOG_VIEW_KEY) === 'obras' ? 'obras' : 'capitulos'
  } catch {
    return 'capitulos'
  }
}

function storeCatalogView(next) {
  try {
    localStorage.setItem(CATALOG_VIEW_KEY, next)
  } catch {
    /* a grade continua mesmo sem gravar a preferência */
  }
}

function loadCatalogFilters() {
  const fallback = { query: '', moods: [], workId: '', sort: 'title-asc' }
  try {
    const raw = localStorage.getItem(CATALOG_FILTERS_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    const sort = CHAPTER_SORTS.some((item) => item.id === data?.sort) ? data.sort : fallback.sort
    const moods = Array.isArray(data?.moods) ? data.moods.filter((mood) => ATMOSPHERES.includes(mood)) : []
    const workId = typeof data?.workId === 'string' ? data.workId : ''
    const query = typeof data?.query === 'string' ? data.query : ''
    return { query, moods, workId, sort }
  } catch {
    return fallback
  }
}

function storeCatalogFilters(filters) {
  try {
    localStorage.setItem(CATALOG_FILTERS_KEY, JSON.stringify(filters))
  } catch {
    /* a grade continua mesmo sem gravar a preferência */
  }
}

function byText(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'pt', { sensitivity: 'base' })
}

function byDate(left, right, tie) {
  const a = Date.parse(left) || 0
  const b = Date.parse(right) || 0
  if (a !== b) return a - b
  return tie
}

function compareEntry(left, right, sort, tie) {
  if (sort === 'title-desc') return byText(right.name, left.name)
  if (sort === 'date-asc') return byDate(left.publishedAt, right.publishedAt, tie)
  if (sort === 'date-desc') return byDate(right.publishedAt, left.publishedAt, -tie)
  if (sort === 'number-asc') return (left.number || 0) - (right.number || 0) || tie
  if (sort === 'number-desc') return (right.number || 0) - (left.number || 0) || tie
  return byText(left.name, right.name)
}

function compareWorks(a, b, sort) {
  return compareEntry(
    { name: a.title, publishedAt: a.publishedAt },
    { name: b.title, publishedAt: b.publishedAt },
    sort,
    byText(a.title, b.title),
  )
}

function compareChapters(a, b, sort) {
  const titleTie = byText(a.name || a.title, b.name || b.title)
  const numberTie = (a.number || 0) - (b.number || 0) || titleTie
  const tie = sort === 'number-asc' || sort === 'number-desc' ? titleTie : numberTie
  return compareEntry(
    { name: a.name || a.title, publishedAt: a.publishedAt, number: a.number },
    { name: b.name || b.title, publishedAt: b.publishedAt, number: b.number },
    sort,
    tie,
  )
}

function hasAtmosphere(moods, selected) {
  if (!selected.length) return true
  return selected.some((mood) => (moods ?? []).includes(mood))
}

function MoodSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const label = value.length === 0 ? 'Atmosfera' : value.length === 1 ? value[0] : `${value[0]} +${value.length - 1}`

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointer = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  function toggle(mood) {
    onChange(value.includes(mood) ? value.filter((item) => item !== mood) : [...value, mood])
  }

  return (
    <div className={`${styles.picker} ${open ? styles.pickerOpen : ''}`} ref={ref}>
      <button
        type="button"
        className={styles.pickerBtn}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{label}</span>
      </button>
      {open ? (
        <ul className={styles.pickerList} role="listbox" aria-multiselectable="true" aria-label="Atmosfera">
          {ATMOSPHERES.map((mood) => {
            const on = value.includes(mood)
            return (
              <li key={mood}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={on ? styles.pickerOn : styles.pickerOption}
                  onClick={() => toggle(mood)}
                >
                  {mood}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function OptionSelect({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((item) => item.id === value)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointer = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div className={`${styles.picker} ${styles.sortPicker} ${open ? styles.pickerOpen : ''}`} ref={ref}>
      <button
        type="button"
        className={styles.pickerBtn}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span>{current?.label}</span>
      </button>
      {open ? (
        <ul className={styles.pickerList} role="listbox" aria-label={ariaLabel}>
          {options.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === value}
                className={item.id === value ? styles.pickerOn : styles.pickerOption}
                onClick={() => {
                  onChange(item.id)
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function isPublished(work) {
  if (!Object.hasOwn(work, 'publishedAt')) return true
  return Boolean(work.publishedAt)
}

function WorkSelect({ works, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const fieldRef = useRef(null)
  const selected = works.find((work) => work.id === value)
  const q = query.trim().toLowerCase()
  const visible = works.filter((work) => !q || work.title.toLowerCase().includes(q))

  useEffect(() => {
    if (!open) return undefined
    fieldRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointer = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  function choose(id) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={`${styles.picker} ${styles.workPicker} ${open ? styles.pickerOpen : ''}`} ref={ref}>
      <button
        type="button"
        className={styles.pickerBtn}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Filtrar por obra"
        onClick={() => {
          setOpen((currentOpen) => !currentOpen)
          setQuery('')
        }}
      >
        <span>{selected?.title || 'Obra'}</span>
      </button>
      {open ? (
        <div className={styles.pickerPanel}>
          <input
            ref={fieldRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar obra"
            aria-label="Buscar obra publicada"
            className={styles.pickerSearch}
          />
          <ul className={styles.pickerList} role="listbox" aria-label="Obras publicadas">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                className={!value ? styles.pickerOn : styles.pickerOption}
                onClick={() => choose('')}
              >
                Todas
              </button>
            </li>
            {visible.map((work) => (
              <li key={work.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={work.id === value}
                  className={work.id === value ? styles.pickerOn : styles.pickerOption}
                  onClick={() => choose(work.id)}
                >
                  {work.title}
                </button>
              </li>
            ))}
            {visible.length === 0 ? <li className={styles.pickerEmpty}>Nenhuma obra com esse nome.</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function chapterCountLabel(count) {
  return count === 1 ? '1 capítulo' : `${count} capítulos`
}

function itemCountLabel(found, total) {
  return `${found}/${total}`
}

function ChapterGroup({ group, divided, has }) {
  return (
    <>
      {divided ? <li className={styles.break} role="separator" /> : null}
      {group.chapters.map((chapter) => {
        const total = chapter.items?.length ?? 0
        const found = (chapter.items ?? []).filter((item) => has(item.id)).length
        const atmosphere = chapter.moods.length ? chapter.moods.join(' · ') : 'Sem atmosfera'
        return (
          <li key={`${group.work.id}:${chapter.id}`}>
            <Link to={`/obra/${group.work.id}/${chapter.id}`} className={styles.card}>
              {chapter.cover ? (
                <img src={chapter.cover} alt="" />
              ) : (
                <span className={styles.noCover}>{(chapter.name || chapter.title).slice(0, 1)}</span>
              )}
              <span className={styles.cardText}>
                <strong>
                  {chapter.name || chapter.title}
                  <span className={styles.bar}> | </span>
                  <span className={styles.moodLabel}>{atmosphere}</span>
                </strong>
                <small>{itemCountLabel(found, total)}</small>
              </span>
            </Link>
          </li>
        )
      })}
    </>
  )
}

export default function CatalogPage() {
  const { works } = useLibrary()
  const { has } = useInventory()
  const narrow = useNarrow()
  const [view, setView] = useState(loadCatalogView)
  const [storedFilters] = useState(loadCatalogFilters)
  const [query, setQuery] = useState(storedFilters.query)

  function chooseView(next) {
    setView(next)
    storeCatalogView(next)
  }
  const [moods, setMoods] = useState(storedFilters.moods)
  const [workId, setWorkId] = useState(storedFilters.workId)
  const [sort, setSort] = useState(storedFilters.sort)
  const sortOptions = view === 'capitulos' ? CHAPTER_SORTS : WORK_SORTS
  const sortValue = sortOptions.some((item) => item.id === sort) ? sort : 'title-asc'
  const [searchOpen, setSearchOpen] = useState(false)
  const searchBtnRef = useRef(null)
  const searchFieldRef = useRef(null)

  useEffect(() => {
    document.title = 'Catálogo · LendaLivre'
  }, [])

  useEffect(() => {
    storeCatalogFilters({ query, moods, workId, sort })
  }, [query, moods, workId, sort])

  useEffect(() => {
    if (!searchOpen) return undefined
    searchFieldRef.current?.focus()
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setSearchOpen(false)
    }
    const onPointer = (event) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (searchBtnRef.current?.contains(target)) return
      if (searchFieldRef.current?.contains(target)) return
      setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [searchOpen])

  const q = query.trim().toLowerCase()

  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchesQuery =
        !q ||
        work.title.toLowerCase().includes(q) ||
        (work.line || '').toLowerCase().includes(q) ||
        work.chapters.some((chapter) => (chapter.name || chapter.title).toLowerCase().includes(q))
      return matchesQuery
    }).sort((a, b) => compareWorks(a, b, sortValue))
  }, [works, q, sortValue])

  const publishedWorks = useMemo(
    () => works.filter(isPublished).sort((a, b) => byText(a.title, b.title)),
    [works],
  )

  const chapterGroups = useMemo(() => {
    const source = workId ? works.filter((work) => work.id === workId) : works
    return source
      .map((work) => ({
        work,
        chapters: work.chapters.filter((chapter) => {
          const name = `${chapter.name || ''} ${chapter.title || ''} ${chapter.line || ''}`
          const matchesMood = hasAtmosphere(chapter.moods, moods)
          const matchesQuery = !q || name.toLowerCase().includes(q) || chapter.moods.some((item) => item.toLowerCase().includes(q))
          return matchesMood && matchesQuery
        }).sort((a, b) => compareChapters(a, b, sort)),
      }))
      .filter((group) => group.chapters.length > 0)
      .sort((a, b) => compareWorks(a.work, b.work, sort))
  }, [works, q, moods, sort, workId])

  const shownCount = view === 'obras' ? filteredWorks.length : chapterGroups.reduce((sum, group) => sum + group.chapters.length, 0)
  const countLabel =
    view === 'obras'
      ? shownCount === 1
        ? '1 obra'
        : `${shownCount} obras`
      : chapterCountLabel(shownCount)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <p className={styles.eyebrow}>Catálogo</p>
          <h1>{view === 'obras' ? 'Obras' : 'Capítulos'}</h1>
        </div>
        <div className={styles.viewToggle} role="group" aria-label="Tipo de exibição">
          <button type="button" className={view === 'obras' ? styles.viewOn : styles.viewBtn} aria-pressed={view === 'obras'} onClick={() => chooseView('obras')}>
            Obras
          </button>
          <button type="button" className={view === 'capitulos' ? styles.viewOn : styles.viewBtn} aria-pressed={view === 'capitulos'} onClick={() => chooseView('capitulos')}>
            Capítulos
          </button>
        </div>
        <div className={styles.mobileActions}>
          <p className={styles.mobileCount}>{countLabel}</p>
          <SearchIconButton
            buttonRef={searchBtnRef}
            pressed={searchOpen || Boolean(query)}
            expanded={searchOpen}
            label="Buscar obras"
            onClick={() => setSearchOpen((open) => !open)}
          />
        </div>
        <div className={styles.controls}>
          {narrow ? null : (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título"
              aria-label="Buscar obras"
              className={styles.search}
            />
          )}
          {view === 'capitulos' ? (
            <WorkSelect works={publishedWorks} value={workId} onChange={setWorkId} />
          ) : null}
          {view === 'capitulos' ? <MoodSelect value={moods} onChange={setMoods} /> : null}
          <OptionSelect value={sortValue} options={sortOptions} onChange={setSort} ariaLabel="Ordenar" />
        </div>
        {narrow ? null : <p className={styles.count}>{countLabel}</p>}
      </header>
      {narrow && searchOpen ? (
        <input
          ref={searchFieldRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título"
          aria-label="Buscar obras"
          className={styles.searchFloat}
        />
      ) : null}
      <p className={styles.lead}>
        {view === 'obras'
          ? 'Cada card é uma obra. A quantidade conta os capítulos que ela reúne.'
          : 'Cada card é um capítulo. A linha separa capítulos de obras diferentes.'}
      </p>

      {shownCount === 0 ? (
        <p className={styles.empty}>{view === 'obras' ? 'Nenhuma obra com esse filtro.' : 'Nenhum capítulo com esse filtro.'}</p>
      ) : view === 'obras' ? (
        <ul className={styles.grid}>
          {filteredWorks.map((work) => (
            <li key={work.id}>
              <Link to={`/obra/${work.id}`} className={styles.card}>
                {work.cover ? <img src={work.cover} alt="" /> : <span className={styles.noCover}>{work.title.slice(0, 1)}</span>}
                <span className={styles.cardText}>
                  <strong>{work.title}</strong>
                  <small>{chapterCountLabel(work.chapters.length)}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.grid}>
          {chapterGroups.map((group, index) => (
            <ChapterGroup key={group.work.id} group={group} divided={index > 0} has={has} />
          ))}
        </ul>
      )}
    </div>
  )
}

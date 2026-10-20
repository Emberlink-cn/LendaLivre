import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchIconButton, useNarrow } from '../../components/common/SearchToggle'
import { useInventory } from '../../context/InventoryContext'
import { useLibrary } from '../../context/LibraryContext'
import { MOODS } from '../../data/catalog'
import styles from './CatalogPage.module.css'

const CATALOG_VIEW_KEY = 'lendalivre_catalog_view'

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
  const [query, setQuery] = useState('')

  function chooseView(next) {
    setView(next)
    storeCatalogView(next)
  }
  const [mood, setMood] = useState('Todos')
  const [moodOpen, setMoodOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const moodRef = useRef(null)
  const searchBtnRef = useRef(null)
  const searchFieldRef = useRef(null)

  useEffect(() => {
    document.title = 'Catálogo · LendaLivre'
  }, [])

  useEffect(() => {
    if (!moodOpen && !searchOpen) return undefined
    if (searchOpen) searchFieldRef.current?.focus()
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setMoodOpen(false)
      setSearchOpen(false)
    }
    const onPointer = (event) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (moodRef.current?.contains(target)) return
      if (searchBtnRef.current?.contains(target)) return
      if (searchFieldRef.current?.contains(target)) return
      setMoodOpen(false)
      setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [moodOpen, searchOpen])

  const q = query.trim().toLowerCase()

  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchesMood = mood === 'Todos' || work.chapters.some((chapter) => chapter.moods.includes(mood)) || work.moods.includes(mood)
      const matchesQuery =
        !q ||
        work.title.toLowerCase().includes(q) ||
        (work.line || '').toLowerCase().includes(q) ||
        work.chapters.some((chapter) => (chapter.name || chapter.title).toLowerCase().includes(q))
      return matchesMood && matchesQuery
    })
  }, [works, q, mood])

  const chapterGroups = useMemo(() => {
    return works
      .map((work) => ({
        work,
        chapters: work.chapters.filter((chapter) => {
          const name = `${chapter.name || ''} ${chapter.title || ''} ${chapter.line || ''}`
          const matchesMood = mood === 'Todos' || chapter.moods.includes(mood)
          const matchesQuery = !q || name.toLowerCase().includes(q) || chapter.moods.some((item) => item.toLowerCase().includes(q))
          return matchesMood && matchesQuery
        }),
      }))
      .filter((group) => group.chapters.length > 0)
  }, [works, q, mood])

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
          <div className={styles.moodMenu} ref={moodRef}>
            <button
              type="button"
              className={styles.moodBtn}
              aria-expanded={moodOpen}
              aria-haspopup="listbox"
              onClick={() => {
                setMoodOpen((open) => !open)
                setSearchOpen(false)
              }}
            >
              {mood}
            </button>
            {moodOpen ? (
              <div className={styles.moodList} role="listbox" aria-label="Filtrar por clima">
                {MOODS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    className={item === mood ? styles.filterOn : styles.filter}
                    aria-selected={item === mood}
                    onClick={() => {
                      setMood(item)
                      setMoodOpen(false)
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <SearchIconButton
            buttonRef={searchBtnRef}
            pressed={searchOpen || Boolean(query)}
            expanded={searchOpen}
            label="Buscar obras"
            onClick={() => {
              setSearchOpen((open) => !open)
              setMoodOpen(false)
            }}
          />
        </div>
        {narrow ? null : (
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título ou clima"
            aria-label="Buscar obras"
            className={styles.search}
          />
        )}
        <div className={styles.tools}>
        <div className={styles.filters} role="group" aria-label="Filtrar por clima">
          {MOODS.map((item) => (
            <button
              key={item}
              type="button"
              className={item === mood ? styles.filterOn : styles.filter}
              aria-pressed={item === mood}
              onClick={() => setMood(item)}
            >
              {item}
            </button>
          ))}
          <p className={styles.count}>{countLabel}</p>
        </div>
        </div>
      </header>
      {narrow && searchOpen ? (
        <input
          ref={searchFieldRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título ou clima"
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

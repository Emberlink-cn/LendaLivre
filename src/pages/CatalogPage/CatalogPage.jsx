import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchIconButton, useNarrow } from '../../components/common/SearchToggle'
import { useLibrary } from '../../context/LibraryContext'
import { MOODS } from '../../data/catalog'
import styles from './CatalogPage.module.css'

export default function CatalogPage() {
  const { works } = useLibrary()
  const narrow = useNarrow()
  const [query, setQuery] = useState('')
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return works.filter((work) => {
      const matchesMood = mood === 'Todos' || work.moods.includes(mood)
      const matchesQuery =
        !q ||
        work.title.toLowerCase().includes(q) ||
        work.line.toLowerCase().includes(q) ||
        work.moods.some((item) => item.toLowerCase().includes(q))
      return matchesMood && matchesQuery
    })
  }, [works, query, mood])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <p className={styles.eyebrow}>Catálogo</p>
          <h1>Obras</h1>
        </div>
        <div className={styles.mobileActions}>
          <p className={styles.mobileCount}>
            {filtered.length === 1 ? '1 obra' : `${filtered.length} obras`}
          </p>
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
          <p className={styles.count}>
            {filtered.length === 1 ? '1 obra' : `${filtered.length} obras`}
          </p>
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
        Capas e nomes do universo. Onde o capítulo já foi escrito, a leitura abre.
      </p>

      {filtered.length === 0 ? (
        <p className={styles.empty}>Nenhuma obra com esse filtro.</p>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((work) => (
            <li key={work.id}>
              <Link to={`/obra/${work.id}`} className={styles.card}>
                {work.cover ? (
                  <img src={work.cover} alt="" />
                ) : (
                  <span className={styles.noCover}>{work.title.slice(0, 1)}</span>
                )}
                <span className={styles.cardText}>
                  <small>{work.moods.join(' · ')}</small>
                  <strong>{work.title}</strong>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

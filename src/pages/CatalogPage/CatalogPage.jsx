import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../components/layout/TopNav/TopNav'
import { MOCK_WORKS } from '../../mocks/catalogMock'
import styles from './CatalogPage.module.css'

const TYPE_FILTERS = ['Todos', 'Livro', 'HQ', 'Video']

export default function CatalogPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_WORKS.filter((w) => {
      const matchesText =
        !q ||
        w.title.toLowerCase().includes(q) ||
        w.author.toLowerCase().includes(q) ||
        w.synopsis.toLowerCase().includes(q)

      const matchesType = typeFilter === 'Todos' || w.type === typeFilter
      return matchesText && matchesType
    })
  }, [query, typeFilter])

  return (
    <div className={styles.page}>
      <TopNav />

      <main className={styles.main}>
        <section className={styles.header}>
          <h1 className={styles.h1}>Catalogo</h1>
          <p className={styles.subtitle}>
            Explore obras, videos e capitulos. Por enquanto esta em modo mock.
          </p>

          <div className={styles.search}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className={styles.searchInput}
            />
          </div>

          <ul className={styles.filters} aria-label="Filtro de tipo">
            {TYPE_FILTERS.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  className={type === typeFilter ? styles.filterActive : styles.filter}
                  onClick={() => setTypeFilter(type)}
                >
                  {type}
                </button>
              </li>
            ))}
          </ul>

          <p className={styles.counter}>{filtered.length} item(ns) encontrado(s)</p>
        </section>

        <section className={styles.grid} aria-label="Lista de obras">
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              Nenhum resultado encontrado para o filtro atual.
            </div>
          ) : (
            filtered.map((work) => (
              <article key={work.id} className={styles.card}>
                <div className={styles.cover} aria-hidden>
                  {work.coverUrl ? (
                    <img src={work.coverUrl} alt="" className={styles.coverImage} />
                  ) : (
                    <span className={styles.coverFallback}>{work.title.slice(0, 1)}</span>
                  )}
                </div>

                <div className={styles.cardTop}>
                  <div className={styles.type}>{work.type}</div>
                  <div className={styles.meta}>{work.year}</div>
                </div>

                <h2 className={styles.title}>{work.title}</h2>
                <div className={styles.author}>Autor: {work.author}</div>
                <p className={styles.synopsis}>{work.synopsis}</p>
                <div className={styles.meta}>Tempo estimado: {work.readingTime}</div>

                <div className={styles.actions}>
                  <Link className={styles.linkBtn} to={`/read/${work.id}`}>
                    Abrir leitura
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  )
}


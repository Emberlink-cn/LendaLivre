import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useLibrary } from '../../context/LibraryContext'
import { legacyRead } from '../../data/catalog'
import styles from './WorkPage.module.css'

export default function WorkPage() {
  const { workId, chapterId } = useParams()
  const { getWork } = useLibrary()
  const work = getWork(workId)
  const legacy = !work ? legacyRead(workId, chapterId) : null
  const focus = chapterId ? work?.chapters.find((chapter) => chapter.id === chapterId) ?? null : null

  useEffect(() => {
    const name = focus?.name || focus?.title || work?.title
    document.title = name ? `${name} · LendaLivre` : 'Obra · LendaLivre'
  }, [work, focus])

  if (legacy) {
    const target = chapterId ? `/obra/${legacy.workId}/${legacy.chapterId}` : `/obra/${legacy.workId}/${legacy.chapterId}`
    return <Navigate to={target} replace />
  }

  if (!work) {
    return (
      <div className={styles.missing}>
        <h1>Obra não encontrada</h1>
        <Link to="/catalogo">Voltar ao catálogo</Link>
      </div>
    )
  }

  if (chapterId && !focus) {
    return (
      <div className={styles.missing}>
        <h1>Capítulo não encontrado</h1>
        <Link to={`/obra/${work.id}`}>Voltar para {work.title}</Link>
      </div>
    )
  }

  if (focus) {
    const readable = (focus.paragraphs ?? []).length > 0
    return (
      <article className={styles.page}>
        <p className={styles.back}>
          <Link to={`/obra/${work.id}`}>{work.title}</Link>
        </p>
        <div className={styles.layout}>
          {focus.cover ? (
            <img src={focus.cover} alt={`Capa de ${focus.name || focus.title}`} className={styles.cover} />
          ) : (
            <div className={styles.coverFallback} aria-hidden>
              {(focus.name || focus.title).slice(0, 1)}
            </div>
          )}
          <div className={styles.panel}>
            <p className={styles.moods}>{focus.moods.length ? focus.moods.join(' · ') : 'Sem atmosfera'}</p>
            <h1>{focus.name || focus.title}</h1>
            {focus.line ? <p className={styles.line}>{focus.line}</p> : null}
            {readable ? (
              <Link className={styles.primary} to={`/ler/${work.id}/${focus.id}`}>
                Começar a leitura
              </Link>
            ) : (
              <p className={styles.wait}>Este capítulo ainda não tem texto publicado.</p>
            )}
          </div>
        </div>
      </article>
    )
  }

  const firstChapter = work.chapters.find((chapter) => (chapter.paragraphs ?? []).length > 0) ?? work.chapters[0]

  return (
    <article className={`${styles.page} ${styles.locked}`}>
      <p className={styles.back}>
        <Link to="/catalogo">Catálogo</Link>
      </p>
      <div className={styles.layout}>
        {work.cover ? (
          <img src={work.cover} alt={`Capa de ${work.title}`} className={styles.cover} />
        ) : (
          <div className={styles.coverFallback} aria-hidden>
            {work.title.slice(0, 1)}
          </div>
        )}
        <div className={styles.panel}>
          <p className={styles.moods}>{work.moods.join(' · ')}</p>
          <h1>{work.title}</h1>
          <p className={styles.line}>{work.line}</p>
          {firstChapter ? (
            <Link className={styles.primary} to={`/ler/${work.id}/${firstChapter.id}`}>
              Começar a leitura
            </Link>
          ) : (
            <p className={styles.wait}>
              Os capítulos desta obra ainda não foram publicados. A capa fica aqui enquanto o texto é preparado.
            </p>
          )}
          {work.chapters.length > 0 ? (
            <ol className={styles.chapters}>
              {work.chapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link to={chapter.paragraphs?.length ? `/ler/${work.id}/${chapter.id}` : `/obra/${work.id}/${chapter.id}`}>
                    <span>Capítulo {chapter.number || '—'}</span>
                    <strong>{chapter.name || chapter.title}</strong>
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </article>
  )
}

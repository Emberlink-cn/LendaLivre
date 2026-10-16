import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLibrary } from '../../context/LibraryContext'
import styles from './WorkPage.module.css'

export default function WorkPage() {
  const { workId } = useParams()
  const { getWork } = useLibrary()
  const work = getWork(workId)

  useEffect(() => {
    document.title = work ? `${work.title} · LendaLivre` : 'Obra · LendaLivre'
  }, [work])

  if (!work) {
    return (
      <div className={styles.missing}>
        <h1>Obra não encontrada</h1>
        <Link to="/catalogo">Voltar ao catálogo</Link>
      </div>
    )
  }

  const firstChapter = work.chapters[0]

  return (
    <article className={styles.page}>
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
              {work.chapters.map((chapter, index) => (
                <li key={chapter.id}>
                  <Link to={`/ler/${work.id}/${chapter.id}`}>
                    <span>Capítulo {index + 1}</span>
                    <strong>{chapter.title}</strong>
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

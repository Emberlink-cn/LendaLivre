import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReadTools from '../../components/read/ReadTools'
import { useLibrary } from '../../context/LibraryContext'
import { useReading } from '../../context/ReadingContext'
import styles from './ReadPage.module.css'

function isMusicMark(text) {
  return /^[♪♫\s]+$/.test(text)
}

function renderText(text) {
  const parts = text.split(/(https?:\/\/\S+)/g)
  return parts.map((part, index) =>
    part.startsWith('http') ? (
      <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      <span key={`${index}-${part.slice(0, 12)}`}>{part}</span>
    ),
  )
}

function ChapterBody({ paragraphs }) {
  let leadUsed = false
  return paragraphs.map((paragraph, index) => {
    const music = isMusicMark(paragraph)
    const lead = !leadUsed && !music
    if (lead) leadUsed = true
    const dialogue = /^[—_–-]/.test(paragraph)
    const className = [music ? styles.music : '', lead ? styles.lead : '', dialogue ? styles.dialogue : '']
      .filter(Boolean)
      .join(' ')
    return (
      <p key={`${index}-${paragraph.slice(0, 24)}`} className={className || undefined}>
        {renderText(paragraph)}
      </p>
    )
  })
}

export default function ReadPage() {
  const { workId, chapterId } = useParams()
  const { getWork } = useLibrary()
  const work = getWork(workId)
  const chapter = work?.chapters.find((item) => item.id === chapterId) ?? null
  const { fontScale, remember } = useReading()

  useEffect(() => {
    document.title = chapter ? `${chapter.title} · LendaLivre` : 'Leitura · LendaLivre'
  }, [chapter])

  useEffect(() => {
    if (workId && chapterId) remember(workId, chapterId)
  }, [workId, chapterId, remember])

  if (!work || !chapter) {
    return (
      <div className={styles.missing}>
        <h1>Capítulo não encontrado</h1>
        <Link to={work ? `/obra/${work.id}` : '/catalogo'}>Voltar</Link>
      </div>
    )
  }

  const index = work.chapters.findIndex((item) => item.id === chapter.id)
  const prev = index > 0 ? work.chapters[index - 1] : null
  const next = index < work.chapters.length - 1 ? work.chapters[index + 1] : null

  return (
    <ReadTools work={work} chapter={chapter}>
    <article className={styles.page}>
      <p className={styles.kicker}>
        <Link to={`/obra/${work.id}`}>{work.title}</Link>
        <span>
          Capítulo {index + 1} de {work.chapters.length}
        </span>
      </p>
      {chapter.note ? <p className={styles.note}>{chapter.note}</p> : null}
      <h1>{chapter.title}</h1>
      <div className={styles.prose} style={{ fontSize: `${fontScale}rem` }}>
        <ChapterBody paragraphs={chapter.paragraphs} />
      </div>
      <nav className={styles.pager} aria-label="Capítulos">
        {prev ? (
          <Link to={`/ler/${work.id}/${prev.id}`}>← {prev.title}</Link>
        ) : (
          <span />
        )}
        {next ? <Link to={`/ler/${work.id}/${next.id}`}>{next.title} →</Link> : <span />}
      </nav>
    </article>
    </ReadTools>
  )
}

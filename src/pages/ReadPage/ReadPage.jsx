import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ReadTools from '../../components/read/ReadTools'
import { useAuth } from '../../context/AuthContext'
import { useLibrary } from '../../context/LibraryContext'
import { legacyRead } from '../../data/catalog'
import { useReading } from '../../context/ReadingContext'
import {
  captureReadingSpot,
  chapterSpot,
  rememberOpenChapter,
  revealReadingSpot,
  saveChapterSpot,
} from '../../lib/readingPlace'
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
      <p key={`${index}-${paragraph.slice(0, 24)}`} className={className || undefined} data-read-paragraph={index}>
        {renderText(paragraph)}
      </p>
    )
  })
}

export default function ReadPage() {
  const { workId, chapterId } = useParams()
  const { getWork } = useLibrary()
  const legacy = getWork(workId) ? null : legacyRead(workId, chapterId)
  const work = getWork(workId)
  const chapter = work?.chapters.find((item) => item.id === chapterId) ?? null
  const { user } = useAuth()
  const { fontScale, remember } = useReading()
  const allowSave = useRef(false)
  const restoredY = useRef(0)

  useEffect(() => {
    document.title = chapter ? `${chapter.title} · LendaLivre` : 'Leitura · LendaLivre'
  }, [chapter])

  useLayoutEffect(() => {
    allowSave.current = false
    const spot = chapterSpot(user?.id, workId, chapterId)
    revealReadingSpot(spot)
    restoredY.current = window.scrollY
    allowSave.current = true
    if (user?.id && workId && chapterId) rememberOpenChapter(user.id, workId, chapterId)
  }, [workId, chapterId, user?.id, chapter?.paragraphs?.length])

  useEffect(() => {
    if (!user?.id || !workId || !chapterId) return undefined
    let alive = true
    document.fonts?.ready.then(() => {
      if (!alive || !allowSave.current) return
      if (Math.abs(window.scrollY - restoredY.current) > 24) return
      allowSave.current = false
      revealReadingSpot(chapterSpot(user.id, workId, chapterId))
      restoredY.current = window.scrollY
      allowSave.current = true
    })
    return () => {
      alive = false
    }
  }, [workId, chapterId, user?.id, chapter?.paragraphs?.length])

  useEffect(() => {
    if (workId && chapterId) remember(workId, chapterId, chapter?.dbId)
  }, [workId, chapterId, chapter?.dbId, remember])

  useEffect(() => {
    if (!user?.id || !workId || !chapterId) return undefined
    const userId = user.id
    const save = () => {
      if (!allowSave.current) return
      saveChapterSpot(userId, workId, chapterId, captureReadingSpot())
    }
    let timer = 0
    const onScroll = () => {
      if (!allowSave.current) return
      window.clearTimeout(timer)
      timer = window.setTimeout(save, 180)
    }
    const onHide = () => {
      if (document.visibilityState === 'hidden') save()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', save)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', save)
    }
  }, [user?.id, workId, chapterId])

  if (legacy) return <Navigate to={`/ler/${legacy.workId}/${legacy.chapterId}`} replace />

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
          Capítulo {chapter.number || index + 1} de {work.chapters.length}
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

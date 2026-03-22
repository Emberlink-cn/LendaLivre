import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Modal from '../../components/common/Modal/Modal'
import TopNav from '../../components/layout/TopNav/TopNav'
import { MOCK_CHAPTERS_BY_WORK_ID, MOCK_WORKS } from '../../mocks/catalogMock'
import styles from './ReadPage.module.css'

function renderChapterContent(chapter) {
  return chapter.sections.map((sec, idx) => (
    <div key={`${chapter.id}-sec-${idx}`} className={styles.section}>
      <h3 className={styles.sectionHeading}>{sec.heading}</h3>
      {sec.paragraphs.map((p, pIdx) => (
        <p key={`${chapter.id}-sec-${idx}-p-${pIdx}`} className={styles.paragraph}>
          {p}
        </p>
      ))}
    </div>
  ))
}

export default function ReadPage() {
  const { workId } = useParams()
  const [openChapterId, setOpenChapterId] = useState(null)

  const work = useMemo(() => MOCK_WORKS.find((w) => w.id === workId) ?? null, [workId])
  const chapters = useMemo(() => MOCK_CHAPTERS_BY_WORK_ID[workId] ?? [], [workId])

  const openChapter = useMemo(() => {
    if (!openChapterId) return null
    return chapters.find((c) => c.id === openChapterId) ?? null
  }, [openChapterId, chapters])

  const openChapterIndex = useMemo(() => {
    if (!openChapter) return -1
    return chapters.findIndex((c) => c.id === openChapter.id)
  }, [openChapter, chapters])

  const hasPrev = openChapterIndex > 0
  const hasNext = openChapterIndex >= 0 && openChapterIndex < chapters.length - 1

  const openPrevChapter = () => {
    if (!hasPrev) return
    setOpenChapterId(chapters[openChapterIndex - 1].id)
  }

  const openNextChapter = () => {
    if (!hasNext) return
    setOpenChapterId(chapters[openChapterIndex + 1].id)
  }

  return (
    <div className={styles.page}>
      <TopNav />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.h1}>{work ? work.title : 'Obra nao encontrada'}</h1>
          <p className={styles.subtitle}>
            {work
              ? `Tipo: ${work.type} • Autor: ${work.author} • ${work.year}`
              : 'Verifique o ID na URL.'}
          </p>
          {work ? <p className={styles.synopsis}>{work.synopsis}</p> : null}
        </header>

        <section className={styles.readLayout}>
          <aside className={styles.chaptersPanel} aria-label="Lista de capitulos">
            <h2 className={styles.panelTitle}>Capitulos</h2>
            {chapters.length === 0 ? (
              <div className={styles.empty}>Sem capitulos disponiveis (mock).</div>
            ) : (
              <div className={styles.chapters}>
                {chapters.map((ch) => {
                  const isSelected = ch.id === openChapterId
                  return (
                    <button
                      key={ch.id}
                      className={isSelected ? styles.chapterBtnPrimary : styles.chapterBtn}
                      onClick={() => setOpenChapterId(ch.id)}
                    >
                      {ch.title}
                    </button>
                  )
                })}
              </div>
            )}
          </aside>

          <section className={styles.readerPreview}>
            <h2 className={styles.panelTitle}>Leitor</h2>
            {openChapter ? (
              <div className={styles.previewBox}>
                <h3 className={styles.previewTitle}>{openChapter.title}</h3>
                <p className={styles.previewText}>
                  Clique em "Reabrir capitulo" para entrar no modo de leitura completo.
                </p>
                <button className={styles.openReaderBtn} onClick={() => setOpenChapterId(openChapter.id)}>
                  Reabrir capitulo
                </button>
              </div>
            ) : (
              <div className={styles.previewBox}>
                <p className={styles.previewText}>
                  Selecione um capitulo na coluna ao lado para iniciar a leitura.
                </p>
              </div>
            )}
          </section>
        </section>

        <footer className={styles.readFooter}>
          <span className={styles.footerBadge}>Tempo estimado: {work?.readingTime ?? '-'}</span>
          <span className={styles.footerBadge}>Capitulos: {chapters.length}</span>
        </footer>
      </main>

      <Modal
        isOpen={Boolean(openChapter)}
        onClose={() => setOpenChapterId(null)}
        title={openChapter?.title}
      >
        {openChapter ? (
          <div>
            <h2 className={styles.modalTitle}>{openChapter.title}</h2>
            {renderChapterContent(openChapter)}
            <div className={styles.modalActions}>
              <button className={styles.modalNavBtn} disabled={!hasPrev} onClick={openPrevChapter}>
                Capitulo anterior
              </button>
              <button className={styles.modalNavBtn} disabled={!hasNext} onClick={openNextChapter}>
                Proximo capitulo
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}


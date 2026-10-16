import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../../context/LibraryContext'
import { useReading } from '../../context/ReadingContext'
import { HERO_IMAGE } from '../../data/catalog'
import styles from './HomePage.module.css'

const NOTES = [
  {
    title: 'Leitura',
    text: 'Coluna estreita, tipo serifado e tamanho de letra ajustável. O capítulo ocupa a página, sem janela por cima.',
  },
  {
    title: 'O tom',
    text: 'Noite, terra, mata e criaturas maiores que a gente. As capas trazem a cor. A sala fica escura para não competir com elas.',
  },
  {
    title: 'Depois',
    text: 'Seis obras já abrem o capítulo escrito. Itens, inventário e trilha ficam neste navegador até existir o servidor.',
  },
]

export default function HomePage() {
  const { works, getWork } = useLibrary()
  const { last } = useReading()
  const railRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const continueWork = last ? getWork(last.workId) : null
  const continueChapter = continueWork?.chapters.find((chapter) => chapter.id === last?.chapterId)

  function syncRail() {
    const rail = railRef.current
    if (!rail) return
    setCanPrev(rail.scrollLeft > 8)
    setCanNext(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8)
  }

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return undefined
    rail.addEventListener('scroll', syncRail, { passive: true })
    window.addEventListener('resize', syncRail)
    return () => {
      rail.removeEventListener('scroll', syncRail)
      window.removeEventListener('resize', syncRail)
    }
  }, [works.length])

  function moveRail(direction) {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector('a')
    const distance = card ? card.getBoundingClientRect().width * 2 + 24 : rail.clientWidth * 0.8
    rail.scrollBy({ left: direction * distance, behavior: 'auto' })
    syncRail()
  }

  useEffect(() => {
    document.title = 'LendaLivre'
  }, [])

  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        aria-label="Abertura"
      >
        <div className={styles.heroShade} />
        <div className={styles.panel}>
          <p className={styles.eyebrow}>Fantasia adulta · folclore brasileiro</p>
          <h1 className={styles.title}>LendaLivre</h1>
          <p className={styles.lead}>
            Travessia, mito e paisagem. Uma sala escura para ler o universo em capítulos.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.primary} to="/catalogo">
              Abrir o catálogo
            </Link>
            {continueChapter ? (
              <Link className={styles.ghost} to={`/ler/${last.workId}/${last.chapterId}`}>
                Continuar leitura
              </Link>
            ) : (
              <Link className={styles.ghost} to="/obra/lazaro">
                Ver Lázaro
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="capas-titulo">
        <div className={styles.sectionHead}>
          <div>
            <h2 id="capas-titulo">As capas</h2>
            <p>Cada card abre a capa da obra. A leitura começa na página do capítulo.</p>
          </div>
          <div className={styles.railNav}>
            <button type="button" onClick={() => moveRail(-1)} disabled={!canPrev} aria-label="Capas anteriores">
              {'<'}
            </button>
            <button type="button" onClick={() => moveRail(1)} disabled={!canNext} aria-label="Próximas capas">
              {'>'}
            </button>
          </div>
        </div>
        <div className={styles.rail} ref={railRef}>
          {works.map((work) => (
            <Link key={work.id} to={`/obra/${work.id}`} className={styles.railCard}>
              {work.cover ? <img src={work.cover} alt="" /> : <span className={styles.railMark}>{work.title.slice(0, 1)}</span>}
              <span className={styles.railTitle}>{work.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.notes} aria-label="Sobre esta sala">
        {NOTES.map((note) => (
          <article key={note.title} className={styles.note}>
            <h2>{note.title}</h2>
            <p>{note.text}</p>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>LendaLivre · Cof Cof Produções</p>
        <p>Conteúdo adulto. O texto publicado é o dos arquivos de capítulo.</p>
      </footer>
    </div>
  )
}

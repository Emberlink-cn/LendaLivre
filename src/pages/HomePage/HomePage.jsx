import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../../context/LibraryContext'
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
    text: 'Os capítulos escritos de Terras Invisíveis já abrem a leitura. Com a conta, a coleta e o último capítulo acompanham o leitor.',
  },
]

export default function HomePage() {
  const { works } = useLibrary()
  const railRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

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
            <Link className={styles.primary} to="/entrar">
              Entrar
            </Link>
            <Link className={styles.ghost} to="/criar-conta">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="capas-titulo">
        <div className={styles.sectionHead}>
          <div>
            <h2 id="capas-titulo">As capas</h2>
            <p>Cada card é um capítulo de Terras Invisíveis.</p>
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
          {works.flatMap((work) =>
            work.chapters.map((chapter) => (
              <Link key={`${work.id}:${chapter.id}`} to={`/obra/${work.id}/${chapter.id}`} className={styles.railCard}>
                {chapter.cover ? (
                  <img src={chapter.cover} alt="" />
                ) : (
                  <span className={styles.railMark}>{(chapter.name || chapter.title).slice(0, 1)}</span>
                )}
                <span className={styles.railTitle}>{chapter.name || chapter.title}</span>
              </Link>
            )),
          )}
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

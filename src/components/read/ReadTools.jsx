import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { normalizeWord } from '../../data/collectibles'
import { useInventory } from '../../context/InventoryContext'
import { useTheme } from '../../context/ThemeContext'
import { useReadToolsSlot } from '../layout/Shell'
import { ItemVisual } from '../common/Marks'
import styles from './ReadTools.module.css'

const PAPER_KEY = 'lendalivre_reading_paper'

function loadPaper() {
  try {
    return localStorage.getItem(PAPER_KEY) === 'light'
  } catch {
    return false
  }
}

function clampPanel(value) {
  const max = Math.round(window.innerWidth * 0.3)
  const min = Math.min(256, max)
  return Math.round(Math.min(max, Math.max(min, value)))
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M12 2.5v2.2M12 19.3v2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6"
      />
    </svg>
  )
}

export default function ReadTools({ work, chapter, children }) {
  const wide = useWide()
  const { theme } = useTheme()
  const toolsSlot = useReadToolsSlot()
  const [open, setOpen] = useState(null)
  const [chooser, setChooser] = useState(false)
  const [panelWidth, setPanelWidth] = useState(352)
  const [paper, setPaper] = useState(loadPaper)
  const [freeLeft, setFreeLeft] = useState(0)
  const dockRef = useRef(null)
  const items = chapter.items ?? []
  const tracks = chapter.tracks?.length ? chapter.tracks : chapter.music ? [chapter.music] : []

  useEffect(() => {
    delete document.documentElement.dataset.reading
  }, [])

  useEffect(() => {
    const node = dockRef.current
    if (!node) return undefined
    const measure = () => setFreeLeft(Math.round(node.getBoundingClientRect().left))
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [wide])

  function togglePaper() {
    setPaper((value) => {
      const next = !value
      try {
        localStorage.setItem(PAPER_KEY, next ? 'light' : 'app')
      } catch {
        /* a leitura segue mesmo sem gravar a preferência */
      }
      return next
    })
  }

  useEffect(() => {
    if (!open && !chooser) return undefined
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      if (open) setOpen(null)
      else setChooser(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, chooser])

  function choose(tool) {
    setChooser(false)
    setOpen((current) => (current === tool ? null : tool))
  }

  function startResize(event) {
    if (event.button != null && event.button !== 0) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const startW = panelWidth
    function move(pointer) {
      setPanelWidth(clampPanel(startW + (startX - pointer.clientX)))
    }
    function end() {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', end)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
  }

  function onResizeKey(event) {
    const step = event.shiftKey ? 48 : 16
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setPanelWidth((value) => clampPanel(value + step))
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setPanelWidth((value) => clampPanel(value - step))
    }
  }

  const chapterBody = isValidElement(children)
    ? cloneElement(children, { 'data-paper': paper ? 'light' : undefined })
    : children

  return (
    <div
      className={styles.stage}
      data-open={open ? 'true' : 'false'}
      style={{
        '--panel': `${panelWidth}px`,
        '--read-free': freeLeft > 0 ? `${freeLeft}px` : undefined,
      }}
    >
      {theme === 'light' ? null : (
        <button
          type="button"
          className={styles.paperBtn}
          aria-pressed={paper}
          aria-label="Tema claro da leitura"
          onClick={togglePaper}
        >
          <SunIcon />
        </button>
      )}
      <div className={styles.column}>
        {!wide && toolsSlot
          ? createPortal(
              <div className={styles.toolMenu}>
                <button
                  type="button"
                  className={styles.floatBtn}
                  aria-expanded={chooser || Boolean(open)}
                  aria-label="Ferramentas da leitura"
                  onClick={() => {
                    if (open) setOpen(null)
                    else setChooser((value) => !value)
                  }}
                >
                  <span aria-hidden>☰</span> Ferramentas
                </button>
                {chooser && !open ? (
                  <div className={styles.chooser}>
                    <button type="button" className={styles.floatBtn} onClick={() => choose('itens')}>
                      Itens
                    </button>
                    <button type="button" className={styles.floatBtn} onClick={() => choose('musica')}>
                      Música
                    </button>
                  </div>
                ) : null}
              </div>,
              toolsSlot,
            )
          : null}
        {chapterBody}
      </div>

      <aside ref={dockRef} className={styles.dock} aria-label="Ferramentas da leitura">
        <div className={styles.strip}>
          <button type="button" className={open === 'itens' ? styles.stripOn : undefined} onClick={() => choose('itens')}>
            Itens
          </button>
          <button type="button" className={open === 'musica' ? styles.stripOn : undefined} onClick={() => choose('musica')}>
            Música
          </button>
        </div>
        {wide && open ? (
          <div className={styles.panel} style={{ '--panel': `${panelWidth}px` }}>
            <div
              className={styles.resize}
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label="Largura do painel"
              aria-valuemin={256}
              aria-valuemax={Math.round(window.innerWidth * 0.3)}
              aria-valuenow={panelWidth}
              onPointerDown={startResize}
              onKeyDown={onResizeKey}
            />
            <PanelBody
              tool={open}
              items={items}
              tracks={tracks}
              work={work}
              chapter={chapter}
              onClose={() => setOpen(null)}
            />
          </div>
        ) : null}
      </aside>

      {!wide && open ? (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label={open === 'itens' ? 'Coletar itens' : 'Música'}>
          <PanelBody
            tool={open}
            items={items}
            tracks={tracks}
            work={work}
            chapter={chapter}
            onClose={() => setOpen(null)}
          />
        </div>
      ) : null}
    </div>
  )
}

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 980px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 980px)')
    const update = () => setWide(query.matches)
    query.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      query.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return wide
}

function PanelBody({ tool, items, tracks, work, chapter, onClose }) {
  return (
    <div className={styles.body}>
      <header className={styles.head}>
        <h2>{tool === 'itens' ? 'Coletar' : 'Trilha'}</h2>
        <button type="button" onClick={onClose}>
          Fechar
        </button>
      </header>
      {tool === 'itens' ? (
        <CollectForm items={items} work={work} chapter={chapter} />
      ) : (
        <MusicBlock tracks={tracks} />
      )}
    </div>
  )
}

function CollectForm({ items, work, chapter }) {
  const { collect, has, items: collected } = useInventory()
  const [query, setQuery] = useState('')
  const [found, setFound] = useState(undefined)
  const recent = [...collected].reverse().slice(0, 6)

  function search(event) {
    event.preventDefault()
    const key = normalizeWord(query)
    if (!key) {
      setFound(undefined)
      return
    }
    setFound(items.find((item) => normalizeWord(item.word) === key || normalizeWord(item.name) === key) ?? null)
  }

  return (
    <>
    <form className={styles.form} onSubmit={search}>
      <p>Digite uma palavra deste capítulo. Se ela for um item, dá para guardar no inventário.</p>
      <label>
        Palavra
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <button type="submit">Procurar</button>
      {found === undefined ? null : found === null ? (
        <p className={styles.miss}>Nenhum item com essa palavra neste capítulo.</p>
      ) : (
        <article className={styles.hit}>
          <ItemVisual item={found} />
          <div>
            <strong>{found.name}</strong>
            <span>{found.word}</span>
          </div>
          {has(found.id) ? (
            <Link to="/inventario">No inventário</Link>
          ) : (
            <button
              type="button"
              onClick={() =>
                collect(found, { workTitle: work.title, chapterTitle: chapter.title })
              }
            >
              Coletar
            </button>
          )}
        </article>
      )}
    </form>
    <section className={styles.history} aria-label="histórico de coletas">
      <p>histórico de coletas</p>
      {recent.length === 0 ? (
        <p className={styles.miss}>Nenhuma coleta ainda.</p>
      ) : (
        <ul>
          {recent.map((item) => (
            <li key={item.id}>
              <ItemVisual item={item} />
              <div>
                <strong>{item.name}</strong>
                <span>
                  {item.workTitle} · {item.chapterTitle}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
    </>
  )
}

function MusicBlock({ tracks }) {
  if (!tracks?.length) {
    return <p>Este capítulo ainda não tem trilha. O criador pode colar um embed do Spotify.</p>
  }
  return (
    <div className={styles.music}>
      {tracks.map((track) => (
        <div key={track.id || track.embedUrl}>
          <p>{track.title}</p>
          <iframe
            title={track.title}
            src={track.embedUrl}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      ))}
      <p className={styles.hint}>
        O widget do Spotify toca uma prévia sem conta. Com a sessão do Spotify aberta no navegador, a faixa continua no player.
      </p>
    </div>
  )
}

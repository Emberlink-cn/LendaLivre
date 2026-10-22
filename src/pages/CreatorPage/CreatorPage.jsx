import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../components/card/Card'
import { ItemIcon, ItemVisual } from '../../components/common/Marks'
import { toSpotifyEmbed } from '../../data/collectibles'
import { useAuth } from '../../context/AuthContext'
import SearchToggle from '../../components/common/SearchToggle'
import { useLibrary } from '../../context/LibraryContext'
import { ATMOSPHERES } from '../../data/catalog'
import { ATTRIBUTES, EMPTY_STATS, FRAMES, RARITIES, faceStats, imageFrameOf, presentCard } from '../../data/cardTraits'
import styles from './CreatorPage.module.css'

const TYPES = [
  { id: 'animal', label: 'Animal' },
  { id: 'arma', label: 'Arma' },
  { id: 'bebida', label: 'Bebida' },
  { id: 'ferramenta', label: 'Ferramenta' },
  { id: 'frasco', label: 'Frasco' },
  { id: 'habilidade', label: 'Habilidade' },
  { id: 'ingrediente', label: 'Ingrediente' },
  { id: 'inseto', label: 'Inseto' },
  { id: 'magia', label: 'Magia' },
  { id: 'maldicao', label: 'Maldição' },
  { id: 'material', label: 'Material' },
  { id: 'moeda', label: 'Moeda' },
  { id: 'objeto', label: 'Objeto' },
  { id: 'planta', label: 'Planta' },
  { id: 'refeicao', label: 'Refeição' },
  { id: 'relic', label: 'Relíquia' },
  { id: 'texto', label: 'Texto' },
  { id: 'veiculo', label: 'Veículo' },
  { id: 'vestimenta', label: 'Vestimenta' },
  { id: 'local', label: 'Local' },
  { id: 'personagem', label: 'Personagem' },
  { id: 'montaria', label: 'Montaria' },
]

function ChoiceField({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState(null)
  const rootRef = useRef(null)
  const current = options.find((item) => item.id === value) ?? options[0]

  useEffect(() => {
    if (!open) return undefined
    function onPointer(event) {
      if (!(event.target instanceof Node)) return
      if (rootRef.current?.contains(event.target)) return
      setOpen(false)
    }
    function onKey(event) {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
    }
    function onMove(event) {
      if (event.type === 'scroll' && rootRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open])

  function toggle() {
    if (open) {
      setOpen(false)
      return
    }
    const box = rootRef.current?.getBoundingClientRect()
    if (!box) return
    const menuHeight = Math.min(16 * 16, options.length * 36 + 12)
    const openUp = window.innerHeight - box.bottom < menuHeight && box.top > window.innerHeight - box.bottom
    setPlace({
      left: box.left,
      width: box.width,
      top: openUp ? box.top - menuHeight - 6 : box.bottom + 6,
    })
    setOpen(true)
  }

  return (
    <div className={`${styles.typeField} ${open ? styles.typeFieldOpen : ''}`} ref={rootRef}>
      <button
        type="button"
        className={styles.typeTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
      >
        <span>{current?.label}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && place ? (
        <ul
          className={`${styles.typeMenu} ${styles.choiceMenu}`}
          role="listbox"
          aria-label={label}
          style={{ left: place.left, top: place.top, width: place.width }}
        >
          {options.map((option) => {
            const selected = option.id === value
            return (
              <li key={option.id || 'nenhuma'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? styles.typeOn : styles.typeOption}
                  onClick={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function TypeField({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const current = TYPES.find((item) => item.id === value) ?? TYPES[0]

  useEffect(() => {
    if (!open) return undefined
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`${styles.typeField} ${open ? styles.typeFieldOpen : ''}`} ref={rootRef}>
      <button
        type="button"
        className={styles.typeTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span>{current.label}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <ul className={styles.typeMenu} role="listbox" aria-label="Tipo">
          {TYPES.map((option) => {
            const selected = option.id === value
            return (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? styles.typeOn : styles.typeOption}
                  onClick={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

const TABS = [
  { id: 'texto', label: 'Texto' },
  { id: 'itens', label: 'Itens' },
  { id: 'musicas', label: 'Músicas' },
]

function slug(value) {
  const base = value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || 'obra'
}

function foldText(value) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function countLabel(shown, total, filtering, singular, plural) {
  if (filtering) return `${shown} de ${total}`
  return total === 1 ? `1 ${singular}` : `${total} ${plural}`
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function readImage(file, onDone, onError) {
  if (!file) return
  if (!IMAGE_TYPES.has(file.type)) {
    onError('Use uma imagem JPEG, PNG, WebP ou GIF.')
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    onError('A imagem precisa ter menos de 8 MB.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => onDone(String(reader.result || ''))
  reader.readAsDataURL(file)
}

function modeClass({ isActive }) {
  return isActive ? styles.modeOn : styles.mode
}

function AtmosphereField({ value, onChange }) {
  function toggle(mood) {
    onChange(value.includes(mood) ? value.filter((item) => item !== mood) : [...value, mood])
  }

  return (
    <div className={styles.atmos} role="group" aria-label="Atmosfera">
      <span className={styles.atmosLabel}>Atmosfera</span>
      {ATMOSPHERES.map((mood) => {
        const on = value.includes(mood)
        return (
          <button
            key={mood}
            type="button"
            className={on ? styles.moodOn : styles.mood}
            aria-pressed={on}
            onClick={() => toggle(mood)}
          >
            {mood}
          </button>
        )
      })}
    </div>
  )
}

export default function CreatorPage() {
  const { isAuthenticated, isSuper, ready } = useAuth()
  const library = useLibrary()
  const navigate = useNavigate()
  const splat = useParams()['*'] ?? ''
  const [section, workId, chapterId] = splat.split('/').filter(Boolean)
  const onWork = section === 'gerir' && Boolean(workId) && !chapterId
  const onChapter = section === 'gerir' && Boolean(workId) && Boolean(chapterId)
  const [notice, setNotice] = useState('')
  const [chapterQuery, setChapterQuery] = useState('')
  const [tab, setTab] = useState('texto')
  const [tabChapter, setTabChapter] = useState('')
  const chapterKey = onChapter ? `${workId}:${chapterId}` : ''

  if (onChapter && tabChapter !== chapterKey) {
    setTabChapter(chapterKey)
    setTab('texto')
  }

  useEffect(() => {
    document.title = 'Criador · LendaLivre'
  }, [])

  if (!ready) return null
  if (!isAuthenticated) return <Navigate to="/entrar" replace state={{ from: { pathname: '/criador' } }} />
  if (!isSuper) {
    return (
      <div className={styles.page}>
        <h1>Painel do criador</h1>
        <p>Esta sala é só da conta de criador.</p>
      </div>
    )
  }

  if (section !== 'nova' && section !== 'gerir') return <Navigate to="/criador/gerir" replace />

  const work = workId ? library.works.find((item) => item.id === workId) ?? null : null
  const chapter = work?.chapters.find((item) => item.id === chapterId) ?? null

  const listPage = (section === 'gerir' && !onChapter && !onWork) || (onChapter && (tab === 'itens' || tab === 'musicas'))

  return (
    <div className={listPage ? `${styles.page} ${styles.pageFill}` : styles.page}>
      {onChapter ? (
        <header className={styles.head}>
          <p className={styles.eyebrow}>{work?.title || 'Capítulo'}</p>
          <h1>{chapter?.title || work?.title || 'Capítulo não encontrado'}</h1>
          {work ? (
            <nav className={styles.modes} aria-label="Conteúdo do capítulo">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? styles.modeOn : styles.mode}
                  aria-current={tab === item.id ? 'page' : undefined}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : null}
        </header>
      ) : onWork ? (
        <header className={styles.head}>
          <p className={styles.eyebrow}>Obra</p>
          <h1>{work?.title || 'Obra não encontrada'}</h1>
        </header>
      ) : (
        <header className={styles.head}>
          <p className={styles.eyebrow}>Superusuário</p>
          <h1>Painel do criador</h1>
          {section === 'gerir' ? (
            <SearchToggle
              className={styles.headSearch}
              value={chapterQuery}
              placeholder="Buscar obra"
              label="Buscar obra"
              onChange={(event) => setChapterQuery(event.target.value)}
            />
          ) : null}
          <nav className={styles.modes} aria-label="Seções do criador">
            <NavLink to="/criador/nova" className={modeClass}>
              Nova obra
            </NavLink>
            <NavLink to="/criador/gerir" end className={modeClass}>
              Gerenciar conteúdo
            </NavLink>
          </nav>
          <p className={styles.lead}>
            O que você publica aqui entra no catálogo. Capas e imagens vão junto com o texto.
          </p>
        </header>
      )}
      {notice ? <p className={styles.ok}>{notice}</p> : null}
      {section === 'nova' ? <NewWork works={library.works} addWork={library.addWork} onDone={setNotice} /> : null}
      {section === 'gerir' && !onChapter && !onWork ? <ManageContent library={library} query={chapterQuery} /> : null}
      {onWork && work ? <WorkEditor work={work} library={library} onDone={setNotice} /> : null}
      {onWork && !work ? <p className={styles.err}>Obra não encontrada.</p> : null}
      {onChapter && work ? (
        <ChapterEditor
          workId={workId}
          chapterId={chapterId}
          chapter={chapter}
          tab={tab}
          library={library}
          onDone={setNotice}
          onRemoved={() => navigate(`/criador/gerir/${workId}`)}
        />
      ) : null}
      {onChapter && !work ? <p className={styles.err}>Capítulo não encontrado.</p> : null}
    </div>
  )
}

function NewWork({ works, addWork, onDone }) {
  const [title, setTitle] = useState('')
  const [line, setLine] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [text, setText] = useState('')
  const [cover, setCover] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function onFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    readImage(file, (next) => {
      setCover(next)
      setError('')
    }, setError)
  }

  async function submit(event) {
    event.preventDefault()
    if (!title.trim() || !text.trim()) {
      setError('Informe o título e o texto.')
      return
    }
    let id = slug(title)
    if (works.some((work) => work.id === id)) id = `${id}-${Date.now()}`
    const paragraphs = text
      .split(/\n\s*\n|\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    const workTitle = title.trim()
    setSaving(true)
    setError('')
    try {
      await addWork({
        id,
        title: workTitle,
        line: line.trim() || 'Obra adicionada pelo criador.',
        cover,
        chapters: [
          {
            id: 'texto',
            number: 1,
            name: chapterTitle.trim() || workTitle,
            title: chapterTitle.trim() || workTitle,
            line: '',
            moods: [],
            cover,
            paragraphs,
          },
        ],
      })
      setTitle('')
      setLine('')
      setChapterTitle('')
      setText('')
      setCover('')
      onDone(`Obra “${workTitle}” publicada no catálogo.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={`${styles.card} ${styles.stack}`} onSubmit={submit}>
      <label>
        Título
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Linha de apresentação
        <input value={line} onChange={(event) => setLine(event.target.value)} />
      </label>
      <label>
        Título do capítulo
        <input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} />
      </label>
      <label>
        Texto
        <textarea rows={8} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <label>
        Capa
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} />
      </label>
      {cover ? <img src={cover} alt="" className={styles.preview} /> : null}
      {error ? <p className={styles.err}>{error}</p> : null}
      <button type="submit" disabled={saving}>{saving ? 'Publicando…' : 'Publicar'}</button>
    </form>
  )
}

function ManageContent({ library, query }) {
  const entries = useMemo(
    () =>
      library.works.map((work) => ({
        key: work.id,
        workId: work.id,
        label: `${work.title} — ${work.chapters.length === 1 ? '1 capítulo' : `${work.chapters.length} capítulos`}`,
      })),
    [library.works],
  )
  const needle = foldText(query.trim())
  const visible = needle ? entries.filter((entry) => foldText(entry.label).includes(needle)) : entries

  return (
    <div className={`${styles.card} ${styles.stack} ${styles.cardGrow}`}>
      <ul className={styles.results}>
        {visible.map((entry) => (
          <li key={entry.key}>
            <Link className={styles.pick} to={`/criador/gerir/${entry.workId}`}>
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
      {needle && visible.length === 0 ? <p className={styles.err}>Nenhuma obra com esse nome.</p> : null}
    </div>
  )
}

function WorkEditor({ work, library, onDone }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(work.title)
  const [line, setLine] = useState(work.line || '')
  const [cover, setCover] = useState(work.cover || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [seenId, setSeenId] = useState(work.id)

  if (seenId !== work.id) {
    setSeenId(work.id)
    setTitle(work.title)
    setLine(work.line || '')
    setCover(work.cover || '')
    setError('')
  }

  function onFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    readImage(file, setCover, setError)
  }

  async function saveWork(event) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Informe o nome da obra.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await library.updateWorkDetails(work.id, { title: title.trim(), line: line.trim(), cover })
      onDone(`Obra “${title.trim()}” atualizada.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveNumber(chapter, value) {
    const number = Number(value)
    if (!Number.isFinite(number) || number < 1 || number === chapter.number) return
    try {
      await library.updateChapterMeta(work.id, chapter.id, { number })
    } catch (err) {
      setError(err.message)
    }
  }

  async function createChapter() {
    const number = work.chapters.reduce((max, chapter) => Math.max(max, chapter.number || 0), 0) + 1
    const id = `cap-${Date.now()}`
    const name = `Capítulo ${number}`
    setSaving(true)
    setError('')
    try {
      await library.addChapter(work.id, {
        id,
        number,
        name,
        title: name,
        line: '',
        moods: [],
        cover: '',
        paragraphs: [],
        note: '',
      })
      navigate(`/criador/gerir/${work.id}/${id}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className={styles.stack}>
      <form className={`${styles.card} ${styles.stack}`} onSubmit={saveWork}>
        <label>
          Nome da obra
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Sinopse
          <textarea rows={3} value={line} onChange={(event) => setLine(event.target.value)} />
        </label>
        <label>
          Capa
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} />
        </label>
        {cover ? <img src={cover} alt="" className={styles.preview} /> : null}
        {error ? <p className={styles.err}>{error}</p> : null}
        <button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar obra'}</button>
      </form>
      <div className={`${styles.card} ${styles.stack}`}>
        <div className={styles.listHead}>
          <p className={styles.listTitle}>Capítulos</p>
          <button type="button" className={styles.addItem} onClick={createChapter} disabled={saving}>
            + Capítulo
          </button>
        </div>
        <ul className={styles.chapterList}>
          {work.chapters.map((chapter) => (
            <li key={chapter.id} className={styles.chapterLine}>
              <label className={styles.numberField}>
                <span>Nº</span>
                <input
                  type="number"
                  min="1"
                  defaultValue={chapter.number || ''}
                  key={`${chapter.id}:${chapter.number}`}
                  aria-label={`Número de ${chapter.name || chapter.title}`}
                  onBlur={(event) => saveNumber(chapter, event.target.value)}
                />
              </label>
              <Link className={styles.pick} to={`/criador/gerir/${work.id}/${chapter.id}`}>
                {chapter.name || chapter.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ChapterEditor({ workId, chapterId, chapter, tab, library, onDone, onRemoved }) {
  const [number, setNumber] = useState(String(chapter?.number || ''))
  const [name, setName] = useState(chapter?.name || chapter?.title || '')
  const [title, setTitle] = useState(chapter?.title ?? '')
  const [line, setLine] = useState(chapter?.line ?? '')
  const [moods, setMoods] = useState(chapter?.moods ?? [])
  const [cover, setCover] = useState(chapter?.cover || '')
  const [body, setBody] = useState((chapter?.paragraphs ?? []).join('\n\n'))
  const [note, setNote] = useState(chapter?.note ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [seenKey, setSeenKey] = useState(`${workId}:${chapterId}`)
  const key = `${workId}:${chapterId}`

  if (seenKey !== key) {
    setSeenKey(key)
    setNumber(String(chapter?.number || ''))
    setName(chapter?.name || chapter?.title || '')
    setTitle(chapter?.title ?? '')
    setLine(chapter?.line ?? '')
    setMoods(chapter?.moods ?? [])
    setCover(chapter?.cover || '')
    setBody((chapter?.paragraphs ?? []).join('\n\n'))
    setNote(chapter?.note ?? '')
    setError('')
    setConfirmDelete(false)
  }

  function onCover(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    readImage(file, setCover, setError)
  }

  async function saveText(event) {
    event.preventDefault()
    const paragraphs = body
      .split(/\n\s*\n|\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    const readingTitle = title.trim() || name.trim()
    if (!name.trim() && !readingTitle) {
      setError('Informe o nome do capítulo.')
      return
    }
    const parsedNumber = Number(number)
    setSaving(true)
    setError('')
    try {
      await library.updateChapterMeta(workId, chapterId, {
        name: name.trim() || readingTitle,
        title: readingTitle,
        number: Number.isFinite(parsedNumber) && parsedNumber > 0 ? parsedNumber : chapter?.number || 1,
        line: line.trim(),
        moods,
        cover,
        paragraphs,
        note: note.trim(),
      })
      onDone(`Capítulo “${name.trim() || readingTitle}” atualizado.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteChapter() {
    setSaving(true)
    setError('')
    try {
      await library.removeChapter(workId, chapterId)
      onDone('Capítulo excluído.')
      onRemoved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (tab === 'itens') {
    return (
      <ItemManager
        workId={workId}
        chapterId={chapterId}
        chapterTitle={chapter?.title}
        items={chapter?.items ?? []}
        library={library}
        onDone={onDone}
      />
    )
  }

  if (tab === 'musicas') {
    return (
      <TrackManager
        workId={workId}
        chapterId={chapterId}
        tracks={chapter?.tracks ?? []}
        library={library}
        onDone={onDone}
      />
    )
  }

  return (
    <div className={`${styles.card} ${styles.stack}`}>
      <form className={styles.stack} onSubmit={saveText}>
        <label>
          Número
          <input type="number" min="1" value={number} onChange={(event) => setNumber(event.target.value)} />
        </label>
        <label>
          Nome do capítulo
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Sinopse
          <textarea rows={3} value={line} onChange={(event) => setLine(event.target.value)} />
        </label>
        <label>
          Capa
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onCover} />
        </label>
        {cover ? <img src={cover} alt="" className={styles.preview} /> : null}
        <AtmosphereField value={moods} onChange={setMoods} />
        <label>
          Título na leitura
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Texto
          <textarea rows={12} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
        <label>
          Nota de leitura
          <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        {error ? <p className={styles.err}>{error}</p> : null}
        <button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar capítulo'}</button>
      </form>
      <div className={styles.actions}>
        {confirmDelete ? (
          <>
            <button type="button" className={styles.ghost} onClick={() => setConfirmDelete(false)}>
              Cancelar
            </button>
            <button type="button" className={styles.danger} onClick={deleteChapter}>
              Confirmar exclusão
            </button>
          </>
        ) : (
          <button type="button" className={styles.danger} onClick={() => setConfirmDelete(true)}>
            Excluir capítulo
          </button>
        )}
      </div>
    </div>
  )
}

const EMPTY_DRAFT = {
  word: '',
  name: '',
  type: 'relic',
  image: '',
  atmospheres: [],
  imageZoom: 1,
  imageX: 50,
  imageY: 50,
  rarity: 'comum',
  frame: 'gold',
  stats: { ...EMPTY_STATS },
  passive: '',
}

function ItemManager({ workId, chapterId, chapterTitle, items, library, onDone }) {
  const [editor, setEditor] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [draftError, setDraftError] = useState('')
  const [saving, setSaving] = useState(false)
  const editingId = editor && editor !== 'new' ? editor : null
  const [query, setQuery] = useState('')
  const needle = foldText(query.trim())
  const visible = needle
    ? items.filter((item) => {
        const typeLabel = TYPES.find((option) => option.id === item.type)?.label || ''
        const rarity = RARITIES.find((option) => option.id === item.rarity)?.label || ''
        const moods = presentCard(item).atmospheres.join(' ')
        return foldText(`${item.name} ${item.word} ${typeLabel} ${moods} ${rarity} ${item.passive || ''}`).includes(needle)
      })
    : items

  function beginCreate() {
    setEditor('new')
    setConfirmId(null)
    setDraft(EMPTY_DRAFT)
    setDraftError('')
  }

  function beginEdit(item) {
    const card = presentCard(item)
    setEditor(item.id)
    setConfirmId(null)
    setDraft({
      word: item.word || '',
      name: item.name || '',
      type: item.type || 'relic',
      image: item.image || '',
      atmospheres: card.atmospheres,
      imageZoom: card.imageZoom,
      imageX: card.imageX,
      imageY: card.imageY,
      rarity: card.rarity,
      frame: card.frame,
      stats: { ...card.stats },
      passive: card.passive,
    })
    setDraftError('')
  }

  function closeEdit() {
    setEditor(null)
    setDraft(EMPTY_DRAFT)
    setDraftError('')
  }

  function setStat(id, value) {
    const next = Number(value)
    setDraft((current) => ({
      ...current,
      stats: { ...current.stats, [id]: Number.isFinite(next) ? next : 0 },
    }))
  }

  function onDraftFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    readImage(file, (image) => setDraft((current) => ({ ...current, image, imageZoom: 1, imageX: 50, imageY: 50 })), setDraftError)
  }

  async function submitItem(event) {
    event.preventDefault()
    if (!draft.word.trim() || !draft.name.trim()) {
      setDraftError('Informe a palavra e o nome do item.')
      return
    }
    const payload = {
      word: draft.word.trim(),
      name: draft.name.trim(),
      type: draft.type,
      image: draft.image,
      atmospheres: draft.atmospheres,
      atmosphere: draft.atmospheres.join(' · '),
      imageZoom: draft.imageZoom,
      imageX: draft.imageX,
      imageY: draft.imageY,
      rarity: draft.rarity,
      frame: draft.frame,
      stats: draft.stats,
      passive: draft.passive.trim(),
    }
    setSaving(true)
    setDraftError('')
    try {
      if (editingId) {
        await library.updateItem(workId, chapterId, editingId, payload)
        onDone(`Item “${payload.name}” atualizado.`)
      } else {
        await library.addItem(workId, chapterId, { id: `item_${Date.now()}`, ...payload })
        onDone(`Item “${payload.name}” adicionado.`)
      }
      closeEdit()
    } catch (err) {
      setDraftError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    setSaving(true)
    try {
      await library.removeItem(workId, chapterId, item.id)
      if (editingId === item.id) closeEdit()
      setConfirmId(null)
      onDone(`Item “${item.name}” excluído.`)
    } catch (err) {
      setDraftError(err.message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!editor) return undefined
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setEditor(null)
      setDraft(EMPTY_DRAFT)
      setDraftError('')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor])

  const preview = presentCard({
    ...draft,
    name: draft.name.trim() || 'Novo item',
    type: draft.type,
    workTitle: chapterTitle,
  })
  const typeLabel = TYPES.find((option) => option.id === draft.type)?.label || 'Item'

  return (
    <>
      {editor
        ? createPortal(
            <div className={styles.itemModal} role="presentation" onClick={closeEdit}>
              <div
                className={styles.itemModalPanel}
                role="dialog"
                aria-modal="true"
                aria-label={editingId ? 'Editar item' : 'Novo item'}
                onClick={(event) => event.stopPropagation()}
              >
                <div className={styles.itemModalCard}>
                  <Card
                    title={preview.name}
                    image={draft.image}
                    imageFrame={imageFrameOf(draft)}
                    fallback={<ItemIcon type={draft.type} />}
                    type={typeLabel}
                    origin={chapterTitle || 'LendaLivre'}
                    description={draft.passive.trim() || undefined}
                    color={draft.frame || 'gold'}
                    stats={faceStats(preview)}
                  />
                </div>
                <form className={`${styles.card} ${styles.itemModalForm}`} onSubmit={submitItem}>
                  <h2>{editingId ? 'Editar item' : 'Novo item'}</h2>
                  <label>
                    Palavra no texto
                    <input value={draft.word} onChange={(event) => setDraft((current) => ({ ...current, word: event.target.value }))} />
                  </label>
                  <label>
                    Nome do item
                    <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label>
                    Tipo
                    <TypeField value={draft.type} onChange={(type) => setDraft((current) => ({ ...current, type }))} />
                  </label>
                  <div className={styles.span2}>
                    <AtmosphereField
                      value={draft.atmospheres}
                      onChange={(atmospheres) => setDraft((current) => ({ ...current, atmospheres }))}
                    />
                  </div>
                  <label>
                    Raridade
                    <ChoiceField
                      label="Raridade"
                      value={draft.rarity}
                      options={RARITIES}
                      onChange={(rarity) => setDraft((current) => ({ ...current, rarity }))}
                    />
                  </label>
                  <label>
                    Moldura
                    <ChoiceField
                      label="Moldura"
                      value={draft.frame}
                      options={FRAMES}
                      onChange={(frame) => setDraft((current) => ({ ...current, frame }))}
                    />
                  </label>
                  <label className={styles.span2}>
                    Imagem do item
                    <input key={editingId || 'novo'} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onDraftFile} />
                  </label>
                  {draft.image ? (
                    <div className={`${styles.frameTune} ${styles.span2}`}>
                      <label>
                        Zoom
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.05"
                          value={draft.imageZoom}
                          onChange={(event) => setDraft((current) => ({ ...current, imageZoom: Number(event.target.value) }))}
                        />
                      </label>
                      <label>
                        Horizontal
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={draft.imageX}
                          onChange={(event) => setDraft((current) => ({ ...current, imageX: Number(event.target.value) }))}
                        />
                      </label>
                      <label>
                        Vertical
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={draft.imageY}
                          onChange={(event) => setDraft((current) => ({ ...current, imageY: Number(event.target.value) }))}
                        />
                      </label>
                    </div>
                  ) : null}
                  <label className={styles.span2}>
                    Habilidade passiva
                    <input
                      value={draft.passive}
                      placeholder="Opcional"
                      onChange={(event) => setDraft((current) => ({ ...current, passive: event.target.value }))}
                    />
                  </label>
                  <div className={`${styles.statGrid} ${styles.span2}`}>
                    {ATTRIBUTES.map((attribute) => (
                      <label key={attribute.id}>
                        {attribute.label}
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={draft.stats[attribute.id]}
                          onChange={(event) => setStat(attribute.id, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                  <p className={`${styles.traitNote} ${styles.span2}`}>Sorte e azar podem alterar qualquer outro atributo na partida.</p>
                  {draft.image ? (
                    <div className={`${styles.extra} ${styles.span2}`}>
                      <ItemVisual item={{ image: draft.image, type: draft.type }} size={42} />
                      <button type="button" className={styles.ghost} onClick={() => setDraft((current) => ({ ...current, image: '', imageZoom: 1, imageX: 50, imageY: 50 }))}>
                        Remover imagem
                      </button>
                    </div>
                  ) : null}
                  {draftError ? <p className={`${styles.err} ${styles.span2}`}>{draftError}</p> : null}
                  <div className={`${styles.composeActions} ${styles.span2}`}>
                    <button type="button" className={styles.ghost} onClick={closeEdit}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving}>
                      {saving ? 'Salvando…' : editingId ? 'Salvar edição' : 'Adicionar item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
      <div className={`${styles.card} ${styles.cardGrow}`}>
        <div className={styles.listHead}>
          <SearchToggle
            value={query}
            placeholder="Buscar item"
            label="Buscar item"
            onChange={(event) => setQuery(event.target.value)}
          />
          <p className={styles.count}>{countLabel(visible.length, items.length, Boolean(needle), 'item', 'itens')}</p>
          <button type="button" className={styles.addItem} onClick={beginCreate}>
            + Adicionar
          </button>
        </div>
        {items.length === 0 ? <p className={styles.err}>Este capítulo ainda não tem itens.</p> : null}
        {items.length > 0 && visible.length === 0 ? <p className={styles.err}>Nenhum item com essa busca.</p> : null}
      <ul className={styles.rows}>
        {visible.map((item) => {
          const editing = editingId === item.id
          const confirming = confirmId === item.id
          const stats = presentCard(item).stats
          return (
            <li key={item.id} className={editing ? `${styles.itemRow} ${styles.rowOn}` : styles.itemRow}>
              <div
                className={styles.rowHit}
                role="button"
                tabIndex={0}
                onClick={() => beginEdit(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    beginEdit(item)
                  }
                }}
              >
                <ItemVisual item={item} size={42} />
                <div className={styles.meta}>
                  <strong>{item.name}</strong>
                  <span>{item.word}</span>
                </div>
                <ul className={styles.attrLine} aria-label="Atributos">
                  {ATTRIBUTES.map((attribute) => (
                    <li key={attribute.id}>
                      <b>{stats[attribute.id]}</b>
                      <span>{attribute.short}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.actions}>
                {confirming ? (
                  <>
                    <button type="button" className={styles.ghost} onClick={() => setConfirmId(null)}>
                      Cancelar
                    </button>
                    <button type="button" className={styles.danger} onClick={() => remove(item)}>
                      Confirmar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.danger}
                    onClick={() => {
                      setConfirmId(item.id)
                      if (editing) closeEdit()
                    }}
                  >
                    Excluir
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      </div>
    </>
  )
}

function TrackManager({ workId, chapterId, tracks, library, onDone }) {
  const [editingId, setEditingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSpotify, setDraftSpotify] = useState('')
  const [draftError, setDraftError] = useState('')
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const needle = foldText(query.trim())
  const visible = needle
    ? tracks.filter((track) => foldText(`${track.title} ${track.embedUrl}`).includes(needle))
    : tracks

  function beginEdit(track) {
    setEditingId(track.id)
    setConfirmId(null)
    setDraftTitle(track.title || '')
    setDraftSpotify(track.embedUrl || '')
    setDraftError('')
  }

  function closeEdit() {
    setEditingId(null)
    setDraftTitle('')
    setDraftSpotify('')
    setDraftError('')
  }

  async function submitTrack(event) {
    event.preventDefault()
    const embedUrl = toSpotifyEmbed(draftSpotify)
    if (!embedUrl) {
      setDraftError('Cole um link ou o código de embed do Spotify.')
      return
    }
    const payload = { title: draftTitle.trim() || 'Trilha do capítulo', embedUrl }
    setSaving(true)
    setDraftError('')
    try {
      if (editingId) {
        await library.updateTrack(workId, chapterId, editingId, payload)
        onDone('Trilha atualizada.')
      } else {
        await library.addTrack(workId, chapterId, { id: `track_${Date.now()}`, ...payload })
        onDone('Trilha adicionada.')
      }
      closeEdit()
    } catch (err) {
      setDraftError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(track) {
    setSaving(true)
    setDraftError('')
    try {
      await library.removeTrack(workId, chapterId, track.id)
      if (editingId === track.id) closeEdit()
      setConfirmId(null)
      onDone('Trilha excluída.')
    } catch (err) {
      setDraftError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <form className={`${styles.card} ${styles.compose} ${styles.composeMusic}`} onSubmit={submitTrack}>
        <label>
          Nome
          <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
        </label>
        <label>
          Link ou embed do Spotify
          <input value={draftSpotify} onChange={(event) => setDraftSpotify(event.target.value)} />
        </label>
        <div className={styles.composeActions}>
          <button type="submit" disabled={saving}>{saving ? 'Salvando…' : editingId ? 'Salvar música' : 'Adicionar música'}</button>
          {editingId ? (
            <button type="button" className={styles.ghost} onClick={closeEdit}>
              Cancelar
            </button>
          ) : null}
        </div>
        {draftError ? <p className={styles.err}>{draftError}</p> : null}
      </form>
      <div className={`${styles.card} ${styles.cardGrow}`}>
        <div className={styles.listHead}>
          <SearchToggle
            value={query}
            placeholder="Buscar música"
            label="Buscar música"
            onChange={(event) => setQuery(event.target.value)}
          />
          <p className={styles.count}>
            {countLabel(visible.length, tracks.length, Boolean(needle), 'música', 'músicas')}
          </p>
        </div>
        {tracks.length === 0 ? <p className={styles.err}>Este capítulo ainda não tem música.</p> : null}
        {tracks.length > 0 && visible.length === 0 ? <p className={styles.err}>Nenhuma música com essa busca.</p> : null}
      <ul className={styles.rows}>
        {visible.map((track) => {
          const editing = editingId === track.id
          const confirming = confirmId === track.id
          return (
            <li key={track.id} className={editing ? styles.rowOn : undefined}>
              <div className={styles.rowHead}>
                <div className={styles.meta}>
                  <strong>{track.title}</strong>
                  <span>{track.embedUrl}</span>
                </div>
                <div className={styles.actions}>
                  {confirming ? (
                    <>
                      <button type="button" className={styles.ghost} onClick={() => setConfirmId(null)}>
                        Cancelar
                      </button>
                      <button type="button" className={styles.danger} onClick={() => remove(track)}>
                        Confirmar
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className={styles.ghost} onClick={() => (editing ? closeEdit() : beginEdit(track))}>
                        {editing ? 'Editando' : 'Editar'}
                      </button>
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => {
                          setConfirmId(track.id)
                          if (editing) closeEdit()
                        }}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      </div>
    </>
  )
}

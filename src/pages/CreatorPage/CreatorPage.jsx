import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ItemVisual } from '../../components/common/Marks'
import { toSpotifyEmbed } from '../../data/collectibles'
import { useAuth } from '../../context/AuthContext'
import SearchToggle from '../../components/common/SearchToggle'
import { useLibrary } from '../../context/LibraryContext'
import { ATMOSPHERES } from '../../data/catalog'
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
]

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

function readImage(file, onDone, onError) {
  if (!file) return
  if (file.size > 400_000) {
    onError('A imagem do item precisa ter menos de 400 KB nesta versão local.')
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
  const { isAuthenticated, isSuper } = useAuth()
  const library = useLibrary()
  const navigate = useNavigate()
  const splat = useParams()['*'] ?? ''
  const [section, workId, chapterId] = splat.split('/').filter(Boolean)
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

  if (!isAuthenticated) return <Navigate to="/entrar" replace state={{ from: { pathname: '/criador' } }} />
  if (!isSuper) {
    return (
      <div className={styles.page}>
        <h1>Painel do criador</h1>
        <p>Esta sala é só da conta de criador.</p>
        <p>
          Demonstração: criador@lendalivre.app / lenda123. <Link to="/entrar">Entrar</Link>
        </p>
      </div>
    )
  }

  if (section !== 'nova' && section !== 'gerir') return <Navigate to="/criador/gerir" replace />

  const work = onChapter ? library.works.find((item) => item.id === workId) : null
  const chapter = work?.chapters.find((item) => item.id === chapterId) ?? null

  const listPage = (section === 'gerir' && !onChapter) || (onChapter && (tab === 'itens' || tab === 'musicas'))

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
      ) : (
        <header className={styles.head}>
          <p className={styles.eyebrow}>Superusuário</p>
          <h1>Painel do criador</h1>
          {section === 'gerir' ? (
            <SearchToggle
              className={styles.headSearch}
              value={chapterQuery}
              placeholder="Buscar capítulo"
              label="Buscar capítulo"
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
            Textos, capas, itens e trilhas ficam neste navegador. O envio para um servidor entra com o banco.
          </p>
        </header>
      )}
      {onChapter && work ? (
        <AtmosphereField value={work.moods ?? []} onChange={(moods) => library.updateWorkMoods(work.id, moods)} />
      ) : null}
      {notice ? <p className={styles.ok}>{notice}</p> : null}
      {section === 'nova' ? <NewWork works={library.works} addWork={library.addWork} onDone={setNotice} /> : null}
      {section === 'gerir' && !onChapter ? <ManageContent library={library} query={chapterQuery} /> : null}
      {onChapter && work ? (
        <ChapterEditor
          workId={workId}
          chapterId={chapterId}
          chapter={chapter}
          tab={tab}
          library={library}
          onDone={setNotice}
          onRemoved={() => navigate('/criador/gerir')}
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
  const [moods, setMoods] = useState([])
  const [error, setError] = useState('')

  function onFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 700_000) {
      setError('A capa precisa ter menos de 700 KB nesta versão local.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCover(String(reader.result || ''))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function submit(event) {
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
    addWork({
      id,
      title: title.trim(),
      line: line.trim() || 'Obra adicionada pelo criador.',
      moods,
      cover,
      chapters: [
        {
          id: 'texto',
          title: chapterTitle.trim() || title.trim(),
          paragraphs,
        },
      ],
    })
    setTitle('')
    setLine('')
    setChapterTitle('')
    setText('')
    setCover('')
    setMoods([])
    setError('')
    onDone(`Obra “${title.trim()}” disponível no catálogo.`)
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
      <AtmosphereField value={moods} onChange={setMoods} />
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
        <input type="file" accept="image/*" onChange={onFile} />
      </label>
      {cover ? <img src={cover} alt="" className={styles.preview} /> : null}
      {error ? <p className={styles.err}>{error}</p> : null}
      <button type="submit">Publicar neste navegador</button>
    </form>
  )
}

function ManageContent({ library, query }) {
  const entries = useMemo(
    () =>
      library.works.flatMap((work) => {
        if (!work.chapters.length) {
          return [
            {
              key: `${work.id}:texto`,
              workId: work.id,
              chapterId: 'texto',
              label: work.title,
            },
          ]
        }
        return work.chapters.map((chapter) => ({
          key: `${work.id}:${chapter.id}`,
          workId: work.id,
          chapterId: chapter.id,
          label: `${work.title} — ${chapter.title}`,
        }))
      }),
    [library.works],
  )
  const needle = foldText(query.trim())
  const visible = needle ? entries.filter((entry) => foldText(entry.label).includes(needle)) : entries

  return (
    <div className={`${styles.card} ${styles.stack} ${styles.cardGrow}`}>
      <ul className={styles.results}>
        {visible.map((entry) => (
          <li key={entry.key}>
            <Link className={styles.pick} to={`/criador/gerir/${entry.workId}/${entry.chapterId}`}>
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
      {needle && visible.length === 0 ? <p className={styles.err}>Nenhum capítulo com esse nome.</p> : null}
    </div>
  )
}

function ChapterEditor({ workId, chapterId, chapter, tab, library, onDone, onRemoved }) {
  const [title, setTitle] = useState(chapter?.title ?? '')
  const [body, setBody] = useState((chapter?.paragraphs ?? []).join('\n\n'))
  const [note, setNote] = useState(chapter?.note ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [seenKey, setSeenKey] = useState(`${workId}:${chapterId}`)
  const key = `${workId}:${chapterId}`

  if (seenKey !== key) {
    setSeenKey(key)
    setTitle(chapter?.title ?? '')
    setBody((chapter?.paragraphs ?? []).join('\n\n'))
    setNote(chapter?.note ?? '')
    setConfirmDelete(false)
  }

  function saveText(event) {
    event.preventDefault()
    const paragraphs = body
      .split(/\n\s*\n|\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    if (!title.trim() || paragraphs.length === 0) return
    library.setChapterText(workId, chapterId, { title: title.trim(), paragraphs, note: note.trim() })
    onDone(`Texto de “${title.trim()}” atualizado.`)
  }

  function deleteChapter() {
    library.removeChapter(workId, chapterId)
    onDone('Capítulo excluído neste navegador.')
    onRemoved()
  }

  if (tab === 'itens') {
    return (
      <ItemManager workId={workId} chapterId={chapterId} items={chapter?.items ?? []} library={library} onDone={onDone} />
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
          Título
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
        <button type="submit">Salvar texto</button>
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

function ItemManager({ workId, chapterId, items, library, onDone }) {
  const [editingId, setEditingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [draftWord, setDraftWord] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftType, setDraftType] = useState('relic')
  const [draftImage, setDraftImage] = useState('')
  const [draftError, setDraftError] = useState('')
  const [query, setQuery] = useState('')
  const needle = foldText(query.trim())
  const visible = needle
    ? items.filter((item) => {
        const typeLabel = TYPES.find((option) => option.id === item.type)?.label || ''
        return foldText(`${item.name} ${item.word} ${typeLabel}`).includes(needle)
      })
    : items

  function beginEdit(item) {
    setEditingId(item.id)
    setConfirmId(null)
    setDraftWord(item.word)
    setDraftName(item.name)
    setDraftType(item.type || 'relic')
    setDraftImage(item.image || '')
    setDraftError('')
  }

  function closeEdit() {
    setEditingId(null)
    setDraftWord('')
    setDraftName('')
    setDraftType('relic')
    setDraftImage('')
    setDraftError('')
  }

  function onDraftFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    readImage(file, setDraftImage, setDraftError)
  }

  function submitItem(event) {
    event.preventDefault()
    if (!draftWord.trim() || !draftName.trim()) {
      setDraftError('Informe a palavra e o nome do item.')
      return
    }
    const payload = { word: draftWord.trim(), name: draftName.trim(), type: draftType, image: draftImage }
    if (editingId) {
      library.updateItem(workId, chapterId, editingId, payload)
      onDone(`Item “${payload.name}” atualizado.`)
      closeEdit()
      return
    }
    library.addItem(workId, chapterId, { id: `item_${Date.now()}`, ...payload })
    onDone(`Item “${payload.name}” adicionado.`)
    closeEdit()
  }

  function remove(item) {
    library.removeItem(workId, chapterId, item.id)
    if (editingId === item.id) closeEdit()
    setConfirmId(null)
    onDone(`Item “${item.name}” excluído.`)
  }

  return (
    <>
      <form className={`${styles.card} ${styles.compose}`} onSubmit={submitItem}>
        <label>
          Palavra no texto
          <input value={draftWord} onChange={(event) => setDraftWord(event.target.value)} />
        </label>
        <label>
          Nome do item
          <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
        </label>
        <label>
          Tipo
          <TypeField value={draftType} onChange={setDraftType} />
        </label>
        <label>
          Imagem do item
          <input key={editingId || 'novo'} type="file" accept="image/*" onChange={onDraftFile} />
        </label>
        <div className={styles.composeActions}>
          <button type="submit">{editingId ? 'Salvar item' : 'Adicionar item'}</button>
          {editingId ? (
            <button type="button" className={styles.ghost} onClick={closeEdit}>
              Cancelar
            </button>
          ) : null}
        </div>
        {draftImage ? (
          <div className={styles.extra}>
            <ItemVisual item={{ image: draftImage, type: draftType }} size={42} />
            <button type="button" className={styles.ghost} onClick={() => setDraftImage('')}>
              Remover imagem
            </button>
          </div>
        ) : null}
        {draftError ? <p className={styles.err}>{draftError}</p> : null}
      </form>
      <div className={`${styles.card} ${styles.cardGrow}`}>
        <div className={styles.listHead}>
          <SearchToggle
            value={query}
            placeholder="Buscar item"
            label="Buscar item"
            onChange={(event) => setQuery(event.target.value)}
          />
          <p className={styles.count}>{countLabel(visible.length, items.length, Boolean(needle), 'item', 'itens')}</p>
        </div>
        {items.length === 0 ? <p className={styles.err}>Este capítulo ainda não tem itens.</p> : null}
        {items.length > 0 && visible.length === 0 ? <p className={styles.err}>Nenhum item com essa busca.</p> : null}
      <ul className={styles.rows}>
        {visible.map((item) => {
          const editing = editingId === item.id
          const confirming = confirmId === item.id
          return (
            <li key={item.id} className={editing ? styles.rowOn : undefined}>
              <div className={`${styles.rowHead} ${styles.rowHeadWithIcon}`}>
                <ItemVisual item={item} size={42} />
                <div className={styles.meta}>
                  <strong>{item.name}</strong>
                  <span>{item.word}</span>
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
                    <>
                      <button type="button" className={styles.ghost} onClick={() => (editing ? closeEdit() : beginEdit(item))}>
                        {editing ? 'Editando' : 'Editar'}
                      </button>
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

function TrackManager({ workId, chapterId, tracks, library, onDone }) {
  const [editingId, setEditingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSpotify, setDraftSpotify] = useState('')
  const [draftError, setDraftError] = useState('')
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

  function submitTrack(event) {
    event.preventDefault()
    const embedUrl = toSpotifyEmbed(draftSpotify)
    if (!embedUrl) {
      setDraftError('Cole um link ou o código de embed do Spotify.')
      return
    }
    const payload = { title: draftTitle.trim() || 'Trilha do capítulo', embedUrl }
    if (editingId) {
      library.updateTrack(workId, chapterId, editingId, payload)
      onDone('Trilha atualizada.')
      closeEdit()
      return
    }
    library.addTrack(workId, chapterId, { id: `track_${Date.now()}`, ...payload })
    onDone('Trilha adicionada.')
    closeEdit()
  }

  function remove(track) {
    library.removeTrack(workId, chapterId, track.id)
    if (editingId === track.id) closeEdit()
    setConfirmId(null)
    onDone('Trilha excluída.')
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
          <button type="submit">{editingId ? 'Salvar música' : 'Adicionar música'}</button>
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

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/card/Card'
import { useNarrow } from '../../components/common/SearchToggle'
import { ItemVisual } from '../../components/common/Marks'
import { useAuth } from '../../context/AuthContext'
import { DECK_SIZE, loadDecks, rememberMatchDeck, saveDecks } from './decks'
import { usePilotDeck } from './pilot'
import styles from './DeckPage.module.css'

function cardProps(card) {
  return {
    title: card.name,
    image: card.image,
    imageFrame: { zoom: card.imageZoom, x: card.imageX, y: card.imageY },
    fallback: <ItemVisual item={card} />,
    type: card.type || 'Item',
    origin: card.workTitle || 'LendaLivre',
    color: card.frame || 'gold',
    stats: [
      { label: 'Ene', value: card.stats?.energia ?? 0 },
      { label: 'Atq', value: card.stats?.ataque ?? 0 },
      { label: 'Def', value: card.stats?.defesa ?? 0 },
    ],
  }
}

function openMatchWindow() {
  const width = Math.min(1280, window.screen.availWidth - 48)
  const height = Math.min(820, window.screen.availHeight - 80)
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)
  const features = [
    'popup=yes',
    `width=${Math.round(width)}`,
    `height=${Math.round(height)}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
  ].join(',')
  const opened = window.open('/evoluir/partida?janela=1', 'lendalivre-partida', features)
  opened?.focus()
}

export default function DeckPage() {
  const navigate = useNavigate()
  const narrow = useNarrow()
  const { user } = useAuth()
  const userId = user?.id ?? 'visitante'
  const { cards, usingSamples } = usePilotDeck()
  const [decks, setDecks] = useState(() => loadDecks(userId))
  const [openId, setOpenId] = useState(null)
  const [over, setOver] = useState(false)
  const [notice, setNotice] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.title = 'Decks · LendaLivre'
  }, [])

  useEffect(() => {
    setDecks(loadDecks(userId))
    setOpenId(null)
    setConfirmId(null)
  }, [userId])

  const owned = usingSamples ? [] : cards
  const byId = new Map(owned.map((card) => [card.id, card]))
  const openDeck = decks.find((deck) => deck.id === openId) ?? null
  const openCards = openDeck ? openDeck.cardIds.map((id) => byId.get(id)).filter(Boolean) : []
  const term = query.trim().toLocaleLowerCase('pt')
  const listed = owned.filter((card) => {
    if (openDeck?.cardIds.includes(card.id)) return false
    if (!term) return true
    return card.name.toLocaleLowerCase('pt').includes(term)
  })

  function commit(next) {
    setDecks(next)
    saveDecks(userId, next)
  }

  function rename(deckId, name) {
    commit(decks.map((deck) => (deck.id === deckId ? { ...deck, name: name.slice(0, 32) } : deck)))
  }

  function addCard(cardId) {
    if (!openDeck) {
      setNotice('Abra um deck para receber a carta.')
      return
    }
    if (openDeck.cardIds.includes(cardId)) {
      setNotice('Essa carta já está neste deck.')
      return
    }
    if (openDeck.cardIds.length >= DECK_SIZE) {
      setNotice(`Este deck já tem ${DECK_SIZE} cartas.`)
      return
    }
    setNotice('')
    commit(decks.map((deck) => (
      deck.id === openDeck.id ? { ...deck, cardIds: [...deck.cardIds, cardId] } : deck
    )))
  }

  function removeCard(cardId) {
    if (!openDeck) return
    setNotice('')
    commit(decks.map((deck) => (
      deck.id === openDeck.id ? { ...deck, cardIds: deck.cardIds.filter((id) => id !== cardId) } : deck
    )))
  }

  function clearDeck(deckId) {
    setNotice('')
    setConfirmId(null)
    commit(decks.map((deck) => (deck.id === deckId ? { ...deck, cardIds: [] } : deck)))
  }

  function findMatch() {
    if (!openDeck || !openCards.length) return
    rememberMatchDeck(userId, openDeck.id)
    if (narrow) {
      navigate('/evoluir/partida')
      return
    }
    openMatchWindow()
  }

  function onDrop(event) {
    event.preventDefault()
    setOver(false)
    const cardId = event.dataTransfer.getData('text/plain')
    if (cardId) addCard(cardId)
  }

  return (
    <section className={styles.page}>
      <aside className={styles.library} aria-label="Inventário">
        <header>
          <h2>Inventário</h2>
          <p>{owned.length === 1 ? '1 carta' : `${owned.length} cartas`}</p>
        </header>
        <input
          className={styles.search}
          type="search"
          value={query}
          placeholder="Buscar carta"
          aria-label="Buscar carta"
          onChange={(event) => setQuery(event.target.value)}
        />
        {listed.length ? (
          <ul className={styles.thumbs}>
            {listed.map((card) => (
              <li key={card.id}>
                <div
                  className={styles.thumb}
                  draggable={!narrow}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', card.id)
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
                  onClick={() => {
                    if (narrow) addCard(card.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      addCard(card.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={card.name}
                >
                  <Card {...cardProps(card)} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            {owned.length
              ? term
                ? 'Nenhuma carta com esse nome.'
                : 'Todas as cartas coletadas já estão neste deck.'
              : 'Nenhuma carta coletada ainda.'}
          </p>
        )}
      </aside>

      <div className={styles.stage}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Evoluir cartas</p>
          <h1>Decks</h1>
          <p>Cinco decks. Cada um recebe até {DECK_SIZE} cartas do inventário.</p>
        </header>

        <ul className={styles.slots}>
          {decks.map((deck) => {
            const count = deck.cardIds.filter((id) => byId.has(id)).length
            const active = deck.id === openId
            return (
              <li key={deck.id} className={active ? styles.slotOn : styles.slot}>
                <button type="button" className={styles.slotMain} onClick={() => { setOpenId(deck.id); setNotice(''); setConfirmId(null) }}>
                  <strong>{deck.name}</strong>
                  <span>{count}/{DECK_SIZE}</span>
                </button>
                <div className={styles.slotActions}>
                  <button type="button" onClick={() => { setOpenId(deck.id); setNotice(''); setConfirmId(null) }}>Editar</button>
                  {confirmId === deck.id ? (
                    <button type="button" onClick={() => clearDeck(deck.id)}>Confirmar</button>
                  ) : (
                    <button type="button" onClick={() => setConfirmId(deck.id)} disabled={!count}>Desmontar</button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <section
          className={over ? `${styles.editor} ${styles.editorOver}` : styles.editor}
          aria-label={openDeck ? `Deck ${openDeck.name}` : 'Deck'}
          onDragOver={(event) => {
            if (!openDeck) return
            event.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          {openDeck ? (
            <>
              <header className={styles.editorBar}>
                <label>
                  Nome
                  <input
                    value={openDeck.name}
                    maxLength={32}
                    onChange={(event) => rename(openDeck.id, event.target.value)}
                  />
                </label>
                <p>{openCards.length}/{DECK_SIZE}</p>
                <button type="button" className={styles.play} onClick={findMatch} disabled={!openCards.length}>
                  Procurar partida
                </button>
              </header>
              {notice ? <p className={styles.notice}>{notice}</p> : null}
              {openCards.length ? (
                <ul className={styles.deckGrid}>
                  {openCards.map((card) => (
                    <li key={card.id}>
                      <Card {...cardProps(card)} />
                      <button type="button" onClick={() => removeCard(card.id)}>Tirar</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.drop}>
                  {narrow
                    ? 'Toque uma carta do inventário para colocar neste deck.'
                    : 'Arraste uma carta do inventário para este deck.'}
                </p>
              )}
            </>
          ) : (
            <p className={styles.drop}>Escolha um dos cinco decks para nomear, montar ou desmontar.</p>
          )}
        </section>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardBack } from '../../components/card/Card'
import { Avatar, ItemVisual } from '../../components/common/Marks'
import { useAuth } from '../../context/AuthContext'
import { cardsForMatch } from './decks'
import FullscreenButton from './FullscreenButton'
import { LANES, usePilotDeck } from './pilot'
import styles from './MatchPage.module.css'

const BELT_SIZE = 7

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
      { label: 'Atq', value: card.stats?.ataque ?? 0 },
      { label: 'Def', value: card.stats?.defesa ?? 0 },
    ],
  }
}

function shuffle(cards) {
  const next = [...cards]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

function openMatch(cards) {
  const deck = shuffle(cards)
  return {
    belt: deck.slice(0, BELT_SIZE),
    pile: deck.slice(BELT_SIZE),
    draws: 0,
  }
}

function PlayedCard({ card }) {
  if (!card) return <div className={styles.emptySlot} />
  return (
    <div className={styles.played}>
      <Card {...cardProps(card)} />
      <b className={styles.cost}>{card.stats?.energia ?? 0}</b>
      <b className={styles.power}>{card.stats?.ataque ?? 0}</b>
    </div>
  )
}

function Pile({ count }) {
  const shown = Math.min(count, 3)
  return (
    <div className={styles.stack} aria-label={count ? `${count} cartas no monte` : 'Monte vazio'}>
      {count === 0 ? <div className={styles.stackEmpty} /> : null}
      {Array.from({ length: shown }, (_, index) => (
        <div
          key={index}
          className={styles.stackCard}
          style={{
            transform: `translate(${(shown - 1 - index) * 8}px, ${(shown - 1 - index) * -6}px)`,
            zIndex: index + 1,
          }}
        >
          <CardBack />
        </div>
      ))}
      {count > 0 ? <span className={styles.stackCount}>{count}</span> : null}
    </div>
  )
}

export default function MatchPage() {
  const stageRef = useRef(null)
  const beltRef = useRef(null)
  const revealRef = useRef(false)
  const [params] = useSearchParams()
  const windowed = params.get('janela') === '1'
  const { user } = useAuth()
  const { cards } = usePilotDeck()
  const tableCards = cardsForMatch(user?.id, cards) ?? cards
  const deckKey = tableCards.map((card) => card.id).join('\0')
  const [matchKey, setMatchKey] = useState(deckKey)
  const [match, setMatch] = useState(() => openMatch(tableCards))
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  if (matchKey !== deckKey) {
    setMatchKey(deckKey)
    setMatch(openMatch(tableCards))
  }

  const { belt, pile, draws } = match
  const canFish = draws > 0 && pile.length > 0

  useEffect(() => {
    document.title = 'Partida · LendaLivre'
  }, [])

  useEffect(() => {
    const node = beltRef.current
    if (!node) return undefined
    const sync = () => {
      setAtStart(node.scrollLeft <= 2)
      setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 2)
    }
    sync()
    node.addEventListener('scroll', sync, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(node)
    return () => {
      node.removeEventListener('scroll', sync)
      observer.disconnect()
    }
  }, [belt.length])

  useEffect(() => {
    if (!revealRef.current) return
    revealRef.current = false
    const node = beltRef.current
    if (!node) return
    node.scrollTo({ left: node.scrollWidth, behavior: 'smooth' })
  }, [belt])

  function step(direction) {
    const node = beltRef.current
    if (!node) return
    const card = node.querySelector('[data-belt-card]')
    const gap = Number.parseFloat(getComputedStyle(node).columnGap) || 0
    const width = (card?.getBoundingClientRect().width || 120) + gap
    node.scrollBy({ left: direction * width, behavior: 'smooth' })
  }

  function removeCard(id) {
    setMatch((current) => {
      if (!current.belt.some((card) => card.id === id)) return current
      return {
        ...current,
        belt: current.belt.filter((card) => card.id !== id),
        draws: current.draws + 1,
      }
    })
  }

  function fish() {
    setMatch((current) => {
      if (current.draws < 1 || current.pile.length === 0) return current
      revealRef.current = true
      const [card, ...rest] = current.pile
      return {
        belt: [...current.belt, card],
        pile: rest,
        draws: current.draws - 1,
      }
    })
  }

  const fishHint = pile.length === 0
    ? 'O monte acabou.'
    : 'Remova uma carta da esteira para pescar.'

  return (
    <section ref={stageRef} className={windowed ? `${styles.page} ${styles.pageWindow}` : styles.page}>
      <div className={styles.sky} aria-hidden="true" />
      <header className={styles.top}>
        <p className={styles.player}>
          <Avatar name={user?.name || 'Você'} face={user?.avatar} size={36} />
          <span>
            <strong>Você</strong>
            <b>0</b>
          </span>
        </p>
        <p className={styles.turn}>1</p>
        <div className={styles.topEnd}>
          <p className={`${styles.player} ${styles.playerEnd}`}>
            <span>
              <strong>Viajante</strong>
              <b>?</b>
            </span>
            <Avatar name="Viajante" face="mark" size={36} />
          </p>
          <FullscreenButton targetRef={stageRef} />
        </div>
      </header>
      <div className={styles.board}>
        {LANES.map((lane) => (
          <article key={lane.id} className={styles.lane}>
            <div className={styles.side}>
              <CardBack />
            </div>
            <h2>
              {lane.name}
              <small>{lane.line}</small>
            </h2>
            <div className={styles.side}>
              <PlayedCard card={null} />
            </div>
          </article>
        ))}
      </div>
      <div className={styles.dock}>
        <div className={styles.carousel} aria-label="Esteira">
          <button
            type="button"
            className={styles.step}
            aria-label="Carta anterior"
            disabled={atStart}
            onClick={() => step(-1)}
          >
            ‹
          </button>
          <div className={styles.belt} ref={beltRef}>
            {belt.length ? (
              belt.map((card) => (
                <div key={card.id} className={styles.beltCard} data-belt-card="">
                  <div className={styles.beltFace}>
                    <Card {...cardProps(card)} />
                  </div>
                  <button type="button" className={styles.remove} onClick={() => removeCard(card.id)}>
                    Remover
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.note}>A esteira está vazia.</p>
            )}
          </div>
          <button
            type="button"
            className={styles.step}
            aria-label="Próxima carta"
            disabled={atEnd}
            onClick={() => step(1)}
          >
            ›
          </button>
        </div>
        <div className={styles.pile}>
          <button
            type="button"
            className={styles.fish}
            disabled={!canFish}
            title={canFish ? 'Pescar uma carta do monte' : fishHint}
            onClick={fish}
          >
            Pescar
          </button>
          <Pile count={pile.length} />
        </div>
      </div>
    </section>
  )
}

import { useEffect } from 'react'
import { Card, CardBack } from '../../components/card/Card'
import { Avatar, ItemVisual } from '../../components/common/Marks'
import { useAuth } from '../../context/AuthContext'
import { dealPreview, usePilotDeck } from './pilot'
import styles from './MatchPage.module.css'

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

export default function MatchPage() {
  const { user } = useAuth()
  const { cards } = usePilotDeck()
  const { lanes, hand } = dealPreview(cards)
  const score = lanes.reduce((sum, lane) => sum + (lane.card?.stats?.ataque ?? 0), 0)

  useEffect(() => {
    document.title = 'Partida · LendaLivre'
  }, [])

  return (
    <section className={styles.page}>
      <div className={styles.sky} aria-hidden="true" />
      <header className={styles.hud}>
        <p className={styles.player}>
          <Avatar name={user?.name || 'Você'} face={user?.avatar} size={36} />
          <span>
            <strong>Você</strong>
            <b>{score}</b>
          </span>
        </p>
        <p className={styles.turn}>1</p>
        <p className={styles.player}>
          <span>
            <strong>Viajante</strong>
            <b>?</b>
          </span>
          <Avatar name="Viajante" face="mark" size={36} />
        </p>
      </header>
      <div className={styles.board}>
        {lanes.map((lane) => (
          <article key={lane.id} className={styles.lane}>
            <div className={styles.side}>
              <CardBack />
            </div>
            <h2>
              {lane.name}
              <small>{lane.line}</small>
            </h2>
            <div className={styles.side}>
              <PlayedCard card={lane.card} />
            </div>
          </article>
        ))}
      </div>
      <div className={styles.hand} aria-label="Sua mão">
        {hand.length ? (
          hand.map((card) => (
            <div key={card.id} className={styles.handCard}>
              <Card {...cardProps(card)} />
            </div>
          ))
        ) : (
          <p className={styles.note}>A mão fica vazia nesta prévia.</p>
        )}
      </div>
      <p className={styles.note}>Prévia da mesa. O verso do oponente é o mesmo para qualquer carta.</p>
    </section>
  )
}

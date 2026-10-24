import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/card/Card'
import { ItemVisual } from '../../components/common/Marks'
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
    description: card.passive?.trim() || undefined,
    color: card.frame || 'gold',
    stats: [
      { label: 'Ene', value: card.stats?.energia ?? 0 },
      { label: 'Atq', value: card.stats?.ataque ?? 0 },
      { label: 'Def', value: card.stats?.defesa ?? 0 },
    ],
  }
}

export default function DeckPage() {
  const { cards, usingSamples } = usePilotDeck()

  useEffect(() => {
    document.title = 'Baralho · LendaLivre'
  }, [])

  return (
    <section className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Evoluir cartas</p>
        <h1>Baralho</h1>
        <p>
          {usingSamples
            ? 'Ainda não há cartas coletadas. A mesa de exemplo usa itens de Terras Invisíveis.'
            : `${cards.length === 1 ? '1 carta coletada' : `${cards.length} cartas coletadas`}. A montagem do deck entra depois.`}
        </p>
      </header>
      <ul className={styles.grid}>
        {cards.map((card) => (
          <li key={card.id}>
            <Card {...cardProps(card)} />
          </li>
        ))}
      </ul>
      <Link to="/evoluir/partida" className={styles.play}>
        Prévia da partida
      </Link>
    </section>
  )
}

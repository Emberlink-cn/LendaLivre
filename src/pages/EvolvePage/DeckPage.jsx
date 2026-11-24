import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/card/Card'
import { useNarrow } from '../../components/common/SearchToggle'
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
  const { cards, usingSamples } = usePilotDeck()

  function findMatch() {
    if (narrow) {
      navigate('/evoluir/partida')
      return
    }
    openMatchWindow()
  }

  useEffect(() => {
    document.title = 'Baralho · LendaLivre'
  }, [])

  return (
    <section className={styles.page}>
      <div className={styles.scroller}>
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
        <div className={styles.actions}>
          <button type="button" className={styles.play} onClick={findMatch}>
            Procurar partida
          </button>
        </div>
      </div>
    </section>
  )
}

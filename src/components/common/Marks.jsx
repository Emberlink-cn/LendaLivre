import styles from './Marks.module.css'

const FACES = {
  leaf: styles.leaf,
  mark: styles.mark,
  river: styles.river,
  ember: styles.ember,
}

export function Avatar({ name, face = 'leaf', size = 36 }) {
  const letter = (name || '?').trim().slice(0, 1).toUpperCase()
  return (
    <span className={`${styles.face} ${FACES[face] || styles.leaf}`} style={{ width: size, height: size }} aria-hidden>
      {letter}
    </span>
  )
}

export function ItemVisual({ item, size = 36 }) {
  if (item?.image) {
    return (
      <img
        src={item.image}
        alt=""
        className={styles.itemImage}
        style={{ width: size, height: size }}
      />
    )
  }
  return <ItemIcon type={item?.type} />
}

export function ItemIcon({ type }) {
  const common = { width: 36, height: 36, viewBox: '0 0 36 36', fill: 'none', 'aria-hidden': true }
  if (type === 'arma') {
    return (
      <svg {...common}>
        <path d="M8 28 L22 8" stroke="currentColor" strokeWidth="2" />
        <path d="M20 10 h8 v4 h-6" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  if (type === 'planta') {
    return (
      <svg {...common}>
        <path d="M18 30 V16" stroke="currentColor" strokeWidth="2" />
        <path d="M18 18 C10 16 8 8 14 8 C16 14 18 16 18 18Z" stroke="currentColor" strokeWidth="2" />
        <path d="M18 20 C26 18 28 10 22 10 C20 16 18 18 18 20Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  if (type === 'frasco') {
    return (
      <svg {...common}>
        <path d="M15 8 h6 v4 l4 6 v10 a4 4 0 0 1 -4 4 h-6 a4 4 0 0 1 -4 -4 V18 l4 -6 V8Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  if (type === 'moeda') {
    return (
      <svg {...common}>
        <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M18 12 v12 M14 16 h8" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="8" y="10" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10 V8 h12 v2" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

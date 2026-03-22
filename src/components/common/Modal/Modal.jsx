import styles from './Modal.module.css'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        // Fecha somente quando clicar no backdrop (não no conteúdo)
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title ?? 'Modal'}>
        <button className={styles.close} onClick={() => onClose?.()} aria-label="Fechar">
          X
        </button>
        {children}
      </div>
    </div>
  )
}


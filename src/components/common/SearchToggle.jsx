import { useEffect, useRef, useState } from 'react'
import styles from './SearchToggle.module.css'

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 16.2 L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 859px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 859px)')
    const onChange = () => setNarrow(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return narrow
}

export function SearchIconButton({ pressed, expanded, label, onClick, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={pressed ? styles.lupaOn : styles.lupa}
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <SearchIcon />
    </button>
  )
}

export default function SearchToggle({ value, onChange, placeholder, label, className }) {
  const narrow = useNarrow()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    inputRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  if (!narrow) {
    return (
      <input
        type="search"
        className={className}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={onChange}
      />
    )
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <SearchIconButton
        pressed={open || Boolean(value)}
        expanded={open}
        label={label}
        onClick={() => setOpen((current) => !current)}
      />
      {open ? (
        <input
          ref={inputRef}
          type="search"
          className={styles.float}
          value={value}
          placeholder={placeholder}
          aria-label={label}
          onChange={onChange}
        />
      ) : null}
    </div>
  )
}

import { useEffect, useState } from 'react'
import styles from './FullscreenButton.module.css'

function currentFullscreen() {
  return document.fullscreenElement || document.webkitFullscreenElement || null
}

function canFullscreen() {
  return Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled)
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 6 V2 H6 M10 2 H14 V6 M14 10 V14 H10 M6 14 H2 V10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CompressIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 2 V6 H2 M10 2 V6 H14 M14 10 H10 V14 M2 10 H6 V14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FullscreenButton({ targetRef }) {
  const [active, setActive] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setSupported(canFullscreen())
    const sync = () => setActive(currentFullscreen() === targetRef?.current)
    sync()
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [targetRef])

  async function toggle() {
    const stage = targetRef?.current
    try {
      if (currentFullscreen()) {
        if (document.exitFullscreen) await document.exitFullscreen()
        else document.webkitExitFullscreen?.()
        return
      }
      if (!stage) return
      if (stage.requestFullscreen) await stage.requestFullscreen()
      else stage.webkitRequestFullscreen?.()
    } catch {
      setActive(currentFullscreen() === stage)
    }
  }

  if (!supported) return null

  const label = active ? 'Sair da tela cheia' : 'Tela cheia'

  return (
    <button type="button" className={styles.button} aria-pressed={active} onClick={toggle}>
      {active ? <CompressIcon /> : <ExpandIcon />}
      {label}
    </button>
  )
}

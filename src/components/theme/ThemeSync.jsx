import { useEffect } from 'react'

export default function ThemeSync() {
  useEffect(() => {
    const lightMode = localStorage.getItem('lighttheme')
    document.body.classList.toggle('lighttheme', Boolean(lightMode))
  }, [])

  return null
}


import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Avatar } from '../common/Marks'
import styles from './UserMenu.module.css'

export default function UserMenu({ variant = 'bar', onNavigate }) {
  const { user, logout, isSuper } = useAuth()
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [openPath, setOpenPath] = useState(null)
  const wrapRef = useRef(null)
  const open = openPath === pathname

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpenPath(null)
    }
    const onPointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpenPath(null)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  function leave() {
    logout()
    onNavigate?.()
    navigate('/entrar')
  }

  if (variant === 'list') {
    return (
      <>
        <Link to="/catalogo" className={styles.drawerLink} onClick={onNavigate}>
          Catálogo
        </Link>
        <Link to="/perfil" className={styles.drawerLink} onClick={onNavigate}>
          Perfil
        </Link>
        <Link to="/inventario" className={styles.drawerLink} onClick={onNavigate}>
          Inventário
        </Link>
        {isSuper ? (
          <Link to="/criador" className={styles.drawerLink} onClick={onNavigate}>
            Painel do criador
          </Link>
        ) : null}
        <button
          type="button"
          className={styles.drawerLink}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          Tema {theme === 'dark' ? 'claro' : 'escuro'}
        </button>
        <button
          type="button"
          className={styles.drawerLink}
          onClick={leave}
        >
          Sair
        </button>
      </>
    )
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        <Avatar name={user.name} face={user.avatar} size={32} />
        <span className={styles.name}>{user.name}</span>
      </button>
      {open ? (
        <div className={styles.menu} role="menu">
          <p className={styles.email}>{user.email}</p>
          <Link to="/catalogo" role="menuitem">
            Catálogo
          </Link>
          <Link to="/perfil" role="menuitem">
            Perfil
          </Link>
          <Link to="/inventario" role="menuitem">
            Inventário
          </Link>
          {isSuper ? (
            <Link to="/criador" role="menuitem">
              Painel do criador
            </Link>
          ) : null}
          <button type="button" role="menuitem" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            Tema {theme === 'dark' ? 'claro' : 'escuro'}
          </button>
          <button type="button" role="menuitem" onClick={leave}>
            Sair
          </button>
        </div>
      ) : null}
    </div>
  )
}

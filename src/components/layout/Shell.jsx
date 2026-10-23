import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../common/Marks'
import UserMenu from '../profile/UserMenu'
import { useAuth } from '../../context/AuthContext'
import { useInventory } from '../../context/InventoryContext'
import { useLibrary } from '../../context/LibraryContext'
import { useReading } from '../../context/ReadingContext'
import { useTheme } from '../../context/ThemeContext'
import styles from './Shell.module.css'

const ReadToolsSlotContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useReadToolsSlot() {
  return useContext(ReadToolsSlotContext)
}

const LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/catalogo', label: 'Catálogo' },
]

function backTarget(pathname) {
  if (pathname.startsWith('/criador/gerir/')) {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length >= 4) return `/criador/gerir/${parts[2]}`
    return '/criador/gerir'
  }
  if (pathname.startsWith('/criador')) return '/catalogo'
  if (pathname.startsWith('/ler/')) {
    const [, , readWork, readChapter] = pathname.split('/')
    return readChapter ? `/obra/${readWork}/${readChapter}` : `/obra/${readWork || ''}`
  }
  if (pathname.startsWith('/obra/') && pathname.split('/').length > 3) return `/obra/${pathname.split('/')[2]}`
  if (pathname.startsWith('/obra/')) return '/catalogo'
  if (pathname === '/entrar' || pathname === '/criar-conta') return '/'
  return '/'
}

function CollectBadge({ pathname }) {
  const { getWork } = useLibrary()
  const { has } = useInventory()
  const [, , workId, chapterId] = pathname.split('/')
  const chapter = getWork(workId)?.chapters.find((item) => item.id === chapterId)
  if (!chapter) return null
  const total = chapter.items?.length ?? 0
  const found = (chapter.items ?? []).filter((item) => has(item.id)).length

  return (
    <p
      className={styles.badge}
      data-collect-badge
      aria-label={`${found} de ${total} coletáveis deste capítulo`}
    >
      Coletáveis {found} / {total}
    </p>
  )
}

function BackButton({ pathname }) {
  const navigate = useNavigate()

  function goBack() {
    if (pathname === '/entrar') {
      navigate('/')
      return
    }
    const idx = window.history.state?.idx
    if (typeof idx === 'number' && idx > 0) navigate(-1)
    else navigate(backTarget(pathname))
  }

  return (
    <button type="button" className={styles.back} onClick={goBack}>
      ← Voltar
    </button>
  )
}

export default function Shell({ children }) {
  const [toolsSlot, setToolsSlot] = useState(null)
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const { scaleIndex, scales, setScaleIndex } = useReading()
  const [openPath, setOpenPath] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const drawerRef = useRef(null)
  const menuBtnRef = useRef(null)
  const open = openPath === pathname
  const isHome = pathname === '/'
  const isLogin = pathname === '/entrar'
  const showMenuButton = !isLogin && (isAuthenticated || !isHome)
  const isCatalog = pathname === '/catalogo'
  const isWork = /^\/obra\/[^/]+$/.test(pathname)
  const isReader = pathname.startsWith('/ler/')
  const isInventory = pathname === '/inventario'
  const guestLinks = pathname === '/entrar' ? LINKS.filter((link) => link.to !== '/catalogo') : LINKS
  const desktopLinks = isHome
    ? []
    : isAuthenticated
      ? [
          { to: '/catalogo', label: 'Catálogo' },
          { to: '/inventario', label: 'Inventário' },
        ]
      : guestLinks
  const navLinks = isAuthenticated ? LINKS.filter((link) => link.to !== '/catalogo') : guestLinks
  const appliedTheme = isHome ? 'dark' : theme

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = appliedTheme
  }, [appliedTheme])
  const isAuth = pathname === '/entrar' || pathname === '/criar-conta'
  const mainClass = isHome
    ? styles.mainHome
    : isReader
      ? styles.mainRead
      : isAuth
        ? styles.mainAuth
          : isInventory
            ? `${styles.main} ${styles.mainInventory}`
            : isCatalog
              ? `${styles.main} ${styles.mainCatalog}`
              : isWork
                ? `${styles.main} ${styles.mainWork}`
                : styles.main

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpenPath(null)
    }
    const onPointer = (event) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (drawerRef.current?.contains(target)) return
      if (menuBtnRef.current?.contains(target)) return
      setOpenPath(null)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const headerClass = [
    styles.header,
    scrolled || !isHome ? styles.headerSolid : '',
    isReader ? styles.headerReader : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <ReadToolsSlotContext.Provider value={toolsSlot}>
    <div className={styles.frame}>
      <a className={styles.skip} href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className={headerClass}>
        <Link to="/" className={styles.brand}>
          LendaLivre
        </Link>

        {desktopLinks.length ? (
          <nav className={styles.desktopNav} aria-label="Principal">
            {desktopLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        <div className={styles.actions}>
          {isReader ? (
            <div className={styles.typeControls} aria-label="Tamanho do texto">
              <button
                type="button"
                className={styles.typeBtn}
                onClick={() => setScaleIndex(Math.max(0, scaleIndex - 1))}
                disabled={scaleIndex === 0}
                aria-label="Diminuir texto"
              >
                A−
              </button>
              <button
                type="button"
                className={styles.typeBtn}
                onClick={() => setScaleIndex(Math.min(scales.length - 1, scaleIndex + 1))}
                disabled={scaleIndex === scales.length - 1}
                aria-label="Aumentar texto"
              >
                A+
              </button>
            </div>
          ) : null}

          {isAuthenticated ? (
            <div className={styles.session}>
              <UserMenu />
            </div>
          ) : isLogin ? null : (
            <Link to="/entrar" className={styles.enter}>
              Entrar
            </Link>
          )}

          {showMenuButton ? (
            <button
              ref={menuBtnRef}
              type="button"
              className={isAuthenticated ? styles.avatarMenu : styles.menuBtn}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fechar menu' : 'Menu'}
              onClick={() => setOpenPath(open ? null : pathname)}
            >
              {isAuthenticated ? <Avatar name={user.name} face={user.avatar} size={32} /> : open ? 'Fechar' : 'Menu'}
            </button>
          ) : null}
        </div>
      </header>

      {showMenuButton && open ? (
        <nav ref={drawerRef} id="menu-mobile" className={styles.drawer} aria-label="Menu">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={styles.drawerLink}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <UserMenu variant="list" onNavigate={() => setOpenPath(null)} />
          ) : (
            <Link to="/entrar" className={styles.drawerLink}>
              Entrar
            </Link>
          )}
        </nav>
      ) : null}

      <main id="conteudo" className={mainClass} data-sun={isReader && theme === 'light' ? 'off' : undefined}>
        {isHome ? null : isReader || isInventory ? (
          <div className={styles.backRow}>
            <BackButton pathname={pathname} />
            {isReader ? <CollectBadge pathname={pathname} /> : null}
            <div className={styles.toolSlot} ref={setToolsSlot} />
          </div>
        ) : isCatalog ? null : (
          <BackButton pathname={pathname} />
        )}
        {children}
      </main>
    </div>
    </ReadToolsSlotContext.Provider>
  )
}

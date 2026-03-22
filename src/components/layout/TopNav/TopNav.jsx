import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import styles from './TopNav.module.css'

export default function TopNav({ homeAnchors = false }) {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">LendaLivre</Link>
      </div>

      <nav className={styles.centerNav} aria-label="Navegacao principal">
        {homeAnchors ? (
          <a href="#about">Sobre</a>
        ) : (
          <Link to="/#about">Sobre</Link>
        )}
        {homeAnchors ? (
          <a href="#contacts">Contatos</a>
        ) : (
          <Link to="/#contacts">Contatos</Link>
        )}
        <Link to="/store">Loja</Link>
        <Link to="/premium">Premium</Link>
      </nav>

      <div className={styles.right}>
        {isAuthenticated ? (
          <>
            <Link to="/catalog">Catálogo</Link>
            <span className={styles.userLabel} title={user?.email}>
              {user?.name ?? 'Leitor'}
            </span>
            <button type="button" className={styles.logoutBtn} onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.loginBtn}>
            Login
          </Link>
        )}
      </div>
    </header>
  )
}


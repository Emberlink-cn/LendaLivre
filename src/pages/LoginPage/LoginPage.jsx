import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import TopNav from '../../components/layout/TopNav/TopNav'
import { useAuth } from '../../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/catalog'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, from, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Nao foi possivel entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <TopNav />

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Entrar</h1>
          <p className={styles.lead}>
            Acesse o catalogo e a area de leitura com sua conta. (Modo demonstracao ate o backend estar pronto.)
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              E-mail
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="voce@email.com"
              />
            </label>
            <label className={styles.label}>
              Senha
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Sua senha"
              />
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Entrando...' : 'Login'}
            </button>
          </form>

          <p className={styles.footer}>
            Ainda nao tem conta?{' '}
            <Link to="/register" className={styles.link}>
              Criar conta
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

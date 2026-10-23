import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AuthPage.module.css'

const EMAIL_KEY = 'lendalivre_login_email'

function rememberedEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) || ''
  } catch {
    return ''
  }
}

export default function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/catalogo'
  const storedEmail = rememberedEmail()
  const [email, setEmail] = useState(storedEmail)
  const [rememberEmail, setRememberEmail] = useState(Boolean(storedEmail))
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Entrar · LendaLivre'
  }, [])

  useEffect(() => {
    if (location.state?.signedOut) return
    if (ready && isAuthenticated) navigate(from, { replace: true })
  }, [ready, isAuthenticated, from, navigate, location.state])

  function storeEmail(nextRemember, value) {
    try {
      if (nextRemember) localStorage.setItem(EMAIL_KEY, value.trim())
      else localStorage.removeItem(EMAIL_KEY)
    } catch {
      /* o campo continua preenchido nesta visita */
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    storeEmail(rememberEmail, email)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <p className={styles.eyebrow}>Conta</p>
        <h1>Entrar</h1>
        <p className={styles.note}>
          A leitura é aberta. A conta vale neste site e nos outros aparelhos.
        </p>
        <label>
          E-mail
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className={styles.remember}>
          <input
            type="checkbox"
            checked={rememberEmail}
            onChange={(event) => {
              const next = event.target.checked
              setRememberEmail(next)
              if (!next) storeEmail(false, email)
            }}
          />
          Lembrar e-mail
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <p className={styles.switch}>
          Ainda sem conta? <Link to="/criar-conta">Criar conta grátis</Link>
        </p>
      </form>
    </section>
  )
}

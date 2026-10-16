import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../data/demoUsers'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/catalogo'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Entrar · LendaLivre'
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
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
          A leitura é aberta. Esta conta ainda vive só neste navegador, até existir um servidor.
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
        {error ? <p className={styles.error}>{error}</p> : null}
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <p className={styles.switch}>
          Ainda sem conta? <Link to="/criar-conta">Criar</Link>
        </p>
        <div className={styles.demos}>
          <p>Contas de demonstração</p>
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              className={styles.demo}
              onClick={() => {
                setEmail(demo.email)
                setPassword(demo.password)
                setError('')
              }}
            >
              {demo.role === 'super' ? 'Criador' : 'Leitora'}: {demo.email}
            </button>
          ))}
        </div>
      </form>
    </section>
  )
}

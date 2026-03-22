import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../../components/layout/TopNav/TopNav'
import { useAuth } from '../../context/AuthContext'
import styles from './RegisterPage.module.css'

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/catalog', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, confirm)
      navigate('/catalog', { replace: true })
    } catch (err) {
      setError(err.message || 'Nao foi possivel criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <TopNav />

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Criar conta</h1>
          <p className={styles.lead}>
            Cadastre-se para salvar leituras e, no futuro, sincronizar com o backend.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              Nome
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Como quer ser chamado"
              />
            </label>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Minimo 6 caracteres"
              />
            </label>
            <label className={styles.label}>
              Confirmar senha
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={styles.input}
                placeholder="Repita a senha"
              />
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <p className={styles.footer}>
            Ja tem conta?{' '}
            <Link to="/login" className={styles.link}>
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from '../LoginPage/AuthPage.module.css'

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Criar conta grátis · LendaLivre'
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate('/catalogo', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, confirmPassword)
      navigate('/catalogo', { replace: true })
    } catch (err) {
      setError(err.message || 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <p className={styles.eyebrow}>Leitor</p>
        <h1>Criar conta grátis</h1>
        <p className={styles.note}>
          A conta de leitor guarda nome, e-mail e senha neste navegador. A leitura continua aberta. O cadastro num servidor entra com o banco.
        </p>
        <label>
          Nome
          <input value={name} autoComplete="name" onChange={(event) => setName(event.target.value)} />
        </label>
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Confirmar senha
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Criando…' : 'Criar conta grátis'}
        </button>
        <p className={styles.switch}>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </form>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Avatar } from '../../components/common/Marks'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import styles from './ProfilePage.module.css'

const FACES = [
  { id: 'leaf', label: 'Folha' },
  { id: 'mark', label: 'Ouro' },
  { id: 'river', label: 'Rio' },
  { id: 'ember', label: 'Brasa' },
]

export default function ProfilePage() {
  const { user, isAuthenticated, ready, updateProfile, changePassword } = useAuth()
  const { theme, setTheme } = useTheme()
  const [draftUserId, setDraftUserId] = useState(user?.id ?? '')
  const [name, setName] = useState(user?.name ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? 'leaf')
  const [profileMessage, setProfileMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    document.title = 'Perfil · LendaLivre'
  }, [])

  if (user && user.id !== draftUserId) {
    setDraftUserId(user.id)
    setName(user.name)
    setAvatar(user.avatar || 'leaf')
  }

  if (!ready) return null
  if (!isAuthenticated) return <Navigate to="/entrar" replace />

  async function saveProfile(event) {
    event.preventDefault()
    if (!name.trim()) return
    setProfileMessage('')
    try {
      await updateProfile({ name: name.trim(), avatar })
      setProfileMessage('Perfil atualizado.')
    } catch (error) {
      setProfileMessage(error.message)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    try {
      await changePassword(currentPassword, nextPassword)
      setCurrentPassword('')
      setNextPassword('')
      setPasswordMessage('Senha alterada.')
    } catch (error) {
      setPasswordError(error.message)
    }
  }

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Conta</p>
      <h1>Perfil</h1>
      <p className={styles.lead}>
        Nome e avatar ficam na sua conta, neste site e nos outros aparelhos.{' '}
        <Link to="/inventario">Abrir inventário</Link>
      </p>

      <div className={styles.board}>
      <form className={styles.card} onSubmit={saveProfile}>
        <div className={styles.identity}>
          <Avatar name={name || user.name} face={avatar} size={72} />
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <span>{user.role === 'super' ? 'Criador' : 'Leitor'}</span>
          </div>
        </div>
        <label>
          Nome
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <fieldset>
          <legend>Avatar</legend>
          <div className={styles.faces}>
            {FACES.map((face) => (
              <button
                key={face.id}
                type="button"
                className={avatar === face.id ? styles.faceOn : styles.face}
                aria-pressed={avatar === face.id}
                onClick={() => setAvatar(face.id)}
              >
                <Avatar name={name || user.name} face={face.id} size={44} />
                {face.label}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" className={styles.submit}>
          Salvar perfil
        </button>
        {profileMessage ? <p className={styles.ok}>{profileMessage}</p> : null}
      </form>

      <form className={styles.card} onSubmit={savePassword}>
        <h2>Senha</h2>
        <label>
          Senha atual
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>
        <label>
          Nova senha
          <input
            type="password"
            autoComplete="new-password"
            value={nextPassword}
            onChange={(event) => setNextPassword(event.target.value)}
          />
        </label>
        {passwordError ? <p className={styles.err}>{passwordError}</p> : null}
        {passwordMessage ? <p className={styles.ok}>{passwordMessage}</p> : null}
        <button type="submit" className={styles.submit}>
          Alterar senha
        </button>
      </form>

      <section className={styles.card}>
        <h2>Tema</h2>
        <div className={styles.themes}>
          <button type="button" className={theme === 'dark' ? styles.faceOn : styles.face} onClick={() => setTheme('dark')}>
            Escuro
          </button>
          <button type="button" className={theme === 'light' ? styles.faceOn : styles.face} onClick={() => setTheme('light')}>
            Claro
          </button>
        </div>
      </section>
      </div>
    </div>
  )
}

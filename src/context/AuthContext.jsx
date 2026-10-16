import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEMO_USERS } from '../data/demoUsers'

const USERS_KEY = 'lendalivre_users'
const SESSION_KEY = 'lendalivre_auth_user'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function hydrate(user) {
  if (!user) return null
  const demo = DEMO_USERS.find((item) => item.email === user.email)
  return {
    ...user,
    avatar: user.avatar || demo?.avatar || 'leaf',
    level: user.level ?? demo?.level ?? 1,
    rank: user.rank || demo?.rank || 'Leitor',
  }
}

function loadUsers() {
  const stored = readJson(USERS_KEY, null)
  if (!Array.isArray(stored)) return DEMO_USERS
  const byEmail = new Map(stored.map((user) => [user.email, user]))
  for (const demo of DEMO_USERS) {
    const existing = byEmail.get(demo.email)
    if (!existing) byEmail.set(demo.email, demo)
    else byEmail.set(demo.email, { ...demo, ...existing, level: existing.level ?? demo.level, rank: existing.rank ?? demo.rank })
  }
  return [...byEmail.values()]
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [user, setUser] = useState(() => hydrate(readJson(SESSION_KEY, null)))

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const login = useCallback(async (email, password) => {
    const normalized = email?.trim().toLowerCase()
    if (!normalized || !password) throw new Error('Preencha e-mail e senha.')
    const found = users.find((item) => item.email === normalized)
    if (found) {
      if (found.password !== password) throw new Error('Senha incorreta.')
      setUser(hydrate(found))
      return found
    }
    const next = {
      id: `user_${Date.now()}`,
      name: normalized.split('@')[0] || 'Leitor',
      email: normalized,
      password,
      role: 'leitor',
      avatar: 'leaf',
      level: 1,
      rank: 'Leitor',
    }
    setUsers((current) => [...current, next])
    setUser(next)
    return next
  }, [users])

  const register = useCallback(async (name, email, password, confirmPassword) => {
    if (!name?.trim()) throw new Error('Informe seu nome.')
    const normalized = email?.trim().toLowerCase()
    if (!normalized) throw new Error('Informe seu e-mail.')
    if (!password || password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.')
    if (password !== confirmPassword) throw new Error('As senhas não conferem.')
    if (users.some((item) => item.email === normalized)) throw new Error('Já existe uma conta com esse e-mail.')
    const next = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalized,
      password,
      role: 'leitor',
      avatar: 'leaf',
      level: 1,
      rank: 'Leitor',
    }
    setUsers((current) => [...current, next])
    setUser(next)
    return next
  }, [users])

  const logout = useCallback(() => setUser(null), [])

  const updateProfile = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current))
    setUsers((list) => list.map((item) => (user && item.id === user.id ? { ...item, ...patch } : item)))
  }, [user])

  const changePassword = useCallback((currentPassword, nextPassword) => {
    if (!user) throw new Error('Entre para alterar a senha.')
    if (user.password && user.password !== currentPassword) throw new Error('A senha atual não confere.')
    if (!nextPassword || nextPassword.length < 6) throw new Error('A nova senha deve ter pelo menos 6 caracteres.')
    updateProfile({ password: nextPassword })
  }, [updateProfile, user])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isSuper: user?.role === 'super',
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, login, register, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

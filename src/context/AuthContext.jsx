import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'lendalivre_auth_user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStoredUser())

  const login = useCallback(async (email, password) => {
    // Mock: substituir por fetch ao backend
    if (!email?.trim() || !password) {
      throw new Error('Preencha e-mail e senha.')
    }
    const next = {
      id: 'mock-user-1',
      email: email.trim().toLowerCase(),
      name: email.split('@')[0] || 'Leitor',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return next
  }, [])

  const register = useCallback(async (name, email, password, confirmPassword) => {
    if (!name?.trim()) throw new Error('Informe seu nome.')
    if (!email?.trim()) throw new Error('Informe seu e-mail.')
    if (!password || password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.')
    if (password !== confirmPassword) throw new Error('As senhas nao conferem.')
    // Mock: substituir por fetch ao backend
    const next = {
      id: 'mock-user-new',
      email: email.trim().toLowerCase(),
      name: name.trim(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return next
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

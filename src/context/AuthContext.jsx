import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

function toAppUser(authUser, profile) {
  return {
    id: authUser.id,
    name: profile?.display_name || authUser.email?.split('@')[0] || 'Leitor',
    email: authUser.email,
    role: profile?.role || 'leitor',
    avatar: profile?.avatar || 'leaf',
    level: profile?.level ?? 1,
    rank: profile?.rank || 'Leitor',
    since: profile?.created_at || authUser.created_at || null,
  }
}

function authError(error, fallback) {
  const message = error?.message || ''
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.'
  if (/already registered|already been registered/i.test(message)) return 'Já existe uma conta com esse e-mail.'
  if (/password/i.test(message) && /6|least/i.test(message)) return 'A senha deve ter pelo menos 6 caracteres.'
  return fallback
}

async function fetchProfile(userId) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw new Error('Não foi possível abrir o perfil.')
    if (data) return data
    await new Promise((resolve) => window.setTimeout(resolve, 250))
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let ignore = false

    function applySession(session) {
      if (!session?.user) {
        if (!ignore) {
          setUser(null)
          setReady(true)
        }
        return
      }
      const authUser = session.user
      window.setTimeout(() => {
        fetchProfile(authUser.id)
          .then((profile) => {
            if (!ignore) setUser(toAppUser(authUser, profile))
          })
          .catch(() => {
            if (!ignore) setUser(toAppUser(authUser, null))
          })
          .finally(() => {
            if (!ignore) setReady(true)
          })
      }, 0)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!ignore) applySession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const normalized = email?.trim().toLowerCase()
    if (!normalized || !password) throw new Error('Preencha e-mail e senha.')
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalized, password })
    if (error) throw new Error(authError(error, 'Não foi possível entrar.'))
    const profile = await fetchProfile(data.user.id)
    const next = toAppUser(data.user, profile)
    setUser(next)
    return next
  }, [])

  const register = useCallback(async (name, email, password, confirmPassword) => {
    if (!name?.trim()) throw new Error('Informe seu nome.')
    const normalized = email?.trim().toLowerCase()
    if (!normalized) throw new Error('Informe seu e-mail.')
    if (!password || password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.')
    if (password !== confirmPassword) throw new Error('As senhas não conferem.')
    const { data, error } = await supabase.auth.signUp({
      email: normalized,
      password,
      options: { data: { name: name.trim() } },
    })
    if (error) throw new Error(authError(error, 'Não foi possível criar a conta.'))
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('Já existe uma conta com esse e-mail.')
    }
    if (!data.session || !data.user) {
      throw new Error('Confirme o e-mail para entrar. A confirmação está ligada no projeto.')
    }
    const profile = await fetchProfile(data.user.id)
    const next = toAppUser(data.user, profile)
    setUser(next)
    return next
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const { data: authData } = await supabase.auth.getUser()
    const authUser = authData.user
    if (!authUser) throw new Error('Entre para atualizar o perfil.')
    const displayName = patch.name?.trim()
    const nextAvatar = patch.avatar
    const { error } = await supabase.from('profiles').update({
      ...(displayName ? { display_name: displayName } : {}),
      ...(nextAvatar ? { avatar: nextAvatar } : {}),
    }).eq('id', authUser.id)
    if (error) throw new Error('Não foi possível salvar o perfil.')
    const profile = await fetchProfile(authUser.id)
    const next = toAppUser(authUser, profile)
    setUser(next)
    return next
  }, [])

  const changePassword = useCallback(async (currentPassword, nextPassword) => {
    const { data: authData } = await supabase.auth.getUser()
    const authUser = authData.user
    if (!authUser?.email) throw new Error('Entre para alterar a senha.')
    if (!nextPassword || nextPassword.length < 6) throw new Error('A nova senha deve ter pelo menos 6 caracteres.')
    const { error: currentError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: currentPassword,
    })
    if (currentError) throw new Error('A senha atual não confere.')
    const { error } = await supabase.auth.updateUser({ password: nextPassword })
    if (error) throw new Error(authError(error, 'Não foi possível alterar a senha.'))
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user),
      isSuper: user?.role === 'super',
      isAuthor: user?.role === 'autor',
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, ready, login, register, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

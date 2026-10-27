import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, TOKEN_KEY, type User } from './api'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (full_name: string, email: string, password: string) => Promise<User>
  logout: () => void
  setUser: (u: User) => void
  isStaff: boolean
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    api<User>('/me').then(setUser).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false))
  }, [])

  const finish = (res: { token: string; user: User }) => {
    localStorage.setItem(TOKEN_KEY, res.token)
    setUser(res.user)
    return res.user
  }
  const login = useCallback(async (email: string, password: string) => finish(await api('/auth/login', { method: 'POST', body: { email, password } })), [])
  const register = useCallback(async (full_name: string, email: string, password: string) => finish(await api('/auth/register', { method: 'POST', body: { full_name, email, password } })), [])
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setUser(null) }, [])

  return <Ctx.Provider value={{ user, loading, login, register, logout, setUser, isStaff: !!user && (user.role === 'admin' || user.role === 'editor') }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)

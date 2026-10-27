import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useI18n()
  const { user, login, register, logout } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const registered = params.get('registered') === '1'
  const [f, setF] = useState({ full_name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const isLogin = mode === 'login'
  useSEO(isLogin ? t('auth.login_t') : t('auth.register_t'))
  if (user) return <Navigate to={next} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (isLogin) {
        const signedIn = await login(f.email, f.password)
        toast(t('auth.welcome'))
        nav(params.has('next') ? next : signedIn.role === 'admin' || signedIn.role === 'editor' ? '/admin' : '/profile', { replace: true })
      } else {
        await register(f.full_name, f.email, f.password)
        logout()
        nav('/login?registered=1', { replace: true })
      }
    } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false) }
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-14">
      <form onSubmit={submit} className="glass-strong w-full max-w-md space-y-4 rounded-3xl p-8 shadow-soft">
        <img src="/logo-white.png" alt="Kelajak markazi" className="mx-auto h-14 w-auto" />
        <h1 className="h-display text-center text-2xl">{isLogin ? t('auth.login_t') : t('auth.register_t')}</h1>
        {isLogin && registered && <p role="status" className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-100">Roʻyxatdan muvaffaqiyatli oʻtdingiz. Endi akkauntingizga kiring.</p>}
        {!isLogin && <div><label className="label" htmlFor="a-name">{t('auth.fullname')}</label><input id="a-name" className="input" required minLength={2} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>}
        <div><label className="label" htmlFor="a-mail">{isLogin ? t('auth.login_id') : t('auth.email')}</label><input id="a-mail" type={isLogin ? 'text' : 'email'} className="input" required autoComplete={isLogin ? 'username' : 'email'} placeholder={isLogin ? 'admin yoki email' : undefined} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="a-pass">{t('auth.password')}</label><input id="a-pass" type="password" className="input" required minLength={6} autoComplete={isLogin ? 'current-password' : 'new-password'} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        <button className="btn-glow w-full" disabled={busy}>{isLogin ? t('nav.login') : t('nav.register')}</button>
        <p className="text-center text-sm text-white/60">{isLogin ? t('auth.no_account') : t('auth.have_account')}{' '}
          <Link to={isLogin ? `/register?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`} className="font-bold text-orchid hover:text-white">{isLogin ? t('nav.register') : t('nav.login')}</Link></p>
      </form>
    </div>
  )
}

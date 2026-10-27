import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarDays, Clock3, ImagePlus, Sparkles } from 'lucide-react'
import { api, uploadImage, type Course, type EventItem, type User } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { PageHeader } from '../components/UI'

export default function Profile() {
  const { t, loc, date, lang } = useI18n()
  const { user, setUser, isStaff } = useAuth()
  const toast = useToast()
  useSEO(t('profile.title'))
  const [f, setF] = useState({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '', bio: user?.bio || '', password: '' })
  const [ov, setOv] = useState<{ courses: Course[]; events: EventItem[] }>({ courses: [], events: [] })
  const [busy, setBusy] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { api<{ courses: Course[]; events: EventItem[] }>('/me/overview').then(setOv).catch(() => {}) }, [])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const body: any = { full_name: f.full_name, email: f.email, phone: f.phone, bio: f.bio }
      if (f.password) body.password = f.password
      setUser(await api<User>('/me', { method: 'PUT', body }))
      setF({ ...f, password: '' }); toast(t('profile.saved'))
    } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false) }
  }

  const uploadAvatar = async (file?: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast('Rasm hajmi 5 MB dan oshmasligi kerak', 'err'); return }
    setAvatarBusy(true)
    try {
      await uploadImage('/me/avatar', file)
      setUser(await api<User>('/me'))
      toast('Profil rasmi yangilandi')
    } catch (err: any) { toast(err.message, 'err') } finally { setAvatarBusy(false) }
  }

  return (
    <>
      <PageHeader title={t('profile.title')} />
      <section className="container-x mb-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-brand via-[#5b21b6] to-glow p-6 shadow-glow sm:p-9">
          <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full bg-magenta/30 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="chip border-white/20 text-white"><Sparkles size={14} className="mr-2" />{t('student.welcome')}</span>
              <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-4xl">{user?.full_name}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{t('student.subtitle')}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/10 px-5 py-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-white/70"><Clock3 size={15} />{t('student.local_time')}</p>
              <p className="mt-1 font-display text-2xl font-bold" aria-live="polite">{now.toLocaleTimeString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="mt-1 text-xs text-white/65">{`${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Link to="/courses" className="glass card-hover flex items-center justify-between rounded-2xl p-5">
            <span><span className="flex items-center gap-2 text-xs text-white/60"><BookOpen size={15} />{t('student.my_courses')}</span><strong className="mt-2 block font-display text-2xl">{ov.courses.length}</strong></span><ArrowRight className="text-orchid" />
          </Link>
          <Link to="/events" className="glass card-hover flex items-center justify-between rounded-2xl p-5">
            <span><span className="flex items-center gap-2 text-xs text-white/60"><CalendarDays size={15} />{t('student.my_events')}</span><strong className="mt-2 block font-display text-2xl">{ov.events.length}</strong></span><ArrowRight className="text-orchid" />
          </Link>
          <Link to="/courses" className="glass card-hover flex items-center justify-between rounded-2xl p-5">
            <span><span className="flex items-center gap-2 text-xs text-white/60"><Sparkles size={15} />{t('student.next_step')}</span><strong className="mt-2 block text-sm">{t('student.find_course')}</strong></span><ArrowRight className="text-orchid" />
          </Link>
        </div>
      </section>
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={save} className="glass space-y-4 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            {user?.profile_image
              ? <img src={user.profile_image} alt={user.full_name} className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20" />
              : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-glow to-magenta font-display text-2xl font-extrabold">{user?.full_name[0]}</span>}
            <div><p className="font-bold">{user?.email}</p><span className="chip mt-1">{user?.role}</span></div>
          </div>
          {(user?.role === 'admin' || user?.role === 'user') && <div>
            <label className="label" htmlFor="profile-image">Profil rasmi</label>
            <label htmlFor="profile-image" className={`btn-ghost !py-2.5 text-xs ${avatarBusy ? 'pointer-events-none opacity-50' : ''}`}><ImagePlus size={16} />{avatarBusy ? 'Yuklanmoqda…' : 'Rasm tanlash'}</label>
            <input id="profile-image" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={avatarBusy} onChange={(e) => { void uploadAvatar(e.target.files?.[0]); e.target.value = '' }} />
            <p className="mt-1 text-xs text-white/45">PNG, JPG, WEBP yoki GIF · 5 MB gacha</p>
          </div>}
          <div><label className="label" htmlFor="p-name">{t('auth.fullname')}</label><input id="p-name" className="input" required minLength={2} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
          <div><label className="label" htmlFor="p-email">Email</label><input id="p-email" type="email" className="input" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label" htmlFor="p-phone">{t('profile.phone')}</label><input id="p-phone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><label className="label" htmlFor="p-bio">{t('profile.bio')}</label><textarea id="p-bio" className="input min-h-28" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
          <div><label className="label" htmlFor="p-pass">{t('profile.new_password')}</label><input id="p-pass" type="password" minLength={6} className="input" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <div className="flex flex-wrap gap-3"><button className="btn-glow" disabled={busy}>{t('common.save')}</button>{isStaff && <Link to="/admin" className="btn-ghost">{t('nav.admin')}</Link>}</div>
        </form>
        <div className="space-y-6">
          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold">{t('profile.my_courses')}</h2>
            <div className="mt-4 space-y-2">{ov.courses.length ? ov.courses.map((c) => <Link key={c.id} to={`/courses/${c.slug}`} className="block rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-semibold hover:bg-white/10">{loc(c, 'title')}<span className="ml-2 text-xs font-normal text-white/50">{c.category}</span></Link>) : <p className="text-sm text-white/55">{t('profile.none')}</p>}</div>
          </section>
          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold">{t('profile.my_events')}</h2>
            <div className="mt-4 space-y-2">{ov.events.length ? ov.events.map((e) => <Link key={e.id} to="/events" className="block rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-semibold hover:bg-white/10">{loc(e, 'title')}<span className="ml-2 text-xs font-normal text-white/50">{date(e.starts_at)}</span></Link>) : <p className="text-sm text-white/55">{t('profile.none')}</p>}</div>
          </section>
        </div>
      </div>
    </>
  )
}

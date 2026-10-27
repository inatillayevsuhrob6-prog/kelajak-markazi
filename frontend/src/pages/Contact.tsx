import { useState } from 'react'
import { ExternalLink, Mail, Send, ShieldCheck } from 'lucide-react'
import { api, type User } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { PageHeader } from '../components/UI'

export default function Contact() {
  const { t } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  const [adminDetailsOpen, setAdminDetailsOpen] = useState(false)
  const admin = useFetch(() => api<Pick<User, 'full_name' | 'email' | 'phone' | 'bio' | 'profile_image'>>('/admin/contact'), [])
  useSEO(t('contact.title'), t('contact.sub'))
  const [f, setF] = useState({ name: user?.full_name || '', email: user?.email || '', subject: '', message: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try { await api('/contact', { method: 'POST', body: f }); toast(t('contact.sent')); setF({ ...f, subject: '', message: '' }) }
    catch (err: any) { toast(err.message, 'err') } finally { setBusy(false) }
  }
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })

  return (
    <>
      <PageHeader title={t('contact.title')} sub={t('contact.sub')} />
      <div className="container-x grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="glass space-y-4 rounded-3xl p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="c-name">{t('contact.name')}</label><input id="c-name" className="input" required minLength={2} value={f.name} onChange={set('name')} /></div>
            <div><label className="label" htmlFor="c-mail">{t('contact.email')}</label><input id="c-mail" type="email" className="input" required value={f.email} onChange={set('email')} /></div>
          </div>
          <div><label className="label" htmlFor="c-sub">{t('contact.subject')}</label><input id="c-sub" className="input" value={f.subject} onChange={set('subject')} /></div>
          <div><label className="label" htmlFor="c-msg">{t('contact.message')}</label><textarea id="c-msg" className="input min-h-40" required minLength={5} value={f.message} onChange={set('message')} /></div>
          <button className="btn-glow" disabled={busy}><Send size={16} />{t('common.send')}</button>
        </form>
        <div className="space-y-5">
          <aside className="glass rounded-3xl p-7">
            <h2 className="font-display text-lg font-bold">Admin bilan aloqa</h2>
            {admin.data ? <button type="button" aria-expanded={adminDetailsOpen} onClick={() => setAdminDetailsOpen((open) => !open)} className="mt-5 flex w-full items-center gap-4 rounded-2xl text-left transition hover:bg-white/[0.05] focus-visible:outline">
              {admin.data.profile_image
                ? <img src={admin.data.profile_image} alt={admin.data.full_name} className="h-16 w-16 rounded-full object-cover" />
                : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-glow to-magenta font-display text-2xl font-bold">{admin.data.full_name[0]}</span>}
              <div><p className="flex items-center gap-2 font-semibold"><ShieldCheck size={16} className="text-orchid" />{admin.data.full_name}</p><p className="mt-1 text-xs text-white/55">Administrator</p></div>
            </button> : <p className="mt-4 text-sm text-white/60">{admin.loading ? 'Yuklanmoqda…' : admin.error || 'Admin maʼlumoti topilmadi'}</p>}
            {admin.data && adminDetailsOpen && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
              <p className="font-semibold">{admin.data.full_name}</p>
              <p className="mt-2 text-white/70">{admin.data.phone || 'Telefon kiritilmagan'}</p>
              {admin.data.bio && <p className="mt-2 whitespace-pre-line leading-6 text-white/65">{admin.data.bio}</p>}
            </div>}
            {admin.data && <a href={`mailto:${admin.data.email}`} className="btn-glow mt-5"><Mail size={16} />{admin.data.email}</a>}
          </aside>
          <aside className="glass rounded-3xl p-7">
            <img src="/logo-white.png" alt="" className="h-14 w-auto" />
            <p className="mt-5 text-sm text-white/70">{t('contact.ref')}</p>
            <a href="https://kelajak.uzedu.uz" target="_blank" rel="noreferrer" className="btn-ghost mt-4">kelajak.uzedu.uz <ExternalLink size={15} /></a>
          </aside>
        </div>
      </div>
    </>
  )
}

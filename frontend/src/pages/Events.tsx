import { useState } from 'react'
import { MapPin, Users } from 'lucide-react'
import { api, type EventItem } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { DateBadge } from '../components/Cards'
import Modal from '../components/Modal'
import { Empty, Loading, PageHeader } from '../components/UI'

export default function Events() {
  const { t, loc, date } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  useSEO(t('events.title'), t('events.sub'))
  const list = useFetch(() => api<{ items: EventItem[] }>('/events?limit=200'), [])
  const seats = useFetch(() => api<Record<string, number>>('/events-meta/seats'), [])
  const [sel, setSel] = useState<EventItem | null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [busy, setBusy] = useState(false)

  const open = (e: EventItem) => { setForm({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' }); setSel(e) }
  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!sel) return
    setBusy(true)
    try {
      await api(`/events/${sel.id}/register`, { method: 'POST', body: form })
      toast(t('events.success')); setSel(null)
      seats.setData((s) => ({ ...(s || {}), [sel.id]: ((s || {})[sel.id] || 0) + 1 }))
    } catch (e: any) { toast(e.message, 'err') } finally { setBusy(false) }
  }

  const items = list.data?.items || []
  const now = new Date()
  const upcoming = items.filter((e) => new Date(e.starts_at) >= now)
  const past = items.filter((e) => new Date(e.starts_at) < now).reverse()

  const Row = ({ e, isPast }: { e: EventItem; isPast?: boolean }) => {
    const left = Math.max(0, e.capacity - (seats.data?.[e.id] || 0))
    return (
      <article className={`glass flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center ${isPast ? 'opacity-60' : ''}`}>
        <DateBadge iso={e.starts_at} />
        <div className="flex-1">
          <span className="chip">{e.category}</span>
          <h3 className="mt-2 font-display text-lg font-semibold">{loc(e, 'title')}</h3>
          <p className="mt-1 text-sm text-white/65">{e.summary}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/55">
            <span>{date(e.starts_at, true)}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={13} />{e.location}</span>
            <span className="inline-flex items-center gap-1"><Users size={13} />{left} {t('events.seats')}</span>
          </p>
        </div>
        {isPast ? <span className="text-sm text-white/50">{t('events.done')}</span>
          : left === 0 ? <span className="text-sm font-bold text-magenta">{t('events.full')}</span>
          : <button onClick={() => open(e)} className="btn-glow">{t('events.register')}</button>}
      </article>
    )
  }

  return (
    <>
      <PageHeader title={t('events.title')} sub={t('events.sub')} />
      <div className="container-x space-y-12">
        {list.loading ? <Loading /> : (
          <>
            <section>
              <h2 className="h-display mb-5 text-xl">{t('events.upcoming')}</h2>
              <div className="space-y-4">{upcoming.length ? upcoming.map((e) => <Row key={e.id} e={e} />) : <Empty />}</div>
            </section>
            {past.length > 0 && <section><h2 className="h-display mb-5 text-xl">{t('events.past')}</h2><div className="space-y-4">{past.map((e) => <Row key={e.id} e={e} isPast />)}</div></section>}
          </>
        )}
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? loc(sel, 'title') : ''}>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="ev-name">{t('events.name')}</label><input id="ev-name" className="input" required minLength={2} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><label className="label" htmlFor="ev-mail">{t('events.email')}</label><input id="ev-mail" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label" htmlFor="ev-phone">{t('events.phone')}</label><input id="ev-phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <button className="btn-glow w-full" disabled={busy}>{t('events.register')}</button>
        </form>
      </Modal>
    </>
  )
}

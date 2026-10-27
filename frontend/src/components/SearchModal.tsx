import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CalendarDays, FolderKanban, Newspaper, Search } from 'lucide-react'
import Modal from './Modal'
import { api } from '../lib/api'
import { useDebounced } from '../lib/hooks'
import { useI18n } from '../lib/i18n'

const ICONS: Record<string, JSX.Element> = {
  course: <BookOpen size={18} />, article: <Newspaper size={18} />, event: <CalendarDays size={18} />, project: <FolderKanban size={18} />,
}

export default function SearchModal({ open, onClose, initial = '' }: { open: boolean; onClose: () => void; initial?: string }) {
  const { t } = useI18n()
  const nav = useNavigate()
  const [q, setQ] = useState(initial)
  const [items, setItems] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const dq = useDebounced(q, 250)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { setQ(initial); setTimeout(() => ref.current?.focus(), 50) } }, [open, initial])
  useEffect(() => {
    if (dq.trim().length < 2) { setItems([]); return }
    setBusy(true)
    api<{ items: any[] }>(`/search?q=${encodeURIComponent(dq.trim())}`).then((r) => setItems(r.items)).catch(() => setItems([])).finally(() => setBusy(false))
  }, [dq])

  const go = (url: string) => { onClose(); nav(url) }

  return (
    <Modal open={open} onClose={onClose} title={t('search.title')} wide>
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
        <input ref={ref} className="input pl-11" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('hero.search')} aria-label={t('nav.search')} />
      </div>
      <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
        {q.trim().length < 2 && <p className="py-6 text-center text-sm text-white/50">{t('search.hint')}</p>}
        {q.trim().length >= 2 && !busy && items.length === 0 && <p className="py-6 text-center text-sm text-white/60">{t('search.none')}</p>}
        {items.map((it, i) => (
          <button key={i} onClick={() => go(it.url)} className="glass flex w-full items-start gap-3 rounded-2xl p-4 text-left transition hover:border-glow">
            <span className="mt-0.5 text-orchid">{ICONS[it.kind]}</span>
            <span><span className="block font-bold">{it.title}</span><span className="line-clamp-1 text-sm text-white/60">{it.summary}</span></span>
          </button>
        ))}
      </div>
    </Modal>
  )
}

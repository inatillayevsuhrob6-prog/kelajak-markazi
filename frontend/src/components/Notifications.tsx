import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { api, type Notice } from '../lib/api'
import { useI18n } from '../lib/i18n'

export default function Notifications() {
  const { t, date } = useI18n()
  const [items, setItems] = useState<Notice[]>([])
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(() => Number(localStorage.getItem('kelajak_seen') || 0))
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = () => api<{ items?: Notice[] }>('/notifications')
      .then((r) => setItems(Array.isArray(r.items) ? r.items : []))
      .catch(() => setItems([]))
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = items.filter((i) => i.id > seen).length
  const toggle = () => {
    setOpen((o) => !o)
    if (items.length) { const max = Math.max(...items.map((i) => i.id)); localStorage.setItem('kelajak_seen', String(max)); setSeen(max) }
  }

  return (
    <div className="relative" ref={box}>
      <button onClick={toggle} aria-label={t('nav.notifications')} className="relative rounded-full p-2.5 text-white/80 hover:bg-white/10 hover:text-white">
        <Bell size={20} />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-magenta px-1 text-[10px] font-bold">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-strong absolute right-0 top-12 z-50 w-80 rounded-2xl p-3 shadow-soft">
            <p className="px-2 pb-2 text-sm font-bold">{t('notif.title')}</p>
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {items.length === 0 && <p className="px-2 py-6 text-center text-sm text-white/60">{t('notif.none')}</p>}
              {items.map((n) => (
                <Link key={n.id} to={n.link || '/'} onClick={() => setOpen(false)} className="block rounded-xl p-3 hover:bg-white/10">
                  <span className="block text-sm font-semibold">{n.title}</span>
                  {n.body && <span className="line-clamp-2 text-xs text-white/60">{n.body}</span>}
                  <span className="mt-1 block text-[11px] text-white/40">{date(n.created_at)}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

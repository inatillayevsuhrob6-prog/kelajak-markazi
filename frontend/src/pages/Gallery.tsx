import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { api, type GalleryItem } from '../lib/api'
import { useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import Cover from '../components/Cover'
import { Chips, Empty, Loading, PageHeader } from '../components/UI'

export default function Gallery() {
  const { t } = useI18n()
  useSEO(t('gallery.title'), t('gallery.sub'))
  const { data, loading } = useFetch(() => api<{ items: GalleryItem[] }>('/gallery?limit=300'), [])
  const [cat, setCat] = useState('')
  const [idx, setIdx] = useState<number | null>(null)
  const all = data?.items || []
  const cats = Array.from(new Set(all.map((g) => g.category)))
  const items = all.filter((g) => !cat || g.category === cat)

  const move = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length])
  useEffect(() => {
    if (idx === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIdx(null); if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [idx, move])

  const cur = idx !== null ? items[idx] : null
  return (
    <>
      <PageHeader title={t('gallery.title')} sub={t('gallery.sub')} />
      <div className="container-x">
        <Chips items={cats} value={cat} onChange={(v) => { setCat(v); setIdx(null) }} allLabel={t('common.all')} />
        <div className="mt-8">
          {loading ? <Loading /> : items.length === 0 ? <Empty /> : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {items.map((g, i) => (
                <button key={g.id} onClick={() => setIdx(i)} className="group relative mb-4 block w-full overflow-hidden rounded-3xl border border-white/10 transition hover:border-glow hover:shadow-glow" aria-label={g.title}>
                  <Cover seed={g.title + g.id} src={g.image} className={`w-full transition duration-500 group-hover:scale-105 ${['h-56', 'h-72', 'h-64', 'h-80'][g.id % 4]}`} />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/90 to-transparent p-4 text-left text-sm font-bold">{g.title}<span className="block text-xs font-medium text-white/60">{g.category}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {cur && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-night/95 p-4" role="dialog" aria-modal="true" aria-label={cur.title} onClick={() => setIdx(null)}>
            <button onClick={() => setIdx(null)} aria-label={t('common.close')} className="absolute right-5 top-5 rounded-full bg-white/10 p-3 hover:bg-white/20"><X size={22} /></button>
            <button onClick={(e) => { e.stopPropagation(); move(-1) }} aria-label="Oldingi" className="absolute left-3 rounded-full bg-white/10 p-3 hover:bg-white/20 sm:left-8"><ChevronLeft size={26} /></button>
            <button onClick={(e) => { e.stopPropagation(); move(1) }} aria-label="Keyingi" className="absolute right-3 rounded-full bg-white/10 p-3 hover:bg-white/20 sm:right-8"><ChevronRight size={26} /></button>
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <Cover seed={cur.title + cur.id} src={cur.image} className="h-[55vh] w-full rounded-3xl" />
              <p className="mt-4 font-display text-lg font-semibold">{cur.title}</p>
              <p className="text-sm text-white/60">{cur.caption}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

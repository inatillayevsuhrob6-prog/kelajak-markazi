import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { api, type Project } from '../lib/api'
import { useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import Cover from '../components/Cover'
import Modal from '../components/Modal'
import { Chips, Empty, Loading, PageHeader } from '../components/UI'

export default function Projects() {
  const { t, loc } = useI18n()
  useSEO(t('projects.title'), t('projects.sub'))
  const [cat, setCat] = useState('')
  const [sel, setSel] = useState<Project | null>(null)
  const { data, loading } = useFetch(() => api<{ items: Project[] }>('/projects?limit=200'), [])
  const all = data?.items || []
  const cats = Array.from(new Set(all.map((p) => p.category).filter(Boolean)))
  const items = all.filter((p) => !cat || p.category === cat)

  return (
    <>
      <PageHeader title={t('projects.title')} sub={t('projects.sub')} />
      <div className="container-x">
        <Chips items={cats} value={cat} onChange={setCat} allLabel={t('common.all')} />
        <div className="mt-8">
          {loading ? <Loading /> : items.length === 0 ? <Empty /> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <button key={p.id} onClick={() => setSel(p)} className="glass card-hover overflow-hidden rounded-3xl text-left">
                  <Cover seed={p.title} src={p.image} className="h-44 w-full" />
                  <div className="p-6">
                    <div className="flex items-center justify-between"><span className="chip">{p.category}</span><span className="text-xs text-white/50">{p.year}</span></div>
                    <h3 className="mt-3 font-display text-base font-semibold">{loc(p, 'title')}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/65">{p.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">{p.tech.split(',').filter(Boolean).map((x) => <span key={x} className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/75">{x.trim()}</span>)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? loc(sel, 'title') : ''} wide>
        {sel && (
          <div>
            <Cover seed={sel.title} src={sel.image} className="h-52 w-full rounded-2xl" />
            <p className="mt-5 whitespace-pre-line text-white/75">{sel.description || sel.summary}</p>
            <p className="mt-5 text-sm font-bold text-white/80">{t('projects.tech')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{sel.tech.split(',').filter(Boolean).map((x) => <span key={x} className="chip">{x.trim()}</span>)}</div>
            {sel.link && <a href={sel.link} target="_blank" rel="noreferrer" className="btn-glow mt-6">{t('common.more')}<ExternalLink size={15} /></a>}
          </div>
        )}
      </Modal>
    </>
  )
}

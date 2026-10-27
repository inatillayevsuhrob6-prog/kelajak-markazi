import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye, Link2 } from 'lucide-react'
import { api, type Article } from '../lib/api'
import { useDebounced, useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { ArticleCard } from '../components/Cards'
import Cover from '../components/Cover'
import { Chips, Empty, ErrorBox, Loading, PageHeader } from '../components/UI'

export function News() {
  const { t } = useI18n()
  useSEO(t('news.title'), t('news.sub'))
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const dq = useDebounced(q)
  const all = useFetch(() => api<{ items: Article[] }>('/articles?limit=200'), [])
  const list = useFetch(() => api<{ items: Article[] }>(`/articles?limit=200&q=${encodeURIComponent(dq)}&category=${encodeURIComponent(cat)}`), [dq, cat])
  const cats = Array.from(new Set((all.data?.items || []).map((a) => a.category)))
  const items = list.data?.items || []

  return (
    <>
      <PageHeader title={t('news.title')} sub={t('news.sub')} />
      <div className="container-x">
        <input className="input mb-5 max-w-md" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search_ph')} aria-label={t('common.search_ph')} />
        <Chips items={cats} value={cat} onChange={setCat} allLabel={t('common.all')} />
        <div className="mt-8">
          {list.loading ? <Loading /> : items.length === 0 ? <Empty /> : (
            <div className="space-y-5">
              <ArticleCard a={items[0]} big />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.slice(1).map((a) => <ArticleCard key={a.id} a={a} />)}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function NewsDetail() {
  const { slug } = useParams()
  const { t, loc, date } = useI18n()
  const toast = useToast()
  const { data: a, loading, error } = useFetch(() => api<Article>(`/articles/${slug}`), [slug])
  useSEO(a ? loc(a, 'title') : '', a?.summary)
  if (loading) return <Loading />
  if (!a) return <div className="container-x py-20"><ErrorBox text={error || t('common.error')} /></div>
  const copy = () => { navigator.clipboard?.writeText(window.location.href); toast(t('common.copied')) }

  return (
    <article className="container-x max-w-3xl py-12">
      <Link to="/news" className="text-sm font-bold text-orchid hover:text-white">← {t('common.back')}</Link>
      <Cover seed={a.title} src={a.image} className="mt-6 h-64 w-full rounded-3xl sm:h-80" />
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60"><span className="chip">{a.category}</span><span>{date(a.created_at)}</span><span>{a.author}</span><span className="inline-flex items-center gap-1"><Eye size={14} />{a.views}</span></div>
      <h1 className="h-display mt-4 text-3xl leading-tight sm:text-4xl">{loc(a, 'title')}</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/80">{a.content.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}</div>
      <button onClick={copy} className="btn-ghost mt-10"><Link2 size={16} />{t('common.share')}</button>
    </article>
  )
}

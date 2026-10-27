import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, Layers, MonitorSmartphone, Search } from 'lucide-react'
import { api, type Course } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useDebounced, useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { CourseCard } from '../components/Cards'
import Cover from '../components/Cover'
import { Chips, Empty, ErrorBox, Loading, PageHeader } from '../components/UI'

export function Courses() {
  const { t } = useI18n()
  useSEO(t('courses.title'), t('courses.sub'))
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [cat, setCat] = useState('')
  const [level, setLevel] = useState('')
  const dq = useDebounced(q)
  const all = useFetch(() => api<{ items: Course[] }>('/courses?limit=200'), [])
  const list = useFetch(() => api<{ items: Course[] }>(`/courses?limit=200&q=${encodeURIComponent(dq)}&category=${encodeURIComponent(cat)}`), [dq, cat])
  useEffect(() => { setParams(dq ? { q: dq } : {}, { replace: true }) }, [dq, setParams])

  const cats = Array.from(new Set((all.data?.items || []).map((c) => c.category).filter(Boolean)))
  const levels = Array.from(new Set((all.data?.items || []).map((c) => c.level).filter(Boolean)))
  const items = (list.data?.items || []).filter((c) => !level || c.level === level)

  return (
    <>
      <PageHeader title={t('courses.title')} sub={t('courses.sub')} />
      <div className="container-x">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" /><input className="input pl-11" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search_ph')} aria-label={t('common.search_ph')} /></div>
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value)} aria-label={t('common.level')}>
            <option value="">{t('common.level')}: {t('common.all')}</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <Chips items={cats} value={cat} onChange={setCat} allLabel={t('common.all')} />
        <div className="mt-8">
          {list.error && <ErrorBox text={list.error} />}
          {list.loading ? <Loading /> : items.length === 0 ? <Empty /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((c) => <CourseCard key={c.id} c={c} />)}</div>}
        </div>
      </div>
    </>
  )
}

export function CourseDetail() {
  const { slug } = useParams()
  const { t, loc } = useI18n()
  const { user } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const [enrolled, setEnrolled] = useState(false)
  const [busy, setBusy] = useState(false)
  const course = useFetch(() => api<Course>(`/courses/${slug}`), [slug])
  const related = useFetch(() => api<{ items: Course[] }>(`/courses?limit=4&category=${encodeURIComponent(course.data?.category || '')}`), [course.data?.category])
  const c = course.data
  useSEO(c ? loc(c, 'title') : '', c?.summary)

  useEffect(() => {
    if (!user || !c) { setEnrolled(false); return }
    api<{ courses: Course[] }>('/me/overview').then((o) => setEnrolled(o.courses.some((x) => x.id === c.id))).catch(() => {})
  }, [user, c])

  const enroll = async () => {
    if (!user) { toast(t('courses.login_needed'), 'err'); nav(`/login?next=/courses/${slug}`); return }
    setBusy(true)
    try { await api(`/courses/${c!.id}/enroll`, { method: 'POST' }); setEnrolled(true); toast(t('courses.enrolled')) }
    catch (e: any) { toast(e.message, 'err') } finally { setBusy(false) }
  }

  if (course.loading) return <Loading />
  if (!c) return <div className="container-x py-20"><ErrorBox text={course.error || t('common.error')} /></div>

  return (
    <div className="container-x py-12">
      <Link to="/courses" className="text-sm font-bold text-orchid hover:text-white">← {t('common.back')}</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Cover seed={c.title} src={c.image} className="h-64 w-full rounded-3xl sm:h-80" />
          <span className="chip mt-6">{c.category}</span>
          <h1 className="h-display mt-4 text-3xl sm:text-4xl">{loc(c, 'title')}</h1>
          <div className="mt-6 whitespace-pre-line text-lg leading-relaxed text-white/75">{c.description}</div>
          {c.video && <section className="mt-8">
            <h2 className="h-display mb-4 text-xl">Dars videosi</h2>
            <video src={c.video} controls playsInline preload="metadata" className="w-full rounded-3xl border border-white/10 bg-black shadow-soft" />
          </section>}
        </div>
        <aside className="glass h-fit space-y-5 rounded-3xl p-7 lg:sticky lg:top-28">
          <div className="flex items-center gap-3"><Clock className="text-orchid" size={20} /><div><p className="text-xs text-white/50">{t('common.duration')}</p><p className="font-bold">{c.duration || '—'}</p></div></div>
          <div className="flex items-center gap-3"><Layers className="text-orchid" size={20} /><div><p className="text-xs text-white/50">{t('common.level')}</p><p className="font-bold">{c.level}</p></div></div>
          <div className="flex items-center gap-3"><MonitorSmartphone className="text-orchid" size={20} /><div><p className="text-xs text-white/50">{t('common.format')}</p><p className="font-bold">{c.format}</p></div></div>
          {enrolled
            ? <p className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-200"><CheckCircle2 size={18} />{t('courses.enrolled')}</p>
            : <button onClick={enroll} disabled={busy} className="btn-glow w-full">{t('courses.enroll')}</button>}
        </aside>
      </div>
      {(related.data?.items || []).filter((x) => x.id !== c.id).length > 0 && (
        <section className="mt-20">
          <h2 className="h-display mb-6 text-2xl">{t('courses.related')}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.data!.items.filter((x) => x.id !== c.id).slice(0, 3).map((x) => <CourseCard key={x.id} c={x} />)}</div>
        </section>
      )}
    </div>
  )
}

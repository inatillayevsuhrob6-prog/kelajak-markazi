import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bot, Layers, Rocket, Search } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { api, type Article, type Course, type EventItem, type Project } from '../lib/api'
import { useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'
import { ArticleCard, CourseCard, EventLine } from '../components/Cards'
import Cover from '../components/Cover'
import { Loading } from '../components/UI'

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1200, 1)
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])
  return <span ref={ref}>{v}</span>
}

/** Markazda logotip, atrofida kurs kategoriyalari aylanadigan interaktiv orbita. */
function Orbit({ cats }: { cats: string[] }) {
  const inner = cats.slice(0, 3)
  const outer = cats.slice(3, 8)
  const place = (list: string[], radius: number, rev: boolean, dur: string) => list.map((c, i) => {
    const a = (360 / list.length) * i
    return (
      <div key={c} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateX(${radius}px)` }}>
        <div style={{ transform: `rotate(${-a}deg)` }}>
          <div className="-translate-x-1/2 -translate-y-1/2">
            <div className={rev ? 'animate-orbit' : 'animate-orbit-rev'} style={{ animationDuration: dur }}>
              <span className="glass block whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold text-orchid shadow-glow">{c}</span>
            </div>
          </div>
        </div>
      </div>
    )
  })
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
      <div className="absolute inset-[12%] rounded-full border border-white/10" />
      <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
      <div className="absolute inset-[22%] rounded-full bg-glow/30 blur-3xl" />
      <div className="absolute inset-0 animate-orbit" style={{ animationDuration: '40s' }}>{place(inner, 138, false, '40s')}</div>
      <div className="absolute inset-0 animate-orbit-rev" style={{ animationDuration: '60s' }}>{place(outer, 214, true, '60s')}</div>
      <img src="/logo-brand.png" alt="" className="absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 shadow-[0_0_24px_rgba(216,180,254,.5)]" />
    </div>
  )
}

export default function Home() {
  const { t, loc } = useI18n()
  const { user, isStaff } = useAuth()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  useSEO('', 'Kelajak markazi platformasi: kurslar, loyihalar, yangiliklar, tadbirlar va sunʼiy intellekt yordamchisi.')
  const stats = useFetch(() => api<Record<string, number>>('/stats'), [])
  const courses = useFetch(() => api<{ items: Course[] }>('/courses?limit=60'), [])
  const news = useFetch(() => api<{ items: Article[] }>('/articles?limit=3'), [])
  const events = useFetch(() => api<{ items: EventItem[] }>('/events?limit=50'), [])
  const projects = useFetch(() => api<{ items: Project[] }>('/projects?limit=6'), [])

  const cats = Array.from(new Set((courses.data?.items || []).map((c) => c.category).filter(Boolean)))
  const upcoming = (events.data?.items || []).filter((e) => new Date(e.starts_at) >= new Date()).slice(0, 3)
  const statItems: [string, string][] = [['courses', 'stat.courses'], ['projects', 'stat.projects'], ['articles', 'stat.articles'], ['events', 'stat.events'], ['members', 'stat.members']]
  const features = [[Layers, 'home.f1t', 'home.f1d'], [Rocket, 'home.f2t', 'home.f2d'], [Bot, 'home.f3t', 'home.f3d']] as const

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <>
      <section onMouseMove={onMove} className="relative overflow-hidden" style={{ ['--mx' as any]: '70%', ['--my' as any]: '30%' }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(520px circle at var(--mx) var(--my), rgba(139,92,246,.22), transparent 65%)' }} />
        <div className="container-x relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="h-display text-4xl leading-[1.08] sm:text-6xl">{t('hero.title')}</motion.h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">{t('hero.sub')}</p>
            <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { nav(`/courses?q=${encodeURIComponent(q.trim())}`) } }} className="relative mt-8 max-w-xl">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" />
              <input className="input !rounded-full !py-4 pl-12 pr-32" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('hero.search')} aria-label={t('nav.search')} />
              <button className="btn-glow absolute right-1.5 top-1/2 -translate-y-1/2 !px-5 !py-2.5">{t('nav.search')}</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary">{t('hero.cta1')}<ArrowRight size={16} /></Link>
              <Link to="/events" className="btn-ghost">{t('hero.cta2')}</Link>
              {user && !isStaff && <Link to="/profile" className="btn-ghost">{t('profile.title')}</Link>}
              {isStaff && <Link to="/admin" className="btn-ghost">{t('nav.admin')}</Link>}
            </div>
          </div>
          <Orbit cats={cats.length ? cats : ['Dasturlash', 'Sunʼiy intellekt', 'Dizayn', 'Menejment', 'Tillar']} />
        </div>
      </section>

      <section className="container-x">
        <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-6 sm:grid-cols-3 lg:grid-cols-5 lg:p-8">
          {statItems.map(([k, label]) => (
            <div key={k} className="text-center">
              <p className="font-display text-4xl font-extrabold text-white"><Counter to={stats.data?.[k] ?? 0} /></p>
              <p className="mt-1 text-sm text-white/60">{t(label)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pt-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><h2 className="h-display text-2xl sm:text-4xl">{t('home.courses')}</h2><p className="mt-2 text-white/65">{t('home.courses_sub')}</p></div>
          <Link to="/courses" className="hidden items-center gap-1 text-sm font-bold text-orchid hover:text-white sm:inline-flex">{t('common.all')}<ArrowRight size={16} /></Link>
        </div>
        {courses.loading ? <Loading /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(courses.data?.items || []).slice(0, 6).map((c) => <CourseCard key={c.id} c={c} />)}</div>}
      </section>

      <section className="container-x pt-24">
        <div className="mb-8">
          <h2 className="h-display text-2xl sm:text-4xl">{t('home.services')}</h2>
          <p className="mt-2 text-white/65">{t('home.services_sub')}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ['/courses', 'home.service_courses_t', 'home.service_courses_d'],
            ['/projects', 'home.service_projects_t', 'home.service_projects_d'],
            ['/events', 'home.service_events_t', 'home.service_events_d'],
            ['/contact', 'home.service_help_t', 'home.service_help_d'],
          ] as const).map(([to, title, description], i) => (
            <Link key={to} to={to} className="glass card-hover rounded-3xl p-6">
              <span className="font-display text-sm font-bold text-orchid">0{i + 1}</span>
              <h3 className="mt-4 font-display text-lg font-semibold">{t(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{t(description)}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">{t('common.more')}<ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pt-24">
        <h2 className="h-display mb-8 text-2xl sm:text-4xl">{t('home.why')}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(([Icon, tk, dk], i) => (
            <div key={tk} className={`glass rounded-3xl p-7 ${i === 1 ? 'md:translate-y-6' : ''}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-glow to-magenta shadow-glow"><Icon size={22} /></span>
              <h3 className="mt-5 font-display text-lg font-semibold">{t(tk)}</h3>
              <p className="mt-2 text-sm text-white/65">{t(dk)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pt-28">
        <div className="mb-8 flex items-end justify-between"><h2 className="h-display text-2xl sm:text-4xl">{t('home.news')}</h2><Link to="/news" className="inline-flex items-center gap-1 text-sm font-bold text-orchid hover:text-white">{t('common.all')}<ArrowRight size={16} /></Link></div>
        {news.loading ? <Loading /> : <div className="grid gap-5 md:grid-cols-3">{(news.data?.items || []).map((a) => <ArticleCard key={a.id} a={a} />)}</div>}
      </section>

      <section className="container-x grid gap-10 pt-24 lg:grid-cols-2">
        <div>
          <div className="mb-8 flex items-end justify-between"><h2 className="h-display text-2xl sm:text-3xl">{t('home.events')}</h2><Link to="/events" className="text-sm font-bold text-orchid hover:text-white">{t('common.all')}</Link></div>
          <div className="space-y-4">{upcoming.map((e) => <EventLine key={e.id} e={e} />)}</div>
        </div>
        <div>
          <div className="mb-8 flex items-end justify-between"><h2 className="h-display text-2xl sm:text-3xl">{t('home.projects')}</h2><Link to="/projects" className="text-sm font-bold text-orchid hover:text-white">{t('common.all')}</Link></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(projects.data?.items || []).slice(0, 4).map((p) => (
              <Link key={p.id} to="/projects" className="glass card-hover overflow-hidden rounded-3xl">
                <Cover seed={p.title} src={p.image} className="h-24 w-full" />
                <div className="p-4"><h3 className="text-sm font-bold">{loc(p, 'title')}</h3><p className="mt-1 text-xs text-white/55">{p.category} · {p.year}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pt-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-[#5b21b6] to-glow p-8 sm:p-14">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-magenta/30 blur-3xl" />
          <h2 className="h-display relative max-w-2xl text-2xl sm:text-4xl">{t('home.cta_t')}</h2>
          <p className="relative mt-4 max-w-xl text-white/80">{t('home.cta_d')}</p>
          <Link to="/register" className="btn-primary relative mt-8">{t('nav.register')}<ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  )
}

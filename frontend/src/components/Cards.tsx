import { Link } from 'react-router-dom'
import { Clock, Eye, Layers, MapPin } from 'lucide-react'
import Cover from './Cover'
import { useI18n } from '../lib/i18n'
import type { Article, Course, EventItem } from '../lib/api'

export function CourseCard({ c }: { c: Course }) {
  const { loc, t } = useI18n()
  return (
    <Link to={`/courses/${c.slug}`} className="glass card-hover group flex flex-col overflow-hidden rounded-3xl">
      <Cover seed={c.title} src={c.image} className="h-40 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <span className="chip self-start">{c.category}</span>
        <h3 className="mt-3 font-display text-base font-semibold leading-snug">{loc(c, 'title')}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/65">{c.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-white/60">
          <span className="inline-flex items-center gap-1"><Clock size={14} />{c.duration}</span>
          <span className="inline-flex items-center gap-1"><Layers size={14} />{c.level}</span>
          <span className="ml-auto font-bold text-orchid group-hover:underline">{t('common.more')}</span>
        </div>
      </div>
    </Link>
  )
}

export function ArticleCard({ a, big }: { a: Article; big?: boolean }) {
  const { loc, date, t } = useI18n()
  return (
    <Link to={`/news/${a.slug}`} className={`glass card-hover group flex overflow-hidden rounded-3xl ${big ? 'flex-col md:flex-row' : 'flex-col'}`}>
      <Cover seed={a.title} src={a.image} className={big ? 'h-56 w-full md:h-auto md:w-1/2' : 'h-44 w-full'} />
      <div className={`flex flex-1 flex-col p-6 ${big ? 'md:p-8' : ''}`}>
        <div className="flex items-center gap-3 text-xs text-white/60"><span className="chip">{a.category}</span><span>{date(a.created_at)}</span></div>
        <h3 className={`mt-3 font-display font-semibold leading-snug ${big ? 'text-2xl' : 'text-base'}`}>{loc(a, 'title')}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-white/65">{a.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-white/50">
          <span className="inline-flex items-center gap-1"><Eye size={14} />{a.views} {t('common.views')}</span>
          <span className="font-bold text-orchid group-hover:underline">{t('common.more')}</span>
        </div>
      </div>
    </Link>
  )
}

export function DateBadge({ iso }: { iso: string }) {
  const { lang } = useI18n()
  const d = new Date(iso)
  const loc = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-GB'
  return (
    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-glow to-brand text-center shadow-glow">
      <span className="font-display text-2xl font-extrabold leading-none">{d.getDate()}</span>
      <span className="mt-1 text-xs font-semibold">{d.toLocaleString(loc, { month: 'short' })}</span>
    </div>
  )
}

export function EventLine({ e }: { e: EventItem }) {
  const { loc, date } = useI18n()
  return (
    <Link to="/events" className="glass card-hover flex items-center gap-5 rounded-3xl p-5">
      <DateBadge iso={e.starts_at} />
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold leading-snug">{loc(e, 'title')}</h3>
        <p className="mt-1 text-sm text-white/60">{date(e.starts_at, true)}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/50"><MapPin size={13} />{e.location}</p>
      </div>
    </Link>
  )
}

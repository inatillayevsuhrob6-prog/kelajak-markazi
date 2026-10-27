import { ExternalLink, Eye, Hammer, Sparkles } from 'lucide-react'
import { api, type Course, type TeamMember } from '../lib/api'
import { useFetch, useSEO } from '../lib/hooks'
import { useI18n } from '../lib/i18n'
import Cover from '../components/Cover'
import { Loading, PageHeader } from '../components/UI'

export default function About() {
  const { t } = useI18n()
  useSEO(t('about.title'), t('about.mission_d'))
  const team = useFetch(() => api<{ items: TeamMember[] }>('/team'), [])
  const courses = useFetch(() => api<{ items: Course[] }>('/courses?limit=100'), [])
  const dirs = Array.from(new Set((courses.data?.items || []).map((c) => c.category).filter(Boolean)))
  const values = [[Eye, 'about.v1t', 'about.v1d'], [Hammer, 'about.v2t', 'about.v2d'], [Sparkles, 'about.v3t', 'about.v3d']] as const

  return (
    <>
      <PageHeader title={t('about.title')} sub={t('about.sub')} />
      <div className="container-x space-y-20">
        <p className="glass rounded-2xl px-5 py-4 text-sm text-orchid">{t('about.demo')}</p>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="h-display text-2xl sm:text-3xl">{t('about.mission_t')}</h2>
          <p className="text-lg leading-relaxed text-white/75">{t('about.mission_d')}</p>
        </section>

        <section>
          <h2 className="h-display mb-6 text-2xl sm:text-3xl">{t('about.values_t')}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(([Icon, a, b]) => (
              <div key={a} className="glass rounded-3xl p-7">
                <Icon className="text-orchid" size={28} />
                <h3 className="mt-4 font-display text-lg font-semibold">{t(a)}</h3>
                <p className="mt-2 text-sm text-white/65">{t(b)}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="h-display mb-6 text-2xl sm:text-3xl">{t('about.org_t')}</h2>
          <div className="glass rounded-3xl p-7">
            <p className="max-w-2xl text-white/75">{t('about.org_d')}</p>
            <a href="https://kelajak.uzedu.uz" target="_blank" rel="noreferrer" className="btn-ghost mt-5">kelajak.uzedu.uz <ExternalLink size={15} /></a>
            {dirs.length > 0 && (
              <div className="mt-8"><h3 className="mb-3 text-sm font-bold text-white/80">{t('about.directions')}</h3><div className="flex flex-wrap gap-2">{dirs.map((d) => <span key={d} className="chip">{d}</span>)}</div></div>
            )}
          </div>
        </section>

        <section>
          <h2 className="h-display mb-6 text-2xl sm:text-3xl">{t('about.team_t')}</h2>
          {team.loading ? <Loading /> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(team.data?.items || []).map((m) => (
                <article key={m.id} className="glass card-hover overflow-hidden rounded-3xl">
                  <Cover seed={m.full_name + m.id} src={m.photo} className="h-44 w-full" />
                  <div className="p-5"><h3 className="font-bold">{m.full_name}</h3><p className="mt-1 text-sm text-orchid">{m.position}</p><p className="mt-2 text-xs text-white/55">{m.bio}</p></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

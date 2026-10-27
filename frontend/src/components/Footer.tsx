import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export default function Footer() {
  const { t } = useI18n()
  const links = [['/courses', 'nav.courses'], ['/projects', 'nav.projects'], ['/news', 'nav.news'], ['/events', 'nav.events'], ['/gallery', 'nav.gallery'], ['/contact', 'nav.contact']]
  return (
    <footer className="mt-24 border-t border-white/10 bg-night/60">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src="/logo-white.png" alt="Kelajak markazi" className="h-14 w-auto" />
          <p className="mt-4 max-w-sm text-sm text-white/60">{t('about.mission_d')}</p>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold">{t('footer.nav')}</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
            {links.map(([to, k]) => <li key={to}><Link to={to} className="hover:text-white">{t(k)}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold">{t('footer.ref')}</h3>
          <a href="https://kelajak.uzedu.uz" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-orchid hover:text-white">kelajak.uzedu.uz <ExternalLink size={14} /></a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">© {new Date().getFullYear()} Kelajak markazi. {t('footer.rights')}</div>
    </footer>
  )
}

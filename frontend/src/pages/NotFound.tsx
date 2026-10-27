import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useSEO } from '../lib/hooks'

export default function NotFound() {
  const { t } = useI18n()
  useSEO('404')
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="h-display bg-gradient-to-r from-glow to-magenta bg-clip-text text-8xl text-transparent">404</h1>
      <p className="mt-4 text-white/70">Sahifa topilmadi</p>
      <Link to="/" className="btn-primary mt-8">{t('nav.home')}</Link>
    </div>
  )
}

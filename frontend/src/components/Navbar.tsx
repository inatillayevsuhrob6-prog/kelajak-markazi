import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Search, User as UserIcon, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { LANGS, useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'
import Notifications from './Notifications'
import SearchModal from './SearchModal'

const LINKS = [
  ['/', 'nav.home'], ['/about', 'nav.about'], ['/courses', 'nav.courses'], ['/projects', 'nav.projects'],
  ['/news', 'nav.news'], ['/events', 'nav.events'], ['/gallery', 'nav.gallery'], ['/contact', 'nav.contact'],
] as const

export default function Navbar() {
  const { t, lang, setLang } = useI18n()
  const { user, logout, isStaff } = useAuth()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()

  useEffect(() => setMenu(false), [loc.pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true) } }
    window.addEventListener('scroll', onScroll)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey) }
  }, [])
  useEffect(() => {
    const open = () => setSearch(true)
    window.addEventListener('kelajak:search', open)
    return () => window.removeEventListener('kelajak:search', open)
  }, [])

  const linkCls = ({ isActive }: { isActive: boolean }) => `whitespace-nowrap rounded-full px-2 py-2 text-[13px] font-semibold transition ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'}`

  return (
    <>
      <nav className={`sticky top-0 z-40 transition ${scrolled ? 'glass-strong border-x-0 border-t-0' : ''}`} aria-label="Asosiy navigatsiya">
        <div className="mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" aria-label="Kelajak markazi — bosh sahifa" className="shrink-0"><img src="/logo-white.png" alt="Kelajak markazi" className="h-11 w-auto" /></Link>
          <div className="hidden items-center gap-0.5 xl:flex">
            {LINKS.map(([to, key]) => <NavLink key={to} to={to} end={to === '/'} className={linkCls}>{t(key)}</NavLink>)}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearch(true)} aria-label={t('nav.search')} className="rounded-full p-2.5 text-white/80 hover:bg-white/10 hover:text-white"><Search size={20} /></button>
            <Notifications />
            <div className="hidden rounded-full border border-white/15 p-0.5 sm:flex" role="group" aria-label="Til">
              {LANGS.map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase transition ${lang === l ? 'bg-white text-brand' : 'text-white/70 hover:text-white'}`}>{l}</button>
              ))}
            </div>
            {user ? (
              <div className="hidden items-center gap-1 lg:flex">
                {isStaff && <Link to="/admin" className="btn-ghost !px-4 !py-2" title={t('nav.admin')}><LayoutDashboard size={16} />{t('nav.admin')}</Link>}
                <Link to="/profile" className="btn-ghost !px-4 !py-2"><UserIcon size={16} />{user.full_name.split(' ')[0]}</Link>
                <button onClick={logout} aria-label={t('nav.logout')} className="rounded-full p-2.5 text-white/70 hover:bg-white/10 hover:text-white"><LogOut size={18} /></button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link to="/login" className="btn-ghost !px-3.5 !py-2 !text-xs">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary !px-3.5 !py-2 !text-xs">{t('nav.register')}</Link>
              </div>
            )}
            <button onClick={() => setMenu((m) => !m)} aria-label="Menyu" aria-expanded={menu} className="rounded-full p-2.5 text-white xl:hidden">{menu ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-strong overflow-hidden border-x-0 xl:hidden">
              <div className="container-x flex flex-col gap-1 py-4">
                {LINKS.map(([to, key]) => <NavLink key={to} to={to} end={to === '/'} className={linkCls}>{t(key)}</NavLink>)}
                <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-4">
                  {LANGS.map((l) => <button key={l} onClick={() => setLang(l)} className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${lang === l ? 'bg-white text-brand' : 'glass'}`}>{l}</button>)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {user ? (
                    <>
                      {isStaff && <Link to="/admin" className="btn-ghost">{t('nav.admin')}</Link>}
                      <Link to="/profile" className="btn-ghost">{t('nav.profile')}</Link>
                      <button onClick={logout} className="btn-ghost">{t('nav.logout')}</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="btn-ghost">{t('nav.login')}</Link>
                      <Link to="/register" className="btn-primary">{t('nav.register')}</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <SearchModal open={search} onClose={() => setSearch(false)} />
    </>
  )
}

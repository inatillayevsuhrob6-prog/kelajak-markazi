import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, BarChart3, BookOpen, CalendarDays, FolderKanban, Image, Mail, Megaphone, Newspaper, UserCog, Users as UsersIcon } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useSEO } from '../lib/hooks'
import Analytics from '../admin/Analytics'
import ResourceManager from '../admin/ResourceManager'
import { CONFIGS } from '../admin/configs'
import { Messages, Notices, Users } from '../admin/Panels'
import { Loading } from '../components/UI'

const TABS = [
  ['analytics', 'Analitika', BarChart3], ['courses', 'Darslar va kurslar', BookOpen], ['projects', 'Loyihalar', FolderKanban], ['articles', 'Yangiliklar', Newspaper],
  ['events', 'Tadbirlar', CalendarDays], ['gallery', 'Galereya', Image], ['team', 'Jamoa', UsersIcon], ['messages', 'Xabarlar', Mail],
  ['notices', 'Bildirishnomalar', Megaphone], ['users', 'Foydalanuvchilar', UserCog],
] as const

export default function Admin() {
  const { tab = 'analytics' } = useParams()
  const { user, loading, isStaff } = useAuth()
  useSEO('Boshqaruv paneli')
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login?next=/admin" replace />
  if (!isStaff) return <Navigate to="/" replace />
  const tabs = TABS.filter(([k]) => k !== 'users' || user.role === 'admin')

  return (
    <div className="container-x grid gap-6 py-8 lg:grid-cols-[230px_1fr]">
      <aside>
        <nav aria-label="Boshqaruv bo‘limlari" className="glass flex gap-1 overflow-x-auto rounded-3xl p-2 lg:sticky lg:top-24 lg:flex-col">
          {tabs.map(([k, label, Icon]) => (
            <Link key={k} to={`/admin/${k}`} className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${tab === k ? 'bg-white text-brand' : 'text-white/75 hover:bg-white/10'}`}><Icon size={17} />{label}</Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-extrabold">Boshqaruv paneli</h1>
          <p className="mt-1 text-sm text-white/60">Darslarni joylang, o‘quvchilar va e’lonlarni boshqaring.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/admin/courses" className="btn-primary !px-4 !py-2.5 text-xs"><BookOpen size={15} />Dars joylash<ArrowRight size={14} /></Link>
            <Link to="/admin/notices" className="btn-ghost !px-4 !py-2.5 text-xs"><Megaphone size={15} />Bildirishnoma yuborish<ArrowRight size={14} /></Link>
            {user.role === 'admin' && <Link to="/admin/users" className="btn-ghost !px-4 !py-2.5 text-xs"><UserCog size={15} />O‘quvchilarni boshqarish<ArrowRight size={14} /></Link>}
          </div>
        </div>
        {tab === 'analytics' && <Analytics />}
        {CONFIGS[tab] && <ResourceManager key={tab} cfg={CONFIGS[tab]} />}
        {tab === 'messages' && <Messages />}
        {tab === 'notices' && <Notices />}
        {tab === 'users' && user.role === 'admin' && <Users />}
      </section>
    </div>
  )
}

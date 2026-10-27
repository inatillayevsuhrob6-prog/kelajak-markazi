import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../lib/api'
import { useFetch } from '../lib/hooks'
import { Loading } from '../components/UI'

const COLORS = ['#8b5cf6', '#f472b6', '#d8b4fe', '#6d28d9', '#c084fc', '#a78bfa']
const tip = { contentStyle: { background: '#170838', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, color: '#fff' }, labelStyle: { color: '#d8b4fe' } }

export default function Analytics() {
  const [days, setDays] = useState(14)
  const { data: d, loading } = useFetch(() => api<any>(`/admin/analytics?days=${days}`), [days])
  if (loading && !d) return <Loading />
  if (!d) return null
  const kpis: [string, number][] = [['Foydalanuvchilar', d.totals.users], ['Tadbirga yozilganlar', d.totals.registrations], ['Xabarlar', d.totals.messages], ['Oʻqilmagan', d.totals.unread], ['Kurslar', d.totals.courses], ['Maqolalar', d.totals.articles], ['Tadbirlar', d.totals.events]]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Analitika</h2>
        <div className="flex gap-1 rounded-full border border-white/15 p-0.5">{[7, 14, 30].map((n) => <button key={n} onClick={() => setDays(n)} className={`rounded-full px-3 py-1 text-xs font-bold ${days === n ? 'bg-white text-brand' : 'text-white/70'}`}>{n} kun</button>)}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{kpis.map(([l, v]) => <div key={l} className="glass rounded-2xl p-5"><p className="text-xs text-white/55">{l}</p><p className="mt-1 font-display text-3xl font-extrabold">{v}</p></div>)}</div>

      <div className="glass rounded-3xl p-5">
        <h3 className="mb-4 text-sm font-bold text-white/80">Sahifa koʻrishlari</h3>
        <div className="h-72"><ResponsiveContainer>
          <AreaChart data={d.series}><defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} /><XAxis dataKey="date" tickFormatter={(v) => String(v).slice(5)} stroke="#ffffff66" fontSize={12} /><YAxis allowDecimals={false} stroke="#ffffff66" fontSize={12} /><Tooltip {...tip} />
            <Area type="monotone" dataKey="views" name="Koʻrishlar" stroke="#d8b4fe" strokeWidth={2.5} fill="url(#vg)" /></AreaChart>
        </ResponsiveContainer></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-5"><h3 className="mb-4 text-sm font-bold text-white/80">Tadbirlarga roʻyxatdan oʻtish</h3>
          <div className="h-64"><ResponsiveContainer><BarChart data={d.event_registrations}><CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} /><XAxis dataKey="title" stroke="#ffffff66" fontSize={11} tickFormatter={(v) => String(v).slice(0, 12)} /><YAxis allowDecimals={false} stroke="#ffffff66" fontSize={12} /><Tooltip {...tip} /><Bar dataKey="count" name="Roʻyxatdan oʻtganlar" fill="#f472b6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="glass rounded-3xl p-5"><h3 className="mb-4 text-sm font-bold text-white/80">Kurslar kategoriyalar boʻyicha</h3>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={d.courses_by_category} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>{d.courses_by_category.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}</Pie><Tooltip {...tip} /><Legend /></PieChart></ResponsiveContainer></div></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-5"><h3 className="mb-3 text-sm font-bold text-white/80">Eng koʻp koʻrilgan sahifalar</h3>
          {d.top_pages.length === 0 ? <p className="text-sm text-white/50">Hali maʼlumot yoʻq</p> : <ul className="space-y-2 text-sm">{d.top_pages.map((p: any) => <li key={p.path} className="flex justify-between rounded-xl bg-white/[0.05] px-4 py-2"><span>{p.path}</span><b>{p.views}</b></li>)}</ul>}</div>
        <div className="glass rounded-3xl p-5"><h3 className="mb-3 text-sm font-bold text-white/80">Eng koʻp oʻqilgan maqolalar</h3>
          <ul className="space-y-2 text-sm">{d.top_articles.map((a: any) => <li key={a.title} className="flex justify-between gap-3 rounded-xl bg-white/[0.05] px-4 py-2"><span className="truncate">{a.title}</span><b>{a.views}</b></li>)}</ul></div>
      </div>
    </div>
  )
}

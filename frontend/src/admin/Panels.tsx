import { useCallback, useEffect, useState } from 'react'
import { Check, Mail, Plus, Trash2 } from 'lucide-react'
import { api, type Notice, type User } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { Loading } from '../components/UI'

export function Messages() {
  const toast = useToast()
  const [rows, setRows] = useState<any[] | null>(null)
  const load = useCallback(() => api<{ items: any[] }>('/admin/messages').then((r) => setRows(r.items)).catch((e) => toast(e.message, 'err')), [toast])
  useEffect(() => { load() }, [load])
  const toggle = async (m: any) => { await api(`/admin/messages/${m.id}`, { method: 'PUT', body: { is_read: !m.is_read } }); load() }
  const del = async (m: any) => { if (window.confirm('Xabarni oʻchirasizmi?')) { await api(`/admin/messages/${m.id}`, { method: 'DELETE' }); load() } }
  if (!rows) return <Loading />
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-semibold">Aloqa xabarlari</h2>
      <div className="space-y-3">
        {rows.length === 0 && <p className="glass rounded-2xl p-8 text-center text-white/55">Xabarlar yoʻq</p>}
        {rows.map((m) => (
          <article key={m.id} className={`glass rounded-2xl p-5 ${m.is_read ? 'opacity-70' : 'border-glow/60'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-bold">{m.subject || '(mavzusiz)'}</p><p className="text-xs text-white/55">{m.name} · <a className="text-orchid hover:underline" href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.created_at).toLocaleString('uz-UZ')}</p></div>
              <div className="flex gap-1"><button onClick={() => toggle(m)} className="btn-ghost !px-3 !py-2 text-xs">{m.is_read ? <Mail size={14} /> : <Check size={14} />}{m.is_read ? 'Oʻqilmagan' : 'Oʻqildi'}</button><button onClick={() => del(m)} aria-label="Oʻchirish" className="btn-danger !px-3 !py-2"><Trash2 size={14} /></button></div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-white/80">{m.message}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export function Users() {
  const toast = useToast()
  const { user: me } = useAuth()
  const [rows, setRows] = useState<User[] | null>(null)
  const load = useCallback(() => api<{ items: User[] }>('/admin/users').then((r) => setRows(r.items)).catch((e) => toast(e.message, 'err')), [toast])
  useEffect(() => { load() }, [load])
  const patch = async (u: User, body: any) => { try { await api(`/admin/users/${u.id}`, { method: 'PUT', body }); toast('Saqlandi'); load() } catch (e: any) { toast(e.message, 'err') } }
  const del = async (u: User) => { if (!window.confirm(`${u.email} foydalanuvchisini oʻchirasizmi?`)) return; try { await api(`/admin/users/${u.id}`, { method: 'DELETE' }); load() } catch (e: any) { toast(e.message, 'err') } }
  if (!rows) return <Loading />
  return (
    <div>
      <div className="mb-5"><h2 className="font-display text-xl font-semibold">Oʻquvchilar va foydalanuvchilar</h2><p className="mt-1 text-sm text-white/55">Jami {rows.filter((u) => u.role === 'user').length} oʻquvchi · {rows.filter((u) => u.role === 'user' && u.is_active).length} faol</p></div>
      <div className="glass overflow-x-auto rounded-3xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs text-white/50"><tr><th className="px-4 py-3">Ism</th><th>Email</th><th>Rol</th><th>Holat</th><th /></tr></thead>
          <tbody>{rows.map((u) => (
            <tr key={u.id} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-3 font-semibold">{u.full_name}</td><td>{u.email}</td>
              <td><select aria-label="Rol" className="input !w-auto !py-1.5" value={u.role} disabled={u.id === me?.id} onChange={(e) => patch(u, { role: e.target.value })}><option value="user">user</option><option value="editor">editor</option><option value="admin">admin</option></select></td>
              <td><button disabled={u.id === me?.id} onClick={() => patch(u, { is_active: !u.is_active })} className={`chip ${u.is_active ? '' : '!border-red-400/40 !text-red-300'}`}>{u.is_active ? 'Faol' : 'Bloklangan'}</button></td>
              <td className="px-4 text-right"><button disabled={u.id === me?.id} onClick={() => del(u)} aria-label="Oʻchirish" className="rounded-full p-2 text-red-300 hover:bg-red-500/15 disabled:opacity-30"><Trash2 size={16} /></button></td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}

export function Notices() {
  const toast = useToast()
  const [rows, setRows] = useState<Notice[] | null>(null)
  const [f, setF] = useState({ title: '', body: '', link: '' })
  const load = useCallback(() => api<{ items: Notice[] }>('/notifications').then((r) => setRows(r.items)), [])
  useEffect(() => { load() }, [load])
  const add = async (e: React.FormEvent) => { e.preventDefault(); try { await api('/admin/notifications', { method: 'POST', body: f }); setF({ title: '', body: '', link: '' }); toast('Yuborildi'); load() } catch (err: any) { toast(err.message, 'err') } }
  const del = async (n: Notice) => { await api(`/admin/notifications/${n.id}`, { method: 'DELETE' }); load() }
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-semibold">Bildirishnomalar</h2>
      <form onSubmit={add} className="glass mb-6 grid gap-3 rounded-3xl p-5 sm:grid-cols-2">
        <input className="input" required placeholder="Sarlavha" aria-label="Sarlavha" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <input className="input" placeholder="Havola (masalan, /events)" aria-label="Havola" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} />
        <textarea className="input sm:col-span-2" placeholder="Matn" aria-label="Matn" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <button className="btn-glow w-fit"><Plus size={16} />Yuborish</button>
      </form>
      {!rows ? <Loading /> : <div className="space-y-2">{rows.map((n) => <div key={n.id} className="glass flex items-center justify-between gap-3 rounded-2xl px-5 py-3"><div><p className="font-semibold">{n.title}</p><p className="text-xs text-white/55">{n.body}</p></div><button onClick={() => del(n)} aria-label="Oʻchirish" className="rounded-full p-2 text-red-300 hover:bg-red-500/15"><Trash2 size={16} /></button></div>)}</div>}
    </div>
  )
}

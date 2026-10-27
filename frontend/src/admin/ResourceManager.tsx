import { useCallback, useEffect, useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { api, uploadImage, uploadVideo } from '../lib/api'
import { useToast } from '../lib/toast'
import Modal from '../components/Modal'
import { Loading } from '../components/UI'

export interface Field {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'datetime' | 'checkbox' | 'select' | 'json' | 'image' | 'video'
  options?: string[]
  required?: boolean
  hint?: string
}
export interface Config {
  endpoint: string
  title: string
  fields: Field[]
  columns: string[]
  defaults?: Record<string, any>
  registrations?: boolean
}

const TRANS_HINT = 'Ixtiyoriy. Masalan: {"ru":{"title":"…"},"en":{"title":"…"}}'

export default function ResourceManager({ cfg }: { cfg: Config }) {
  const toast = useToast()
  const [rows, setRows] = useState<any[] | null>(null)
  const [edit, setEdit] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [busy, setBusy] = useState(false)
  const [regs, setRegs] = useState<{ title: string; items: any[] } | null>(null)

  const load = useCallback(() => api<{ items: any[] }>(`/${cfg.endpoint}?all=true&limit=500`).then((r) => setRows(r.items)).catch((e) => toast(e.message, 'err')), [cfg.endpoint, toast])
  useEffect(() => { setRows(null); load() }, [load])

  const openForm = (row: any | null) => {
    const base: Record<string, any> = {}
    cfg.fields.forEach((f) => {
      const v = row ? row[f.key] : cfg.defaults?.[f.key]
      if (f.type === 'json') base[f.key] = JSON.stringify(v ?? {}, null, 2)
      else if (f.type === 'datetime') base[f.key] = v ? String(v).slice(0, 16) : ''
      else if (f.type === 'checkbox') base[f.key] = v ?? true
      else base[f.key] = v ?? ''
    })
    setForm(base); setEdit(row || {})
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, any> = { ...form }
    for (const f of cfg.fields) {
      if (f.type === 'json') {
        try { body[f.key] = JSON.parse(form[f.key] || '{}') } catch { toast(`"${f.label}" maydonida JSON xatosi bor`, 'err'); return }
      }
    }
    setBusy(true)
    try {
      if (edit?.id) await api(`/${cfg.endpoint}/${edit.id}`, { method: 'PUT', body })
      else await api(`/${cfg.endpoint}`, { method: 'POST', body })
      toast('Saqlandi'); setEdit(null); load()
    } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false) }
  }

  const remove = async (row: any) => {
    if (!window.confirm('Rostdan ham oʻchirmoqchimisiz?')) return
    try { await api(`/${cfg.endpoint}/${row.id}`, { method: 'DELETE' }); toast('Oʻchirildi'); load() } catch (e: any) { toast(e.message, 'err') }
  }

  const showRegs = async (row: any) => {
    try { const r = await api<{ items: any[] }>(`/events/${row.id}/registrations`); setRegs({ title: row.title, items: r.items }) } catch (e: any) { toast(e.message, 'err') }
  }

  const label = (k: string) => cfg.fields.find((f) => f.key === k)?.label || k
  const cell = (row: any, k: string) => {
    const v = row[k]
    if (typeof v === 'boolean') return v ? 'Ha' : 'Yoʻq'
    if (k === 'starts_at' && v) return new Date(v).toLocaleString('uz-UZ')
    return String(v ?? '').slice(0, 70)
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">{cfg.title}</h2>
        <button onClick={() => openForm(null)} className="btn-glow !py-2.5"><Plus size={16} />Qoʻshish</button>
      </div>
      {rows === null ? <Loading /> : (
        <div className="glass overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-white/50"><tr>{cfg.columns.map((c) => <th key={c} className="px-4 py-3 font-semibold">{label(c)}</th>)}<th className="px-4 py-3" /></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={cfg.columns.length + 1} className="px-4 py-10 text-center text-white/50">Maʼlumot yoʻq</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04]">
                  {cfg.columns.map((c) => <td key={c} className="px-4 py-3">{cell(r, c)}</td>)}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {cfg.registrations && <button onClick={() => showRegs(r)} aria-label="Roʻyxatdan oʻtganlar" title="Roʻyxatdan oʻtganlar" className="rounded-full p-2 hover:bg-white/10"><Users size={16} /></button>}
                    <button onClick={() => openForm(r)} aria-label="Tahrirlash" className="rounded-full p-2 hover:bg-white/10"><Pencil size={16} /></button>
                    <button onClick={() => remove(r)} aria-label="Oʻchirish" className="rounded-full p-2 text-red-300 hover:bg-red-500/15"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Tahrirlash' : 'Yangi yozuv'} wide>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          {cfg.fields.map((f) => {
            const id = `f-${f.key}`
            const full = f.type === 'textarea' || f.type === 'json' || f.type === 'image' || f.type === 'video'
            return (
              <div key={f.key} className={full ? 'sm:col-span-2' : ''}>
                {f.type === 'checkbox' ? (
                  <label className="flex items-center gap-3 pt-7 text-sm font-semibold"><input type="checkbox" className="h-5 w-5 accent-[#8b5cf6]" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />{f.label}</label>
                ) : (
                  <>
                    <label className="label" htmlFor={id}>{f.label}{f.required && ' *'}</label>
                    {f.type === 'image' ? <div className="space-y-3">
                      {form[f.key] && <img src={form[f.key]} alt="Tanlangan rasm" className="h-40 w-full rounded-2xl border border-white/10 object-cover" />}
                      <label htmlFor={id} className="btn-ghost !py-2.5 text-xs"><ImagePlus size={16} />Rasm tanlash</label>
                      <input id={id} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 5 * 1024 * 1024) { toast('Rasm hajmi 5 MB dan oshmasligi kerak', 'err'); e.target.value = ''; return }
                        setBusy(true)
                        try {
                          const uploaded = await uploadImage('/admin/images', file)
                          setForm((current) => ({ ...current, [f.key]: uploaded.url }))
                          toast('Rasm yuklandi')
                        } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false); e.target.value = '' }
                      }} />
                      <p className="text-xs text-white/45">PNG, JPG, WEBP yoki GIF · 5 MB gacha</p>
                    </div>
                      : f.type === 'video' ? <div className="space-y-3">
                        {form[f.key] && <video src={form[f.key]} controls className="max-h-64 w-full rounded-2xl bg-black" />}
                        <label htmlFor={id} className="btn-ghost !py-2.5 text-xs"><ImagePlus size={16} />Video tanlash</label>
                        <input id={id} className="sr-only" type="file" accept="video/mp4,video/webm" onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          if (file.size > 50 * 1024 * 1024) { toast('Video hajmi 50 MB dan oshmasligi kerak', 'err'); e.target.value = ''; return }
                          setBusy(true)
                          try {
                            const uploaded = await uploadVideo('/admin/videos', file)
                            setForm((current) => ({ ...current, [f.key]: uploaded.url }))
                            toast('Video yuklandi')
                          } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false); e.target.value = '' }
                        }} />
                        <p className="text-xs text-white/45">MP4 yoki WEBM · 50 MB gacha</p>
                      </div>
                      : f.type === 'textarea' || f.type === 'json' ? <textarea id={id} className={`input min-h-28 ${f.type === 'json' ? 'font-mono text-xs' : ''}`} required={f.required} value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                      : f.type === 'select' ? <select id={id} className="input" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
                      : <input id={id} className="input" required={f.required} type={f.type === 'number' ? 'number' : f.type === 'datetime' ? 'datetime-local' : 'text'} value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />}
                    {(f.hint || f.type === 'json') && <p className="mt-1 text-xs text-white/45">{f.hint || TRANS_HINT}</p>}
                  </>
                )}
              </div>
            )
          })}
          <div className="flex gap-3 sm:col-span-2"><button className="btn-glow" disabled={busy}>Saqlash</button><button type="button" onClick={() => setEdit(null)} className="btn-ghost">Bekor qilish</button></div>
        </form>
      </Modal>

      <Modal open={!!regs} onClose={() => setRegs(null)} title={regs ? `Roʻyxatdan oʻtganlar: ${regs.title}` : ''} wide>
        {regs && (regs.items.length === 0 ? <p className="text-white/60">Hozircha hech kim roʻyxatdan oʻtmagan.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-white/50"><tr><th className="py-2">Ism</th><th>Email</th><th>Telefon</th></tr></thead>
            <tbody>{regs.items.map((r) => <tr key={r.id} className="border-t border-white/10"><td className="py-2">{r.full_name}</td><td>{r.email}</td><td>{r.phone}</td></tr>)}</tbody></table></div>
        ))}
      </Modal>
    </div>
  )
}

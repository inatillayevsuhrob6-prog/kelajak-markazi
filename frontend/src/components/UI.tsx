import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../lib/i18n'

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <header className="container-x pb-8 pt-14 sm:pt-20">
      <h1 className="h-display max-w-4xl text-3xl leading-tight sm:text-5xl">{title}</h1>
      {sub && <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">{sub}</p>}
      {children}
    </header>
  )
}

export function Loading() {
  const { t } = useI18n()
  return <div className="flex items-center justify-center gap-3 py-20 text-white/70"><Loader2 className="animate-spin" size={20} />{t('common.loading')}</div>
}

export function Empty({ text }: { text?: string }) {
  const { t } = useI18n()
  return <div className="glass rounded-3xl px-6 py-14 text-center text-white/70">{text || t('common.empty')}</div>
}

export function ErrorBox({ text }: { text: string }) {
  return <div role="alert" className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">{text}</div>
}

export function Chips({ items, value, onChange, allLabel }: { items: string[]; value: string; onChange: (v: string) => void; allLabel: string }) {
  const cls = (a: boolean) => `rounded-full border px-4 py-2 text-sm font-semibold transition ${a ? 'border-white bg-white text-brand' : 'border-white/15 bg-white/[0.06] text-white/80 hover:border-glow'}`
  return (
    <div className="flex flex-wrap gap-2">
      <button className={cls(value === '')} onClick={() => onChange('')}>{allLabel}</button>
      {items.map((c) => <button key={c} className={cls(value === c)} onClick={() => onChange(c)}>{c}</button>)}
    </div>
  )
}

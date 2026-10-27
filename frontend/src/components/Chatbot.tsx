import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../lib/api'
import { useI18n } from '../lib/i18n'

interface Msg { role: 'user' | 'assistant'; content: string }
const PATH_RE = /(\/(?:courses|projects|news|events|gallery|contact|about|login|register|profile)(?:\/[\w-]+)*)/g

/** Javobdagi sayt yo‘llarini (masalan, /courses) bosiladigan havolaga aylantiradi. */
function Rich({ text, onNav }: { text: string; onNav: () => void }) {
  return <>{text.split(PATH_RE).map((part, i) => (i % 2 === 1 ? <Link key={i} to={part} onClick={onNav} className="font-bold text-orchid underline">{part}</Link> : <Fragment key={i}>{part}</Fragment>))}</>
}

export default function Chatbot() {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, busy, open])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    const next: Msg[] = [...msgs, { role: 'user', content: q }]
    setMsgs(next); setInput(''); setBusy(true)
    try {
      const r = await api<{ reply: string }>('/chat', { method: 'POST', body: { messages: next, lang } })
      setMsgs([...next, { role: 'assistant', content: r.reply }])
    } catch (e: any) {
      setMsgs([...next, { role: 'assistant', content: e.message || t('chat.err') }])
    } finally { setBusy(false) }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }}
            aria-label={t('chat.title')} className="glass-strong fixed bottom-24 right-4 z-[60] flex h-[min(560px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl shadow-soft sm:right-6">
            <header className="flex items-center justify-between bg-gradient-to-r from-brand to-glow/60 px-5 py-4">
              <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"><Sparkles size={18} /></span><div><p className="font-display text-sm font-semibold">{t('chat.title')}</p><p className="text-[11px] text-white/70">Groq AI</p></div></div>
              <button onClick={() => setOpen(false)} aria-label={t('common.close')} className="rounded-full p-1.5 hover:bg-white/15"><X size={18} /></button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm">{t('chat.hello')}</div>
              {msgs.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {['chat.s1', 'chat.s2', 'chat.s3'].map((k) => <button key={k} onClick={() => send(t(k))} className="chip hover:bg-white/15">{t(k)}</button>)}
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'ml-auto rounded-br-md bg-glow' : 'rounded-bl-md bg-white/10'}`}>
                  {m.role === 'assistant' ? <Rich text={m.content} onNav={() => setOpen(false)} /> : m.content}
                </div>
              ))}
              {busy && <div className="flex w-16 gap-1.5 rounded-2xl rounded-bl-md bg-white/10 px-4 py-3" aria-label="Yozmoqda">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-orchid" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>}
              <div ref={end} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2 border-t border-white/10 p-3">
              <input className="input !rounded-full" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('chat.ph')} maxLength={1000} aria-label={t('chat.ph')} />
              <button className="btn-glow !px-4" disabled={busy || !input.trim()} aria-label={t('common.send')}><Send size={18} /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((o) => !o)} aria-label={t('chat.title')} aria-expanded={open}
        className="fixed bottom-6 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-glow to-magenta text-white shadow-glow transition hover:scale-110 sm:right-6">
        {open ? <X size={24} /> : <Bot size={26} />}
        {!open && <span className="absolute inset-0 animate-ring rounded-full border-2 border-orchid" />}
      </button>
    </>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../lib/i18n'

const DURATION = 2.6

/** To‘liq ekranli animatsiyali Kelajak logotipi — har seansda bir marta ko‘rsatiladi. */
export default function Intro() {
  const { t } = useI18n()
  const [show, setShow] = useState(() => !sessionStorage.getItem('kelajak_intro'))
  const dots = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    left: (i * 37) % 100, top: (i * 53) % 100, size: 2 + (i % 4), delay: (i % 7) * 0.4, dur: 4 + (i % 5),
  })), [])

  const finish = () => { sessionStorage.setItem('kelajak_intro', '1'); setShow(false) }

  useEffect(() => {
    if (!show) return
    document.body.style.overflow = 'hidden'
    const id = setTimeout(finish, DURATION * 1000 + 300)
    return () => { clearTimeout(id); document.body.style.overflow = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="intro" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-night"
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: 'inset(0 0 0% 0)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,.45), rgba(58,9,127,.55) 40%, #0b031c 75%)' }} />
          {dots.map((d, i) => (
            <span key={i} className="absolute animate-floaty rounded-full bg-orchid/70" style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
          ))}
          <div className="relative flex flex-col items-center">
            <span className="absolute h-64 w-64 animate-ring rounded-full border border-orchid/60 sm:h-80 sm:w-80" />
            <span className="absolute h-64 w-64 animate-ring rounded-full border border-glow/60 sm:h-80 sm:w-80" style={{ animationDelay: '1.2s' }} />
            <motion.img src="/logo-brand.png" alt="Kelajak markazi" className="relative w-56 rounded-full border border-white/15 shadow-[0_0_30px_rgba(216,180,254,.45)] sm:w-80"
              initial={{ opacity: 1, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }} />
            <div className="mt-12 h-1 w-56 overflow-hidden rounded-full bg-white/10 sm:w-72" role="progressbar" aria-label={t('common.loading')}>
              <motion.div className="h-full rounded-full bg-gradient-to-r from-glow via-orchid to-magenta" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: DURATION, ease: 'easeInOut' }} />
            </div>
          </div>
          <button onClick={finish} className="absolute bottom-8 right-6 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">{t('intro.skip')}</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

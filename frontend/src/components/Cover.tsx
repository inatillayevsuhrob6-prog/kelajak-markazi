function hash(s: string) {
  let h = 7
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

/** Rasm bo‘lmasa, sarlavhadan hosil qilingan binafsha gradient-muqova ko‘rsatiladi. */
export default function Cover({ seed, src, className = '' }: { seed: string; src?: string; className?: string }) {
  const h = hash(seed)
  const hue = 255 + (h % 70)
  const x = 15 + (h % 60)
  const y = 10 + ((h >> 3) % 60)
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`}
      style={{ background: `radial-gradient(circle at ${x}% ${y}%, hsl(${hue} 90% 66% / .85), transparent 55%), radial-gradient(circle at ${100 - x}% ${100 - y}%, hsl(${hue + 45} 90% 62% / .55), transparent 52%), linear-gradient(135deg, hsl(${hue - 10} 70% 16%), hsl(${hue} 75% 30%))` }}>
      <svg className="absolute inset-0 h-full w-full opacity-[.18]" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id={`g${h}`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="white" strokeWidth=".6" /></pattern></defs>
        <rect width="100%" height="100%" fill={`url(#g${h})`} />
      </svg>
      {src && <img src={src} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} className={`absolute inset-0 h-full w-full object-cover ${className}`} />}
    </div>
  )
}

import { useEffect, useState } from 'react'

/** SEO: sarlavha, tavsif va Open Graph teglarini sahifaga qarab yangilaydi. */
export function useSEO(title: string, description?: string) {
  useEffect(() => {
    const full = title ? `${title} — Kelajak markazi` : 'Kelajak markazi — taʼlim va texnologiyalar platformasi'
    document.title = full
    const set = (sel: string, attr: string, val: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(sel)
      if (!el) {
        el = document.createElement('meta')
        const [k, v] = attr.split('=')
        el.setAttribute(k, v)
        document.head.appendChild(el)
      }
      el.setAttribute('content', val)
    }
    set('meta[property="og:title"]', 'property=og:title', full)
    if (description) {
      set('meta[name="description"]', 'name=description', description)
      set('meta[property="og:description"]', 'property=og:description', description)
    }
  }, [title, description])
}

/** Qiymatni kechiktirib qaytaradi (qidiruv uchun). */
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id) }, [value, ms])
  return v
}

/** API dan ma’lumot yuklash. */
export function useFetch<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    setLoading(true)
    loader().then((d) => { if (alive) { setData(d); setError('') } })
      .catch((e) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, loading, error, setData }
}

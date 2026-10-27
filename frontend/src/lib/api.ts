const BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api'
export const TOKEN_KEY = 'kelajak_token'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { method: opts.method || 'GET', headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined })
  } catch {
    throw new ApiError('Serverga ulanib boʻlmadi', 0)
  }
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    let msg = 'Xatolik yuz berdi'
    if (typeof data.detail === 'string') msg = data.detail
    else if (Array.isArray(data.detail)) msg = data.detail.map((d: any) => d.msg).join('; ')
    throw new ApiError(msg, res.status)
  }
  return data as T
}

export async function uploadMedia(path: string, file: File): Promise<{ url: string }> {
  const headers: Record<string, string> = { 'Content-Type': file.type || 'application/octet-stream' }
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.Authorization = `Bearer ${token}`
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: file })
  } catch {
    throw new ApiError('Serverga ulanib boʻlmadi', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(typeof data.detail === 'string' ? data.detail : 'Rasmni yuklab boʻlmadi', res.status)
  return data as { url: string }
}

export const uploadImage = (path: string, file: File) => uploadMedia(path, file)
export const uploadVideo = (path: string, file: File) => uploadMedia(path, file)

export interface User { id: number; email: string; full_name: string; role: 'admin' | 'editor' | 'user'; phone: string; bio: string; profile_image: string; is_active: boolean; created_at: string }
export interface Course { id: number; title: string; slug: string; category: string; level: string; duration: string; format: string; summary: string; description: string; image: string; video: string; is_published: boolean; translations: any }
export interface Project { id: number; title: string; category: string; summary: string; description: string; tech: string; link: string; image: string; year: number; is_published: boolean; translations: any }
export interface Article { id: number; title: string; slug: string; category: string; summary: string; content: string; author: string; image: string; views: number; is_published: boolean; translations: any; created_at: string }
export interface EventItem { id: number; title: string; category: string; summary: string; description: string; location: string; starts_at: string; capacity: number; image: string; is_published: boolean; translations: any }
export interface GalleryItem { id: number; title: string; category: string; caption: string; image: string }
export interface TeamMember { id: number; full_name: string; position: string; bio: string; photo: string; sort_order: number }
export interface Notice { id: number; title: string; body: string; link: string; created_at: string }

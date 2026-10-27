import type { Config } from './ResourceManager'

const TR = { key: 'translations', label: 'Tarjimalar (JSON)', type: 'json' as const }
const PUB = { key: 'is_published', label: 'Chop etilgan', type: 'checkbox' as const }

export const CONFIGS: Record<string, Config> = {
  courses: {
    endpoint: 'courses', title: 'Kurslar', columns: ['title', 'category', 'level', 'is_published'],
    defaults: { level: 'Boshlangʻich', format: 'Onlayn', is_published: true },
    fields: [
      { key: 'title', label: 'Nomi', required: true },
      { key: 'category', label: 'Kategoriya' },
      { key: 'level', label: 'Daraja', type: 'select', options: ['Boshlangʻich', 'Oʻrta', 'Yuqori'] },
      { key: 'format', label: 'Format', type: 'select', options: ['Onlayn', 'Offlayn', 'Aralash'] },
      { key: 'duration', label: 'Davomiyligi' },
      { key: 'image', label: 'Rasm yuklash', type: 'image' },
      { key: 'video', label: 'Dars videosi', type: 'video' },
      { key: 'summary', label: 'Qisqa tavsif', type: 'textarea' },
      { key: 'description', label: 'Toʻliq tavsif', type: 'textarea' },
      PUB, TR,
    ],
  },
  projects: {
    endpoint: 'projects', title: 'Loyihalar', columns: ['title', 'category', 'year', 'is_published'], defaults: { year: new Date().getFullYear(), is_published: true },
    fields: [
      { key: 'title', label: 'Nomi', required: true }, { key: 'category', label: 'Kategoriya' },
      { key: 'year', label: 'Yil', type: 'number' }, { key: 'tech', label: 'Texnologiyalar (vergul bilan)' },
      { key: 'link', label: 'Havola (URL)' }, { key: 'image', label: 'Rasm yuklash', type: 'image' },
      { key: 'summary', label: 'Qisqa tavsif', type: 'textarea' }, { key: 'description', label: 'Toʻliq tavsif', type: 'textarea' }, PUB, TR,
    ],
  },
  articles: {
    endpoint: 'articles', title: 'Yangiliklar va maqolalar', columns: ['title', 'category', 'views', 'is_published'], defaults: { category: 'Yangilik', author: 'Tahririyat', is_published: true },
    fields: [
      { key: 'title', label: 'Sarlavha', required: true }, { key: 'category', label: 'Kategoriya' }, { key: 'author', label: 'Muallif' },
      { key: 'image', label: 'Rasm yuklash', type: 'image' }, { key: 'summary', label: 'Qisqa mazmun', type: 'textarea' },
      { key: 'content', label: 'Matn (abzaclar yangi qatordan)', type: 'textarea' }, PUB, TR,
    ],
  },
  events: {
    endpoint: 'events', title: 'Tadbirlar', columns: ['title', 'starts_at', 'location', 'capacity'], registrations: true, defaults: { category: 'Tadbir', capacity: 100, is_published: true },
    fields: [
      { key: 'title', label: 'Nomi', required: true }, { key: 'category', label: 'Turi' },
      { key: 'starts_at', label: 'Boshlanish vaqti', type: 'datetime', required: true }, { key: 'capacity', label: 'Oʻrinlar soni', type: 'number' },
      { key: 'location', label: 'Joy' }, { key: 'image', label: 'Rasm yuklash', type: 'image' },
      { key: 'summary', label: 'Qisqa tavsif', type: 'textarea' }, { key: 'description', label: 'Toʻliq tavsif', type: 'textarea' }, PUB, TR,
    ],
  },
  gallery: {
    endpoint: 'gallery', title: 'Galereya', columns: ['title', 'category'], defaults: { category: 'Umumiy' },
    fields: [{ key: 'title', label: 'Sarlavha', required: true }, { key: 'category', label: 'Kategoriya' }, { key: 'image', label: 'Rasm yuklash', type: 'image' }, { key: 'caption', label: 'Izoh', type: 'textarea' }],
  },
  team: {
    endpoint: 'team', title: 'Jamoa', columns: ['full_name', 'position', 'sort_order'], defaults: { sort_order: 0 },
    fields: [{ key: 'full_name', label: 'Ism-familiya', required: true }, { key: 'position', label: 'Lavozim' }, { key: 'sort_order', label: 'Tartib raqami', type: 'number' }, { key: 'photo', label: 'Rasm yuklash', type: 'image' }, { key: 'bio', label: 'Qisqacha maʼlumot', type: 'textarea' }],
  },
}

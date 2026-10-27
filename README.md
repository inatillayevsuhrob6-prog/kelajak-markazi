# Kelajak markazi — to‘liq stek veb-platforma

Taʼlim va texnologiyalar platformasi: kurslar, loyihalar, yangiliklar, tadbirlar, galereya, aloqa, foydalanuvchi profillari, boshqaruv paneli, analitika va **Groq** asosidagi **Kelajak AI** yordamchisi. Sayt kontenti to‘liq o‘zbek tilida; interfeys UZ / RU / EN tillarida ishlaydi.

> **Muhim:** loyihadagi barcha kurs, yangilik, tadbir, jamoa va galereya yozilari — **namunaviy (demo) ma’lumot**. Tashkilot haqidagi rasmiy ma’lumotlar o‘ylab topilmagan; ularni boshqaruv paneli orqali haqiqiy ma’lumotlarga almashtiring. Rasmiy manba: https://kelajak.uzedu.uz

## Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion, React Router, Recharts, Vite |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2, Alembic |
| Ma’lumotlar bazasi | PostgreSQL (ulanmasa — SQLite zaxira varianti) |
| AI | Groq API (kalit faqat serverda) |
| Autentifikatsiya | JWT + rollar (`admin`, `editor`, `user`) |

## Imkoniyatlar

1. Animatsiyali to‘liq ekranli logotip intro (har seansda bir marta) va bosh sahifa: jonli statistika, orbita animatsiyasi, kurslar, yangiliklar, tadbirlar.
2. Biz haqimizda: missiya, tamoyillar, tashkilot, jamoa.
3. Kurslar: kategoriya, daraja, qidiruv; kursga yozilish.
4. Loyihalar portfoliosi (modal oyna bilan).
5. Yangiliklar va maqolalar (koʻrishlar soni, qidiruv, kategoriya).
6. Tadbirlar: bo‘sh o‘rinlar hisobi bilan ro‘yxatdan o‘tish.
7. Interaktiv galereya (lightbox, klaviatura bilan boshqarish).
8. Aloqa formasi — xabarlar bazaga yoziladi, admin panelda ko‘rinadi.
9. Kirish, ro‘yxatdan o‘tish, profil (kurslar va tadbirlar tarixi).
10. Boshqaruv paneli: kurs, loyiha, maqola, tadbir, galereya, jamoa uchun to‘liq CRUD; xabarlar; foydalanuvchilar va rollar; bildirishnomalar.
11. Analitika: ko‘rishlar grafigi, tadbirlarga yozilish, kategoriyalar, eng ko‘p ko‘rilgan sahifalar.
12. Ko‘p tillilik (UZ/RU/EN): interfeys + kontentdagi `translations` maydoni orqali tarjimalar.
13. Global qidiruv (`Ctrl/⌘ + K`), filtrlar, bildirishnomalar (qo‘ng‘iroqcha).
14. Suzuvchi **Kelajak AI** chatbot (Groq). Javobdagi sayt yo‘llari bosiladigan havolaga aylanadi.
15. Moslashuvchan (mobil) interfeys, SEO: meta teglar, `robots.txt`, dinamik `sitemap.xml`, a11y (klaviatura fokusi, `prefers-reduced-motion`).

## Tezkor ishga tushirish (Docker)

```bash
cp .env.example .env
# .env ichida SECRET_KEY, ADMIN_PASSWORD va GROQ_API_KEY qiymatlarini to‘ldiring
docker compose up --build
```

Sayt: http://localhost:8080 · API hujjatlari: backend ichida `http://backend:8000/docs` (tashqaridan ko‘rish uchun `backend` xizmatiga `ports: ["8000:8000"]` qo‘shing).

Konteyner ishga tushganda avtomatik: `alembic upgrade head` → namunaviy ma’lumotlar (`app.seed`) → server.

## Bepul hosting: Netlify + Render + Neon

Frontend Netlify’da, Python API Render’da, PostgreSQL bazasi Neon’da ishlaydi. Render bepul servisida uzoq vaqt so‘rov bo‘lmasa API uxlab qolishi, keyingi so‘rovda esa uyg‘onishi mumkin. Render bepul diskida yuklangan media doimiy saqlanmaydi.

1. Neon’da PostgreSQL loyiha/baza yarating va pooled connection string’ni nusxalang (`sslmode=require` bo‘lishi kerak).
2. Render’da **New → Blueprint** tanlab, `inatillayevsuhrob6-prog/kelajak-markazi` repository’sini ulang. Root’dagi `render.yaml` API servisni sozlaydi.
3. Blueprint so‘raganda `DATABASE_URL` ga Neon connection string’ni, `ADMIN_EMAIL` va `ADMIN_PASSWORD` ga o‘zingizning admin ma’lumotlaringizni kiriting. Render `SECRET_KEY` ni o‘zi yaratadi. Groq AI uchun API kalitni Render servisining Environment bo‘limiga `GROQ_API_KEY` sifatida alohida qo‘shing; bu ixtiyoriy.
4. Render deploy tugagach, `https://<render-servis-nomi>.onrender.com/api/health` manzilida `{"status":"ok"}` javobini tekshiring.
5. Netlify → **Project configuration → Environment variables** bo‘limiga `VITE_API_URL=https://<render-servis-nomi>.onrender.com/api` qo‘shib, saytni qayta deploy qiling.
6. Render servisining `CORS_ORIGINS` va `SITE_URL` qiymatlarini Netlify saytining haqiqiy HTTPS manziliga moslang.

`.env` faylini GitHub’ga yoki Netlify frontend environment’iga joylamang. Admin uchun `admin123` kabi sodda parol ishlatmang.

## Lokal ishga tushirish (Docker’siz)

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env        # DATABASE_URL ni sqlite:///./kelajak.db qilib qo‘yishingiz mumkin
python -m app.seed             # jadvallar + namunaviy ma’lumotlar + birinchi admin
uvicorn app.main:app --reload --port 8000
```

PostgreSQL ishlamasa yoki `DATABASE_URL` noto‘g‘ri bo‘lsa, backend **SQLite** (`backend/kelajak.db`) ga avtomatik o‘tadi.

Admin kurs, loyiha, tadbir, maqola, galereya va jamoa rasmlarini tahrirlash oynasidan yuklaydi. Kursga MP4 yoki WEBM dars videosi (50 MB gacha) ham qo‘shish mumkin. Administrator va o‘quvchi profil sahifasidan profil rasmi yuklashi mumkin. Rasmlar PNG, JPG, WEBP yoki GIF formatida, 5 MB gacha bo‘lishi kerak. Barcha yuklamalar `backend/uploads` ichida saqlanadi; Docker Compose `uploads` volume orqali ularni saqlab qoladi.

Migratsiyalar (PostgreSQL uchun tavsiya etiladi):

```bash
alembic upgrade head                                   # mavjud migratsiyani qo‘llash
alembic revision --autogenerate -m "o‘zgarish tavsifi" # modellar o‘zgargach yangisini yaratish
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  (/api so‘rovlari 8000-portga yo‘naltiriladi)
npm run build      # production build -> dist/
```

## Birinchi administrator

`.env` dagi `ADMIN_EMAIL` / `ADMIN_PASSWORD` qiymatlari bilan birinchi administrator seed vaqtida yaratiladi. Kirishda email o‘rniga `admin` loginini ham ishlatish mumkin; u email o‘zgargan taqdirda ham mavjud administrator hisobini topadi. Ushbu ishchi muhitda kirish: `admin` / `admin123`. **Bu faqat mahalliy sinov uchun — internetga chiqarishdan oldin parolni albatta o‘zgartiring.** Panel: `/admin`. Keyin boshqa foydalanuvchilarga `editor` yoki `admin` rolini «Foydalanuvchilar» bo‘limidan bering.

- `editor` — kontentni boshqaradi (CRUD, xabarlar, analitika)
- `admin` — yuqoridagilar + foydalanuvchilar va rollarni boshqarish

## Groq AI yordamchisi

1. https://console.groq.com dan API kalit oling.
2. `.env` ga yangi `GROQ_API_KEY=...` yozing (ixtiyoriy: `GROQ_MODEL`; standart `openai/gpt-oss-120b`).
3. Serverni qayta ishga tushiring.

Kalit faqat backend (`POST /api/chat`) ichida ishlatiladi, frontend kodiga tushmaydi. Tizim ko‘rsatmasi bazadagi kurslar va yaqin tadbirlar bilan to‘ldiriladi; rasmiy ma’lumot bo‘lmasa, yordamchi uni o‘ylab topmaslikka yo‘naltirilgan. Kalit kiritilmasa, chat tushunarli xabar bilan javob beradi. So‘rovlar IP bo‘yicha daqiqada 20 tagacha cheklangan.

## Ko‘p tillilik va kontent tarjimasi

Interfeys matnlari `frontend/src/lib/i18n.tsx` da. Kontent (kurs, maqola, loyiha, tadbir) uchun admin formasidagi **Tarjimalar (JSON)** maydoniga yozing:

```json
{"ru": {"title": "Основы Python"}, "en": {"title": "Python Basics"}}
```

Tarjima bo‘lmasa, o‘zbekcha asl matn ko‘rsatiladi. Admin panel interfeysi o‘zbek tilida.

## Loyiha tuzilmasi

```
kelajak-markazi/
├── docker-compose.yml
├── .env.example
├── scripts/smoke_api.sh        # API tezkor tekshiruvi
├── backend/
│   ├── app/                    # main, models, security, routerlar, seed
│   ├── alembic/                # migratsiyalar
│   ├── Dockerfile, entrypoint.sh, requirements.txt
└── frontend/
    ├── src/ (pages, components, admin, lib)
    ├── public/                 # Kelajak logotipi va favicon
    ├── Dockerfile, nginx.conf
```

## Asosiy API yo‘llari

| Yo‘l | Tavsif |
|---|---|
| `POST /api/auth/register`, `/api/auth/login`, `GET/PUT /api/me` | Autentifikatsiya va profil |
| `GET /api/{courses,projects,articles,events,gallery,team}` | Ochiq ro‘yxat (`q`, `category`, `limit`) |
| `POST/PUT/DELETE /api/{resurs}` | CRUD (admin/editor) |
| `POST /api/events/{id}/register`, `POST /api/courses/{id}/enroll` | Ro‘yxatdan o‘tish / kursga yozilish |
| `POST /api/contact`, `GET /api/admin/messages` | Aloqa xabarlari |
| `GET /api/search?q=` , `GET /api/stats`, `GET /api/notifications` | Qidiruv, statistika, bildirishnomalar |
| `GET /api/admin/analytics` | Analitika |
| `POST /api/chat` | Groq AI chat |
| `GET /sitemap.xml`, `/robots.txt` | SEO |

To‘liq interaktiv hujjat: `/docs` (FastAPI Swagger).

## Eslatmalar

- Shriftlar (Unbounded, Manrope) Google Fonts’dan yuklanadi; internet bo‘lmasa tizim shriftlari ishlatiladi.
- Rasm maydonlariga URL kiritilmasa, sarlavhadan avtomatik binafsha muqova hosil qilinadi. Admin panelidan kontent rasmlari va kurs videolarini, profil sahifasidan esa admin/o‘quvchi avatarini yuklash mumkin; fayllar `backend/uploads` ichida saqlanadi va Git’ga qo‘shilmaydi.
- Ishlab chiqarishda `SECRET_KEY` va admin parolini albatta almashtiring, `CORS_ORIGINS` va `SITE_URL` ni o‘z domeningizga moslang, HTTPS ortida ishlating.
- Logotip yuklangan Kelajak logotipidan olingan (shaffof fonli oq variant: `frontend/public/logo-white.png`).

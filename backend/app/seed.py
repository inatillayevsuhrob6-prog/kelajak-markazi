"""Namunaviy ma’lumotlar. Barcha yozuvlar DEMO — admin panel orqali haqiqiy kontentga almashtiring."""
from datetime import timedelta
from . import config
from .database import SessionLocal
from .models import Article, Course, Event, GalleryItem, Notification, Project, TeamMember, User, now
from .security import hash_password
from .utils import slugify


def T(ru, en, **extra):
    return {"ru": {"title": ru, **extra.get("ru", {})}, "en": {"title": en, **extra.get("en", {})}}


COURSES = [
    ("Python dasturlash asoslari", "Dasturlash", "Boshlangʻich", "8 hafta", "Onlayn",
     "Python tilini noldan oʻrganing: oʻzgaruvchilar, funksiyalar, OOP va amaliy loyihalar.",
     T("Основы программирования на Python", "Python Programming Basics")),
    ("Zamonaviy veb-dasturlash (React)", "Dasturlash", "Oʻrta", "10 hafta", "Aralash",
     "React, TypeScript va REST API bilan zamonaviy veb-ilovalar yaratish.",
     T("Современная веб-разработка (React)", "Modern Web Development (React)")),
    ("Sunʼiy intellekt va mashinaviy oʻqitish", "Sunʼiy intellekt", "Oʻrta", "12 hafta", "Onlayn",
     "Mashinaviy oʻqitish asoslari, neyron tarmoqlar va til modellari bilan ishlash.",
     T("Искусственный интеллект и машинное обучение", "Artificial Intelligence and Machine Learning")),
    ("Maʼlumotlar tahlili", "Sunʼiy intellekt", "Boshlangʻich", "6 hafta", "Onlayn",
     "Jadvallar, vizualizatsiya va statistik fikrlash: maʼlumotdan xulosa chiqarish.",
     T("Анализ данных", "Data Analysis")),
    ("UI/UX dizayn amaliyoti", "Dizayn", "Boshlangʻich", "8 hafta", "Offlayn",
     "Foydalanuvchi tajribasi tadqiqoti, prototiplash va interfeys dizayni tamoyillari.",
     T("Практика UI/UX дизайна", "UI/UX Design Practice")),
    ("Kiberxavfsizlik asoslari", "Xavfsizlik", "Boshlangʻich", "6 hafta", "Onlayn",
     "Shaxsiy va tashkiliy maʼlumotlarni himoya qilishning asosiy usullari.",
     T("Основы кибербезопасности", "Cybersecurity Basics")),
    ("Loyihalarni boshqarish", "Menejment", "Oʻrta", "5 hafta", "Aralash",
     "Rejalashtirish, jamoa bilan ishlash va loyihani oxirigacha yetkazish.",
     T("Управление проектами", "Project Management")),
    ("Ingliz tili (IT yoʻnalishi uchun)", "Tillar", "Boshlangʻich", "10 hafta", "Offlayn",
     "Texnik hujjatlar, uchrashuvlar va yozishmalar uchun kerakli ingliz tili.",
     T("Английский язык для IT", "English for IT")),
]

PROJECTS = [
    ("Taʼlim platformasi", "Veb-ilova", "Kurslar, vazifalar va natijalarni bir joyda boshqaradigan namunaviy platforma.", "React, FastAPI, PostgreSQL", 2025,
     T("Образовательная платформа", "Learning Platform")),
    ("Yordamchi Telegram bot", "Bot", "Savollarga javob beruvchi va eslatmalar yuboruvchi namunaviy bot.", "Python, aiogram", 2025,
     T("Телеграм-бот помощник", "Helper Telegram Bot")),
    ("Maʼlumotlar paneli", "Analitika", "Faoliyat koʻrsatkichlarini grafiklarda koʻrsatuvchi interaktiv panel.", "TypeScript, Recharts", 2024,
     T("Панель данных", "Data Dashboard")),
    ("Matn tahlili modeli", "Sunʼiy intellekt", "Oʻzbek tilidagi matnlarni tasniflash boʻyicha tajriba loyihasi.", "Python, PyTorch", 2024,
     T("Модель анализа текста", "Text Analysis Model")),
]

ARTICLES = [
    ("Yangi oʻquv mavsumi uchun kurslar roʻyxati yangilandi", "Yangilik",
     "Platformaga namunaviy kurslar qoʻshildi. Kategoriyalar boʻyicha izlab, oʻzingizga mosini tanlang.",
     "Platformadagi kurslar boʻlimi yangilandi. Endi kurslarni kategoriya, daraja va format boʻyicha saralash mumkin.\n\nHar bir kurs sahifasida qisqacha tavsif, davomiylik va oʻqitish formati koʻrsatilgan. Roʻyxatdan oʻtgan foydalanuvchilar kursga yozilib, profilida kuzatib borishi mumkin.\n\nBu matn namuna sifatida kiritilgan; haqiqiy yangiliklar admin panel orqali qoʻshiladi.",
     T("Обновлён список курсов", "Course list updated")),
    ("Sunʼiy intellekt yordamchisi ishga tushdi", "Texnologiya",
     "Kelajak AI savollaringizga javob beradi va sayt boʻylab yoʻl koʻrsatadi.",
     "Saytning pastki oʻng burchagidagi chat tugmasi orqali Kelajak AI yordamchisiga savol bering.\n\nYordamchi kurslar haqida tushuntiradi, tegishli sahifalarga yoʻnaltiradi va umumiy taʼlim savollariga javob beradi. Rasmiy maʼlumot boʻlmagan masalalarda u buni ochiq aytadi.",
     T("Запущен ИИ-помощник", "AI assistant launched")),
    ("Dasturlashni oʻrganishni qayerdan boshlash kerak?", "Maqola",
     "Yangi boshlovchilar uchun oddiy yoʻl xaritasi: til tanlash, kichik loyiha va muntazam mashq.",
     "Birinchi qadam — bitta tilni tanlash. Python boshlovchilar uchun qulay sintaksisi bilan mashhur.\n\nIkkinchi qadam — kichik, lekin oxiriga yetkaziladigan loyiha qilish: kalkulyator, vazifalar roʻyxati yoki oddiy bot.\n\nUchinchi qadam — har kuni oz boʻlsa-da mashq qilish. Muntazamlik hajmdan muhimroq.",
     T("С чего начать изучение программирования?", "Where to start learning programming?")),
    ("Loyihalar boʻlimi: portfolio qanday yigʻiladi", "Maqola",
     "Yaxshi portfolio nechta loyiha emas, qanday loyihalar borligi bilan ajraladi.",
     "Portfolioga 3–5 ta puxta loyiha yetarli. Har biri uchun muammo, yechim va ishlatilgan texnologiyalarni qisqa yozing.\n\nIloji boʻlsa, jonli havola va manba kodini qoʻshing.",
     T("Раздел проектов: как собрать портфолио", "Projects section: building a portfolio")),
]

GALLERY = [("Dars jarayoni", "Darslar"), ("Jamoaviy ish", "Darslar"), ("Taqdimot kuni", "Tadbirlar"), ("Hackathon", "Tadbirlar"),
           ("Seminar", "Tadbirlar"), ("Amaliy mashgʻulot", "Darslar"), ("Mentor suhbati", "Jamoa"), ("Guruh suratga tushishi", "Jamoa")]

TEAM = [("Ism Familiya (namuna)", "Markaz rahbari", "Namunaviy yozuv. Haqiqiy maʼlumotni admin panelda kiriting."),
        ("Ism Familiya (namuna)", "Oʻquv ishlari boʻyicha mutaxassis", "Namunaviy yozuv. Haqiqiy maʼlumotni admin panelda kiriting."),
        ("Ism Familiya (namuna)", "Loyihalar yetakchisi", "Namunaviy yozuv. Haqiqiy maʼlumotni admin panelda kiriting."),
        ("Ism Familiya (namuna)", "Aloqa va hamkorlik menejeri", "Namunaviy yozuv. Haqiqiy maʼlumotni admin panelda kiriting.")]


def run():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.role == "admin").first():
            db.add(User(email=config.ADMIN_EMAIL.lower(), full_name=config.ADMIN_NAME, hashed_password=hash_password(config.ADMIN_PASSWORD), role="admin"))
            db.commit()
        if db.query(Course).count():
            return
        for title, cat, level, dur, fmt, summary, tr in COURSES:
            db.add(Course(title=title, slug=slugify(title), category=cat, level=level, duration=dur, format=fmt, summary=summary,
                          description=summary + "\n\nBu kurs tavsifi namuna sifatida kiritilgan. Dastur, jadval va shartlar admin panel orqali yangilanadi.",
                          translations=tr))
        for title, cat, summary, tech, year, tr in PROJECTS:
            db.add(Project(title=title, category=cat, summary=summary, description=summary, tech=tech, year=year, translations=tr))
        for i, (title, cat, summary, content, tr) in enumerate(ARTICLES):
            db.add(Article(title=title, slug=slugify(title), category=cat, summary=summary, content=content, views=0, translations=tr,
                           created_at=now() - timedelta(days=i * 3)))
        events = [
            ("Ochiq eshiklar kuni", "Tadbir", "Platforma va kurslar bilan tanishuv uchun ochiq uchrashuv.", "Toshkent (namuna manzil)", 7, 80,
             T("День открытых дверей", "Open Day")),
            ("Dasturlash boʻyicha amaliy seminar", "Seminar", "Python va veb asoslari boʻyicha amaliy mashgʻulot.", "Onlayn", 14, 120,
             T("Практический семинар по программированию", "Hands-on Programming Seminar")),
            ("Sunʼiy intellekt hackathoni", "Hackathon", "Jamoalarda gʻoyani prototipga aylantirish musobaqasi.", "Toshkent (namuna manzil)", 30, 60,
             T("Хакатон по ИИ", "AI Hackathon")),
        ]
        for title, cat, summary, loc, days, cap, tr in events:
            db.add(Event(title=title, category=cat, summary=summary, description=summary, location=loc,
                         starts_at=(now() + timedelta(days=days)).replace(hour=14, minute=0, second=0, microsecond=0), capacity=cap, translations=tr))
        for title, cat in GALLERY:
            db.add(GalleryItem(title=title, category=cat, caption="Namunaviy rasm — admin panel orqali haqiqiy surat qoʻshing."))
        for i, (name, pos, bio) in enumerate(TEAM):
            db.add(TeamMember(full_name=name, position=pos, bio=bio, sort_order=i))
        db.add(Notification(title="Xush kelibsiz!", body="Platformadagi kontent namuna sifatida kiritilgan.", link="/about"))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    from .database import Base, engine
    Base.metadata.create_all(bind=engine)
    run()
    print("Seed bajarildi.")

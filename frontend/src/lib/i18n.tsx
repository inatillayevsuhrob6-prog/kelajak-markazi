import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'uz' | 'ru' | 'en'
export const LANGS: Lang[] = ['uz', 'ru', 'en']

type Dict = Record<string, string>

const uz: Dict = {
  'nav.home': 'Bosh sahifa', 'nav.about': 'Biz haqimizda', 'nav.courses': 'Kurslar', 'nav.projects': 'Loyihalar',
  'nav.news': 'Yangiliklar', 'nav.events': 'Tadbirlar', 'nav.gallery': 'Galereya', 'nav.contact': 'Aloqa',
  'nav.login': 'Kirish', 'nav.register': 'Roʻyxatdan oʻtish', 'nav.profile': 'Profil', 'nav.logout': 'Chiqish',
  'nav.admin': 'Boshqaruv paneli', 'nav.search': 'Qidirish', 'nav.notifications': 'Bildirishnomalar',
  'hero.title': 'Kelajakni bugun oʻrganing va yarating', 'hero.sub': 'Kurslar, amaliy loyihalar, tadbirlar va sunʼiy intellekt yordamchisi — hammasi bitta platformada.',
  'hero.cta1': 'Kurslarni koʻrish', 'hero.cta2': 'Tadbirlarga yozilish', 'hero.search': 'Kurs, maqola yoki tadbirni qidiring…',
  'stat.courses': 'kurs', 'stat.projects': 'loyiha', 'stat.articles': 'maqola', 'stat.events': 'tadbir', 'stat.members': 'foydalanuvchi',
  'home.courses': 'Kurslar', 'home.courses_sub': 'Yoʻnalishni tanlang va oʻrganishni boshlang',
  'home.services': 'Markaz xizmatlari', 'home.services_sub': 'Oʻqish, amaliyot va rivojlanish uchun barcha imkoniyatlar bir joyda.',
  'home.service_courses_t': 'Kasbiy kurslar', 'home.service_courses_d': 'Dasturlash, sunʼiy intellekt, dizayn va boshqa yoʻnalishlarda bosqichma-bosqich taʼlim oling.',
  'home.service_projects_t': 'Amaliy loyihalar', 'home.service_projects_d': 'Bilimlaringizni amaliy ishlar bilan mustahkamlang va portfoliongizni yarating.',
  'home.service_events_t': 'Tadbir va seminarlar', 'home.service_events_d': 'Seminar, uchrashuv va hackathonlarda qatnashib, yangi bilim va aloqalar orttiring.',
  'home.service_help_t': 'Maslahat va aloqa', 'home.service_help_d': 'Savollaringiz bo‘lsa jamoaga yozing yoki Kelajak AI yordamchisidan yo‘l-yo‘riq oling.',
  'home.why': 'Platforma nimalarni beradi', 'home.f1t': 'Moslashuvchan format', 'home.f1d': 'Kurslar onlayn, offlayn yoki aralash shaklda — oʻzingizga qulayini tanlang.',
  'home.f2t': 'Amaliy loyihalar', 'home.f2d': 'Nazariyani loyihalarda mustahkamlang va oʻz portfoliongizni yigʻing.',
  'home.f3t': 'Kelajak AI yordamchisi', 'home.f3d': 'Savol bering: yordamchi kurslarni tushuntiradi va kerakli sahifaga yoʻnaltiradi.',
  'home.news': 'Soʻnggi yangiliklar', 'home.events': 'Yaqin tadbirlar', 'home.projects': 'Loyihalar',
  'home.cta_t': 'Birinchi qadamni hozir qoʻying', 'home.cta_d': 'Roʻyxatdan oʻting, kursga yoziling va oʻqish jarayonini profilingizda kuzating.',
  'common.more': 'Batafsil', 'common.all': 'Barchasi', 'common.loading': 'Yuklanmoqda…', 'common.empty': 'Hozircha hech narsa topilmadi.',
  'common.error': 'Xatolik yuz berdi. Qayta urinib koʻring.', 'common.save': 'Saqlash', 'common.cancel': 'Bekor qilish',
  'common.delete': 'Oʻchirish', 'common.edit': 'Tahrirlash', 'common.add': 'Qoʻshish', 'common.send': 'Yuborish', 'common.close': 'Yopish',
  'common.search_ph': 'Qidirish…', 'common.level': 'Daraja', 'common.duration': 'Davomiyligi', 'common.format': 'Format',
  'common.category': 'Kategoriya', 'common.back': 'Orqaga', 'common.views': 'koʻrish', 'common.share': 'Havolani nusxalash', 'common.copied': 'Havola nusxalandi',
  'courses.title': 'Kurslar', 'courses.sub': 'Kategoriya, daraja va kalit soʻz boʻyicha qidiring.', 'courses.enroll': 'Kursga yozilish',
  'courses.enrolled': 'Siz kursga yozildingiz', 'courses.login_needed': 'Kursga yozilish uchun tizimga kiring', 'courses.related': 'Shu kategoriyadagi kurslar',
  'projects.title': 'Loyihalar', 'projects.sub': 'Amaliy ishlar va portfolio namunalari.', 'projects.tech': 'Texnologiyalar',
  'news.title': 'Yangiliklar va maqolalar', 'news.sub': 'Platforma yangiliklari, foydali maqolalar va eʼlonlar.',
  'events.title': 'Tadbirlar', 'events.sub': 'Yaqin tadbirlarni koʻring va oʻrningizni band qiling.', 'events.register': 'Roʻyxatdan oʻtish',
  'events.seats': 'boʻsh oʻrin', 'events.full': 'Oʻrinlar tugagan', 'events.done': 'Tadbir yakunlangan', 'events.name': 'Ism-familiya',
  'events.email': 'Email', 'events.phone': 'Telefon (ixtiyoriy)', 'events.upcoming': 'Yaqin tadbirlar', 'events.past': 'Oʻtgan tadbirlar',
  'events.success': 'Roʻyxatdan oʻtdingiz. Tadbirda koʻrishamiz!',
  'gallery.title': 'Galereya', 'gallery.sub': 'Darslar, tadbirlar va jamoadan lavhalar.',
  'contact.title': 'Biz bilan bogʻlaning', 'contact.sub': 'Savol yoki taklifingizni yozing — xabaringiz administratorlarga yetkaziladi.',
  'contact.name': 'Ismingiz', 'contact.email': 'Email', 'contact.subject': 'Mavzu', 'contact.message': 'Xabar', 'contact.sent': 'Xabaringiz yuborildi. Rahmat!',
  'contact.ref': 'Rasmiy maʼlumotlar uchun tashkilotning rasmiy saytiga qarang:',
  'auth.login_t': 'Tizimga kirish', 'auth.register_t': 'Roʻyxatdan oʻtish', 'auth.email': 'Email', 'auth.password': 'Parol', 'auth.fullname': 'Ism-familiya',
  'auth.login_id': 'Login yoki email',
  'auth.no_account': 'Hisobingiz yoʻqmi?', 'auth.have_account': 'Hisobingiz bormi?', 'auth.welcome': 'Xush kelibsiz!',
  'profile.title': 'Mening profilim', 'profile.my_courses': 'Mening kurslarim', 'profile.my_events': 'Roʻyxatdan oʻtgan tadbirlarim', 'profile.phone': 'Telefon',
  'student.welcome': 'O‘quvchi kabineti', 'student.subtitle': 'O‘qishni davom ettiring, tadbirlaringizni kuzating va yangi maqsadlar sari qadam qo‘ying.',
  'student.local_time': 'Mahalliy vaqt', 'student.my_courses': 'Mening darslarim', 'student.my_events': 'Tadbirlarim', 'student.next_step': 'Keyingi qadam', 'student.find_course': 'Yangi kurs topish',
  'profile.bio': 'Oʻzingiz haqingizda', 'profile.new_password': 'Yangi parol (oʻzgartirmoqchi boʻlsangiz)', 'profile.saved': 'Profil saqlandi', 'profile.none': 'Hozircha yoʻq',
  'about.title': 'Biz haqimizda', 'about.sub': 'Platformamiz maqsadi va jamoasi.',
  'about.mission_t': 'Missiya', 'about.mission_d': 'Zamonaviy bilim va texnologiyalarni oson, ochiq va qulay shaklda yetkazish, hamda har bir oʻquvchiga amaliy tajriba orttirish imkonini berish.',
  'about.values_t': 'Tamoyillar', 'about.team_t': 'Jamoa', 'about.org_t': 'Tashkilot', 'about.directions': 'Taʼlim yoʻnalishlari',
  'about.org_d': 'Tashkilot haqidagi rasmiy maʼlumotlar — tuzilma, rahbariyat va aloqa maʼlumotlari — rasmiy manbada eʼlon qilinadi.',
  'about.demo': 'Diqqat: sayt kontenti hozircha namuna sifatida kiritilgan va boshqaruv paneli orqali haqiqiy maʼlumotlarga almashtiriladi.',
  'about.v1t': 'Ochiqlik', 'about.v1d': 'Kurslar va yangiliklar hamma uchun tushunarli va oson topiladi.',
  'about.v2t': 'Amaliyot', 'about.v2d': 'Har bir yoʻnalishda real loyihalar bilan ishlash tajribasi.',
  'about.v3t': 'Texnologiya', 'about.v3d': 'Zamonaviy vositalar va sunʼiy intellekt yordamida oʻrganish.',
  'footer.rights': 'Barcha huquqlar himoyalangan.', 'footer.nav': 'Boʻlimlar', 'footer.ref': 'Rasmiy sayt',
  'chat.title': 'Kelajak AI', 'chat.ph': 'Savolingizni yozing…', 'chat.hello': 'Salom! Men Kelajak AI yordamchisiman. Kurslar, tadbirlar yoki sayt boʻyicha savol bering.',
  'chat.s1': 'Qaysi kursdan boshlash kerak?', 'chat.s2': 'Yaqin tadbirlar qaysilar?', 'chat.s3': 'Qanday roʻyxatdan oʻtaman?', 'chat.err': 'Javob olib boʻlmadi. Keyinroq urinib koʻring.',
  'search.title': 'Global qidiruv', 'search.none': 'Hech narsa topilmadi', 'search.hint': 'Kamida 2 ta belgi kiriting',
  'notif.title': 'Bildirishnomalar', 'notif.none': 'Yangi bildirishnoma yoʻq',
  'intro.skip': 'Oʻtkazib yuborish',
}

const ru: Dict = {
  'nav.home': 'Главная', 'nav.about': 'О нас', 'nav.courses': 'Курсы', 'nav.projects': 'Проекты', 'nav.news': 'Новости', 'nav.events': 'События',
  'nav.gallery': 'Галерея', 'nav.contact': 'Контакты', 'nav.login': 'Войти', 'nav.register': 'Регистрация', 'nav.profile': 'Профиль',
  'nav.logout': 'Выйти', 'nav.admin': 'Панель управления', 'nav.search': 'Поиск', 'nav.notifications': 'Уведомления',
  'hero.title': 'Учитесь и создавайте будущее уже сегодня', 'hero.sub': 'Курсы, практические проекты, события и ИИ-помощник — всё на одной платформе.',
  'hero.cta1': 'Смотреть курсы', 'hero.cta2': 'Записаться на событие', 'hero.search': 'Найдите курс, статью или событие…',
  'stat.courses': 'курсов', 'stat.projects': 'проектов', 'stat.articles': 'статей', 'stat.events': 'событий', 'stat.members': 'пользователей',
  'home.courses': 'Курсы', 'home.courses_sub': 'Выберите направление и начните обучение',
  'home.services': 'Услуги центра', 'home.services_sub': 'Возможности для обучения, практики и развития в одном месте.',
  'home.service_courses_t': 'Профессиональные курсы', 'home.service_courses_d': 'Учитесь программированию, ИИ, дизайну и другим направлениям.',
  'home.service_projects_t': 'Практические проекты', 'home.service_projects_d': 'Закрепляйте знания на практике и создавайте портфолио.',
  'home.service_events_t': 'События и семинары', 'home.service_events_d': 'Участвуйте в семинарах, встречах и хакатонах.',
  'home.service_help_t': 'Консультация и связь', 'home.service_help_d': 'Напишите команде или получите подсказку от Kelajak AI.',
  'home.why': 'Что даёт платформа', 'home.f1t': 'Гибкий формат', 'home.f1d': 'Курсы онлайн, офлайн или в смешанном формате — выбирайте удобный.',
  'home.f2t': 'Практические проекты', 'home.f2d': 'Закрепляйте теорию в проектах и собирайте своё портфолио.',
  'home.f3t': 'ИИ-помощник Kelajak', 'home.f3d': 'Задайте вопрос: помощник объяснит курсы и подскажет нужную страницу.',
  'home.news': 'Последние новости', 'home.events': 'Ближайшие события', 'home.projects': 'Проекты',
  'home.cta_t': 'Сделайте первый шаг сейчас', 'home.cta_d': 'Зарегистрируйтесь, запишитесь на курс и следите за прогрессом в профиле.',
  'common.more': 'Подробнее', 'common.all': 'Все', 'common.loading': 'Загрузка…', 'common.empty': 'Пока ничего не найдено.',
  'common.error': 'Произошла ошибка. Попробуйте ещё раз.', 'common.save': 'Сохранить', 'common.cancel': 'Отмена', 'common.delete': 'Удалить',
  'common.edit': 'Изменить', 'common.add': 'Добавить', 'common.send': 'Отправить', 'common.close': 'Закрыть', 'common.search_ph': 'Поиск…',
  'common.level': 'Уровень', 'common.duration': 'Длительность', 'common.format': 'Формат', 'common.category': 'Категория', 'common.back': 'Назад',
  'common.views': 'просмотров', 'common.share': 'Скопировать ссылку', 'common.copied': 'Ссылка скопирована',
  'courses.title': 'Курсы', 'courses.sub': 'Ищите по категории, уровню и ключевому слову.', 'courses.enroll': 'Записаться на курс',
  'courses.enrolled': 'Вы записаны на курс', 'courses.login_needed': 'Войдите, чтобы записаться на курс', 'courses.related': 'Курсы этой категории',
  'projects.title': 'Проекты', 'projects.sub': 'Практические работы и примеры портфолио.', 'projects.tech': 'Технологии',
  'news.title': 'Новости и статьи', 'news.sub': 'Новости платформы, полезные статьи и объявления.',
  'events.title': 'События', 'events.sub': 'Смотрите ближайшие события и бронируйте место.', 'events.register': 'Зарегистрироваться',
  'events.seats': 'свободных мест', 'events.full': 'Места закончились', 'events.done': 'Событие завершено', 'events.name': 'Имя и фамилия',
  'events.email': 'Email', 'events.phone': 'Телефон (необязательно)', 'events.upcoming': 'Ближайшие события', 'events.past': 'Прошедшие события',
  'events.success': 'Вы зарегистрированы. До встречи на событии!',
  'gallery.title': 'Галерея', 'gallery.sub': 'Кадры с занятий, событий и из жизни команды.',
  'contact.title': 'Свяжитесь с нами', 'contact.sub': 'Напишите вопрос или предложение — сообщение получат администраторы.',
  'contact.name': 'Ваше имя', 'contact.email': 'Email', 'contact.subject': 'Тема', 'contact.message': 'Сообщение', 'contact.sent': 'Сообщение отправлено. Спасибо!',
  'contact.ref': 'Официальную информацию смотрите на официальном сайте организации:',
  'auth.login_t': 'Вход в систему', 'auth.register_t': 'Регистрация', 'auth.email': 'Email', 'auth.password': 'Пароль', 'auth.fullname': 'Имя и фамилия',
  'auth.login_id': 'Логин или email',
  'auth.no_account': 'Нет аккаунта?', 'auth.have_account': 'Уже есть аккаунт?', 'auth.welcome': 'Добро пожаловать!',
  'profile.title': 'Мой профиль', 'profile.my_courses': 'Мои курсы', 'profile.my_events': 'Мои регистрации на события', 'profile.phone': 'Телефон',
  'student.welcome': 'Кабинет ученика', 'student.subtitle': 'Продолжайте обучение, следите за событиями и двигайтесь к новым целям.',
  'student.local_time': 'Местное время', 'student.my_courses': 'Мои занятия', 'student.my_events': 'Мои события', 'student.next_step': 'Следующий шаг', 'student.find_course': 'Найти новый курс',
  'profile.bio': 'О себе', 'profile.new_password': 'Новый пароль (если хотите сменить)', 'profile.saved': 'Профиль сохранён', 'profile.none': 'Пока нет',
  'about.title': 'О нас', 'about.sub': 'Цели платформы и команда.',
  'about.mission_t': 'Миссия', 'about.mission_d': 'Делать современные знания и технологии простыми, открытыми и доступными, давая каждому ученику возможность получить практический опыт.',
  'about.values_t': 'Принципы', 'about.team_t': 'Команда', 'about.org_t': 'Организация', 'about.directions': 'Направления обучения',
  'about.org_d': 'Официальная информация об организации — структура, руководство и контакты — публикуется в официальном источнике.',
  'about.demo': 'Внимание: контент сайта пока добавлен как пример и будет заменён реальными данными через панель управления.',
  'about.v1t': 'Открытость', 'about.v1d': 'Курсы и новости понятны и легко находятся для всех.',
  'about.v2t': 'Практика', 'about.v2d': 'Опыт работы над реальными проектами в каждом направлении.',
  'about.v3t': 'Технологии', 'about.v3d': 'Обучение с современными инструментами и искусственным интеллектом.',
  'footer.rights': 'Все права защищены.', 'footer.nav': 'Разделы', 'footer.ref': 'Официальный сайт',
  'chat.title': 'Kelajak AI', 'chat.ph': 'Напишите вопрос…', 'chat.hello': 'Здравствуйте! Я ИИ-помощник Kelajak. Спросите про курсы, события или сайт.',
  'chat.s1': 'С какого курса начать?', 'chat.s2': 'Какие ближайшие события?', 'chat.s3': 'Как зарегистрироваться?', 'chat.err': 'Не удалось получить ответ. Попробуйте позже.',
  'search.title': 'Глобальный поиск', 'search.none': 'Ничего не найдено', 'search.hint': 'Введите минимум 2 символа',
  'notif.title': 'Уведомления', 'notif.none': 'Новых уведомлений нет', 'intro.skip': 'Пропустить',
}

const en: Dict = {
  'nav.home': 'Home', 'nav.about': 'About', 'nav.courses': 'Courses', 'nav.projects': 'Projects', 'nav.news': 'News', 'nav.events': 'Events',
  'nav.gallery': 'Gallery', 'nav.contact': 'Contact', 'nav.login': 'Log in', 'nav.register': 'Sign up', 'nav.profile': 'Profile',
  'nav.logout': 'Log out', 'nav.admin': 'Dashboard', 'nav.search': 'Search', 'nav.notifications': 'Notifications',
  'hero.title': 'Learn and build the future today', 'hero.sub': 'Courses, hands-on projects, events and an AI assistant — all on one platform.',
  'hero.cta1': 'Browse courses', 'hero.cta2': 'Join an event', 'hero.search': 'Search a course, article or event…',
  'stat.courses': 'courses', 'stat.projects': 'projects', 'stat.articles': 'articles', 'stat.events': 'events', 'stat.members': 'users',
  'home.courses': 'Courses', 'home.courses_sub': 'Pick a track and start learning',
  'home.services': 'Our services', 'home.services_sub': 'Everything you need to learn, practice and grow in one place.',
  'home.service_courses_t': 'Career courses', 'home.service_courses_d': 'Learn programming, AI, design and more through structured courses.',
  'home.service_projects_t': 'Hands-on projects', 'home.service_projects_d': 'Turn your knowledge into practical work and build a portfolio.',
  'home.service_events_t': 'Events and seminars', 'home.service_events_d': 'Join seminars, meetups and hackathons to learn and connect.',
  'home.service_help_t': 'Guidance and contact', 'home.service_help_d': 'Contact our team or ask Kelajak AI for help finding your way.',
  'home.why': 'What the platform offers', 'home.f1t': 'Flexible formats', 'home.f1d': 'Courses online, offline or blended — choose what suits you.',
  'home.f2t': 'Hands-on projects', 'home.f2d': 'Reinforce theory with projects and build your portfolio.',
  'home.f3t': 'Kelajak AI assistant', 'home.f3d': 'Ask a question: the assistant explains courses and points you to the right page.',
  'home.news': 'Latest news', 'home.events': 'Upcoming events', 'home.projects': 'Projects',
  'home.cta_t': 'Take the first step now', 'home.cta_d': 'Sign up, enroll in a course and track your progress in your profile.',
  'common.more': 'Details', 'common.all': 'All', 'common.loading': 'Loading…', 'common.empty': 'Nothing found yet.',
  'common.error': 'Something went wrong. Please try again.', 'common.save': 'Save', 'common.cancel': 'Cancel', 'common.delete': 'Delete',
  'common.edit': 'Edit', 'common.add': 'Add', 'common.send': 'Send', 'common.close': 'Close', 'common.search_ph': 'Search…',
  'common.level': 'Level', 'common.duration': 'Duration', 'common.format': 'Format', 'common.category': 'Category', 'common.back': 'Back',
  'common.views': 'views', 'common.share': 'Copy link', 'common.copied': 'Link copied',
  'courses.title': 'Courses', 'courses.sub': 'Search by category, level and keyword.', 'courses.enroll': 'Enroll in course',
  'courses.enrolled': 'You are enrolled', 'courses.login_needed': 'Log in to enroll in a course', 'courses.related': 'Courses in this category',
  'projects.title': 'Projects', 'projects.sub': 'Practical work and portfolio examples.', 'projects.tech': 'Technologies',
  'news.title': 'News and articles', 'news.sub': 'Platform news, useful articles and announcements.',
  'events.title': 'Events', 'events.sub': 'See upcoming events and reserve your seat.', 'events.register': 'Register',
  'events.seats': 'seats left', 'events.full': 'No seats left', 'events.done': 'Event has ended', 'events.name': 'Full name',
  'events.email': 'Email', 'events.phone': 'Phone (optional)', 'events.upcoming': 'Upcoming events', 'events.past': 'Past events',
  'events.success': 'You are registered. See you at the event!',
  'gallery.title': 'Gallery', 'gallery.sub': 'Moments from classes, events and the team.',
  'contact.title': 'Get in touch', 'contact.sub': 'Send a question or suggestion — your message goes to the administrators.',
  'contact.name': 'Your name', 'contact.email': 'Email', 'contact.subject': 'Subject', 'contact.message': 'Message', 'contact.sent': 'Message sent. Thank you!',
  'contact.ref': 'For official information, see the organization’s official website:',
  'auth.login_t': 'Log in', 'auth.register_t': 'Create account', 'auth.email': 'Email', 'auth.password': 'Password', 'auth.fullname': 'Full name',
  'auth.login_id': 'Username or email',
  'auth.no_account': 'No account yet?', 'auth.have_account': 'Already have an account?', 'auth.welcome': 'Welcome!',
  'profile.title': 'My profile', 'profile.my_courses': 'My courses', 'profile.my_events': 'My event registrations', 'profile.phone': 'Phone',
  'student.welcome': 'Student dashboard', 'student.subtitle': 'Continue learning, keep up with your events and take the next step toward your goals.',
  'student.local_time': 'Local time', 'student.my_courses': 'My lessons', 'student.my_events': 'My events', 'student.next_step': 'Next step', 'student.find_course': 'Find a course',
  'profile.bio': 'About you', 'profile.new_password': 'New password (leave empty to keep current)', 'profile.saved': 'Profile saved', 'profile.none': 'None yet',
  'about.title': 'About us', 'about.sub': 'The platform’s goals and team.',
  'about.mission_t': 'Mission', 'about.mission_d': 'To make modern knowledge and technology simple, open and accessible, giving every learner the chance to gain practical experience.',
  'about.values_t': 'Principles', 'about.team_t': 'Team', 'about.org_t': 'Organization', 'about.directions': 'Learning tracks',
  'about.org_d': 'Official information about the organization — structure, leadership and contacts — is published at its official source.',
  'about.demo': 'Note: site content is currently sample data and will be replaced with real information via the dashboard.',
  'about.v1t': 'Openness', 'about.v1d': 'Courses and news are clear and easy to find for everyone.',
  'about.v2t': 'Practice', 'about.v2d': 'Real project experience in every track.',
  'about.v3t': 'Technology', 'about.v3d': 'Learning with modern tools and artificial intelligence.',
  'footer.rights': 'All rights reserved.', 'footer.nav': 'Sections', 'footer.ref': 'Official website',
  'chat.title': 'Kelajak AI', 'chat.ph': 'Type your question…', 'chat.hello': 'Hi! I am the Kelajak AI assistant. Ask about courses, events or the site.',
  'chat.s1': 'Which course should I start with?', 'chat.s2': 'What events are coming up?', 'chat.s3': 'How do I sign up?', 'chat.err': 'Could not get a reply. Please try later.',
  'search.title': 'Global search', 'search.none': 'Nothing found', 'search.hint': 'Type at least 2 characters',
  'notif.title': 'Notifications', 'notif.none': 'No new notifications', 'intro.skip': 'Skip',
}

const dicts: Record<Lang, Dict> = { uz, ru, en }
const LOCALES: Record<Lang, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' }

interface Ctx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  /** Kontent maydonini tanlangan tilda qaytaradi (tarjima bo‘lmasa — asl matn). */
  loc: (item: any, field: string) => string
  date: (iso: string, withTime?: boolean) => string
}

const I18nContext = createContext<Ctx>(null as unknown as Ctx)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('kelajak_lang') as Lang | null
    return saved && LANGS.includes(saved) ? saved : 'uz'
  })
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const setLang = useCallback((l: Lang) => { localStorage.setItem('kelajak_lang', l); setLangState(l) }, [])
  const value = useMemo<Ctx>(() => ({
    lang, setLang,
    t: (key) => dicts[lang][key] ?? uz[key] ?? key,
    loc: (item, field) => item?.translations?.[lang]?.[field] || item?.[field] || '',
    date: (iso, withTime) => new Date(iso).toLocaleString(LOCALES[lang], withTime
      ? { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'long', year: 'numeric' }),
  }), [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

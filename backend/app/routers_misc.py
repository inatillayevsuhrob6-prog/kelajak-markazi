"""Aloqa, qidiruv, statistika, bildirishnomalar, analitika va Groq AI chat."""
import time
from collections import defaultdict, deque
from datetime import timedelta
from typing import List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from . import config
from .database import get_db
from .models import (Article, ContactMessage, Course, Event, GalleryItem, Notification, PageView, Project,
                     Registration, User, now)
from .security import staff_user
from .uploads import save_image, save_video
from .utils import to_dict

router = APIRouter(prefix="/api", tags=["misc"])


@router.post("/admin/images", status_code=201)
async def upload_content_image(request: Request, _: User = Depends(staff_user)):
    return {"url": await save_image(request)}


@router.post("/admin/videos", status_code=201)
async def upload_course_video(request: Request, _: User = Depends(staff_user)):
    return {"url": await save_video(request)}


# ---------- Aloqa ----------
class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    subject: str = ""
    message: str = Field(min_length=5, max_length=5000)


@router.post("/contact", status_code=201)
def send_contact(data: ContactIn, db: Session = Depends(get_db)):
    db.add(ContactMessage(name=data.name.strip(), email=data.email.lower(), subject=data.subject, message=data.message))
    db.commit()
    return {"ok": True}


@router.get("/admin/messages")
def list_messages(_: User = Depends(staff_user), db: Session = Depends(get_db)):
    items = db.query(ContactMessage).order_by(ContactMessage.id.desc()).all()
    return {"items": [to_dict(m) for m in items]}


@router.put("/admin/messages/{mid}")
def mark_message(mid: int, data: dict, _: User = Depends(staff_user), db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, mid)
    if not msg:
        raise HTTPException(404, "Xabar topilmadi")
    msg.is_read = bool(data.get("is_read", True))
    db.commit()
    return to_dict(msg)


@router.delete("/admin/messages/{mid}")
def delete_message(mid: int, _: User = Depends(staff_user), db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, mid)
    if msg:
        db.delete(msg)
        db.commit()
    return {"ok": True}


# ---------- Global qidiruv ----------
@router.get("/search")
def search(q: str = "", db: Session = Depends(get_db)):
    q = q.strip()
    if len(q) < 2:
        return {"items": []}
    like = f"%{q}%"
    out = []
    for c in db.query(Course).filter(Course.is_published.is_(True), or_(Course.title.ilike(like), Course.summary.ilike(like), Course.category.ilike(like))).limit(6):
        out.append({"kind": "course", "title": c.title, "summary": c.summary, "url": f"/courses/{c.slug}"})
    for a in db.query(Article).filter(Article.is_published.is_(True), or_(Article.title.ilike(like), Article.summary.ilike(like))).limit(6):
        out.append({"kind": "article", "title": a.title, "summary": a.summary, "url": f"/news/{a.slug}"})
    for e in db.query(Event).filter(Event.is_published.is_(True), or_(Event.title.ilike(like), Event.summary.ilike(like))).limit(6):
        out.append({"kind": "event", "title": e.title, "summary": e.summary, "url": "/events"})
    for p in db.query(Project).filter(Project.is_published.is_(True), or_(Project.title.ilike(like), Project.summary.ilike(like), Project.tech.ilike(like))).limit(6):
        out.append({"kind": "project", "title": p.title, "summary": p.summary, "url": "/projects"})
    return {"items": out}


# ---------- Statistika va bildirishnomalar ----------
@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    """Bosh sahifa uchun statistika — faqat bazadagi haqiqiy sanoqlar."""
    return {
        "courses": db.query(Course).filter(Course.is_published.is_(True)).count(),
        "projects": db.query(Project).filter(Project.is_published.is_(True)).count(),
        "articles": db.query(Article).filter(Article.is_published.is_(True)).count(),
        "events": db.query(Event).filter(Event.is_published.is_(True)).count(),
        "members": db.query(User).filter(User.role == "user", User.is_active.is_(True)).count(),
    }


@router.get("/notifications")
def notifications(db: Session = Depends(get_db)):
    items = db.query(Notification).order_by(Notification.id.desc()).limit(15).all()
    return {"items": [to_dict(n) for n in items]}


@router.delete("/admin/notifications/{nid}")
def delete_notification(nid: int, _: User = Depends(staff_user), db: Session = Depends(get_db)):
    n = db.get(Notification, nid)
    if n:
        db.delete(n)
        db.commit()
    return {"ok": True}


@router.post("/admin/notifications", status_code=201)
def create_notification(data: dict, _: User = Depends(staff_user), db: Session = Depends(get_db)):
    title = (data.get("title") or "").strip()
    if not title:
        raise HTTPException(422, "Sarlavha kiritilishi shart")
    n = Notification(title=title, body=data.get("body", ""), link=data.get("link", ""))
    db.add(n)
    db.commit()
    db.refresh(n)
    return to_dict(n)


# ---------- Analitika ----------
class TrackIn(BaseModel):
    path: str = Field(max_length=255)


@router.post("/track", status_code=204)
def track(data: TrackIn, db: Session = Depends(get_db)):
    if not data.path.startswith("/admin"):
        db.add(PageView(path=data.path))
        db.commit()


@router.get("/admin/analytics")
def analytics(days: int = 14, _: User = Depends(staff_user), db: Session = Depends(get_db)):
    days = max(1, min(days, 90))
    since = now() - timedelta(days=days - 1)
    since = since.replace(hour=0, minute=0, second=0, microsecond=0)
    rows = db.query(func.date(PageView.created_at), func.count()).filter(PageView.created_at >= since).group_by(func.date(PageView.created_at)).all()
    per_day = {str(d): c for d, c in rows}
    series = []
    for i in range(days):
        d = (since + timedelta(days=i)).date().isoformat()
        series.append({"date": d, "views": per_day.get(d, 0)})
    top = db.query(PageView.path, func.count().label("c")).group_by(PageView.path).order_by(func.count().desc()).limit(8).all()
    reg_rows = db.query(Event.title, func.count(Registration.id)).outerjoin(Registration).group_by(Event.id).order_by(Event.id).all()
    cat_rows = db.query(Course.category, func.count()).group_by(Course.category).all()
    top_articles = db.query(Article.title, Article.views).order_by(Article.views.desc()).limit(5).all()
    return {
        "totals": {
            "views": db.query(PageView).count(),
            "users": db.query(User).count(),
            "registrations": db.query(Registration).count(),
            "messages": db.query(ContactMessage).count(),
            "unread": db.query(ContactMessage).filter(ContactMessage.is_read.is_(False)).count(),
            "courses": db.query(Course).count(),
            "articles": db.query(Article).count(),
            "events": db.query(Event).count(),
            "projects": db.query(Project).count(),
            "gallery": db.query(GalleryItem).count(),
        },
        "series": series,
        "top_pages": [{"path": p, "views": c} for p, c in top],
        "event_registrations": [{"title": t, "count": c} for t, c in reg_rows],
        "courses_by_category": [{"name": n or "Boshqa", "value": c} for n, c in cat_rows],
        "top_articles": [{"title": t, "views": v or 0} for t, v in top_articles],
    }


# ---------- Groq AI chat ----------
class ChatMsg(BaseModel):
    role: str
    content: str = Field(max_length=4000)


class ChatIn(BaseModel):
    messages: List[ChatMsg] = Field(min_length=1, max_length=20)
    lang: str = "uz"


_hits = defaultdict(deque)


def _rate_limit(ip: str, limit: int = 20, window: int = 60):
    q = _hits[ip]
    t = time.time()
    while q and t - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, "Juda koʻp soʻrov. Biroz kutib, qayta urinib koʻring.")
    q.append(t)


def _system_prompt(db: Session, lang: str) -> str:
    courses = db.query(Course).filter(Course.is_published.is_(True)).limit(30).all()
    events = db.query(Event).filter(Event.is_published.is_(True), Event.starts_at >= now()).order_by(Event.starts_at).limit(10).all()
    course_lines = "\n".join(f"- {c.title} ({c.category}, {c.level}, {c.duration}, {c.format}): {c.summary}" for c in courses) or "- hozircha kurslar yoʻq"
    event_lines = "\n".join(f"- {e.title} — {e.starts_at:%Y-%m-%d %H:%M}, {e.location}" for e in events) or "- yaqin tadbirlar yoʻq"
    reply_lang = {"uz": "oʻzbek", "ru": "rus", "en": "ingliz"}.get(lang, "oʻzbek")
    return (
        "Sen 'Kelajak AI' — Kelajak markazi veb-platformasining yordamchisisan. "
        f"Foydalanuvchi bilan asosan {reply_lang} tilida, aniq, samimiy va qisqa muloqot qil. "
        "Vazifang: taʼlim savollariga javob berish, kurslarni tushuntirish va saytda yoʻl koʻrsatish. "
        "Markaz haqida rasmiy maʼlumotni (manzil, narx, telefon, rahbariyat, sanalar) oʻylab topma; bilmasang, "
        "buni ochiq ayt va foydalanuvchini 'Aloqa' sahifasiga yoʻnalt.\n\n"
        "Sayt sahifalari: / (bosh sahifa), /about (biz haqimizda), /courses (kurslar), /projects (loyihalar), "
        "/news (yangiliklar), /events (tadbirlar), /gallery (galereya), /contact (aloqa), /login, /register, /profile.\n\n"
        f"Platformadagi kurslar:\n{course_lines}\n\nYaqin tadbirlar:\n{event_lines}"
    )


@router.post("/chat")
def chat(data: ChatIn, request: Request, db: Session = Depends(get_db)):
    _rate_limit(request.client.host if request.client else "anon")
    if not config.GROQ_API_KEY:
        return {"reply": "AI yordamchi hozircha sozlanmagan: serverda GROQ_API_KEY kiritilmagan. Administrator .env faylini toʻldirishi kerak.", "configured": False}
    history = [{"role": m.role, "content": m.content} for m in data.messages[-10:] if m.role in ("user", "assistant")]
    payload = {
        "model": config.GROQ_MODEL,
        "messages": [{"role": "system", "content": _system_prompt(db, data.lang)}, *history],
        "temperature": 0.5,
        "max_tokens": 700,
    }
    try:
        res = httpx.post("https://api.groq.com/openai/v1/chat/completions", json=payload,
                         headers={"Authorization": f"Bearer {config.GROQ_API_KEY}"}, timeout=30)
        res.raise_for_status()
        response_data = res.json()
        choices = response_data.get("choices")
        message = choices[0].get("message") if isinstance(choices, list) and choices and isinstance(choices[0], dict) else None
        reply = message.get("content") if isinstance(message, dict) else None
        if not isinstance(reply, str) or not reply.strip():
            raise HTTPException(502, "AI xizmati boʻsh yoki notoʻgʻri javob qaytardi.")
        return {"reply": reply, "configured": True}
    except httpx.HTTPStatusError as exc:
        detail = ""
        try:
            error = exc.response.json().get("error", {})
            detail = error.get("message", "") if isinstance(error, dict) else ""
        except ValueError:
            pass
        message = f"AI xizmati xato qaytardi ({exc.response.status_code})"
        if detail:
            message += f": {detail[:300]}"
        raise HTTPException(502, message) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(504, "AI xizmati vaqtida javob bermadi. Qayta urinib koʻring.") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(502, "AI xizmati bilan bogʻlanib boʻlmadi. Server internetini tekshiring.") from exc
    except ValueError as exc:
        raise HTTPException(502, "AI xizmati notoʻgʻri javob qaytardi.") from exc

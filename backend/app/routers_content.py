"""Kontent resurslari uchun umumiy CRUD va maxsus (tadbir/kurs) amallar."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .database import get_db
from .models import (Article, Course, Enrollment, Event, GalleryItem, Notification, Project,
                     Registration, TeamMember, User)
from .security import STAFF, current_user, optional_user, staff_user
from .utils import clean_payload, to_dict, unique_slug

router = APIRouter()


def make_crud(prefix: str, Model, search=("title",), notify_label: Optional[str] = None, notify_link: str = "", order=None):
    r = APIRouter(prefix=f"/api/{prefix}", tags=[prefix])
    has_slug = hasattr(Model, "slug")
    published = hasattr(Model, "is_published")

    @r.get("")
    def list_items(q: str = "", category: str = "", limit: int = Query(200, le=500), offset: int = 0,
                   include_all: bool = Query(False, alias="all"), db: Session = Depends(get_db),
                   user: Optional[User] = Depends(optional_user)):
        query = db.query(Model)
        if published and not (include_all and user and user.role in STAFF):
            query = query.filter(Model.is_published.is_(True))
        if q:
            query = query.filter(or_(*[getattr(Model, f).ilike(f"%{q}%") for f in search]))
        if category and hasattr(Model, "category"):
            query = query.filter(Model.category == category)
        total = query.count()
        items = query.order_by(order if order is not None else Model.id.desc()).offset(offset).limit(limit).all()
        return {"total": total, "items": [to_dict(i) for i in items]}

    @r.get("/{ident}")
    def get_item(ident: str, db: Session = Depends(get_db)):
        obj = db.get(Model, int(ident)) if ident.isdigit() else (db.query(Model).filter(Model.slug == ident).first() if has_slug else None)
        if not obj or (published and not obj.is_published):
            raise HTTPException(404, "Topilmadi")
        if hasattr(obj, "views"):
            obj.views = (obj.views or 0) + 1
            db.commit()
        return to_dict(obj)

    @r.post("", status_code=201)
    def create_item(data: dict, _: User = Depends(staff_user), db: Session = Depends(get_db)):
        fields = clean_payload(Model, data)
        if has_slug:
            fields["slug"] = unique_slug(db, Model, fields.get("slug") or fields.get("title", ""))
        obj = Model(**fields)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        if notify_label and getattr(obj, "is_published", True):
            db.add(Notification(title=f"{notify_label}: {obj.title}", body=getattr(obj, "summary", "") or "", link=notify_link))
            db.commit()
        return to_dict(obj)

    @r.put("/{oid}")
    def update_item(oid: int, data: dict, _: User = Depends(staff_user), db: Session = Depends(get_db)):
        obj = db.get(Model, oid)
        if not obj:
            raise HTTPException(404, "Topilmadi")
        fields = clean_payload(Model, data)
        if has_slug and "slug" in fields:
            fields["slug"] = unique_slug(db, Model, fields["slug"] or obj.title, exclude_id=oid)
        for k, v in fields.items():
            setattr(obj, k, v)
        db.commit()
        db.refresh(obj)
        return to_dict(obj)

    @r.delete("/{oid}")
    def delete_item(oid: int, _: User = Depends(staff_user), db: Session = Depends(get_db)):
        obj = db.get(Model, oid)
        if not obj:
            raise HTTPException(404, "Topilmadi")
        db.delete(obj)
        db.commit()
        return {"ok": True}

    return r


# Maxsus yo‘llar umumiy "/{ident}" yo‘lidan oldin ro‘yxatdan o‘tishi kerak
extra = APIRouter(tags=["extra"])


class RegisterEventIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: str = ""


@extra.post("/api/events/{eid}/register", status_code=201)
def register_event(eid: int, data: RegisterEventIn, db: Session = Depends(get_db), user: Optional[User] = Depends(optional_user)):
    ev = db.get(Event, eid)
    if not ev or not ev.is_published:
        raise HTTPException(404, "Tadbir topilmadi")
    if len(ev.registrations) >= (ev.capacity or 0):
        raise HTTPException(409, "Afsuski, joylar tugagan")
    email = data.email.lower()
    if db.query(Registration).filter(Registration.event_id == eid, Registration.email == email).first():
        raise HTTPException(409, "Bu email allaqachon roʻyxatdan oʻtgan")
    reg = Registration(event_id=eid, user_id=user.id if user else None, full_name=data.full_name.strip(), email=email, phone=data.phone)
    db.add(reg)
    db.commit()
    return {"ok": True, "left": max(0, ev.capacity - len(ev.registrations))}


@extra.get("/api/events/{eid}/registrations")
def event_registrations(eid: int, _: User = Depends(staff_user), db: Session = Depends(get_db)):
    regs = db.query(Registration).filter(Registration.event_id == eid).order_by(Registration.id.desc()).all()
    return {"items": [to_dict(r) for r in regs]}


@extra.post("/api/courses/{cid}/enroll", status_code=201)
def enroll(cid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    course = db.get(Course, cid)
    if not course or not course.is_published:
        raise HTTPException(404, "Kurs topilmadi")
    if db.query(Enrollment).filter(Enrollment.user_id == user.id, Enrollment.course_id == cid).first():
        raise HTTPException(409, "Siz bu kursga allaqachon yozilgansiz")
    db.add(Enrollment(user_id=user.id, course_id=cid))
    db.commit()
    return {"ok": True}


@extra.get("/api/events-meta/seats")
def seats(db: Session = Depends(get_db)):
    """Har bir tadbir bo‘yicha band joylar soni."""
    return {e.id: len(e.registrations) for e in db.query(Event).all()}


router.include_router(extra)
router.include_router(make_crud("courses", Course, ("title", "summary", "category"), "Yangi kurs", "/courses"))
router.include_router(make_crud("projects", Project, ("title", "summary", "tech"), None, "", Project.year.desc()))
router.include_router(make_crud("articles", Article, ("title", "summary", "content"), "Yangi maqola", "/news"))
router.include_router(make_crud("events", Event, ("title", "summary", "location"), "Yangi tadbir", "/events", Event.starts_at.asc()))
router.include_router(make_crud("gallery", GalleryItem, ("title", "caption", "category")))
router.include_router(make_crud("team", TeamMember, ("full_name", "position"), None, "", TeamMember.sort_order.asc()))

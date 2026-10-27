"""Autentifikatsiya, profil va foydalanuvchilarni boshqarish."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from .database import get_db
from .models import Enrollment, Registration, User
from .security import admin_user, create_token, current_user, hash_password, verify_password
from .uploads import save_image
from .utils import to_dict

router = APIRouter(prefix="/api", tags=["auth"])


class RegisterIn(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: str = Field(min_length=1, max_length=255)
    password: str


class ProfileIn(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=6, max_length=128)


def public_user(u: User) -> dict:
    return to_dict(u, exclude=("hashed_password",))


@router.get("/admin/contact")
def admin_contact(db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.role == "admin", User.is_active.is_(True)).order_by(User.id.asc()).first()
    if not admin:
        raise HTTPException(404, "Administrator topilmadi")
    return {
        "full_name": admin.full_name,
        "email": admin.email,
        "phone": admin.phone,
        "bio": admin.bio,
        "profile_image": admin.profile_image,
    }


@router.post("/me/avatar")
async def upload_avatar(request: Request, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if user.role not in ("admin", "user"):
        raise HTTPException(403, "Profil rasmi faqat administrator va oʻquvchilar uchun")
    user.profile_image = await save_image(request)
    db.commit()
    db.refresh(user)
    return public_user(user)


@router.post("/auth/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "Bu email bilan foydalanuvchi allaqachon mavjud")
    user = User(email=email, full_name=data.full_name.strip(), hashed_password=hash_password(data.password), role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_token(user), "user": public_user(user)}


@router.post("/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    if email == "admin":
        user = db.query(User).filter(User.role == "admin").order_by(User.id.asc()).first()
    else:
        user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Email yoki parol notoʻgʻri")
    if not user.is_active:
        raise HTTPException(403, "Hisob bloklangan")
    return {"token": create_token(user), "user": public_user(user)}


@router.get("/me")
def me(user: User = Depends(current_user)):
    return public_user(user)


@router.put("/me")
def update_me(data: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if data.full_name is not None:
        user.full_name = data.full_name.strip()
    if data.email is not None:
        email = data.email.lower()
        exists = db.query(User).filter(User.email == email, User.id != user.id).first()
        if exists:
            raise HTTPException(409, "Bu email boshqa akkauntda ishlatilmoqda")
        user.email = email
    if data.phone is not None:
        user.phone = data.phone
    if data.bio is not None:
        user.bio = data.bio
    if data.password:
        user.hashed_password = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return public_user(user)


@router.get("/me/overview")
def overview(user: User = Depends(current_user), db: Session = Depends(get_db)):
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    regs = db.query(Registration).filter(Registration.user_id == user.id).all()
    return {
        "courses": [to_dict(e.course) for e in enrollments if e.course],
        "events": [to_dict(r.event) for r in regs if r.event],
    }


# ---- Administrator: foydalanuvchilar ----
@router.get("/admin/users")
def list_users(_: User = Depends(admin_user), db: Session = Depends(get_db)):
    return {"items": [public_user(u) for u in db.query(User).order_by(User.id.desc()).all()]}


@router.put("/admin/users/{uid}")
def edit_user(uid: int, data: dict, admin: User = Depends(admin_user), db: Session = Depends(get_db)):
    user = db.get(User, uid)
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    if "role" in data and data["role"] in ("admin", "editor", "user"):
        if user.id == admin.id and data["role"] != "admin":
            raise HTTPException(400, "Oʻz rolingizni pasaytira olmaysiz")
        user.role = data["role"]
    if "is_active" in data:
        if user.id == admin.id:
            raise HTTPException(400, "Oʻzingizni bloklay olmaysiz")
        user.is_active = bool(data["is_active"])
    db.commit()
    return public_user(user)


@router.delete("/admin/users/{uid}")
def delete_user(uid: int, admin: User = Depends(admin_user), db: Session = Depends(get_db)):
    user = db.get(User, uid)
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    if user.id == admin.id:
        raise HTTPException(400, "Oʻzingizni oʻchira olmaysiz")
    db.delete(user)
    db.commit()
    return {"ok": True}

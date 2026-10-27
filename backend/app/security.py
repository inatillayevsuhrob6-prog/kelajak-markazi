"""Parol xeshlash, JWT va rollarga asoslangan kirish."""
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from . import config
from .database import get_db
from .models import User

bearer = HTTPBearer(auto_error=False)
STAFF = ("admin", "editor")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode()[:72], bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode()[:72], hashed.encode())
    except ValueError:
        return False


def create_token(user: User) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=config.ACCESS_TOKEN_HOURS)
    return jwt.encode({"sub": str(user.id), "role": user.role, "exp": exp}, config.SECRET_KEY, algorithm="HS256")


def optional_user(cred: Optional[HTTPAuthorizationCredentials] = Depends(bearer), db: Session = Depends(get_db)) -> Optional[User]:
    if not cred:
        return None
    try:
        data = jwt.decode(cred.credentials, config.SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    user = db.get(User, int(data["sub"]))
    return user if user and user.is_active else None


def current_user(user: Optional[User] = Depends(optional_user)) -> User:
    if not user:
        raise HTTPException(401, "Tizimga kirish talab qilinadi")
    return user


def staff_user(user: User = Depends(current_user)) -> User:
    if user.role not in STAFF:
        raise HTTPException(403, "Bu amal uchun ruxsat yoʻq")
    return user


def admin_user(user: User = Depends(current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(403, "Faqat administrator uchun")
    return user

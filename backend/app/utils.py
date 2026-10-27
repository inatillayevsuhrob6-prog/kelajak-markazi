"""Yordamchi funksiyalar."""
import re
import secrets
import unicodedata
from datetime import date, datetime
from sqlalchemy import Boolean, DateTime, Integer


def slugify(text: str) -> str:
    text = (text or "").lower()
    for ch in ("ʻ", "ʼ", "’", "‘", "'", "`"):
        text = text.replace(ch, "")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "element"


def unique_slug(db, Model, title: str, exclude_id=None) -> str:
    base = slugify(title)
    slug, n = base, 1
    while True:
        q = db.query(Model).filter(Model.slug == slug)
        if exclude_id:
            q = q.filter(Model.id != exclude_id)
        if not q.first():
            return slug
        n += 1
        slug = f"{base}-{n}" if n < 50 else f"{base}-{secrets.token_hex(2)}"


def to_dict(obj, exclude=()):
    out = {}
    for col in obj.__table__.columns:
        if col.name in exclude:
            continue
        val = getattr(obj, col.name)
        if isinstance(val, (datetime, date)):
            val = val.isoformat()
        out[col.name] = val
    return out


def clean_payload(Model, data: dict, extra_exclude=()) -> dict:
    """Faqat ruxsat etilgan ustunlarni olib, turlarini to‘g‘rilaydi."""
    blocked = {"id", "created_at", "views", *extra_exclude}
    cols = {c.name: c for c in Model.__table__.columns if c.name not in blocked}
    out = {}
    for key, val in (data or {}).items():
        col = cols.get(key)
        if col is None:
            continue
        if isinstance(col.type, DateTime):
            if isinstance(val, str) and val:
                val = datetime.fromisoformat(val.replace("Z", "")).replace(tzinfo=None)
            else:
                continue
        elif isinstance(col.type, Integer):
            try:
                val = int(val)
            except (TypeError, ValueError):
                continue
        elif isinstance(col.type, Boolean):
            val = bool(val)
        out[key] = val
    return out

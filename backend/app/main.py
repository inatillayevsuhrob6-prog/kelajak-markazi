"""Kelajak markazi — FastAPI ilovasi."""
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import Depends, FastAPI
from fastapi.responses import PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import config
from .database import Base, engine, get_db
from .models import Article, Course
from .routers_auth import router as auth_router
from .routers_content import router as content_router
from .routers_misc import router as misc_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)  # mavjud jadvallarga tegmaydi
    from .seed import run as seed
    seed()
    yield


app = FastAPI(title="Kelajak Markazi API", version="1.0.0", lifespan=lifespan)
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(misc_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/robots.txt", response_class=PlainTextResponse)
def robots():
    return f"User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: {config.SITE_URL}/sitemap.xml\n"


@app.get("/sitemap.xml")
def sitemap(db: Session = Depends(get_db)):
    """SEO uchun dinamik sayt xaritasi (SITE_URL .env dan olinadi)."""
    paths = ["/", "/about", "/courses", "/projects", "/news", "/events", "/gallery", "/contact"]
    paths += [f"/courses/{c.slug}" for c in db.query(Course).filter(Course.is_published.is_(True))]
    paths += [f"/news/{a.slug}" for a in db.query(Article).filter(Article.is_published.is_(True))]
    body = "".join(f"<url><loc>{config.SITE_URL}{p}</loc></url>" for p in paths)
    xml = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>'
    return Response(xml, media_type="application/xml")

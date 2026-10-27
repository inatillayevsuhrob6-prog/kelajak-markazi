"""Ma’lumotlar bazasi ulanishi. PostgreSQL ishlamasa, SQLite ga avtomatik o‘tadi."""
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from . import config

log = logging.getLogger("kelajak.db")
SQLITE_URL = "sqlite:///./kelajak.db"


def _make_engine(url: str):
    kwargs = {"connect_args": {"check_same_thread": False}} if url.startswith("sqlite") else {"pool_pre_ping": True}
    return create_engine(url, **kwargs)


def _connect():
    engine = _make_engine(config.DATABASE_URL)
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine
    except Exception as exc:  # PostgreSQL mavjud emas — SQLite zaxira varianti
        log.warning("Asosiy bazaga ulanib bo‘lmadi (%s). SQLite ishlatilmoqda.", exc.__class__.__name__)
        return _make_engine(SQLITE_URL)


engine = _connect()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

"""SQLAlchemy modellari."""
from datetime import datetime, timezone
from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # admin | editor | user
    phone = Column(String(50), default="")
    bio = Column(Text, default="")
    profile_image = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    category = Column(String(100), default="", index=True)
    level = Column(String(50), default="Boshlangʻich")
    duration = Column(String(50), default="")
    format = Column(String(50), default="Onlayn")
    summary = Column(Text, default="")
    description = Column(Text, default="")
    image = Column(String(500), default="")
    video = Column(String(500), default="")
    is_published = Column(Boolean, default=True)
    translations = Column(JSON, default=dict)
    created_at = Column(DateTime, default=now)


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="", index=True)
    summary = Column(Text, default="")
    description = Column(Text, default="")
    tech = Column(String(255), default="")
    link = Column(String(500), default="")
    image = Column(String(500), default="")
    year = Column(Integer, default=2025)
    is_published = Column(Boolean, default=True)
    translations = Column(JSON, default=dict)
    created_at = Column(DateTime, default=now)


class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    category = Column(String(100), default="Yangilik", index=True)
    summary = Column(Text, default="")
    content = Column(Text, default="")
    author = Column(String(150), default="Tahririyat")
    image = Column(String(500), default="")
    views = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    translations = Column(JSON, default=dict)
    created_at = Column(DateTime, default=now)


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Tadbir")
    summary = Column(Text, default="")
    description = Column(Text, default="")
    location = Column(String(255), default="")
    starts_at = Column(DateTime, default=now)
    capacity = Column(Integer, default=100)
    image = Column(String(500), default="")
    is_published = Column(Boolean, default=True)
    translations = Column(JSON, default=dict)
    created_at = Column(DateTime, default=now)
    registrations = relationship("Registration", cascade="all, delete-orphan", back_populates="event")


class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (UniqueConstraint("event_id", "email", name="uq_event_email"),)
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), default="")
    created_at = Column(DateTime, default=now)
    event = relationship("Event", back_populates="registrations")


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_user_course"),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=now)
    course = relationship("Course")


class GalleryItem(Base):
    __tablename__ = "gallery"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Umumiy", index=True)
    caption = Column(Text, default="")
    image = Column(String(500), default="")
    created_at = Column(DateTime, default=now)


class TeamMember(Base):
    __tablename__ = "team"
    id = Column(Integer, primary_key=True)
    full_name = Column(String(255), nullable=False)
    position = Column(String(255), default="")
    bio = Column(Text, default="")
    photo = Column(String(500), default="")
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=now)


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), default="")
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, default="")
    link = Column(String(255), default="")
    created_at = Column(DateTime, default=now)


class PageView(Base):
    __tablename__ = "page_views"
    id = Column(Integer, primary_key=True)
    path = Column(String(255), index=True)
    created_at = Column(DateTime, default=now, index=True)

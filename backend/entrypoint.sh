#!/bin/sh
# Migratsiyalarni qo‘llash, namunaviy ma’lumotlarni yuklash va serverni ishga tushirish
set -e
alembic upgrade head
python -m app.seed
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

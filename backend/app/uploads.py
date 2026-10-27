"""Validate and persist user-provided raster images."""
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, Request

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_VIDEO_SIZE = 50 * 1024 * 1024
IMAGE_SIGNATURES = (
    (b"\x89PNG\r\n\x1a\n", "png", "image/png"),
    (b"\xff\xd8\xff", "jpg", "image/jpeg"),
    (b"GIF87a", "gif", "image/gif"),
    (b"GIF89a", "gif", "image/gif"),
)


def _image_type(data: bytes, content_type: str) -> tuple[str, str] | None:
    for signature, extension, mime in IMAGE_SIGNATURES:
        if data.startswith(signature) and content_type in (mime, "application/octet-stream"):
            return extension, mime
    if (
        len(data) >= 12
        and data.startswith(b"RIFF")
        and data[8:12] == b"WEBP"
        and content_type in ("image/webp", "application/octet-stream")
    ):
        return "webp", "image/webp"
    return None


async def _save(request: Request, *, video: bool) -> str:
    max_size = MAX_VIDEO_SIZE if video else MAX_IMAGE_SIZE
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > max_size:
                limit = 50 if video else 5
                raise HTTPException(413, f"{'Video' if video else 'Rasm'} hajmi {limit} MB dan oshmasligi kerak")
        except ValueError as exc:
            raise HTTPException(400, "Rasm hajmi sarlavhasi notoʻgʻri") from exc

    chunks = []
    size = 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > max_size:
            limit = 50 if video else 5
            raise HTTPException(413, f"{'Video' if video else 'Rasm'} hajmi {limit} MB dan oshmasligi kerak")
        chunks.append(chunk)

    data = b"".join(chunks)
    content_type = request.headers.get("content-type", "").lower()
    if video:
        if content_type in ("video/mp4", "application/octet-stream") and len(data) >= 12 and data[4:8] == b"ftyp":
            extension = "mp4"
        elif content_type in ("video/webm", "application/octet-stream") and data.startswith(b"\x1a\x45\xdf\xa3"):
            extension = "webm"
        else:
            raise HTTPException(415, "MP4 yoki WEBM video yuklang")
    else:
        image_type = _image_type(data, content_type)
        if not image_type:
            raise HTTPException(415, "PNG, JPG, WEBP yoki GIF rasm yuklang")
        extension, _ = image_type

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}.{extension}"
    (UPLOAD_DIR / filename).write_bytes(data)
    return f"/uploads/{filename}"


async def save_image(request: Request) -> str:
    return await _save(request, video=False)


async def save_video(request: Request) -> str:
    return await _save(request, video=True)


import asyncio
import logging
import os
import tempfile
import threading

import whisper
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

import models
from auth import get_current_user

logger = logging.getLogger("uvicorn.error")
router = APIRouter(tags=["transcribe"])

MAX_AUDIO_BYTES = 5 * 1024 * 1024  # 5 MB

_whisper_model = None
_model_lock = threading.Lock()


def _get_local_model():
    global _whisper_model

    if _whisper_model is None:
        with _model_lock:
            if _whisper_model is None:
                logger.info("Loading local Whisper base model...")
                _whisper_model = whisper.load_model("base")
                logger.info("Local Whisper model loaded successfully.")

    return _whisper_model


def _transcribe_local_file(file_path: str) -> str:
    model = _get_local_model()
    result = model.transcribe(file_path)
    return (result.get("text") or "").strip()


async def _transcribe(file: UploadFile) -> dict:
    audio = await file.read()

    if not audio:
        raise HTTPException(status_code=400, detail="Empty audio file")

    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=400, detail="Audio file is too large")

    content_type = (file.content_type or "").lower()
    suffix = ".mp4" if "mp4" in content_type else ".webm"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=suffix, delete=False
        ) as temp_file:
            temp_file.write(audio)
            temp_path = temp_file.name

        text = await asyncio.to_thread(
            _transcribe_local_file, temp_path
        )

        logger.info("Local Whisper transcribed %d characters", len(text))
        return {"text": text}

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("Local Whisper transcription failed")
        raise HTTPException(
            status_code=500,
            detail="Local voice transcription failed. Check backend logs.",
        ) from exc

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/chat/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    return await _transcribe(file)


@router.post("/chat/public/transcribe")
async def transcribe_public_audio(file: UploadFile = File(...)):
    return await _transcribe(file)

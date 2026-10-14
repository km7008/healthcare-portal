import logging
import os

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

import models
from auth import get_current_user

load_dotenv()  

logger = logging.getLogger("uvicorn.error")

router = APIRouter(tags=["transcribe"])

HF_ASR_MODELS = [
    "openai/whisper-large-v3-turbo",
    "openai/whisper-large-v3",
]
HF_ASR_BASE = "https://router.huggingface.co/hf-inference/models/"

MAX_AUDIO_BYTES = 5 * 1024 * 1024  # 5 MB


def _get_token() -> str:
    for name in (
        "HF_TOKEN",
        "HF_API_TOKEN",
        "HUGGINGFACE_TOKEN",
        "HUGGINGFACEHUB_API_TOKEN",
    ):
        value = os.getenv(name, "").strip()

        if value:
            return value

    return ""


async def _transcribe(file: UploadFile) -> dict:
    token = _get_token()

    if not token:
        similar = [
            k
            for k in os.environ
            if "HF" in k.upper() or "HUGGING" in k.upper()
        ]

        logger.error(
            "Voice: no Hugging Face token found. Add HF_TOKEN=hf_xxx to "
            "backend/.env and restart the backend. "
            "Similar variable names found: %s",
            similar or "none",
        )
        raise HTTPException(
            status_code=500,
            detail="Voice transcription is not configured (HF_TOKEN missing)",
        )

    audio = await file.read()

    if not audio:
        raise HTTPException(status_code=400, detail="Empty audio file")

    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=400, detail="Audio file is too large")

    content_type = (file.content_type or "audio/webm").split(";")[0]

    last_status = None

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(90.0, connect=10.0)
    ) as client:
        for model in HF_ASR_MODELS:
            try:
                response = await client.post(
                    HF_ASR_BASE + model,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": content_type,
                        "x-wait-for-model": "true",
                    },
                    content=audio,
                )
            except httpx.HTTPError as exc:
                logger.warning("Voice: %s request failed: %r", model, exc)
                continue

            last_status = response.status_code

            if response.status_code == 200:
                try:
                    data = response.json()
                except ValueError:
                    logger.warning(
                        "Voice: %s returned a non-JSON answer", model
                    )
                    continue

                text = ""

                if isinstance(data, dict):
                    text = (data.get("text") or "").strip()

                logger.info("Voice: %s understood %d characters", model, len(text))

                return {"text": text}

            logger.warning(
                "Voice: %s -> HTTP %s %s",
                model,
                response.status_code,
                response.text[:300],
            )

    raise HTTPException(
        status_code=502,
        detail=f"Transcription failed (Hugging Face status {last_status})",
    )


@router.post("/chat/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    return await _transcribe(file)



@router.post("/chat/public/transcribe")
async def transcribe_public_audio(file: UploadFile = File(...)):
    return await _transcribe(file)
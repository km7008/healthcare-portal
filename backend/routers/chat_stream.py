"""
routers/chat_stream.py  -  fast chat answers with SSE (Server-Sent Events)

Instead of: start job -> poll /status every 500 ms,
the browser sends ONE request and the server pushes the answer the moment
it is ready. chat.py is NOT changed; this file only calls its functions.

    POST /chat/stream           dashboard chatbot (logged-in user)
    POST /chat/public/stream    login page / home page chatbot (no login)

The old /chat/start and /chat/status routes stay as a fallback.
"""

import asyncio
import json

from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse

from database import SessionLocal
import models
import schemas
from auth import get_current_user
from routers.chat import ask_chat, process_public_chat

router = APIRouter(tags=["chat-stream"])


def sse_response(work):
    """Runs work() in a thread and streams its result as one SSE event."""

    async def event_stream():
        task = asyncio.ensure_future(run_in_threadpool(work))

        # opens the stream immediately
        yield ": connected\n\n"

        # keep-alive ping while the AI is still thinking
        while not task.done():
            await asyncio.wait({task}, timeout=10)

            if not task.done():
                yield ": ping\n\n"

        try:
            data = task.result()
            yield f"event: result\ndata: {json.dumps(data)}\n\n"
        except Exception:
            error = {"error": "Unable to process the chat request."}
            yield f"event: error\ndata: {json.dumps(error)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat/stream")
async def chat_stream(
    payload: schemas.ChatQuery,
    current_user: models.User = Depends(get_current_user),
):
    user_id = current_user.id

    def work():
        # own DB session, because the request session is closed by then
        db = SessionLocal()

        try:
            user = (
                db.query(models.User)
                .filter(models.User.id == user_id)
                .first()
            )

            if not user:
                raise ValueError("User not found")

            result = ask_chat(
                payload=payload,
                db=db,
                current_user=user,
            )

            return result.model_dump(mode="json")
        finally:
            db.close()

    return sse_response(work)


@router.post("/chat/public/stream")
async def public_chat_stream(payload: schemas.ChatQuery):
    def work():
        db = SessionLocal()

        try:
            return process_public_chat(payload=payload, db=db)
        finally:
            db.close()

    return sse_response(work)
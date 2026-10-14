"""
routers/ticket_files.py  -  ticket attachments (photos / PDFs)

    POST /chat/public/tickets/{ticket_id}/attachment   login / home page chatbot (no login)
    GET  /tickets/{ticket_id}/attachments               admin: list the files of a ticket
    GET  /tickets/attachments/{attachment_id}/file      admin: open / download one file

Uses your existing models.TicketAttachment (the same table the dashboard
upload in tickets.py uses).
"""

import re
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from database import get_db
import models
from auth import require_role

router = APIRouter(tags=["ticket-files"])

ALLOWED_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
}

MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB (Figma: "maximum 10 MB")
MAX_FILES_PER_TICKET = 5


def _coerce_id(value: str):
    """Attachment ids are UUIDs in most projects; fall back to the raw value."""
    try:
        return uuid.UUID(value)
    except ValueError:
        return value


@router.post("/chat/public/tickets/{ticket_id}/attachment")
async def upload_public_ticket_attachment(
    ticket_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Only tickets raised from the public chatbot (no user account).
    # The ticket id is an unguessable UUID that only its creator receives.
    ticket = (
        db.query(models.Ticket)
        .filter(
            models.Ticket.id == ticket_id,
            models.Ticket.user_id.is_(None),
        )
        .first()
    )

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    existing = (
        db.query(models.TicketAttachment)
        .filter(models.TicketAttachment.ticket_id == ticket.id)
        .count()
    )

    if existing >= MAX_FILES_PER_TICKET:
        raise HTTPException(
            status_code=400,
            detail="Too many attachments for this ticket.",
        )

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, WEBP images or PDF files are allowed.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Empty file.")

    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Attachment must be 10MB or smaller.",
        )

    attachment = models.TicketAttachment(
        ticket_id=ticket.id,
        filename=file.filename or "attachment",
        content_type=file.content_type,
        file_data=content,
        file_size=len(content),
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {
        "id": str(attachment.id),
        "ticket_id": str(ticket.id),
        "filename": attachment.filename,
        "content_type": attachment.content_type,
        "file_size": int(attachment.file_size),
    }


@router.get("/tickets/{ticket_id}/attachments")
def list_ticket_attachments(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    rows = (
        db.query(models.TicketAttachment)
        .filter(models.TicketAttachment.ticket_id == ticket_id)
        .all()
    )

    return [
        {
            "id": str(row.id),
            "filename": row.filename,
            "content_type": row.content_type,
            "file_size": int(row.file_size or 0),
        }
        for row in rows
    ]


@router.get("/tickets/attachments/{attachment_id}/file")
def get_attachment_file(
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    row = (
        db.query(models.TicketAttachment)
        .filter(models.TicketAttachment.id == _coerce_id(attachment_id))
        .first()
    )

    if not row:
        raise HTTPException(status_code=404, detail="Attachment not found")

    safe_name = re.sub(r"[^A-Za-z0-9._ -]", "_", row.filename or "attachment")

    return Response(
        content=bytes(row.file_data),
        media_type=row.content_type or "application/octet-stream",
        headers={
            # "inline" = opens in the browser (photo / PDF viewer)
            "Content-Disposition": f'inline; filename="{safe_name}"',
        },
    )
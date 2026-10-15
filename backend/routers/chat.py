import os
import re
import requests
import json

from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from uuid import uuid4
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import get_current_user
from dotenv import load_dotenv
load_dotenv()

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)


HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_URL = "https://router.huggingface.co/v1/chat/completions"
HF_MODEL = "openai/gpt-oss-120b:fastest"

FAQ_CONFIDENCE_THRESHOLD = 0.15
SUGGESTION_THRESHOLD = 0.03

PUBLIC_CATEGORIES = ["General"]

CHAT_STOP_WORDS = {
    "a", "an", "and", "are", "am", "be", "can", "could",
    "do", "does", "for", "from", "how", "i", "in", "is",
    "it", "me", "my", "of", "on", "or", "the", "this",
    "to", "was", "what", "when", "where", "which", "who",
    "why", "will", "with", "you", "your",
}

SPOKEN_FILLER_WORDS = {
    "want", "wanted", "wanna", "know", "tell", "please", "like", "need",
    "help", "also", "just", "so", "hello", "hey",
}




def ensure_public_chat_jobs_table(db: Session):
    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS public_chat_jobs (
                job_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                response JSONB,
                error TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )
    )
    db.commit()


def ensure_chat_jobs_table(db: Session):
    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS chat_jobs (
                job_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                status TEXT NOT NULL,
                response JSONB,
                error TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )
    )
    db.commit()


def _run_public_chat_job(job_id, payload, bind):
    job_db = Session(bind=bind)

    try:
        result = process_public_chat(
            payload=payload,
            db=job_db,
        )

        job_db.execute(
            text(
                """
                UPDATE public_chat_jobs
                SET status = 'completed',
                    response = CAST(:response AS JSONB)
                WHERE job_id = :job_id
                """
            ),
            {
                "job_id": job_id,
                "response": json.dumps(result),
            },
        )

        job_db.commit()

    except Exception as exc:
        job_db.rollback()

        job_db.execute(
            text(
                """
                UPDATE public_chat_jobs
                SET status = 'failed',
                    error = :error
                WHERE job_id = :job_id
                """
            ),
            {
                "job_id": job_id,
                "error": str(exc)[:500],
            },
        )

        job_db.commit()

    finally:
        job_db.close()


def _run_chat_job(job_id, payload, user_id, bind):
    job_db = Session(bind=bind)

    try:
        current_user = (
            job_db.query(models.User)
            .filter(models.User.id == user_id)
            .first()
        )

        if not current_user:
            raise ValueError("User not found")

        result = ask_chat(
            payload=payload,
            db=job_db,
            current_user=current_user,
        )

        job_db.execute(
            text(
                """
                UPDATE chat_jobs
                SET status = 'completed',
                    response = CAST(:response AS JSONB)
                WHERE job_id = :job_id
                """
            ),
            {
                "job_id": job_id,
                "response": json.dumps(
                    result.model_dump(mode="json")
                ),
            },
        )
        job_db.commit()

    except Exception:
        job_db.rollback()

        job_db.execute(
            text(
                """
                UPDATE chat_jobs
                SET status = 'failed',
                    error = :error
                WHERE job_id = :job_id
                """
            ),
            {
                "job_id": job_id,
                "error": "Unable to process the chat request.",
            },
        )
        job_db.commit()

    finally:
        job_db.close()


@router.post("/start")
def start_chat(
    payload: schemas.ChatQuery,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ensure_chat_jobs_table(db)

    job_id = str(uuid4())
    user_id = str(current_user.id)

    db.execute(
        text(
            """
            INSERT INTO chat_jobs (
                job_id,
                user_id,
                status
            )
            VALUES (
                :job_id,
                :user_id,
                'processing'
            )
            """
        ),
        {
            "job_id": job_id,
            "user_id": user_id,
        },
    )
    db.commit()

    background_tasks.add_task(
        _run_chat_job,
        job_id,
        payload,
        current_user.id,
        db.get_bind(),
    )

    return {
        "job_id": job_id,
        "status": "processing",
    }


@router.get("/status/{job_id}")
def chat_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ensure_chat_jobs_table(db)

    row = db.execute(
        text(
            """
            SELECT
                job_id,
                user_id,
                status,
                response,
                error
            FROM chat_jobs
            WHERE job_id = :job_id
            """
        ),
        {"job_id": job_id},
    ).first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Chat job not found",
        )

    if row.user_id != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not allowed",
        )

    return {
        "job_id": row.job_id,
        "status": row.status,
        "response": row.response,
        "error": row.error,
    }




def get_bot_response(db: Session, key: str) -> str:
    raw_key = (key or "").strip().lower()
    normalized_key = raw_key.strip("_")

    if not normalized_key:
        return ""

    try:
        row = db.execute(
            text(
                """
                SELECT text
                FROM bot_responses
                WHERE lower(key) = :raw_key
                   OR lower(key) = :normalized_key
                LIMIT 1
                """
            ),
            {
                "raw_key": raw_key,
                "normalized_key": normalized_key,
            },
        ).first()

        return row.text if row else ""

    except SQLAlchemyError:
        db.rollback()
        return ""


def get_database_trigger_values(db: Session, key: str) -> set[str]:
    value = get_bot_response(db, key)

    if not value:
        return set()

    return {
        item.strip().lower()
        for item in value.split(",")
        if item.strip()
    }


def matches_trigger(query: str, triggers: set[str]) -> bool:
    return query.strip().lower() in triggers


def normalize_chat_query(query: str) -> str:
    normalized = re.sub(
        r"\s+",
        " ",
        (query or "").strip().lower(),
    )

    if "password" in normalized:
        normalized = re.sub(
            r"\brest\b",
            "reset",
            normalized,
        )

    return normalized


def get_allowed_faq_categories(role: str):
    if role == "organization":
        return ["General", "Organization"]

    if role in ("candidate", "user"):
        return ["General", "Personal"]

    return ["General"]



def build_or_tsquery(query: str) -> str:
    """'so I want to know how to reset my password' -> 'reset | password'"""
    words = [
        word
        for word in re.findall(r"[a-zA-Z]{3,}", normalize_chat_query(query))
        if word not in CHAT_STOP_WORDS and word not in SPOKEN_FILLER_WORDS
    ]

    return " | ".join(list(dict.fromkeys(words))[:8])


def search_knowledge_base(
    db: Session,
    query: str,
    allowed_categories=None,
):
    query = normalize_chat_query(query)

    category_filter = ""
    params = {}

    if allowed_categories:
        category_filter = """
            AND category = ANY(
                CAST(:allowed_categories AS text[])
            )
        """
        params["allowed_categories"] = allowed_categories

    def run(tsquery_function: str, value: str):
        return db.execute(
            text(
                f"""
                SELECT
                    id,
                    category,
                    question,
                    answer,
                    ts_rank(
                        to_tsvector(
                            'english',
                            question || ' ' || answer
                        ),
                        {tsquery_function}('english', :q)
                    ) AS rank
                FROM knowledge_base
                WHERE to_tsvector(
                    'english',
                    question || ' ' || answer
                ) @@ {tsquery_function}('english', :q)
                {category_filter}
                ORDER BY rank DESC
                LIMIT 3
                """
            ),
            dict(params, q=value),
        ).fetchall()

    try:
        rows = run("plainto_tsquery", query)

        if rows:
            return rows

        or_query = build_or_tsquery(query)

        if not or_query:
            return []

        return run("to_tsquery", or_query)

    except SQLAlchemyError:
        db.rollback()
        return []


def get_faq_by_exact_question(
    db: Session,
    question: str,
    allowed_categories=None,
):
    normalized_question = re.sub(
        r"[?.!,\s]+$",
        "",
        normalize_chat_query(question),
    )

    try:
        category_filter = ""
        params = {"q": normalized_question}

        if allowed_categories:
            category_filter = """
                AND category = ANY(
                    CAST(:allowed_categories AS text[])
                )
            """
            params["allowed_categories"] = allowed_categories

        
        return db.execute(
            text(
                f"""
                SELECT
                    id,
                    category,
                    question,
                    answer
                FROM knowledge_base
                WHERE (
                    regexp_replace(
                        lower(trim(question)),
                        '[?.!, ]+$',
                        ''
                    ) = :q
                    OR replace(
                        regexp_replace(
                            lower(trim(question)),
                            '[?.!, ]+$',
                            ''
                        ),
                        'rest password',
                        'reset password'
                    ) = :q
                )
                {category_filter}
                ORDER BY
                    CASE WHEN category = 'General' THEN 1 ELSE 0 END,
                    id
                LIMIT 1
                """
            ),
            params,
        ).fetchone()

    except SQLAlchemyError:
        db.rollback()
        return None


def get_category_suggestions(db: Session, query: str):
    key = query.strip().lower()

    if not key:
        return None

    try:
        row = db.execute(
            text(
                """
                SELECT category
                FROM chat_category_keywords
                WHERE lower(keyword) = lower(:q)
                LIMIT 1
                """
            ),
            {"q": key},
        ).first()

        if not row or not row.category:
            return None

        rows = db.execute(
            text(
                """
                SELECT question
                FROM knowledge_base
                WHERE category = :cat
                LIMIT 5
                """
            ),
            {"cat": row.category},
        ).fetchall()

        return [item.question for item in rows] if rows else None

    except SQLAlchemyError:
        db.rollback()
        return None


def get_question_overlap_score(left: str, right: str) -> float:
    left = normalize_chat_query(left)
    right = normalize_chat_query(right)

    left_words = {
        word
        for word in re.findall(r"[a-zA-Z]{3,}", left)
        if word not in CHAT_STOP_WORDS
    }

    right_words = {
        word
        for word in re.findall(r"[a-zA-Z]{3,}", right)
        if word not in CHAT_STOP_WORDS
    }

    if not left_words or not right_words:
        return 0.0

    union = left_words | right_words

    return len(left_words & right_words) / len(union)


def get_related_questions(
    db: Session,
    category: str,
    exclude_question: str = None,
    reference_query: str = None,
):
    if not category:
        return []

    try:
        rows = db.execute(
            text(
                """
                SELECT question
                FROM knowledge_base
                WHERE category = :cat
                  AND lower(question) != lower(:exclude)
                ORDER BY
                    CASE
                        WHEN :reference = '' THEN 0
                        ELSE ts_rank(
                            to_tsvector(
                                'english',
                                question
                            ),
                            plainto_tsquery(
                                'english',
                                :reference
                            )
                        )
                    END DESC,
                    question ASC
                LIMIT 3
                """
            ),
            {
                "cat": category,
                "exclude": exclude_question or "",
                "reference": normalize_chat_query(
                    reference_query or exclude_question or ""
                ),
            },
        ).fetchall()

        return [item.question for item in rows]

    except SQLAlchemyError:
        db.rollback()
        return []


def get_next_ticket_number(db: Session) -> int:
    try:
        row = db.execute(
            text("SELECT nextval('ticket_number_seq')")
        ).first()

        return int(row[0])

    except SQLAlchemyError:
        db.rollback()
        raise




def get_ai_prompt(db: Session) -> str:
    return get_bot_response(db, "ai_system_prompt")


def get_ticket_subject_prompt(db: Session) -> str:
    return get_bot_response(db, "ticket_subject_prompt")


def ask_ai(
    db: Session,
    query: str,
    context_faqs: list,
    history: list,
    answer_only: bool = False,
):
   
    if not HF_TOKEN:
        return None

    system_prompt = get_ai_prompt(db)

    if not system_prompt:
        return None

    if context_faqs:
        context_text = "\n\n".join(
            f"Q: {row.question}\nA: {row.answer}"
            for row in context_faqs
        )
    else:
        context_text = ""

    direct_answer_instruction = get_bot_response(
        db,
        "ai_direct_answer_instruction",
    )

    public_instruction = (
        get_bot_response(db, "ai_public_instruction")
        if answer_only
        else ""
    )

    final_system_prompt = (
        system_prompt
        + "\n\n"
        + direct_answer_instruction
        + "\n\n"
        + public_instruction
        + "\n\n"
        + context_text
    ).strip()

    messages = [
        {
            "role": "system",
            "content": final_system_prompt,
        }
    ]

    for turn in history or []:
        role = "assistant" if turn.role == "assistant" else "user"

        messages.append(
            {
                "role": role,
                "content": turn.text,
            }
        )

    messages.append(
        {
            "role": "user",
            "content": query,
        }
    )

    try:
        response = requests.post(
            HF_URL,
            headers={
                "Authorization": f"Bearer {HF_TOKEN}",
                "Content-Type": "application/json",
            },
            json={
                "model": HF_MODEL,
                "messages": messages,
                "temperature": 0.3,
                "stream": False,
            },
            timeout=8,
        )

        response.raise_for_status()

        data = response.json()

        text_out = data["choices"][0]["message"]["content"].strip()
        

        if text_out == "NOT_FOUND":
            return None

        return text_out

    except (
        requests.RequestException,
        KeyError,
        IndexError,
        TypeError,
        ValueError,
    ):
        return None
        


def generate_ticket_subject(db: Session, query: str) -> str:
    if not HF_TOKEN:
        return ""

    prompt = get_ticket_subject_prompt(db)

    if not prompt:
        return ""

    messages = [
        {
            "role": "system",
            "content": prompt,
        },
        {
            "role": "user",
            "content": query,
        },
    ]
    
    try:
        response = requests.post(
            HF_URL,
            headers={
                "Authorization": f"Bearer {HF_TOKEN}",
                "Content-Type": "application/json",
            },
            json={
                "model": HF_MODEL,
                "messages": messages,
                "temperature": 0.2,
                "stream": False,
            },
            timeout=2,
        )

        response.raise_for_status()

        data = response.json()

        subject = data["choices"][0]["message"]["content"].strip()

        subject = re.sub(
            r"^[\"']|[\"']$",
            "",
            subject,
        )

        return subject[:80].strip()

    except (
        requests.RequestException,
        KeyError,
        IndexError,
        TypeError,
        ValueError,
    ):
        return ""



def _faq_response(row, db: Session) -> schemas.ChatResponse:
    related = get_related_questions(
        db,
        row.category,
        row.question,
        row.question,
    )

    return schemas.ChatResponse(
        source="faq",
        answer=row.answer,
        matched_question=row.question,
        related_label=(
            get_bot_response(db, "related_questions_intro")
            if related
            else None
        ),
        related_questions=related if related else None,
    )


@router.post(
    "/ask",
    response_model=schemas.ChatResponse,
)
def ask_chat(
    payload: schemas.ChatQuery,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = payload.query.strip()

    allowed_categories = get_allowed_faq_categories(
        current_user.role
    )

    greeting_triggers = get_database_trigger_values(
        db,
        "greeting_triggers",
    )

    thanks_triggers = get_database_trigger_values(
        db,
        "thanks_triggers",
    )

    if matches_trigger(query, greeting_triggers):
        return schemas.ChatResponse(
            source="greeting",
            answer=get_bot_response(db, "greeting"),
        )

    if matches_trigger(query, thanks_triggers):
        return schemas.ChatResponse(
            source="greeting",
            answer=get_bot_response(db, "thanks"),
        )

    if query.startswith("__") and query.endswith("__"):
        action_response = get_bot_response(db, query)

        if action_response:
            if query == "__latest_jobs__":
                try:
                    jobs = (
                        db.query(models.Job)
                        .order_by(models.Job.created_at.desc())
                        .limit(3)
                        .all()
                    )

                except SQLAlchemyError:
                    db.rollback()
                    jobs = []

                job_list = "\n".join(
                    f"• {job.title} at "
                    f"{job.organization} "
                    f"({job.location})"
                    for job in jobs
                )

                answer = action_response.replace(
                    "{jobs}",
                    job_list,
                )

                return schemas.ChatResponse(
                    source="ai",
                    answer=answer,
                )

            return schemas.ChatResponse(
                source="ai",
                answer=action_response,
            )

    exact = get_faq_by_exact_question(
        db,
        query,
        allowed_categories,
    )

    if exact:
        return _faq_response(exact, db)

    matches = search_knowledge_base(
        db,
        query,
        allowed_categories,
    )

    if (
        matches
        and matches[0].rank >= FAQ_CONFIDENCE_THRESHOLD
        and get_question_overlap_score(query, matches[0].question) >= 0.5
    ):
        return _faq_response(matches[0], db)

    ai_answer = None

    if matches:
        ai_answer = ask_ai(
            db,
            query,
            matches,
            payload.history,
        )

    if ai_answer:
        fallback_category = matches[0].category if matches else None

        related = (
            get_related_questions(
                db,
                fallback_category,
                None,
                query,
            )
            if fallback_category
            else []
        )

        return schemas.ChatResponse(
            source="ai",
            answer=ai_answer,
            related_label=(
                get_bot_response(db, "related_questions_intro")
                if related
                else None
            ),
            related_questions=related if related else None,
        )

    
    return schemas.ChatResponse(
        source="ticket_prompt",
        answer="",
    )



@router.post("/public")
def public_chat(
    payload: schemas.ChatQuery,
    db: Session = Depends(get_db),
):
    return process_public_chat(
        payload=payload,
        db=db,
    )


def process_public_chat(
    payload: schemas.ChatQuery,
    db: Session,
):
    query = payload.query.strip()

    if query == "__login_start__":
        return {
            "source": "greeting",
            "answer": get_bot_response(db, "login_name_prompt"),
        }

    if query == "__login_name__":
        user_messages = [
            item.text.strip()
            for item in (payload.history or [])
            if item.role == "user" and item.text.strip()
        ]

        if not user_messages:
            return {
                "source": "error",
                "answer": get_bot_response(db, "login_name_prompt"),
            }

        name = user_messages[-1]

        hour = datetime.now().hour

        if hour < 12:
            time_word = "morning"
        elif hour < 17:
            time_word = "afternoon"
        else:
            time_word = "evening"

        greeting = get_bot_response(db, "login_name_greeting")

        return {
            "source": "greeting",
            "answer": greeting.format(
                time=time_word,
                name=name,
            ),
        }

    if not query:
        return {
            "source": "error",
            "answer": "Please enter a question.",
        }

    greeting_triggers = get_database_trigger_values(
        db,
        "greeting_triggers",
    )

    if matches_trigger(query, greeting_triggers):
        return {
            "source": "greeting",
            "answer": get_bot_response(db, "greeting"),
        }

    exact = get_faq_by_exact_question(
        db,
        query,
        PUBLIC_CATEGORIES,
    )

    if exact:
        return {
            "source": "faq",
            "answer": exact.answer,
            "matched_question": exact.question,
        }

   
    matches = search_knowledge_base(
        db,
        query,
        PUBLIC_CATEGORIES,
    )

    if (
        matches
        and matches[0].rank >= FAQ_CONFIDENCE_THRESHOLD
        and get_question_overlap_score(query, matches[0].question) >= 0.5
    ):
        top = matches[0]

        return {
            "source": "faq",
            "answer": top.answer,
            "matched_question": top.question,
        }

    ai_answer = ask_ai(
        db,
        query,
        matches,
        payload.history,
        answer_only=True,
    )

    if ai_answer:
        return {
            "source": "ai",
            "answer": ai_answer,
        }

   
    return {
        "source": "ticket_form",
        "answer": get_bot_response(db, "public_ticket_prompt"),
        "question": query,
        "ticket_prompts": {
            "contact_prompt": get_bot_response(db, "public_ticket_prompt"),
            "phone_missing": get_bot_response(db, "public_phone_missing_prompt"),
            "email_missing": get_bot_response(db, "public_email_missing_prompt"),
            "invalid_email": get_bot_response(db, "public_invalid_email"),
            "invalid_phone": get_bot_response(db, "public_invalid_phone"),
            "success": get_bot_response(db, "public_ticket_success"),
        },
    }


@router.post("/public/start")
def start_public_chat(
    payload: schemas.ChatQuery,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ensure_public_chat_jobs_table(db)

    job_id = str(uuid4())

    db.execute(
        text(
            """
            INSERT INTO public_chat_jobs (
                job_id,
                status,
                response,
                error
            )
            VALUES (
                :job_id,
                'processing',
                NULL,
                NULL
            )
            """
        ),
        {"job_id": job_id},
    )

    db.commit()

    background_tasks.add_task(
        _run_public_chat_job,
        job_id,
        payload,
        db.get_bind(),
    )

    return {
        "job_id": job_id,
        "status": "processing",
    }


@router.get("/public/status/{job_id}")
def public_chat_status(
    job_id: str,
    db: Session = Depends(get_db),
):
    ensure_public_chat_jobs_table(db)

    row = db.execute(
        text(
            """
            SELECT
                job_id,
                status,
                response,
                error
            FROM public_chat_jobs
            WHERE job_id = :job_id
            LIMIT 1
            """
        ),
        {"job_id": job_id},
    ).first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Public chat job not found",
        )

    return {
        "job_id": row.job_id,
        "status": row.status,
        "response": row.response,
        "error": row.error,
    }


@router.post("/public/ticket", response_model=schemas.TicketOut)
def create_public_ticket(
    payload: schemas.PublicTicketCreate,
    db: Session = Depends(get_db),
):
    contact_phone = (payload.contact_phone or "").strip()

    
    if contact_phone and not re.fullmatch(r"\d{10}", contact_phone):
        raise HTTPException(
            status_code=422,
            detail="Phone number must contain exactly 10 digits.",
        )

    try:
        next_number = get_next_ticket_number(db)

        ticket = models.Ticket(
            user_id=None,
            contact_name=payload.contact_name.strip(),
            contact_email=str(payload.contact_email).strip(),
            contact_phone=contact_phone,
            subject=payload.subject.strip(),
            description=payload.description.strip(),
            status="open",
            ticket_number=next_number,
            channel="Bot",
            priority="Medium",
        )

        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        return ticket

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Ticket creation failed",
        )
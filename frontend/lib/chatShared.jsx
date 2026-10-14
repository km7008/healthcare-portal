"use client";
import { useEffect, useRef, useState } from "react";
const NAVY = "#033A85";
const BORDER = "#C9D6E8";
const BLUE = "#064B9E";  

function IconBase({ size = 18, className = "", children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function MicIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M3.5 7.5V8C3.5 10.49 5.51 12.5 8 12.5M8 12.5C10.49 12.5 12.5 10.49 12.5 8V7.5M8 12.5V15M5.5 15H10.5M8 1.5C6.62 1.5 5.5 2.62 5.5 4V8C5.5 9.38 6.62 10.5 8 10.5C9.38 10.5 10.5 9.38 10.5 8V4C10.5 2.62 9.38 1.5 8 1.5Z"
        stroke="#064B9E"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon(props) {
  return (
    <IconBase {...props}>
      <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />
    </IconBase>
  );
}

export function PauseIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
    </IconBase>
  );
}

export function TrashIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </IconBase>
  );
}

export function TicketIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </IconBase>
  );
}

export function MessageIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconBase>
  );
}

export function PaperclipIcon(props) {
  return (
    <IconBase {...props}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </IconBase>
  );
}

export function PowerIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" x2="12" y1="2" y2="12" />
    </IconBase>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <IconBase {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </IconBase>
  );
}

export function CloseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}

export function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </IconBase>
  );
}

export function SendIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M14.5702 1.43131L7.27622 8.72372M9.69092 14.4563C9.71625 14.5194 9.76029 14.5732 9.81711 14.6106C9.87394 14.648 9.94084 14.6671 10.0088 14.6653C10.0768 14.6636 10.1427 14.6411 10.1975 14.6009C10.2524 14.5606 10.2936 14.5046 10.3156 14.4403L14.6493 1.77404C14.6707 1.71497 14.6748 1.65105 14.6611 1.58975C14.6474 1.52845 14.6166 1.47231 14.5721 1.4279C14.5277 1.38349 14.4716 1.35265 14.4103 1.33898C14.349 1.32531 14.285 1.32938 14.226 1.35072L1.55823 5.6839C1.49389 5.70596 1.43784 5.74718 1.3976 5.80201C1.35736 5.85684 1.33486 5.92267 1.33312 5.99066C1.33138 6.05865 1.35048 6.12555 1.38785 6.18237C1.42523 6.23919 1.4791 6.28322 1.54223 6.30854L6.82934 8.42847C6.99648 8.49538 7.14834 8.59544 7.27576 8.72261C7.40318 8.84979 7.50352 9.00145 7.57074 9.16844L9.69092 14.4563Z"
        stroke="white"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BotIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M16 7H8C5.79086 7 4 8.79086 4 11V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V11C20 8.79086 18.2091 7 16 7Z"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3V7M2 12V16M22 12V16M8 15H8.01M16 15H16.01M9 18H15"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}



function chip(label) {
  return { label: label, query: label };
}

export const GUEST_SUGGESTIONS = [
  chip("Find & apply for jobs"),
  chip("Post a job"),
  chip("Reset or change my password"),
  chip("Is my data safe?"),
  chip("Who can use Nextenti?"),
  chip("Talk to support"),
];

export const CANDIDATE_SUGGESTIONS = [
  chip("Search & apply for jobs"),
  chip("Track my application status"),
  chip("View & manage job offers"),
  chip("Set my availability"),
  chip("Get better job recommendations"),
  chip("Update my profile or mobile number"),
  chip("Reset or change my password"),
  chip("Talk to support"),
];

export const ORGANIZATION_SUGGESTIONS = [
  chip("Post a job"),
  chip("Manage my jobs"),
  chip("Subscription & plans"),
  chip("Timesheets & attendance"),
  chip("Manage users"),
  chip("Edit organization / billing details"),
  chip("Reset or change my password"),
  chip("Talk to support"),
];

function isOrganization(user) {
  return String((user && user.role) || "").toLowerCase() === "organization";
}

export function getGreetingSuggestions(user) {
  return isOrganization(user)
    ? ORGANIZATION_SUGGESTIONS
    : CANDIDATE_SUGGESTIONS;
}

export function getMatchSuggestions(user) {
  return getGreetingSuggestions(user);
}



export function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDuration(total) {
  const t = Math.max(0, Math.round(total || 0));
  const m = Math.floor(t / 60);
  const s = t % 60;

  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatFileSize(bytes) {
  const n = Number(bytes || 0);

  if (n >= 1024 * 1024) {
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function ticketCode(id) {
  const raw = String(id || "");
  const hex = raw.replace(/-/g, "").slice(0, 8);
  const value = parseInt(hex || "0", 16);

  return String(value % 10000).padStart(4, "0");
}

export function ticketLabel(ticket) {
  return (
    "TKT-" +
    String((ticket && (ticket.ticket_number || ticketCode(ticket.id))) || "0").padStart(4, "0")
  );
}

export function ticketCreatedText(ticket) {
  return (
    "Ticket created successfully.\n" +
    "Ticket ID: **" +
    ticketLabel(ticket) +
    "**\n" +
    "Our support team will contact you shortly."
  );
}

export const THANKS_RESOLVED_TEXT =
  "Great! I'm glad I could help. Thank you for contacting Nextenti Support. Have a great day!";

export function notResolvedText(question) {
  const q = String(question || "").trim();

  return (
    (q ? '"' + q + '"\n' : "") +
    "I couldn't resolve that. Our team will contact you shortly."
  );
}

export const ATTACHMENT_TICKET_QUESTION = "Attachment shared for review";

export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];


export function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : [];

    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
  }
}

export function stripAudio(list) {
  return list.map(function (it) {
    if (it.kind === "attachment") {
      return Object.assign({}, it, { previewUrl: null });
    }

    if (it.kind !== "voice") {
      return it;
    }

    return Object.assign({}, it, {
      audioUrl: null,
      status: it.status === "transcribing" ? "error" : it.status,
    });
  });
}


const MATCH_STOP_WORDS = new Set([
  "how", "what", "when", "where", "why", "who", "which", "can", "could",
  "should", "would", "will", "the", "and", "for", "with", "that", "this",
  "from", "are", "was", "does", "did", "you", "your", "my", "me", "our",
  "please", "tell", "about", "have", "has", "any", "there", "their", "its",
  "into", "need", "want", "know", "give", "show", "wanna", "hey", "hello",
]);

export function matchTokens(text) {
  const words = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(function (w) {
      return w.length >= 3 && !MATCH_STOP_WORDS.has(w);
    })
    .map(function (w) {
      return w.length > 3 && w.endsWith("s") && !w.endsWith("ss")
        ? w.slice(0, -1)
        : w;
    });

  return Array.from(new Set(words));
}

export function matchSuggestion(text, suggestions) {
  const spoken = matchTokens(text);

  if (!spoken.length) {
    return null;
  }

  let best = null;
  let bestScore = 0;

  suggestions.forEach(function (c) {
    [c.label, c.query].forEach(function (candidate) {
      const words = matchTokens(candidate);

      if (!words.length) {
        return;
      }

      const common = spoken.filter(function (w) {
        return words.indexOf(w) !== -1;
      }).length;

      let score = common / (spoken.length + words.length - common);

      if (common === spoken.length && spoken.length >= 2) {
        score = Math.max(score, 0.9);
      }

      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    });
  });

  return bestScore >= 0.6 ? best : null;
}

const YES_WORDS = [
  "yes", "yeah", "yep", "yup", "sure", "please", "ok", "okay",
  "correct", "go ahead", "of course", "yes please",
];

const NO_WORDS = ["no", "nope", "nah", "not now", "no thanks", "no thank you"];

export function spokenAnswer(text) {
  const t = String(text || "").toLowerCase().replace(/[^a-z\s]/g, "").trim();

  if (YES_WORDS.indexOf(t) !== -1) {
    return "Yes";
  }

  if (NO_WORDS.indexOf(t) !== -1) {
    return "No";
  }

  return "";
}


const SUBJECT_STOP_WORDS = new Set([
  "i", "am", "is", "are", "was", "were", "be", "been", "to", "of", "in", "on",
  "at", "by", "a", "an", "and", "or", "but", "if", "so", "as", "it", "its",
  "this", "that", "these", "those", "with", "from", "for", "up", "out", "my",
  "me", "we", "our", "you", "your", "wanted", "want", "wants", "wish", "like",
  "know", "need", "needs", "get", "got", "can", "could", "would", "should",
  "will", "please", "hi", "hello", "hey", "kindly", "just", "some", "any",
  "also", "about", "regarding", "really", "very", "much", "many", "there",
  "here", "them", "they", "he", "she", "his", "her", "do", "does", "did",
  "doing", "have", "has", "had", "how", "what", "when", "where", "why", "who",
  "which", "tell", "say", "let", "the", "not", "no", "yes", "than", "then",
  "into", "over", "such", "only", "more", "most", "all", "now", "ask",
  "asking", "help", "thing", "things", "something", "time", "able",
  "show", "shows", "showing", "try", "trying", "tried", "getting", "using",
]);

export function makeTicketSubject(text) {
  const words = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(function (w) {
      return w.length >= 2 && !SUBJECT_STOP_WORDS.has(w);
    });

  const unique = [];

  words.forEach(function (w) {
    if (unique.indexOf(w) === -1) {
      unique.push(w);
    }
  });

  const subject = unique.slice(0, 4).join(" ");

  if (!subject) {
    return "";
  }

  return (subject.charAt(0).toUpperCase() + subject.slice(1)).slice(0, 80);
}

export function ticketSubject(values, fallbackQuestion) {
  const base =
    makeTicketSubject(values.description) ||
    makeTicketSubject(fallbackQuestion) ||
    "Support Request";

  return (values.category ? values.category + ": " + base : base).slice(0, 80);
}

export function lastAskedQuestion(list) {
  for (let j = list.length - 1; j >= 0; j--) {
    const it = list[j];

    if (it.kind === "user" && !it.system) {
      return it.text;
    }

    if (it.kind === "voice" && it.transcript) {
      return it.transcript;
    }
  }

  return "";
}


const STOP_WORDS = new Set([
  "how", "what", "when", "where", "why", "who", "which", "can", "could",
  "should", "would", "will", "the", "and", "for", "with", "that", "this",
  "from", "are", "was", "does", "did", "you", "your", "my", "me", "our",
  "please", "tell", "about", "have", "has", "get", "yes", "not", "any",
  "there", "their", "its", "into", "need", "want", "know", "give", "show",
]);

export function extractKeywords(question) {
  const words = String(question || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(function (w) {
      return w.length >= 3 && !STOP_WORDS.has(w);
    });

  const unique = [];

  words.forEach(function (w) {
    if (unique.indexOf(w) === -1) {
      unique.push(w);
    }
  });

  return unique.slice(0, 6);
}

function questionFor(list, index) {
  for (let j = index - 1; j >= 0; j--) {
    const it = list[j];

    if (it.kind === "user") {
      return it.system ? "" : it.text;
    }

    if (it.kind === "voice") {
      return it.transcript;
    }
  }

  return "";
}

function renderInline(text, keywords) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);

  let re = null;

  if (keywords && keywords.length) {
    const escaped = keywords.map(function (k) {
      return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });

    re = new RegExp("(\\b(?:" + escaped.join("|") + ")\\w*)", "gi");
  }

  return parts.map(function (part, pi) {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={pi} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (!re) {
      return part;
    }

    return part.split(re).map(function (seg, si) {
      return si % 2 === 1 ? (
        <strong key={pi + "-" + si} className="font-semibold">
          {seg}
        </strong>
      ) : (
        seg
      );
    });
  });
}

const ACTION_VERBS = new Set([
  "download", "visit", "sign", "signup", "log", "login", "go", "open",
  "click", "tap", "select", "choose", "enter", "fill", "provide", "submit",
  "upload", "navigate", "search", "use", "apply", "review", "check", "save",
  "add", "update", "edit", "verify", "confirm", "follow", "contact", "create",
  "post", "view", "set", "manage", "press", "scroll", "find", "proceed",
  "pay", "reset", "change", "delete", "remove", "browse", "register", "start",
  "begin", "install", "send", "attach", "accept", "decline", "filter",
  "track", "close", "cancel", "invite", "grant", "complete",
]);

function splitSteps(line) {
  if (line.length < 90 || /\?$/.test(line)) {
    return null;
  }

  const parts = line
    .replace(/[.!]+$/, "")
    .split(/\s*[;,]\s*(?:(?:and|then)\s+)?|\s+then\s+/i)
    .map(function (p) {
      return p.trim();
    })
    .filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  const verbCount = parts.filter(function (p) {
    return ACTION_VERBS.has(p.split(/\s+/)[0].toLowerCase());
  }).length;

  if (parts.length === 2) {
    if (verbCount < 2 || line.length < 110) {
      return null;
    }
  } else if (verbCount / parts.length < 0.75) {
    return null;
  }

  return parts.map(function (p) {
    return p.charAt(0).toUpperCase() + p.slice(1);
  });
}

function parseAnswer(text) {
  let t = String(text || "").trim();

  if (t.indexOf("\n") === -1 && /(^|\s)1[.)]\s[\s\S]*\s2[.)]\s/.test(t)) {
    t = t.replace(/\s+(?=[1-9][.)]\s)/g, "\n");
  }

  const lines = t
    .split("\n")
    .map(function (l) {
      return l.trim();
    })
    .filter(Boolean);

  const blocks = [];

  function pushItem(type, value) {
    const last = blocks[blocks.length - 1];

    if (last && last.type === type) {
      last.items.push(value);
    } else {
      blocks.push({ type: type, items: [value] });
    }
  }

  lines.forEach(function (line) {
    let m = line.match(/^\d+[.)]\s+(.*)$/);

    if (m) {
      pushItem("ol", m[1]);
      return;
    }

    m = line.match(/^[-*•]\s+(.*)$/);

    if (m) {
      pushItem("ul", m[1]);
      return;
    }

    const steps = splitSteps(line);

    if (steps) {
      steps.forEach(function (step) {
        pushItem("ol", step);
      });
      return;
    }

    const sentences = line.match(/[^.!?]+[.!?]+/g);

    if (line.length > 120 && sentences && sentences.length >= 3) {
      sentences.forEach(function (sentence) {
        pushItem("ul", sentence.trim());
      });
      return;
    }

    blocks.push({ type: "p", items: [line] });
  });

  return blocks;
}

function FormattedAnswer({ text, keywords }) {
  const blocks = parseAnswer(text);

  return (
    <div className="flex flex-col gap-1.5">
      {blocks.map(function (b, bi) {
        if (b.type === "ol" || b.type === "ul") {
          return (
            <ul key={bi} className="list-disc pl-4 flex flex-col gap-0.5">
              {b.items.map(function (li, i) {
                return (
                  <li key={i} className="break-words">
                    {renderInline(li, keywords)}
                  </li>
                );
              })}
            </ul>
          );
        }

        return <p key={bi}>{renderInline(b.items[0], keywords)}</p>;
      })}
    </div>
  );
}


function BotBubble({ text, time, keywords }) {
  return (
    <div
      className="mr-auto flex w-[274px] max-w-full flex-col items-start gap-1 rounded-xl border bg-white p-3"
      style={{ borderColor: "#D1DEF0" }}
    >
      <div className="self-stretch text-[10px] font-bold leading-[14px] text-[#064B9E]">
        Nextenti Support
      </div>

      <div className="self-stretch text-[13px] font-normal leading-[19px] text-[#263343] break-words [overflow-wrap:anywhere]">
        <FormattedAnswer text={text} keywords={keywords} />
      </div>

      {time && (
        <div className="self-stretch text-[9px] font-normal leading-3 text-[#98A6B8]">
          {time}
        </div>
      )}
    </div>
  );
}

function UserBubble({ text, time }) {
  return (
    <div
      className="ml-auto flex w-[274px] max-w-full flex-col items-start gap-1 rounded-xl p-3 text-white"
      style={{ background: NAVY }}
    >
      <div className="self-stretch text-[13px] font-normal leading-[19px] break-words [overflow-wrap:anywhere] whitespace-pre-line">
        {text}
      </div>

      {time && (
        <div className="self-stretch text-[9px] font-normal leading-3 text-white/70">
          {time}
        </div>
      )}
    </div>
  );
}

function AttachmentBubble({ item }) {
  const isImage = String(item.mime || "").indexOf("image/") === 0;

  function openFile() {
    if (item.previewUrl) {
      window.open(item.previewUrl, "_blank");
    }
  }

  if (isImage) {
    return (
      <div className="ml-auto max-w-[70%] rounded-xl p-1" style={{ background: NAVY }}>
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt="Attachment"
            onClick={openFile}
            className="block w-full max-h-[170px] object-cover rounded-lg cursor-pointer"
          />
        ) : (
          <div className="px-3 py-6 text-xs text-white text-center">Photo</div>
        )}

        <div className="text-right text-[11px] text-white/80 px-1 pt-0.5">
          {item.time}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={openFile}
      className={`ml-auto max-w-[80%] rounded-xl px-3 py-2.5 text-white flex items-center gap-2 ${
        item.previewUrl ? "cursor-pointer" : ""
      }`}
      style={{ background: NAVY }}
    >
      <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-bold">
        PDF
      </div>

      <div className="min-w-0">
        <div className="text-xs font-medium truncate">{item.fileName}</div>

        <div className="text-[11px] text-white/80">
          {formatFileSize(item.size)} · {item.time}
        </div>
      </div>
    </div>
  );
}

function VoiceBubble({ item }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const src = item.audioUrl;
  const duration = item.duration;

  function toggle() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  return (
    <div className="ml-auto max-w-[85%] flex flex-col items-end gap-1">
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-white min-w-[190px]"
        style={{ background: NAVY }}
      >
        {src ? (
          <>
            <audio
              ref={audioRef}
              src={src}
              preload="metadata"
              onPlay={function () {
                setPlaying(true);
              }}
              onPause={function () {
                setPlaying(false);
              }}
              onEnded={function () {
                setPlaying(false);
                setProgress(0);
              }}
              onTimeUpdate={function (e) {
                const a = e.target;

                const total =
                  isFinite(a.duration) && a.duration > 0
                    ? a.duration
                    : duration || 1;

                setProgress(Math.min(a.currentTime / total, 1));
              }}
            />

            <button
              type="button"
              onClick={toggle}
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 cursor-pointer"
              style={{ color: NAVY }}
              title={playing ? "Pause" : "Play"}
            >
              {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </button>

            <div className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${progress * 100}%` }}></div>
            </div>
          </>
        ) : (
          <span className="flex-1 text-xs">Voice message</span>
        )}

        <span className="text-[11px] tabular-nums">{formatDuration(duration)}</span>
      </div>

      {item.status === "transcribing" && (
        <div className="text-[11px] text-gray-400 italic">
          Listening to your voice message...
        </div>
      )}

      {item.status === "done" && item.transcript && (
        <div className="text-[11px] text-gray-500 italic max-w-full break-words text-right">
          “{item.transcript}”
        </div>
      )}

      {item.time && <div className="text-[11px] text-gray-400">{item.time}</div>}
    </div>
  );
}


const choiceBtn =
  "w-full min-h-[34px] px-[10px] py-[7px] flex items-center self-stretch text-left rounded-lg border bg-white hover:bg-[#EEF3FA] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const SUGGESTION_WIDTH = 256;

const yesNoBtn =
  "min-h-[34px] px-[10px] py-[7px] flex items-center grow shrink-0 basis-0 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";


function YesButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={yesNoBtn}
      style={{ background: BLUE, borderColor: BLUE }}
    >
      <span className="grow shrink-0 basis-0 text-center text-[11px] font-semibold leading-4 text-white">
        {label}
      </span>
    </button>
  );
}

function NoButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={yesNoBtn + " bg-white"}
      style={{ borderColor: "#D1DEF0", color: BLUE }}
    >
      <span className="grow shrink-0 basis-0 text-center text-[11px] font-medium leading-4">
        {label}
      </span>
    </button>
  );
}


const SHOW_PHONE = true;

const MAX_FILE_MB = 10;

const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export const TICKET_CATEGORIES = [
  "Account",
  "Jobs & applications",
  "Profile",
  "Billing",
  "Other",
];


const ticketBox =
  "w-full bg-white border rounded-lg px-[10px] text-[11px] font-normal leading-4 text-[#263343] outline-none focus:border-[#033A85] placeholder:text-[#98A6B8] disabled:opacity-60";

function ClipIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M10.0001 3.74902L4.7409 9.11579C4.50641 9.35028 4.37467 9.66832 4.37467 9.99994C4.37467 10.3316 4.50641 10.6496 4.7409 10.8841C4.97538 11.1186 5.29342 11.2503 5.62503 11.2503C5.95665 11.2503 6.27468 11.1186 6.50917 10.8841L11.7684 5.51732C12.2372 5.04842 12.5007 4.41245 12.5007 3.74933C12.5007 3.08621 12.2372 2.45025 11.7684 1.98135C11.2995 1.51245 10.6635 1.24902 10.0004 1.24902C9.33728 1.24902 8.70133 1.51245 8.23244 1.98135L2.99512 7.32624C2.64222 7.67345 2.36155 8.0871 2.16931 8.54332C1.97706 8.99954 1.87705 9.48932 1.87503 9.98439C1.87302 10.4795 1.96904 10.97 2.15756 11.4278C2.34608 11.8856 2.62337 12.3015 2.97344 12.6516C3.32351 13.0016 3.73942 13.2789 4.19719 13.4675C4.65495 13.656 5.14552 13.752 5.64058 13.75C6.13565 13.748 6.62541 13.648 7.08163 13.4557C7.53785 13.2635 7.95149 12.9828 8.29869 12.6299L13.536 7.28499"
        stroke="#064B9E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#738094" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function TicketField({ label, required, optional, error, children }) {
  return (
    <div className="flex flex-col gap-1 self-stretch">
      <div className="self-stretch text-[11px] font-semibold leading-[15px] text-[#263343]">
        {label}
        {required ? " *" : ""}
        {optional ? (
          <span className="font-normal text-[#738094]">{" (optional)"}</span>
        ) : null}
      </div>

      {children}

      {error && <div className="text-[10px] leading-[14px] text-red-500">{error}</div>}
    </div>
  );
}

function TicketForm({ defaults, sending, error, onSubmit, onBack }) {
  const d = defaults || {};

  const [name, setName] = useState(d.name || "");
  const [email, setEmail] = useState(d.email || "");
  const [phone, setPhone] = useState(String(d.phone || "").replace(/\D/g, "").slice(-10));
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  function validate() {
    const e = {};
    const n = name.trim();

    if (!n) {
      e.name = "Please enter your name.";
    } else if (!NAME_RE.test(n)) {
      e.name = "Please enter a valid name (letters only).";
    }

    if (!EMAIL_RE.test(email.trim())) {
      e.email = "Please enter a valid email address.";
    }

    if (SHOW_PHONE && !/^\d{10}$/.test(phone)) {
      e.phone = "Please enter a valid 10-digit phone number.";
    }

    if (!category) {
      e.category = "Please select a category.";
    }

    if (description.trim().length < 5) {
      e.description = "Please describe the issue in a little more detail.";
    }

    return e;
  }

  function pickFile(f) {
    if (!f) {
      return;
    }

    if (!ALLOWED_ATTACHMENT_TYPES.includes(f.type)) {
      setErrors(function (prev) {
        return Object.assign({}, prev, { file: "Please select a PNG, JPG, WEBP image or a PDF." });
      });
      return;
    }

    if (f.size > MAX_FILE_BYTES) {
      setErrors(function (prev) {
        return Object.assign({}, prev, { file: "File size must be " + MAX_FILE_MB + " MB or smaller." });
      });
      return;
    }

    setErrors(function (prev) {
      return Object.assign({}, prev, { file: "" });
    });
    setFile(f);
  }

  function submit(ev) {
    ev.preventDefault();

    if (sending) {
      return;
    }

    const e = validate();

    setErrors(e);

    if (Object.keys(e).length) {
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone,
      category: category,
      description: description.trim(),
      file: file,
    });
  }

  return (
    <form onSubmit={submit} noValidate className="self-stretch flex flex-col gap-[10px]">
      <div className="self-stretch text-[15px] font-bold leading-5 text-[#033A85]">
        Submit a support ticket
      </div>

      <TicketField label="Full Name" required error={errors.name}>
        <input
          value={name}
          onChange={function (e) {
            setName(e.target.value);
          }}
          placeholder="Your full name"
          disabled={sending}
          className={ticketBox + " h-9"}
          style={{ borderColor: "#D1DEF0" }}
        />
      </TicketField>

      <TicketField label="Email Address" required error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={function (e) {
            setEmail(e.target.value);
          }}
          placeholder="you@example.com"
          disabled={sending}
          className={ticketBox + " h-9"}
          style={{ borderColor: "#D1DEF0" }}
        />
      </TicketField>

      {SHOW_PHONE && (
        <TicketField label="Phone Number" required error={errors.phone}>
          <input
            inputMode="numeric"
            value={phone}
            onChange={function (e) {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
            }}
            placeholder="10-digit phone number"
            disabled={sending}
            className={ticketBox + " h-9"}
            style={{ borderColor: "#D1DEF0" }}
          />
        </TicketField>
      )}

      <TicketField label="Issue Category" required error={errors.category}>
        <div className="relative self-stretch">
          <select
            value={category}
            onChange={function (e) {
              setCategory(e.target.value);
            }}
            disabled={sending}
            className={
              ticketBox +
              " h-9 appearance-none pr-8 cursor-pointer " +
              (category ? "" : "text-[#98A6B8]")
            }
            style={{ borderColor: "#D1DEF0" }}
          >
            <option value="">Select a category</option>

            {TICKET_CATEGORIES.map(function (c) {
              return (
                <option key={c} value={c}>
                  {c}
                </option>
              );
            })}
          </select>

          <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 flex">
            <ChevronDownIcon />
          </span>
        </div>
      </TicketField>

      <TicketField label="Description of Issue" required error={errors.description}>
        <textarea
          value={description}
          onChange={function (e) {
            setDescription(e.target.value);
          }}
          placeholder="Tell us what happened"
          disabled={sending}
          className={ticketBox + " h-16 py-2 resize-none"}
          style={{ borderColor: "#D1DEF0" }}
        />
      </TicketField>

      <TicketField label="Attachment" optional error={errors.file}>
        <button
          type="button"
          onClick={function () {
            if (fileRef.current) {
              fileRef.current.click();
            }
          }}
          disabled={sending}
          className="flex min-h-[42px] items-center gap-2 self-stretch rounded-lg border px-[10px] py-2 text-left cursor-pointer disabled:opacity-60"
          style={{ borderColor: "#D1DEF0", background: "#F4F8FE" }}
        >
          <ClipIcon />

          <span className="flex min-w-0 grow flex-col">
            <span className="self-stretch truncate text-[11px] font-semibold leading-normal text-[#064B9E]">
              {file ? file.name : "Choose a file"}
            </span>

            <span className="self-stretch text-[9px] font-normal leading-normal text-[#738094]">
              {"PNG, JPG, PDF · maximum " + MAX_FILE_MB + " MB"}
            </span>
          </span>
        </button>

        {file && (
          <button
            type="button"
            onClick={function () {
              setFile(null);
            }}
            className="self-start bg-transparent border-none p-0 text-[10px] leading-[14px] text-[#064B9E] underline cursor-pointer"
          >
            Remove file
          </button>
        )}

        <input
          type="file"
          ref={fileRef}
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={function (e) {
            pickFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </TicketField>

      {error && <div className="text-[10px] leading-[14px] text-red-500">{error}</div>}

      <button
        type="submit"
        disabled={sending}
        className="flex min-h-[34px] items-center self-stretch rounded-lg border px-[10px] py-[7px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: BLUE, borderColor: BLUE }}
      >
        <span className="grow shrink-0 basis-0 text-center text-[11px] font-semibold leading-4 text-white">
          {sending ? "Submitting..." : "Submit ticket"}
        </span>
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={sending}
        className={choiceBtn}
        style={{ color: BLUE, borderColor: "#D1DEF0" }}
      >
        <span className="grow shrink-0 basis-0 text-left text-[11px] font-medium leading-4">
          Back to main menu
        </span>
      </button>
    </form>
  );
}

function SuccessBubble({ text, time }) {
  return (
    <div
      className="flex flex-col items-start gap-1 self-stretch rounded-xl border p-3"
      style={{ borderColor: "#B9E2CC", background: "#EEF9F3" }}
    >
      <div className="self-stretch text-[10px] font-bold leading-[14px] text-[#064B9E]">
        Nextenti Support
      </div>

      <div className="self-stretch text-[13px] font-normal leading-[19px] text-[#263343] break-words [overflow-wrap:anywhere]">
        {text}
      </div>

      {time && (
        <div className="self-stretch text-[9px] font-normal leading-3 text-[#98A6B8]">{time}</div>
      )}
    </div>
  );
}

function TicketSuccess({ info, onBack }) {
  const i = info || {};

  return (
    <>
      {i.question ? <UserBubble text={i.question} time={i.time} /> : null}

      <BotBubble
        text="Let's submit a support ticket so our team can follow up."
        time={i.time}
        keywords={[]}
      />

      <SuccessBubble
        text={
          "Your support ticket has been submitted successfully. A confirmation has been sent to " +
          (i.email || "your email") +
          ". Our team will review your request and get back to you as soon as possible."
        }
        time={i.time}
      />

      <div
        className="flex flex-col items-start gap-[3px] self-stretch rounded-[10px] border p-[14px]"
        style={{ borderColor: "#AAC4E6", background: "#F4F8FE" }}
      >
        <div className="self-stretch text-[9px] font-medium uppercase leading-3 tracking-[0.06em] text-[#738094]">
          Ticket reference
        </div>

        <div className="self-stretch text-[16px] font-bold leading-normal text-[#033A85]">
          {i.ticket ? ticketLabel(i.ticket) : ""}
        </div>
      </div>

      {i.attachmentFailed && (
        <div className="text-[10px] leading-[14px] text-red-500">
          Your ticket was created, but the attachment could not be sent.
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className={choiceBtn}
        style={{ color: BLUE, borderColor: "#D1DEF0" }}
      >
        <span className="grow shrink-0 basis-0 text-left text-[11px] font-medium leading-4">
          Back to main menu
        </span>
      </button>
    </>
  );
}


export function TicketPage({ page, info, defaults, sending, error, onSubmit, onBack }) {
  if (!page) {
    return null;
  }

  return (
    <div
      className={
        "flex-1 min-h-0 self-stretch flex flex-col gap-[10px] overflow-y-auto bg-white px-[22px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
        (page === "form" ? "pt-3 pb-4" : "py-4")
      }
    >
      {page === "form" ? (
        <TicketForm
          defaults={defaults}
          sending={sending}
          error={error}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      ) : (
        <TicketSuccess info={info} onBack={onBack} />
      )}
    </div>
  );
}

export function ChatItems({
  items,
  sending,
  error,
  ticketChoiceEnabled,
  onTicketChoice,
  onResolve,
  onSuggestion,
}) {
  function movedOn(index) {
    for (let j = index + 1; j < items.length; j++) {
      const k = items[j].kind;

      if (k === "user" || k === "voice" || k === "bot") {
        return true;
      }
    }

    return false;
  }

  return (
    <>
      {items.map(function (item, index) {
        if (item.kind === "voice") {
          return <VoiceBubble key={index} item={item} />;
        }

        if (item.kind === "attachment") {
          return <AttachmentBubble key={index} item={item} />;
        }

        if (item.kind === "user") {
          return <UserBubble key={index} text={item.text} time={item.time} />;
        }

        if (item.kind === "ticket_prompt") {
          return (
            <div key={index} className="self-stretch w-full flex flex-col gap-2">
              <BotBubble text={item.text} time={item.time} keywords={[]} />

              <div className="flex self-stretch gap-2">
                <YesButton
                  label="Yes"
                  disabled={!ticketChoiceEnabled || sending}
                  onClick={function () {
                    onTicketChoice("Yes");
                  }}
                />

                <NoButton
                  label="No"
                  disabled={!ticketChoiceEnabled || sending}
                  onClick={function () {
                    onTicketChoice("No");
                  }}
                />
              </div>
            </div>
          );
        }

        if (item.kind === "resolve_prompt") {
          if (item.answered || movedOn(index)) {
            return null;
          }

          return (
            <div key={index} className="self-stretch w-full flex flex-col gap-2">
              <div className="self-stretch text-[12px] font-normal leading-[18px] text-[#263343]">
                Did this help resolve your issue?
              </div>

              <div className="flex self-stretch gap-2">
                <YesButton
                  label="Yes, resolved"
                  disabled={sending}
                  onClick={function () {
                    onResolve("yes");
                  }}
                />

                <NoButton
                  label="No, I need more help"
                  disabled={sending}
                  onClick={function () {
                    onResolve("no");
                  }}
                />
              </div>

              <button
                type="button"
                disabled={sending}
                onClick={function () {
                  onResolve("menu");
                }}
                className={choiceBtn}
                style={{ color: BLUE, borderColor: "#D1DEF0" }}
              >
                <span className="grow shrink-0 basis-0 text-center text-[11px] font-medium leading-4">
                  Back to main menu
                </span>
              </button>
            </div>
          );
        }

        if (!item.text) {
          return null;
        }

        return (
          <div key={index} className="flex flex-col gap-2">
            <BotBubble
              text={item.text}
              time={item.time}
              keywords={item.plain ? [] : extractKeywords(questionFor(items, index))}
            />

            {item.suggestions && !movedOn(index) && (
              <div className="flex flex-col gap-2" style={{ width: SUGGESTION_WIDTH, maxWidth: "100%" }}>
                {item.suggestions.map(function (s, si) {
                  const isObj = typeof s === "object";
                  const label = isObj ? s.label : s;
                  const query = isObj ? s.query : s;

                  return (
                    <button
                      key={si}
                      type="button"
                      disabled={sending}
                      onClick={function () {
                        onSuggestion(query, label);
                      }}
                      className={choiceBtn}
                      style={{ color: BLUE, borderColor: "#D1DEF0" }}
                    >
                      <span className="grow shrink-0 basis-0 text-[11px] font-medium leading-4">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {sending && <div className="text-xs text-gray-400 self-start">Thinking...</div>}

      {error && (
        <div className="text-xs text-red-500 self-start break-words max-w-full">
          {error}
        </div>
      )}
    </>
  );
}


export function useVoiceRecorder({ onRecorded, onError }) {
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const secondsRef = useRef(0);
  const cancelledRef = useRef(false);

  const cbRef = useRef({});
  cbRef.current = { onRecorded: onRecorded, onError: onError };

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(function () {
    return function () {
      clearTimer();

      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        cancelledRef.current = true;
        recorder.stop();
      }
    };
  }, []);

  function start() {
    if (
      typeof window === "undefined" ||
      typeof MediaRecorder === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      cbRef.current.onError("Voice recording is not supported in this browser.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        let recorder;

        try {
          recorder = new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
        } catch (e) {
          recorder = new MediaRecorder(stream);
        }

        chunksRef.current = [];
        cancelledRef.current = false;
        secondsRef.current = 0;
        setRecordingSeconds(0);

        recorder.ondataavailable = function (event) {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = function () {
          clearTimer();

          stream.getTracks().forEach(function (track) {
            track.stop();
          });

          const duration = secondsRef.current;
          const wasCancelled = cancelledRef.current;

          setRecording(false);
          setRecordingSeconds(0);
          mediaRecorderRef.current = null;

          if (wasCancelled || !chunksRef.current.length) {
            return;
          }

          if (duration < 1) {
            cbRef.current.onError(
              "Recording too short. Please speak for a little longer."
            );
            return;
          }

          const mime = recorder.mimeType || "audio/webm";
          const blob = new Blob(chunksRef.current, { type: mime });

          const ext = mime.includes("mp4")
            ? "m4a"
            : mime.includes("ogg")
            ? "ogg"
            : "webm";

          const file = new File([blob], `voice-${Date.now()}.${ext}`, {
            type: mime,
          });

          cbRef.current.onRecorded(file, blob, duration);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();

        setRecording(true);
        cbRef.current.onError("");

        timerRef.current = setInterval(function () {
          secondsRef.current += 1;
          setRecordingSeconds(secondsRef.current);

          if (secondsRef.current >= 120 && recorder.state !== "inactive") {
            recorder.stop();
          }
        }, 1000);
      })
      .catch(function () {
        cbRef.current.onError(
          "Microphone permission is required for voice recording."
        );
      });
  }

  function stop() {
    const recorder = mediaRecorderRef.current;

    cancelledRef.current = false;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    setRecording(false);
  }

  function cancel() {
    const recorder = mediaRecorderRef.current;

    cancelledRef.current = true;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    clearTimer();
    setRecording(false);
  }

  function toggle() {
    if (recording) {
      stop();
    } else {
      start();
    }
  }

  return {
    recording: recording,
    recordingSeconds: recordingSeconds,
    start: start,
    stop: stop,
    cancel: cancel,
    toggle: toggle,
  };
}



function PanelHeader({ title, onBack, onClose }) {
  return (
    <div
      className="h-[76px] px-5 flex items-center gap-3 shrink-0 self-stretch text-white"
      style={{ background: NAVY }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-white cursor-pointer flex items-center"
          title="Back to chat"
        >
          <ArrowLeftIcon size={20} />
        </button>
      )}

      <div className="flex-1 text-lg font-medium">{title}</div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        title="Close"
        className="flex w-8 h-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer border-none"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}


const DESIGN_WIDTH = 1920;
const MIN_SCALE = 0.8;

function useWidgetScale() {
  const [scale, setScale] = useState(1);

  useEffect(function () {
    function update() {
      const s = window.innerWidth / DESIGN_WIDTH;
      setScale(Math.min(1, Math.max(MIN_SCALE, s)));
    }

    update();
    window.addEventListener("resize", update);

    return function () {
      window.removeEventListener("resize", update);
    };
  }, []);

  return scale;
}

export function ChatWidget({
  open,
  onToggle,
  onClose,
  items,
  sending,
  children,
  overlay,
  draft,
  setDraft,
  onSubmit,
  voice,
  onError,
  loadTickets,
}) {
  const chatRef = useRef(null);
  const menuRef = useRef(null);
  const scale = useWidgetScale();

  const [menuOpen, setMenuOpen] = useState(false);
  const [ticketList, setTicketList] = useState(null); // null = closed, array = open

  const ticketPageOpen = !!(overlay && overlay.props && overlay.props.page);

  useEffect(
    function () {
      setMenuOpen(false);
      setTicketList(null);
    },
    [open]
  );

  useEffect(
    function () {
      function scrollToBottom() {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }

      requestAnimationFrame(scrollToBottom);

      const t = setTimeout(scrollToBottom, 100);

      return function () {
        clearTimeout(t);
      };
    },
    [items, sending, open, ticketPageOpen]
  );

  useEffect(
    function () {
      function handleOutsideClick(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setMenuOpen(false);
        }
      }

      if (menuOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      }

      return function () {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    },
    [menuOpen]
  );

  async function openTickets() {
    setMenuOpen(false);

    try {
      const list = await loadTickets();
      setTicketList(list || []);
    } catch (err) {
      onError(err.message);
    }
  }

  const menuItem =
    "w-full min-h-[34px] px-[10px] py-[8px] flex items-center gap-2 self-stretch text-left rounded-lg border bg-white hover:bg-[#EEF3FA] cursor-pointer";

  const menuLabel =
    "grow shrink-0 basis-0 text-[11px] font-medium leading-4 text-[#064B9E]";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');",
        }}
      />

      <div
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white flex items-center justify-center cursor-pointer shadow-lg z-50"
        style={{ background: NAVY, transform: `scale(${scale})`, transformOrigin: "bottom right" }}
        title="Nextenti Support"
      >
        <BotIcon size={26} />
      </div>

      {open && (
        <div
          className="fixed bottom-24 right-6 w-[400px] h-[640px] max-h-[calc(100vh-7rem)] max-w-[calc(100vw-2rem)] bg-white border rounded-2xl shadow-[0_8px_28px_0_rgba(5,26,59,0.16)] flex flex-col z-50 overflow-hidden"
          style={{
            borderColor: "#D1DEF0",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            transform: `scale(${scale})`,
            transformOrigin: "bottom right",
          }}
        >
          {Array.isArray(ticketList) && (
            <div className="absolute inset-0 z-40 bg-white flex flex-col">
              <PanelHeader
                title="Your Tickets"
                onClose={function () {
                  setTicketList(null);
                }}
              />

              <div className="flex-1 overflow-y-auto p-3">
                {ticketList.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 py-10">
                    No tickets raised yet.
                  </div>
                ) : (
                  ticketList.map(function (ticket) {
                    return (
                      <div
                        key={ticket.id}
                        className="border rounded-lg p-3 mb-2 bg-white"
                        style={{ borderColor: BORDER }}
                      >
                        <div className="text-sm font-semibold" style={{ color: NAVY }}>
                          {ticketLabel(ticket)}
                        </div>

                        <div className="text-xs text-gray-500 mt-2">Description</div>

                        <div className="text-sm text-gray-800 mt-1 whitespace-pre-line break-words">
                          {ticket.description}
                        </div>

                        <div className="text-xs text-gray-500 mt-3">
                          Our support team will contact you shortly.
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-gray-100 p-3">
                <button
                  type="button"
                  onClick={function () {
                    setTicketList(null);
                  }}
                  className="w-full rounded-lg border bg-white text-sm font-semibold py-2.5 hover:bg-[#EEF3FA] cursor-pointer"
                  style={{ color: NAVY, borderColor: BORDER }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div
            className="h-[76px] px-5 flex items-center gap-3 shrink-0 self-stretch text-white"
            style={{ background: NAVY }}
          >
            {ticketPageOpen ? (
              <button
                type="button"
                onClick={function () {
                  if (overlay && overlay.props && overlay.props.onBack) {
                    overlay.props.onBack();
                  }
                }}
                title="Back"
                aria-label="Back"
                className="flex w-8 h-8 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer border-none"
              >
                <ArrowLeftIcon size={16} />
              </button>
            ) : (
              <div ref={menuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={function () {
                    setMenuOpen(function (v) {
                      return !v;
                    });
                  }}
                  title="Menu"
                  aria-label="Menu"
                  className="flex w-8 h-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer border-none"
                >
                  <MenuIcon size={16} />
                </button>

                {menuOpen && (
                  <div
                    className="absolute left-0 top-full z-30 mt-2 w-44 rounded-xl border bg-white p-2 shadow-lg"
                    style={{ borderColor: "#D1DEF0" }}
                  >
                    <button
                      type="button"
                      onClick={openTickets}
                      className={menuItem}
                      style={{ borderColor: "#D1DEF0" }}
                    >
                      <TicketIcon size={14} className="shrink-0 text-[#064B9E]" />
                      <span className={menuLabel}>View Tickets</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0 text-[18px] font-normal leading-[25px]">
              Nextenti Support
            </div>

            <button
              type="button"
              onClick={function () {
                voice.cancel();
                onClose();
              }}
              aria-label="Close"
              title="Close"
              className="flex w-8 h-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer border-none"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          {overlay}

          <div className={ticketPageOpen ? "hidden" : "contents"}>
            <div
              ref={chatRef}
              className="overflow-y-auto overflow-x-hidden px-[22px] py-4 flex-1 flex flex-col gap-[10px] min-h-0 self-stretch bg-white"
            >
              {children}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100"
            >
              {voice.recording ? (
                <>
                  <div className="flex-1 flex items-center gap-2 border border-red-200 bg-red-50 rounded-lg px-2.5 h-9 text-sm text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>

                    <span className="font-medium tabular-nums">
                      {formatDuration(voice.recordingSeconds)}
                    </span>

                    <span className="text-xs text-red-400">Recording...</span>
                  </div>

                  <button
                    type="button"
                    onClick={voice.cancel}
                    className="shrink-0 cursor-pointer text-gray-500 hover:text-red-600 px-1 bg-transparent border-none"
                    title="Cancel recording"
                  >
                    <TrashIcon size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={voice.stop}
                    className="w-10 h-9 rounded-lg border-none text-white flex items-center justify-center shrink-0 cursor-pointer"
                    style={{ background: BLUE }}
                    title="Send voice message"
                  >
                    <SendIcon />
                  </button>
                </>
              ) : (
                <>
                  <div className="relative flex-1 min-w-0">
                    <input
                      value={draft}
                      onChange={function (e) {
                        setDraft(e.target.value);
                      }}
                      placeholder="Type your message..."
                      className="w-full h-9 text-sm border rounded-lg pl-3 pr-9 outline-none focus:border-[#033A85] placeholder:text-[#064B9E]"
                      style={{ borderColor: BORDER }}
                      disabled={sending}
                    />

                    <button
                      type="button"
                      onClick={voice.toggle}
                      disabled={sending}
                      title="Start voice recording"
                      className="absolute right-[10px] top-[10px] w-4 h-4 p-0 flex items-center justify-center bg-transparent border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MicIcon />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="w-10 h-9 rounded-lg border-none text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: BLUE }}
                    title="Send"
                  >
                    <SendIcon />
                  </button>
                </>
              )}
            </form>

            <div className="self-stretch text-center text-[9px] leading-3 font-normal text-[#98A6B8] pb-2.5">
              Powered by Nextenti · Secure &amp; Confidential
            </div>
          </div>
        </div>
      )}
    </>
  );
}
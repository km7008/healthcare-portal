"use client";

import { useRef, useState } from "react";
import { api } from "../../lib/api";
import {
  ChatWidget,
  ChatItems,
  useVoiceRecorder,
  GUEST_SUGGESTIONS,
  matchTokens,
  matchSuggestion,
  ticketSubject,
  spokenAnswer,
  lastAskedQuestion,
  readStorage,
  writeStorage,
  timeNow,
  THANKS_RESOLVED_TEXT,
  notResolvedText,
  TicketPage,
} from "../../lib/chatShared";

const NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

const QUESTION_PATTERN =
  /^(what|why|how|when|where|who|which|can|could|would|should|is|are|do|does|did|will|tell me|explain|please tell me)\b/i;

const TICKETS_KEY = "public_chat_tickets";


const GREETING_PREFIX =
  /^(?:(?:hi+|hello|hey|hai|good\s+(?:morning|afternoon|evening))\b[\s,.!-]*)+/i;

const INTRO_PATTERN =
  /^(?:my\s+name\s+is|my\s+name's|name\s+is|i\s+am|i'm|im|this\s+is|it\s+is|it's|call\s+me|you\s+can\s+call\s+me|they\s+call\s+me)\s+(.+)$/i;

const NON_NAME_WORDS = new Set([
  "how", "what", "when", "where", "why", "who", "which", "can", "could",
  "should", "would", "the", "and", "for", "with", "that", "this", "from",
  "are", "was", "does", "did", "you", "your", "our", "please", "tell",
  "about", "have", "has", "get", "yes", "not", "any", "there", "need",
  "want", "know", "give", "show", "ok", "okay", "thanks", "thank", "fine",
  "good", "great", "sure", "new", "looking", "searching", "trying",
  "interested", "here", "help", "support", "job", "jobs", "hire", "hiring",
  "apply", "applying", "ticket", "resume", "account", "login", "signup",
  "profile", "user", "admin", "candidate", "organization",
]);

function detectName(text) {
  let t = String(text || "")
    .replace(/[’‘]/g, "'")
    .trim()
    .replace(/[.!?,\s]+$/, "");

  t = t.replace(GREETING_PREFIX, "").trim();

  if (!t) {
    return "";
  }

  const intro = t.match(INTRO_PATTERN);

  if (intro) {
    t = intro[1].trim().replace(/[.!?,\s]+$/, "");
  }

  const words = t.split(/\s+/);

  if (words.length > 3 || !NAME_PATTERN.test(t) || QUESTION_PATTERN.test(t)) {
    return "";
  }

  const chipWords = new Set(
    GUEST_SUGGESTIONS.reduce(function (all, c) {
      return all.concat(matchTokens(c.label));
    }, [])
  );

  const blocked = words.some(function (w) {
    const lower = w.toLowerCase();

    return (
      NON_NAME_WORDS.has(lower) ||
      chipWords.has(
        lower.length > 3 && lower.endsWith("s") && !lower.endsWith("ss")
          ? lower.slice(0, -1)
          : lower
      )
    );
  });

  if (blocked) {
    return "";
  }

  return t === t.toLowerCase()
    ? words
        .map(function (w) {
          return w.charAt(0).toUpperCase() + w.slice(1);
        })
        .join(" ")
    : t;
}


export default function LoginChatbot() {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [chatStage, setChatStage] = useState("name");
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [userName, setUserName] = useState("");

  const [ticketStage, setTicketStage] = useState("none");
  const [ticketPage, setTicketPage] = useState(null); 
  const [ticketInfo, setTicketInfo] = useState(null);
  const [ticketQuestion, setTicketQuestion] = useState("");

  const processRef = useRef(null);


  function pushUser(text, system) {
    setItems(function (prev) {
      return prev.concat([
        { kind: "user", text: text, time: timeNow(), system: !!system },
      ]);
    });
  }

  function pushBot(text, extra) {
    setItems(function (prev) {
      return prev.concat([
        Object.assign(
          { kind: "bot", text: text, time: timeNow(), plain: true },
          extra || {}
        ),
      ]);
    });
  }

  function buildHistory() {
    return items
      .filter(function (item) {
        return (
          item.kind === "user" ||
          item.kind === "bot" ||
          (item.kind === "voice" && item.transcript)
        );
      })
      .slice(-10)
      .map(function (item) {
        return {
          role: item.kind === "bot" ? "assistant" : "user",
          text: item.kind === "voice" ? item.transcript : item.text,
        };
      });
  }

  function typeOutMessage(fullText, onDone, extra) {
    const text = String(fullText || "");

    setItems(function (prev) {
      return prev.concat([
        Object.assign({ kind: "bot", text: "", time: timeNow() }, extra || {}),
      ]);
    });

    let index = 0;

    const interval = setInterval(function () {
      index += 3;

      setItems(function (prev) {
        const updated = prev.slice();
        const last = updated.length - 1;

        if (last < 0) {
          return prev;
        }

        updated[last] = Object.assign({}, updated[last], {
          text: text.slice(0, index),
        });

        return updated;
      });

      if (index >= text.length) {
        clearInterval(interval);

        if (onDone) {
          onDone();
        }
      }
    }, 5);
  }

  function showResolvePrompt() {
    setItems(function (prev) {
      return prev.concat([{ kind: "resolve_prompt", answered: false }]);
    });
  }

  function answerWithResolve(text, askedText) {
    typeOutMessage(text, function () {
      if (/support agent/i.test(text)) {
        askTicketConfirmation(
          askedText || "",
          "Would you like to raise a support ticket now?",
          false
        );
      } else {
        showResolvePrompt();
      }
    });
  }

  function askTicketConfirmation(question, promptText, withSorryLine) {
    if (question) {
      setTicketQuestion(question);
    }

    setTicketStage("confirm");

    setItems(function (prev) {
      const extra = withSorryLine
        ? [
            {
              kind: "bot",
              text: "I couldn't find an answer to your question.",
              time: timeNow(),
              plain: true,
            },
          ]
        : [];

      return prev.concat(extra).concat([
        {
          kind: "ticket_prompt",
          text: promptText,
          time: timeNow(),
        },
      ]);
    });
  }

  function resetTicketState() {
    setTicketStage("none");
    setTicketQuestion("");
  }


  async function freshGreeting() {
    setItems([]);
    setError("");
    setDraft("");
    setChatStage("name");
    setUserName("");

    resetTicketState();

    setSending(true);

    try {
      const response = await api.publicChat("__login_start__", []);

      setSending(false);

      if (response && response.answer) {
        pushBot(response.answer);
      }
    } catch (err) {
      setSending(false);
      setError(err.message);
    }
  }

  function toggleWidget() {
    const next = !widgetOpen;

    setWidgetOpen(next);

    if (next && items.length === 0) {
      freshGreeting();
    }
  }

  function showMainMenu() {
    const text = userName
      ? `Hi, ${userName}! How can I help you today?`
      : "Hi! How can I help you today?";

    typeOutMessage(
      text,
      function () {
        setItems(function (prev) {
          const updated = prev.slice();

          updated[updated.length - 1] = Object.assign({}, updated[updated.length - 1], {
            text: text,
            suggestions: GUEST_SUGGESTIONS,
          });

          return updated;
        });
      },
      { plain: true }
    );
  }


  function handleResolve(choice) {
    const asked = lastAskedQuestion(items);

    setItems(function (prev) {
      return prev.map(function (it) {
        return it.kind === "resolve_prompt"
          ? Object.assign({}, it, { answered: true })
          : it;
      });
    });

    if (choice === "yes") {
      pushUser("Yes, resolved", true);
      typeOutMessage(THANKS_RESOLVED_TEXT, null, { plain: true });
      return;
    }

    if (choice === "no") {
      pushUser("No, I need more help", true);
      typeOutMessage(notResolvedText(asked), null, { plain: true });
      return;
    }

    pushUser("Back to main menu", true);
    showMainMenu();
  }


  function showTicketForm() {
    setTicketStage("none");
    setTicketInfo(null);
    setTicketPage("form");
  }

  function handleTicketBack() {
    setTicketPage(null);
    setTicketInfo(null);
    resetTicketState();

    pushUser("Back to main menu", true);
    showMainMenu();
  }

  function handleTicketAnswer(value) {
    setDraft("");
    setError("");

    const answer = spokenAnswer(value);

    if (answer === "Yes") {
      showTicketForm();
      return;
    }

    if (answer === "No") {
      resetTicketState();
      typeOutMessage("Thank you. Have a great day.", null, { plain: true });
      return;
    }

    typeOutMessage(
      "Please answer Yes or No. Would you like us to raise a support ticket?",
      null,
      { plain: true }
    );
  }

  async function createTicket(values) {
    setSending(true);
    setError("");

    try {
      const ticket = await api.createPublicTicket({
        contact_name: values.name,
        contact_email: values.email,
        contact_phone: values.phone,
        subject:
          ticketSubject(values, ticketQuestion),
        description: values.description || ticketQuestion,
      });

      let attachmentSent = true;

      if (values.file) {
        try {
          await api.uploadPublicTicketAttachment(values.file, ticket.id);
        } catch (e) {
          attachmentSent = false;
        }
      }

      const submittedQuestion = ticketQuestion;

      setSending(false);

      setTicketInfo({
        ticket: ticket,
        email: values.email,
        question: submittedQuestion,
        time: timeNow(),
        attachmentFailed: !!values.file && !attachmentSent,
      });
      setTicketPage("success");

      resetTicketState();
      setDraft("");

      writeStorage(
        TICKETS_KEY,
        [
          {
            id: ticket.id,
            ticket_number: ticket.ticket_number,
            description: values.description || submittedQuestion,
          },
        ].concat(readStorage(TICKETS_KEY))
      );
    } catch (err) {
      setSending(false);
      setError(err.message);
    }
  }

  
  async function processInput(question, skipUserBubble, displayText) {
    setError("");

    if (ticketStage === "confirm") {
      if (!skipUserBubble) {
        pushUser(question, true);
      }

      handleTicketAnswer(question);

      return;
    }

    setDraft("");
    setSending(true);

    let history = buildHistory();

    if (
      skipUserBubble &&
      history.length &&
      history[history.length - 1].role === "user" &&
      history[history.length - 1].text === question
    ) {
      history = history.slice(0, -1);
    }

    if (chatStage === "name") {
      const nameCandidate = detectName(question);

      if (nameCandidate) {
        if (!skipUserBubble) {
          pushUser(question, true);
        }

        try {
          const response = await api.publicChat("__login_name__", [
            { role: "user", text: nameCandidate },
          ]);

          setSending(false);

          if (response && response.answer) {
            setChatStage("chat");
            setUserName(nameCandidate);

            typeOutMessage(
              response.answer,
              function () {
                setItems(function (prev) {
                  const updated = prev.slice();

                  updated[updated.length - 1] = Object.assign(
                    {},
                    updated[updated.length - 1],
                    {
                      text: response.answer,
                      suggestions: GUEST_SUGGESTIONS,
                    }
                  );

                  return updated;
                });
              },
              { plain: true }
            );
          }
        } catch (err) {
          setSending(false);
          setError(err.message);
        }

        return;
      }
    }

    if (!skipUserBubble) {
      pushUser(displayText || question);
    }

    const chip = matchSuggestion(question, GUEST_SUGGESTIONS);

    try {
      const response = await api.publicChat(chip ? chip.query : question, history);

      setSending(false);

      if (!response || !response.answer) {
        return;
      }

      if (response.source === "ticket_form") {
        askTicketConfirmation(
          response.question || question,
          "Would you like to raise a support ticket?",
          true
        );

        return;
      }

      if (chatStage === "name") {
        setChatStage("chat");
      }

      if (response.source === "greeting") {
        typeOutMessage(response.answer, null, { plain: true });
        return;
      }

      answerWithResolve(response.answer, displayText || question);
    } catch (err) {
      setSending(false);
      setError(err.message);
    }
  }

  processRef.current = processInput;

  async function submitQuestion(e) {
    e.preventDefault();

    const question = draft.trim();

    if (!question || sending) {
      return;
    }

    await processInput(question, false);
  }

  function handleTicketChoice(choice) {
    if (sending) {
      return;
    }

    processInput(choice, false);
  }

  function handleSuggestionClick(question, label) {
    if (sending) {
      return;
    }

    processInput(question, false, label);
  }


  function updateVoiceItem(id, patch) {
    setItems(function (prev) {
      return prev.map(function (it) {
        return it.id === id ? Object.assign({}, it, patch) : it;
      });
    });
  }

  function voiceFallback(voiceId) {
    updateVoiceItem(voiceId, { status: "error" });
    setSending(false);

    pushBot(
      "Sorry, I could not recognize your voice. Please try speaking again, or type your message below."
    );
  }

  async function transcribeAndAsk(audioFile, voiceId) {
    setSending(true);
    setError("");

    try {
      if (typeof api.transcribePublicAudio !== "function") {
        throw new Error("api.transcribePublicAudio is not set up in lib/api.js");
      }

      const res = await api.transcribePublicAudio(audioFile);

      const text = ((res && res.text) || "").trim();

      if (!text || /thanks for watching|subtitles by|amara\.org/i.test(text)) {
        voiceFallback(voiceId);
        return;
      }

      updateVoiceItem(voiceId, { transcript: text, status: "done" });

      setSending(false);

      processRef.current(text, true);
    } catch (err) {
      console.error("Voice transcription failed:", err);
      voiceFallback(voiceId);
    }
  }

  const voice = useVoiceRecorder({
    onRecorded: function (file, blob, duration) {
      const voiceId = `voice-${Date.now()}`;

      setItems(function (prev) {
        return prev.concat([
          {
            kind: "voice",
            id: voiceId,
            audioUrl: URL.createObjectURL(blob),
            duration: duration,
            transcript: "",
            status: "transcribing",
            time: timeNow(),
          },
        ]);
      });

      transcribeAndAsk(file, voiceId);
    },
    onError: setError,
  });

  async function loadTickets() {
    return readStorage(TICKETS_KEY);
  }

  return (
    <ChatWidget
      open={widgetOpen}
      onToggle={toggleWidget}
      onClose={function () {
        setWidgetOpen(false);
      }}
      items={items}
      sending={sending}
      overlay={
        <TicketPage
          page={ticketPage}
          info={ticketInfo}
          defaults={{ name: userName || "", email: "", phone: "" }}
          sending={sending}
          error={error}
          onSubmit={createTicket}
          onBack={handleTicketBack}
        />
      }
      draft={draft}
      setDraft={setDraft}
      onSubmit={submitQuestion}
      voice={voice}
      onError={setError}
      loadTickets={loadTickets}
    >
      <ChatItems
        items={items}
        sending={sending}
        error={error}
        ticketChoiceEnabled={ticketStage === "confirm"}
        onTicketChoice={handleTicketChoice}
        onResolve={handleResolve}
        onSuggestion={handleSuggestionClick}
      />
    </ChatWidget>
  );
}
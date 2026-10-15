"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { api, session } from "../../lib/api";
import {
  ChatWidget,
  ChatItems,
  useVoiceRecorder,
  getGreetingSuggestions,
  getMatchSuggestions,
  matchSuggestion,
  spokenAnswer,
  ticketSubject,
  lastAskedQuestion,
  stripAudio,
  timeNow,
  ticketCreatedText,
  THANKS_RESOLVED_TEXT,
  notResolvedText,
  TicketPage,
} from "../../lib/chatShared";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [widgetOpen, setWidgetOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [ticketStep, setTicketStep] = useState(null);
  const [ticketPage, setTicketPage] = useState(null); 
  const [ticketInfo, setTicketInfo] = useState(null);
  const [ticketQuestion, setTicketQuestion] = useState("");

  const chatLoadedRef = useRef(false);

  const actionsRef = useRef({});
  const ticketStepRef = useRef(null);
  ticketStepRef.current = ticketStep;


  useEffect(
    function () {
      const token = session.getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const currentUser = session.getUser();

      if (currentUser && currentUser.role === "admin") {
        router.replace("/admin");
        return;
      }

      setUser(currentUser);

      if (currentUser) {
        const saved = localStorage.getItem(`chat_history_${currentUser.email}`);

        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch (e) {
            setItems([]);
          }
        }
      }
    },
    [router]
  );

  useEffect(
    function () {
      if (user) {
        chatLoadedRef.current = true;
      }
    },
    [user]
  );

  useEffect(
    function () {
      if (!user || !chatLoadedRef.current) {
        return;
      }

      localStorage.setItem(
        `chat_history_${user.email}`,
        JSON.stringify(stripAudio(items))
      );
    },
    [user, items]
  );

  function handleLogout() {
    session.clearSession();
    router.replace("/");
  }


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
      .filter(function (it) {
        return (
          it.kind === "user" ||
          it.kind === "bot" ||
          (it.kind === "voice" && it.transcript)
        );
      })
      .slice(-10)
      .map(function (it) {
        return {
          role: it.kind === "bot" ? "assistant" : "user",
          text: it.kind === "voice" ? it.transcript : it.text,
        };
      });
  }

  function typeOutMessage(fullText, onDone, extra) {
    const text = String(fullText || "");

    setItems(function (prev) {
      return prev.concat([
        Object.assign(
          { kind: "bot", text: "", time: timeNow() },
          extra || {}
        ),
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
    }, 6);
  }

  function showResolvePrompt() {
    setItems(function (prev) {
      return prev.concat([{ kind: "resolve_prompt", answered: false }]);
    });
  }

  function offerTicket(text) {
    setTicketStep("waiting_yes_no");

    setItems(function (prev) {
      return prev.concat([
        {
          kind: "ticket_prompt",
          text: text || "Would you like to raise a support ticket?",
          time: timeNow(),
        },
      ]);
    });
  }

  function answerWithResolve(text, askedText) {
    typeOutMessage(text, function () {
      if (/support agent/i.test(text)) {
        if (askedText) {
          setTicketQuestion(askedText);
        }

        offerTicket("Would you like to raise a support ticket now?");
      } else {
        showResolvePrompt();
      }
    });
  }

  function ticketCreatedMessage(ticket) {
    typeOutMessage(ticketCreatedText(ticket), null, { plain: true });
  }


  function greetingText() {
    const first = user && user.name ? String(user.name).split(" ")[0] : "there";

    return `Hi, ${first}! How can I help you today?`;
  }

  function showMainMenu(resetChat) {
    const text = greetingText();

    if (resetChat) {
      setItems([]);
      setError("");
      setDraft("");
    }

    typeOutMessage(
      text,
      function () {
        setItems(function (prev) {
          const updated = prev.slice();

          updated[updated.length - 1] = Object.assign({}, updated[updated.length - 1], {
            text: text,
            suggestions: getGreetingSuggestions(user),
          });

          return updated;
        });
      },
      { plain: true }
    );
  }

  function toggleWidget() {
    const next = !widgetOpen;

    setWidgetOpen(next);

    if (next && items.length === 0) {
      showMainMenu(true);
    }
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
    showMainMenu(false);
  }


  function startTicketFlow(question) {
    setTicketQuestion(question);
    setTicketStep("waiting_yes_no");

    setItems(function (prev) {
      return prev.concat([
        {
          kind: "bot",
          text: "I couldn't find an answer to your question.",
          time: timeNow(),
          plain: true,
        },
        {
          kind: "ticket_prompt",
          text: "Would you like to raise a support ticket?",
          time: timeNow(),
        },
      ]);
    });
  }

  function showTicketForm() {
    setTicketStep(null);
    setTicketInfo(null);
    setTicketPage("form");
  }

  function handleTicketBack() {
    setTicketPage(null);
    setTicketInfo(null);
    setTicketStep(null);
    setTicketQuestion("");

    pushUser("Back to main menu", true);
    showMainMenu(false);
  }

  function handleTicketChoice(choice, skipBubble) {
    if (!skipBubble) {
      pushUser(choice, true);
    }

    if (choice === "Yes") {
      showTicketForm();
      return;
    }

    setTicketStep(null);
    setTicketQuestion("");

    pushBot("Okay. If you need help later, you can raise a support ticket from the chat.");
  }

  async function createSupportTicket(values) {
    if (!user) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const ticket = await api.createTicket(
        values.name,
        values.email,
        values.phone,
        ticketSubject(values, ticketQuestion),
        values.description
      );

      let attachmentFailed = false;

      if (values.file) {
        try {
          await api.uploadTicketAttachment(values.file, ticket.id);
        } catch (e) {
          attachmentFailed = true;
        }
      }

      setTicketInfo({
        ticket: ticket,
        email: values.email,
        question: ticketQuestion,
        time: timeNow(),
        attachmentFailed: attachmentFailed,
      });
      setTicketPage("success");
      setTicketQuestion("");
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }


  function handleBotResponse(res, askedText) {
    if (res.source === "greeting") {
      typeOutMessage(res.answer || "", null, { plain: true });
      return;
    }

    if (res.source === "ticket_prompt") {
      startTicketFlow(askedText);
      return;
    }

    if (res.source === "suggestions") {
      typeOutMessage(
        res.answer || "",
        function () {
          setItems(function (prev) {
            const updated = prev.slice();

            updated[updated.length - 1] = Object.assign({}, updated[updated.length - 1], {
              text: res.answer || "",
              suggestions: res.suggestions || [],
            });

            return updated;
          });
        },
        { plain: true }
      );

      return;
    }

    if (res.source === "ticket") {
      if (res.ticket) {
        ticketCreatedMessage(res.ticket);
      } else {
        typeOutMessage(res.answer || "", null, { plain: true });
      }

      return;
    }

    answerWithResolve(res.answer || "I received your request.", askedText);
  }

  async function submitQuestion(rawText, skipUserBubble) {
    const question = rawText.trim();

    if (!question) {
      return;
    }

    const history = buildHistory();

    if (!skipUserBubble) {
      pushUser(question);
    }

    setDraft("");
    setSending(true);
    setError("");

    try {
      const chip = matchSuggestion(question, getMatchSuggestions(user));

      const res = await api.askFaq(chip ? chip.query : question, history, !!chip);

      setSending(false);
      handleBotResponse(res, question);
    } catch (err) {
      setSending(false);
      setError(err.message);
    }
  }

  async function handleSuggestionClick(question, label) {
    pushUser(label || question);

    setSending(true);
    setError("");

    try {
      const res = await api.askFaq(question, buildHistory(), true);

      setSending(false);
      handleBotResponse(res, label || question);
    } catch (err) {
      setSending(false);
      setError(err.message);
    }
  }

  function handleSend(e) {
    e.preventDefault();

    const text = draft.trim();

    if (!text) {
      return;
    }

    if (ticketStep === "waiting_yes_no") {
      const answer = spokenAnswer(text);

      if (answer) {
        setDraft("");
        handleTicketChoice(answer);
        return;
      }
    }

    submitQuestion(text);
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
      if (typeof api.transcribeAudio !== "function") {
        throw new Error("api.transcribeAudio is not set up in lib/api.js");
      }

      const res = await api.transcribeAudio(audioFile);

      const text = ((res && res.text) || "").trim();

      if (!text || /thanks for watching|subtitles by|amara\.org/i.test(text)) {
        voiceFallback(voiceId);
        return;
      }

      updateVoiceItem(voiceId, { transcript: text, status: "done" });

      setSending(false);

      const a = actionsRef.current;

      if (ticketStepRef.current === "waiting_yes_no") {
        const answer = spokenAnswer(text);

        if (answer) {
          a.handleTicketChoice(answer, true);
          return;
        }
      }

      a.submitQuestion(text, true);
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

  actionsRef.current = {
    submitQuestion: submitQuestion,
    handleTicketChoice: handleTicketChoice,
  };

  async function loadTickets() {
    return await api.listMyTickets();
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="font-bold text-xl">Healthcare Portal</div>

        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/dashboard/jobs"
            className={pathname === "/dashboard/jobs" ? "font-bold" : "font-normal"}
          >
            Jobs
          </Link>

          <Link
            href="/dashboard/profile"
            className={pathname === "/dashboard/profile" ? "font-bold" : "font-normal"}
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="bg-white/20 border-none text-white px-3.5 py-2 rounded-lg cursor-pointer "
          >
            Log Out
          </button>
        </div>
      </div>

      {children}

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
            defaults={{
              name: (user && user.name) || "",
              email: (user && user.email) || "",
              phone: (user && user.phone) || "",
            }}
            sending={sending}
            error={error}
            onSubmit={createSupportTicket}
            onBack={handleTicketBack}
          />
        }
        draft={draft}
        setDraft={setDraft}
        onSubmit={handleSend}
        voice={voice}
        onError={setError}
        loadTickets={loadTickets}
      >
        <ChatItems
          items={items}
          sending={sending}
          error={error}
          ticketChoiceEnabled={ticketStep === "waiting_yes_no"}
          onTicketChoice={function (choice) {
            handleTicketChoice(choice);
          }}
          onResolve={handleResolve}
          onSuggestion={handleSuggestionClick}
        />
      </ChatWidget>
    </div>
  );
}
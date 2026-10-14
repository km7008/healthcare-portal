"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, session } from "../../../../lib/api";
import { formatRelativeTime } from "../../../../lib/format";

function StatusBadge({ status }) {
  const isOpen =
    String(status).toLowerCase() === "open";

  return (
    <span
      className={
        isOpen
          ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-sm font-medium text-blue-700"
          : "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-600"
      }
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          backgroundColor: isOpen
            ? "#1447E6"
            : "#6A7282",
        }}
      />

      {isOpen ? "Open" : "Closed"}
    </span>
  );
}

function displaySubject(subject) {
  if (
    !subject ||
    String(subject)
      .toLowerCase()
      .includes("auto-raised")
  ) {
    return "Support Ticket";
  }

  return subject;
}

function formatFileSize(bytes) {
  const n = Number(bytes || 0);

  if (n >= 1024 * 1024) {
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();

  const shortCode = String(params.id)
    .replace(/^TKT-/i, "")
    .toUpperCase();

  const [user, setUser] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // status button feedback ("Ticket closed" / "Ticket reopened")
  const [statusMessage, setStatusMessage] = useState("");

  // admin remark: idle -> saving -> saved (green) / error (red)
  const [remark, setRemark] = useState("");
  const [remarkState, setRemarkState] = useState("idle");
  const remarkLoadedRef = useRef(false);

  // files sent by the user (photos / PDFs)
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);
  const attachmentUrlsRef = useRef([]);

  const timersRef = useRef([]);

  function later(fn, ms) {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  }

  useEffect(function () {
    const token = session.getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const currentUser = session.getUser();

    if (
      !currentUser ||
      currentUser.role !== "admin"
    ) {
      router.replace("/dashboard/jobs");
      return;
    }

    setUser(currentUser);
    loadTicket();

    return function () {
      timersRef.current.forEach(clearTimeout);

      attachmentUrlsRef.current.forEach(function (url) {
        URL.revokeObjectURL(url);
      });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAttachments(ticketId) {
    try {
      const list = await api.listTicketAttachments(ticketId);

      const withUrls = await Promise.all(
        (list || []).map(async function (att) {
          try {
            const blob = await api.getAttachmentBlob(att.id);
            const url = URL.createObjectURL(blob);

            attachmentUrlsRef.current.push(url);

            return Object.assign({}, att, { url: url });
          } catch (e) {
            return Object.assign({}, att, { url: "" });
          }
        })
      );

      setAttachments(withUrls);
    } catch (e) {
      setAttachments([]);
    } finally {
      setAttachmentsLoading(false);
    }
  }

  async function loadTicket() {
    setError("");

    try {
      const data =
        await api.getTicketByCode(shortCode);

      setTicket(data);

      // fill the remark box only the first time,
      // so the 60 second refresh never wipes what the admin is typing
      if (!remarkLoadedRef.current) {
        remarkLoadedRef.current = true;
        setRemark(data.admin_remark || "");
        loadAttachments(data.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(
    function () {
      const interval = setInterval(
        loadTicket,
        60000
      );

      return function () {
        clearInterval(interval);
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [shortCode]
  );

  async function handleToggleStatus() {
    if (!ticket || saving) return;

    const newStatus =
      String(ticket.status).toLowerCase() ===
      "open"
        ? "closed"
        : "open";

    setSaving(true);
    setStatusMessage("");
    setError("");

    try {
      await api.updateTicketStatus(
        ticket.id,
        newStatus
      );

      await loadTicket();

      setStatusMessage(
        newStatus === "closed"
          ? "Ticket closed"
          : "Ticket reopened"
      );

      later(function () {
        setStatusMessage("");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRemark() {
    if (!ticket || remarkState === "saving") return;

    setRemarkState("saving");
    setError("");

    try {
      // the status route also stores the admin remark
      const updated = await api.updateTicketStatus(
        ticket.id,
        String(ticket.status).toLowerCase(),
        remark.trim()
      );

      setTicket(function (prev) {
        return Object.assign({}, prev, updated);
      });

      setRemarkState("saved");

      later(function () {
        setRemarkState("idle");
      }, 2500);
    } catch (err) {
      setError(err.message);
      setRemarkState("error");

      later(function () {
        setRemarkState("idle");
      }, 3000);
    }
  }

  function handleLogout() {
    session.clearSession();
    router.replace("/login");
  }

  if (!user || loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-4">
        <p className="text-red-500">
          {error || "Ticket not found."}
        </p>
      </div>
    );
  }

  const isOpen =
    String(ticket.status).toLowerCase() ===
    "open";

  const ticketCode = String(
    ticket.ticket_number || shortCode
  ).padStart(4, "0");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="font-bold text-xl">
          Healthcare Portal — Admin
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-white/20 border-none text-white px-3.5 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-white/30"
        >
          Log Out
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-6">
        <Link
          href="/admin"
          className="text-sm text-black hover:underline cursor-pointer"
        >
          Back to All Tickets
        </Link>

        <div className="flex items-center justify-between mt-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">
              TKT-{ticketCode}
            </h1>

            <p className="text-base text-gray-500 mt-1">
              {displaySubject(ticket.subject)}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Updated{" "}
              {formatRelativeTime(
                ticket.updated_at
              )}
            </p>
          </div>

          <StatusBadge status={ticket.status} />
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        {/* PHONE (before the description) */}

        <div className="bg-white rounded-lg border border-blue-100 p-4 mb-3">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Phone
          </div>

          <div className="text-sm text-gray-800">
            {ticket.contact_phone || "Not provided"}
          </div>
        </div>

        {/* DESCRIPTION */}

        <div className="bg-white rounded-lg border border-blue-100 p-4 mb-3">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Description
          </div>

          <div className="text-sm text-gray-800 whitespace-pre-line break-words">
            {ticket.description}
          </div>
        </div>

        {/* ATTACHMENTS (under the description) */}

        <div className="bg-white rounded-lg border border-blue-100 p-4 mb-5">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Attachments
          </div>

          {attachmentsLoading ? (
            <div className="text-sm text-gray-400">
              Loading attachments...
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-sm text-gray-400">
              No attachments
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {attachments.map(function (att) {
                const isImage =
                  String(att.content_type).indexOf(
                    "image/"
                  ) === 0;

                return (
                  <div
                    key={att.id}
                    className="w-32 flex flex-col gap-1"
                  >
                    {isImage ? (
                      <a
                        href={att.url || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className={
                          att.url
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        }
                      >
                        {att.url ? (
                          <img
                            src={att.url}
                            alt={att.filename}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                            Not available
                          </div>
                        )}
                      </a>
                    ) : (
                      <a
                        href={att.url || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-32 h-32 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 text-blue-700 ${
                          att.url
                            ? "cursor-pointer hover:bg-blue-50"
                            : "cursor-not-allowed"
                        }`}
                      >
                        <span className="text-2xl font-bold">
                          PDF
                        </span>

                        <span className="text-xs">
                          Click to open
                        </span>
                      </a>
                    )}

                    <div
                      className="text-xs text-gray-700 truncate"
                      title={att.filename}
                    >
                      {att.filename}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>
                        {formatFileSize(att.file_size)}
                      </span>

                      {att.url && (
                        <a
                          href={att.url}
                          download={att.filename}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* OPEN / CLOSE */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={saving}
            className={`px-5 py-3 rounded-lg text-sm font-bold text-white transition-colors ${
              saving
                ? "bg-blue-400 cursor-wait"
                : isOpen
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            }`}
          >
            {saving
              ? "Saving..."
              : isOpen
              ? "Mark Closed"
              : "Reopen"}
          </button>

          {statusMessage && (
            <span
              className={`text-sm font-medium ${
                isOpen
                  ? "text-blue-600"
                  : "text-emerald-600"
              }`}
            >
              ✓ {statusMessage}
            </span>
          )}
        </div>

        {/* ADMIN REMARK */}

        <div className="bg-white rounded-lg border border-blue-100 p-5 mt-6">
          <div className="text-lg font-semibold text-blue-700 mb-3">
            Admin Remark
          </div>

          <textarea
            value={remark}
            onChange={function (e) {
              setRemark(e.target.value);

              if (remarkState !== "saving") {
                setRemarkState("idle");
              }
            }}
            rows={3}
            placeholder="Enter a remark for this user..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y"
          />

          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={handleSaveRemark}
              disabled={remarkState === "saving"}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                remarkState === "saving"
                  ? "bg-blue-400 cursor-wait"
                  : remarkState === "saved"
                  ? "bg-emerald-600 cursor-pointer"
                  : remarkState === "error"
                  ? "bg-red-600 cursor-pointer"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {remarkState === "saving"
                ? "Saving..."
                : remarkState === "saved"
                ? "Saved ✓"
                : remarkState === "error"
                ? "Try again"
                : "Save Remark"}
            </button>

            {remarkState === "saved" && (
              <span className="text-sm font-medium text-emerald-600">
                Remark saved
              </span>
            )}

            {remarkState === "error" && (
              <span className="text-sm font-medium text-red-600">
                Could not save the remark
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
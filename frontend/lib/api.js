const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";


function getToken() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    "token"
  );
}


function setSession(
  token,
  user
) {
  localStorage.setItem(
    "token",
    token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );
}


function clearSession() {
  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user"
  );
}


function getUser() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const raw =
    localStorage.getItem("user");

  return raw
    ? JSON.parse(raw)
    : null;
}


async function request(
  path,
  {
    method = "GET",
    body,
    auth = false,
    timeoutMs = 0,
  } = {}
) {
  const headers = {
    "Content-Type":
      "application/json",
  };

  if (auth) {
    const token =
      getToken();

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  const controller =
    new AbortController();

  let timeoutId = null;

  if (timeoutMs > 0) {
    timeoutId = setTimeout(
      function () {
        controller.abort();
      },
      timeoutMs
    );
  }

  try {
    const response =
      await fetch(
        `${API_URL}${path}`,
        {
          method,
          headers,
          body: body
            ? JSON.stringify(body)
            : undefined,
          signal:
            controller.signal,
        }
      );

    if (!response.ok) {
      let detail =
        "Something went wrong";

      try {
        const data =
          await response.json();

        if (
          Array.isArray(
            data.detail
          )
        ) {
          detail =
            data.detail
              .map(
                function (item) {
                  return item.msg;
                }
              )
              .join(", ");
        } else if (
          typeof data.detail ===
          "string"
        ) {
          detail =
            data.detail;
        }
      } catch {}

      throw new Error(detail);
    }

    if (
      response.status === 204
    ) {
      return null;
    }

    return await response.json();

  } catch (error) {
    if (
      error &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "The request timed out. Please try again."
      );
    }

    throw error;

  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}


// Reads a Server-Sent Events (SSE) response. The server pushes the answer
// as soon as it is ready, so there is no waiting between polls.
async function streamRequest(path, body, auth) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };

  if (auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  function unavailable(message) {
    const err = new Error(message);
    err.streamUnavailable = true;
    return err;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw unavailable("Unable to reach the server.");
  }

  if (!response.ok) {
    // old backend without the stream route -> caller falls back to polling
    if ([404, 405, 501].includes(response.status)) {
      throw unavailable("Streaming is not available");
    }

    let detail = "Something went wrong";

    try {
      const data = await response.json();

      if (Array.isArray(data.detail)) {
        detail = data.detail
          .map(function (item) {
            return item.msg;
          })
          .join(", ");
      } else if (typeof data.detail === "string") {
        detail = data.detail;
      }
    } catch {}

    throw new Error(detail);
  }

  if (!response.body || !response.body.getReader) {
    throw unavailable("Streaming is not supported");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let sep = buffer.indexOf("\n\n");

    while (sep !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      let eventName = "message";
      let data = "";

      rawEvent.split("\n").forEach(function (line) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          data += line.slice(5).trim();
        }
      });

      // lines starting with ":" are keep-alive pings (no data)
      if (data) {
        const parsed = JSON.parse(data);

        if (eventName === "result") {
          reader.cancel().catch(function () {});
          return parsed;
        }

        if (eventName === "error") {
          throw new Error(
            parsed.error ||
              "Unable to process the chat request."
          );
        }
      }

      sep = buffer.indexOf("\n\n");
    }
  }

  throw new Error(
    "The connection closed before the answer arrived."
  );
}


export const api = {

  register: (
    email,
    password,
    name,
    phone,
    role,
  ) =>
    request(
      "/auth/register",
      {
        method: "POST",
        body: {
          email,
          password,
          name,
          phone,
          role,
        },
      }
    ),


  login: (
    email,
    password,
    role
  ) =>
    request(
      "/auth/login",
      {
        method: "POST",
        body: {
          email,
          password,
          role,
        },
      }
    ),


  askFaq: async (
    query,
    history,
    isSuggestion
  ) => {
    // fast path: the server pushes the answer as soon as it is ready (SSE)
    try {
      return await streamRequest(
        "/chat/stream",
        {
          query,
          history: history || [],
          is_suggestion: !!isSuggestion,
        },
        true
      );
    } catch (err) {
      if (!err || !err.streamUnavailable) {
        throw err;
      }
      // backend without /chat/stream -> polling below
    }

    const started =
      await request(
        "/chat/start",
        {
          method: "POST",
          body: {
            query,
            history:
              history || [],
            is_suggestion:
              !!isSuggestion,
          },
          auth: true,
        }
      );

    const POLL_INTERVAL_MS =
      500;

    const MAX_ATTEMPTS =
      120;

    return new Promise(
      (
        resolve,
        reject
      ) => {
        let attempts = 0;

        async function poll() {
          attempts += 1;

          if (
            attempts >
            MAX_ATTEMPTS
          ) {
            reject(
              new Error(
                "Chat response timed out."
              )
            );
            return;
          }

          try {
            const result =
              await request(
                `/chat/status/${started.job_id}`,
                {
                  method: "GET",
                  auth: true,
                }
              );

            if (
              result.status ===
              "completed"
            ) {
              resolve(
                result.response
              );
              return;
            }

            if (
              result.status ===
              "failed"
            ) {
              reject(
                new Error(
                  result.error ||
                    "Unable to process the chat request."
                )
              );
              return;
            }

            setTimeout(
              poll,
              POLL_INTERVAL_MS
            );

          } catch (err) {
            reject(err);
          }
        }

        setTimeout(
          poll,
          POLL_INTERVAL_MS
        );
      }
    );
  },

  publicGreeting: (
  query,
  history
) =>
  request(
    "/chat/public",
    {
      method: "POST",
      body: {
        query,
        history: history || [],
      },
    }
  ),




  publicChat: async (
    query,
    history
  ) => {
    // fast path: the server pushes the answer as soon as it is ready (SSE)
    try {
      return await streamRequest(
        "/chat/public/stream",
        {
          query,
          history: history || [],
        },
        false
      );
    } catch (err) {
      if (!err || !err.streamUnavailable) {
        throw err;
      }
      // backend without /chat/public/stream -> polling below
    }

    const started =
      await request(
        "/chat/public/start",
        {
          method: "POST",
          body: {
            query,
            history:
              history || [],
          },
        }
      );

    const POLL_INTERVAL_MS =
      500;

    const MAX_ATTEMPTS =
      120;

    return new Promise(
      (
        resolve,
        reject
      ) => {
        let attempts = 0;

        async function poll() {
          attempts += 1;

          if (
            attempts >
            MAX_ATTEMPTS
          ) {
            reject(
              new Error(
                "Chat response timed out."
              )
            );
            return;
          }

          try {
            const result =
              await request(
                `/chat/public/status/${started.job_id}`,
                {
                  method: "GET",
                }
              );

            if (
              result.status ===
              "completed"
            ) {
              resolve(
                result.response
              );
              return;
            }

            if (
              result.status ===
              "failed"
            ) {
              reject(
                new Error(
                  result.error ||
                    "Unable to process the chat request."
                )
              );
              return;
            }

            setTimeout(
              poll,
              POLL_INTERVAL_MS
            );

          } catch (err) {
            reject(err);
          }
        }

        setTimeout(
          poll,
          POLL_INTERVAL_MS
        );
      }
    );
  },


  createPublicTicket: (
    payload
  ) =>
    request(
      "/chat/public/ticket",
      {
        method: "POST",
        body: payload,
      }
    ),


  listFaqs: () =>
    request(
      "/faqs",
      {
        auth: true,
      }
    ),


  createFaq: (
    question,
    answer
  ) =>
    request(
      "/faqs",
      {
        method: "POST",
        body: {
          question,
          answer,
        },
        auth: true,
      }
    ),


  listMyTickets: () =>
    request(
      "/tickets",
      {
        auth: true,
      }
    ),


  listAllTickets: (
    page,
    pageSize,
    search,
    status
  ) => {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      page || 1
    );

    params.set(
      "page_size",
      pageSize || 10
    );

    if (
      search &&
      search.trim()
    ) {
      params.set(
        "search",
        search.trim()
      );
    }

    if (
      status &&
      status !== "all"
    ) {
      params.set(
        "status",
        status
      );
    }

    return request(
      `/tickets/all?${params.toString()}`,
      {
        auth: true,
      }
    );
  },


  getTicket: (
    ticketId
  ) =>
    request(
      `/tickets/${ticketId}`,
      {
        auth: true,
      }
    ),


  getTicketByCode: (
    code
  ) =>
    request(
      `/tickets/by-code/${code}`,
      {
        auth: true,
      }
    ),


  updateTicketStatus: (
    ticketId,
    status,
    adminRemark
  ) =>
    request(
      `/tickets/${ticketId}/status`,
      {
        method: "PATCH",
        body: {
          status,
          admin_remark:
            adminRemark,
        },
        auth: true,
      }
    ),


  updateTicketRemark: (
    ticketId,
    adminRemark
  ) =>
    request(
      `/tickets/${ticketId}/remark`,
      {
        method: "PATCH",
        body: {
          admin_remark:
            adminRemark,
        },
        auth: true,
      }
    ),


  createTicket: (
    payloadOrName,
    contactEmail,
    contactPhone,
    subject,
    description
  ) => {
    let payload;

    if (
      payloadOrName &&
      typeof payloadOrName ===
        "object"
    ) {
      payload =
        payloadOrName;
    } else {
      payload = {
        contact_name:
          payloadOrName || "",
        contact_email:
          contactEmail || "",
        contact_phone:
          contactPhone || null,
        subject:
          subject ||
          "New Ticket",
        description:
          description || "",
      };
    }

    return request(
      "/tickets",
      {
        method: "POST",
        body: {
          contact_name:
            String(
              payload.contact_name ||
                ""
            ).trim(),

          contact_email:
            String(
              payload.contact_email ||
                ""
            ).trim(),

          contact_phone:
            payload.contact_phone
              ? String(
                  payload.contact_phone
                ).trim()
              : null,

          subject:
            String(
              payload.subject ||
                "New Ticket"
            ).trim() ||
            "New Ticket",

          description:
            String(
              payload.description ||
                ""
            ).trim(),

          channel:
            payload.channel ||
            "Bot",

          priority:
            payload.priority ||
            "Medium",

          company:
            payload.company
              ? String(
                  payload.company
                ).trim()
              : null,

          preferred_call_time:
            payload.preferred_call_time
              ? String(
                  payload.preferred_call_time
                ).trim()
              : null,
        },
        auth: true,
      }
    );
  },


  listJobs: (
    query,
    location
  ) => {
    const params =
      new URLSearchParams();

    if (query) {
      params.set(
        "q",
        query
      );
    }

    if (location) {
      params.set(
        "location",
        location
      );
    }

    const queryString =
      params.toString();

    return request(
      `/jobs${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  },


  uploadResume: (
    file
  ) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    

    return fetch(
      `${API_URL}/profile/resume`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer " +
            getToken(),
        },
        body: formData,
      }
    ).then(
      async function (
        response
      ) {
        if (!response.ok) {
          let message =
            "Upload failed";

          try {
            const data =
              await response.json();

            if (
              typeof data.detail ===
              "string"
            ) {
              message =
                data.detail;
            }
          } catch {}

          throw new Error(
            message
          );
        }

        return response.json();
      }
    );
  },


  // Voice message -> text (backend sends the audio to Hugging Face Whisper)
  // Returns: { text: "..." }
  transcribeAudio: (
    file
  ) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    return fetch(
      `${API_URL}/chat/transcribe`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer " +
            getToken(),
        },
        body: formData,
      }
    ).then(
      async function (
        response
      ) {
        if (!response.ok) {
          let message =
            "Transcription failed";

          try {
            const data =
              await response.json();

            if (
              typeof data.detail ===
              "string"
            ) {
              message =
                data.detail;
            }
          } catch {}

          throw new Error(
            message
          );
        }

        return response.json();
      }
    );
  },

  // Same as transcribeAudio, but for the login page chatbot (no login token)
  transcribePublicAudio: (
    file
  ) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    return fetch(
      `${API_URL}/chat/public/transcribe`,
      {
        method: "POST",
        body: formData,
      }
    ).then(
      async function (
        response
      ) {
        if (!response.ok) {
          let message =
            "Transcription failed";

          try {
            const data =
              await response.json();

            if (
              typeof data.detail ===
              "string"
            ) {
              message =
                data.detail;
            }
          } catch {}

          throw new Error(
            message
          );
        }

        return response.json();
      }
    );
  },

  // logged-in user: photo / PDF for a ticket
  uploadTicketAttachment: (file, ticketId) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      body: formData,
    }).then(function (r) {
      if (!r.ok) {
        return r.json().then(function (d) {
          throw new Error(d.detail || "Attachment upload failed");
        });
      }

      return r.json();
    });
  },

  // login page / home page chatbot (no login): photo / PDF for a new ticket
  uploadPublicTicketAttachment: (file, ticketId) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(
      `${API_URL}/chat/public/tickets/${ticketId}/attachment`,
      {
        method: "POST",
        body: formData,
      }
    ).then(function (r) {
      if (!r.ok) {
        return r.json().then(function (d) {
          throw new Error(d.detail || "Attachment upload failed");
        });
      }

      return r.json();
    });
  },

  // admin: list the attachments of a ticket
  listTicketAttachments: (ticketId) =>
    request(
      `/tickets/${ticketId}/attachments`,
      {
        auth: true,
      }
    ),

  // admin: download one attachment as a Blob (so it can be shown or saved)
  getAttachmentBlob: async (attachmentId) => {
    const response = await fetch(
      `${API_URL}/tickets/attachments/${attachmentId}/file`,
      {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Unable to load the attachment");
    }

    return response.blob();
  },
}



export const session = {
  getToken,
  setSession,
  clearSession,
  getUser,
};
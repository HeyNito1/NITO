import { env } from "@/config/env";
import { ApiError, apiRequest } from "./apiClient";

export const liveChat = import.meta.env.VITE_LIVE_CHAT === "true";

export function chatSession() {
  const token = sessionStorage.getItem("nito.accessToken");
  if (!token) return null;

  try {
    const segment = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { sub, exp } = JSON.parse(atob(segment));

    if (typeof sub !== "string" || !sub || !(exp * 1000 > Date.now())) {
      return null;
    }

    // FastAPI verifies the token. The subject here only separates browser caches.
    return { token, key: `nito.liveChats:${env.apiBaseUrl}:${sub}` };
  } catch {
    return null;
  }
}

async function request(path, options) {
  const session = chatSession();

  if (!session) {
    throw new ApiError("Please log in to use chat.", { status: 401 });
  }

  return apiRequest(path, {
    ...options,
    headers: { Authorization: `Bearer ${session.token}` },
  });
}

export async function sendLiveMessage(message, conversationId, signal) {
  const result = await request("chat", {
    method: "POST",
    body: {
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    },
    signal,
  });

  if (
    typeof result?.reply !== "string" ||
    !result.reply.trim() ||
    typeof result.conversation_id !== "string" ||
    !result.conversation_id
  ) {
    throw new Error("The server returned an incomplete chat reply.");
  }

  return { text: result.reply, conversationId: result.conversation_id };
}

export function fetchConversations(signal) {
  return request("conversations", { signal });
}

export function fetchMessages(conversationId, signal) {
  return request(`conversations/${encodeURIComponent(conversationId)}/messages`, {
    signal,
  });
}
import { env } from "@/config/env";

function configuredOrigin() {
  if (!env.chatOrigin) return null;
  try {
    const url = new URL(env.chatOrigin);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export const isChatHost = window.location.hostname === "chat.heynito.com" ||
  configuredOrigin() === window.location.origin;

export const marketingHome = isChatHost ? "https://heynito.com/" : "/";

export function chatPath(chatId) {
  return isChatHost ? (chatId ? `/c/${chatId}` : "/") : (chatId ? `/chat/${chatId}` : "/chat");
}

export function externalChatUrl() {
  if (!env.chatOrigin) return null;
  const origin = configuredOrigin();
  if (!origin) throw new Error("VITE_CHAT_ORIGIN must be a valid HTTP or HTTPS origin.");
  return origin === window.location.origin ? null : origin;
}

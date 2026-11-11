import { useSyncExternalStore } from "react";
import { chatStore } from "@/services/chatStore";

export function useChat() {
  return { ...useSyncExternalStore(chatStore.subscribe, chatStore.getSnapshot), ...chatStore };
}

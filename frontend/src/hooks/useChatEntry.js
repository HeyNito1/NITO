import { useNavigate } from "react-router";
import { chatStore } from "@/services/chatStore";
import { chatPath, externalChatUrl } from "@/services/chatDestination";

export function useChatEntry() {
  const navigate = useNavigate();
  return function enterChat({ prompt = "", category = null, attachments = [] } = {}) {
    const external = externalChatUrl();
    if (external) {
      if (prompt.trim() || attachments.length) {
        throw new Error("The chat subdomain needs its server handoff before prompts can be transferred. Use the local /chat route until hosting is connected.");
      }
      window.location.assign(external);
      return;
    }
    const chatId = prompt.trim() ? chatStore.send({ text: prompt, category, attachments }) : null;
    navigate(chatPath(chatId));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
}

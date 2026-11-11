import { env } from "@/config/env";
import { apiRequest } from "./apiClient";
import { mockDelay } from "./mockDelay";

export async function replyToChat({ messages, category }, { signal } = {}) {
  if (!env.useMocks) {
    if (messages.some((message) => message.attachments?.length)) {
      throw new Error("File uploads are not connected yet. Start a chat without attachments to use the API.");
    }
    const result = await apiRequest("chat/messages", {
      method: "POST",
      body: { messages: messages.map(({ role, text }) => ({ role, text })), category },
      signal,
    });
    if (typeof result?.text !== "string" || !result.text.trim()) {
      throw new Error("The server returned an empty reply. Please try again.");
    }
    return result.text;
  }
  await mockDelay(800, signal);
  const latest = messages.filter((message) => message.role === "user").at(-1);
  const followup = messages.filter((message) => message.role === "user").length > 1;
  if (/maggi|noodles/i.test(latest.text)) {
    return "How to make Maggi — step-by-step guide\n\n1. Gather your ingredients\nYou’ll need one packet of Maggi, its seasoning sachet, and about 1½ cups of water. Add chopped vegetables or a teaspoon of butter if you like.\n\n2. Bring the water to a boil\nHeat the water in a small pan. Add vegetables first if you’re using them, and let them soften.\n\n3. Add the noodles and seasoning\nBreak the noodle cake into the pan, add the seasoning, and stir gently.\n\n4. Cook and serve\nSimmer for about two minutes, stirring occasionally, until the noodles are cooked. Follow the packet’s instructions and add a splash of water if needed. Serve hot.";
  }
  const lead = followup ? "Let’s build on your previous message." : "Let’s work through your idea.";
  const fileNote = latest.attachments?.length ? "\n\nYour attachment names are included in this conversation. This demo does not upload, read, or analyze their contents." : "";
  return `${lead}\n\n${latest.text}\n\nA useful starting point is to define the result you want, list the information you already have, and break the work into small steps.\n\n1. Describe the outcome and any constraints.\n2. Choose the first practical step.\n3. Review the result and refine it.\n\nWhat would you like to focus on first?${fileNote}`;
}

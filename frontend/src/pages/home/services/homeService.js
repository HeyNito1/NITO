import { env } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { homeData } from "../mocks/homeData";
import { promptReplies } from "../mocks/promptReplies";
import { mockDelay } from "@/services/mockDelay";
export async function getHome({ signal } = {}) {
  if (!env.useMocks) return apiRequest("home", { signal });
  await mockDelay(0, signal);
  return homeData;
}
export async function sendPrompt(
  { prompt, category, attachments = [] },
  { signal } = {},
) {
  if (!prompt.trim()) throw new Error("Please enter a prompt.");
  if (!env.useMocks) {
    if (attachments.length)
      throw new Error(
        "File upload integration is not configured yet. Remove attachments to continue.",
      );
    return apiRequest("prompts", {
      method: "POST",
      body: { prompt, category },
      signal,
    });
  }
  await mockDelay(550, signal);
  return {
    id: `demo-${Date.now()}`,
    prompt,
    category,
    text: promptReplies[category] || promptReplies["api-platform"],
    isDemo: true,
  };
}

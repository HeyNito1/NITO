import { env } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { mockDelay } from "@/services/mockDelay";
export async function subscribe(email, { signal } = {}) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    throw new Error("Please enter a valid email address.");
  if (!env.useMocks)
    return apiRequest("newsletter/subscriptions", {
      method: "POST",
      body: { email: email.trim() },
      signal,
    });
  await mockDelay(450, signal);
  return {
    isDemo: true,
    message: "Preview complete. No subscription was created or email stored.",
  };
}

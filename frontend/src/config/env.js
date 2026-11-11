export const env = Object.freeze({
  chatOrigin: import.meta.env.VITE_CHAT_ORIGIN || "",
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(
    /\/$/,
    "",
  ),
  useMocks: import.meta.env.VITE_USE_MOCKS !== "false",
});

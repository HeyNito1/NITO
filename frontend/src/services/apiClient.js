import { env } from "@/config/env";
export class ApiError extends Error {
  constructor(message, { status = 0, code = "REQUEST_FAILED", details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
export async function apiRequest(path, { body, headers, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${env.apiBaseUrl}/${path.replace(/^\/+/, "")}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Unable to connect. Please try again.", {
      code: "NETWORK_ERROR",
    });
  }
  if (response.status === 204) return null;
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("The server returned an invalid response.", {
      status: response.status,
      code: "INVALID_RESPONSE",
    });
  }
    if (!response.ok) {
      const detail = payload?.detail;
      const fastApiMessage = Array.isArray(detail) ? detail[0]?.msg : detail;

      throw new ApiError(
        payload?.error?.message ||
          (typeof fastApiMessage === "string" ? fastApiMessage : "Request failed."),
        {
          status: response.status,
          code: payload?.error?.code,
          details: payload?.error?.details ?? detail,
        }
      );
    }

    return payload && Object.prototype.hasOwnProperty.call(payload, "data")
      ? payload.data
      : payload;
}

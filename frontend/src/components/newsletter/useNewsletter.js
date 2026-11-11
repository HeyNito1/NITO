import { useEffect, useRef, useState } from "react";
import { subscribe } from "./newsletterService";
export function useNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  async function submit(event) {
    event.preventDefault();
    if (status === "loading") return;
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("loading");
    setMessage("");
    try {
      const result = await subscribe(email, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setStatus("success");
        setMessage(result.message || "You are subscribed.");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setStatus("error");
        setMessage(error.message);
      }
    }
  }
  return { email, setEmail, status, message, submit };
}

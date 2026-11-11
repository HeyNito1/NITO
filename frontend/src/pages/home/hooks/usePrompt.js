import { useRef, useState } from "react";
import { useChatEntry } from "@/hooks/useChatEntry";
export function usePrompt() {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const result = null;
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const enterChat = useChatEntry();
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  function submit(event) {
    event.preventDefault();
    if (!prompt.trim() || status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      enterChat({ prompt, category, attachments });
    } catch (failure) {
      setError(failure.message);
      setStatus("error");
    }
  }
  function attach(event) {
    const files = [...event.target.files];
    if (attachments.length + files.length > 3) {
      setError("Please select up to three attachments.");
      event.target.value = "";
      return;
    }
    event.target.value = "";
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Please choose files smaller than 5 MB.");
      return;
    }
    setError("");
    setAttachments((current) => [...current, ...files].slice(0, 3));
  }
  function chooseAudience(audience) {
    setStatus("idle");
    setPrompt(audience.prompt);
    setCategory(audience.category);
    setError("");
    document.getElementById("hero")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    inputRef.current?.focus({ preventScroll: true });
  }
  return {
    prompt,
    setPrompt,
    category,
    setCategory,
    attachments,
    setAttachments,
    result,
    status,
    error,
    fileRef,
    inputRef,
    submit,
    attach,
    chooseAudience,
  };
}

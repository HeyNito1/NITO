import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import IconButton from "@/components/ui/IconButton";

export default function ChatComposer({
  draft,
  onDraftChange,
  onSend,
  busy,
  onStop,
  inputRef,
}) {
  const { text, attachments } = draft;

  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const fieldId = useId();

  useEffect(() => {
    const field = inputRef.current;
    if (!field) return;

    field.style.height = "auto";
    field.style.height = `${Math.min(
      field.scrollHeight,
      144,
    )}px`;
  }, [text, inputRef]);

  function attach(event) {
    const files = Array.from(
      event.target.files || [],
    );

    event.target.value = "";

    if (files.length + attachments.length > 3) {
      setError(
        "Please select up to three attachments.",
      );
      return;
    }

    if (
      files.some(
        (file) => file.size > 5 * 1024 * 1024,
      )
    ) {
      setError(
        "Please choose files smaller than 5 MB.",
      );
      return;
    }

    setError("");

    onDraftChange({
      attachments: [...attachments, ...files],
    });
  }

  function submit(event) {
    event.preventDefault();

    if (!text.trim() || busy) return;

    if (onSend(text, attachments)) {
      setError("");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="chat-composer-wrap pb-[40px]!">
      {error && (
        <p
          className="mb-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

        <p className="mb-[10px] text-center text-[14px]! leading-[20px]! text-[var(--nito-muted)]">
          NITO can make mistakes. Check important facts!
        </p>

      <form
        onSubmit={submit}
        className="
          chat-compose-form
          min-h-[44px]!
          px-[16px]!
          py-[4px]!
          bg-[var(--nito-input)]!
          border-[var(--nito-line)]!
          focus-within:border-[var(--nito-accent)]!
        "
        aria-label="Chat message"
      >
        {attachments.length > 0 && (
          <ul
            className="flex flex-wrap gap-2 px-2 pb-3 pt-1"
            aria-label="Selected attachments"
          >
            {attachments.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex max-w-full items-center gap-2 rounded-lg border border-[var(--nito-line)] bg-[var(--nito-panel)] px-3 py-2 text-xs text-[var(--nito-text)]"
              >
                <span className="truncate">
                  {file.name}
                </span>

                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() =>
                    onDraftChange({
                      attachments:
                        attachments.filter(
                          (_, position) =>
                            position !== index,
                        ),
                    })
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex min-h-[40px] items-center gap-[12px]">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".txt,.md,.pdf,image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={attach}
            aria-label="Choose chat attachments"
          />

          <IconButton
            className="chat-icon-button self-center! leading-none! text-[var(--nito-text)]!"
            label="Add attachment"
            disabled={busy}
            onClick={() =>
              fileRef.current?.click()
            }
          >
            +
          </IconButton>

          <label
            htmlFor={fieldId}
            className="sr-only"
          >
            Message NITO
          </label>

          <textarea
            id={fieldId}
            ref={inputRef}
            value={text}
            onChange={(event) =>
              onDraftChange({
                text: event.target.value,
              })
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                event.currentTarget.form.requestSubmit();
              }
            }}
            placeholder="Message NITO"
            rows={1}
            maxLength={4000}
            required
            className="
              max-h-36
              min-h-[32px]!
              min-w-0
              flex-1
              resize-none
              border-0
              bg-transparent
              py-[4px]!
              text-[14px]!
              leading-[22px]!
              text-[var(--nito-text)]
              outline-none!
              placeholder:text-[var(--nito-muted)]
              max-[800px]:text-[17px]!
              border-[var(--nito-line)]!
              bg-[var(--nito-input)]!
            "
          />

          {busy ? (
            <IconButton
              className="chat-send-button self-center! leading-none!"
              label={onStop ? "Stop response" : "Waiting for reply"}
              disabled={!onStop}
              variant="blue"
              onClick={onStop}
            >
              ■
            </IconButton>
          ) : (
            <IconButton
              className="chat-send-button"
              type="submit"
              label="Send message"
              variant="blue"
              disabled={!text.trim()}
            >
              ✓
            </IconButton>
          )}
        </div>
      </form>
    </div>
  );
}
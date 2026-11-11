import {
  useEffect,
  useRef,
  useState,
} from "react";

const buttonClass =
  "inline-flex h-[28px] w-[27px] shrink-0 items-center justify-center rounded transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-500";

export default function ReplyActions({ message }) {
  const [feedback, setFeedback] = useState(null);
  const [status, setStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOutside(event) {
      if (
        !menuRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        moreRef.current?.focus();
      }
    }

    document.addEventListener(
      "pointerdown",
      closeOutside,
    );

    document.addEventListener(
      "keydown",
      closeWithEscape,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside,
      );

      document.removeEventListener(
        "keydown",
        closeWithEscape,
      );
    };
  }, [menuOpen]);

  async function copy(shared = false) {
    try {
      await navigator.clipboard.writeText(
        message.text,
      );

      setStatus(
        shared
          ? "Reply copied. Paste it wherever you want to share."
          : "Reply copied.",
      );
    } catch {
      setStatus(
        "Copy is unavailable. Select the reply text and copy it manually.",
      );
    }
  }

  async function share() {
    if (!navigator.share) {
      await copy(true);
      return;
    }

    try {
      await navigator.share({
        title: "NITO reply",
        text: message.text,
      });

      setStatus("");
    } catch (error) {
      if (error.name !== "AbortError") {
        setStatus(
          "Sharing is unavailable. Use Copy reply instead.",
        );
      }
    }
  }

  function rate(value) {
    setFeedback((current) =>
      current === value ? null : value,
    );

    setStatus("");
  }

  function download() {
    const blob = new Blob([message.text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "nito-reply.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    setMenuOpen(false);
    setStatus("Reply downloaded.");
    moreRef.current?.focus();
  }

  return (
    <div className="mt-4">
      <div
        className="flex w-fit items-center gap-[10px]"
        role="group"
        aria-label="Reply actions"
      >
        <button
          type="button"
          className={buttonClass}
          aria-label="Copy reply"
          title="Copy reply"
          onClick={() => copy()}
        >
          <img
            src="/assets/icons/reply/Frame-1.svg"
            alt=""
            width="27"
            height="27"
            className="max-w-none"
          />
        </button>

        <button
          type="button"
          className={buttonClass}
          aria-label="Share reply"
          title="Share reply"
          onClick={share}
        >
          <img
            src="/assets/icons/reply/Frame-2.svg"
            alt=""
            width="27"
            height="24"
            className="max-w-none"
          />
        </button>

        <button
          type="button"
          className={`${buttonClass} ${
            feedback === "up"
              ? "bg-white/10 ring-1 ring-white/30"
              : ""
          }`}
          aria-label="Helpful reply"
          aria-pressed={feedback === "up"}
          title="Helpful reply"
          onClick={() => rate("up")}
        >
          <img
            src="/assets/icons/reply/Frame-3.svg"
            alt=""
            width="27"
            height="27"
            className={`max-w-none ${
              feedback === "up"
                ? "brightness-200"
                : ""
            }`}
          />
        </button>

        <button
          type="button"
          className={`${buttonClass} ${
            feedback === "down"
              ? "bg-white/10 ring-1 ring-white/30"
              : ""
          }`}
          aria-label="Unhelpful reply"
          aria-pressed={feedback === "down"}
          title="Unhelpful reply"
          onClick={() => rate("down")}
        >
          <img
            src="/assets/icons/reply/Frame.svg"
            alt=""
            width="27"
            height="27"
            className={`max-w-none ${
              feedback === "down"
                ? "brightness-200"
                : ""
            }`}
          />
        </button>

        <div
          className="relative"
          ref={menuRef}
        >
          <button
            ref={moreRef}
            type="button"
            className="flex h-[28px] w-[5px] flex-col items-center justify-center gap-[3px] rounded text-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-500"
            aria-label="More reply actions"
            title="More reply actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen(!menuOpen);

              if (!menuOpen) {
                requestAnimationFrame(() => {
                  menuRef.current
                    ?.querySelector(
                      '[role="menuitem"]',
                    )
                    ?.focus();
                });
              }
            }}
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-[3px] rounded-full bg-current"
                aria-hidden="true"
              />
            ))}
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="More reply actions"
              className="absolute right-0 bottom-full z-20 mb-2 w-40 rounded-lg border border-white/20 bg-[#161616] p-1 shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={download}
                className="w-full rounded px-3 py-2 text-left text-[13px] leading-5 text-white hover:bg-white/10"
              >
                Download reply
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="sr-only" role="status">
        {feedback === "up"
          ? "Helpful selected."
          : feedback === "down"
            ? "Unhelpful selected."
            : ""}
      </p>

      {status && (
        <p
          role="status"
          className="mt-2 text-xs leading-5 text-[#999]"
        >
          {status}
        </p>
      )}
    </div>
  );
}
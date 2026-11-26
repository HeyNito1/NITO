import { useEffect, useRef } from "react";
import ReplyActions from "./ReplyActions";
import { env } from "@/config/env";
import MessageContent from "./MessageContent";


export default function ChatMessages({ chat, busy, onRetry }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "instant" });
  }, [chat.id, chat.messages]);
  return (
    <div className="chat-message-scroll" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
      <div className="chat-message-column">
        {chat.messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "chat-user-message text-[14px]! leading-[1.5]!"
                : "chat-assistant-message text-[15px] leading-[1.5]"
            }
            aria-label={message.role === "user" ? "You" : "NITO"}
          >            {message.role === "user" ? (
              <>
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                {message.attachments?.length > 0 && <ul aria-label="Message attachments" className="mt-3 flex flex-wrap gap-2">{message.attachments.map((file, index) => <li key={`${file.name}-${index}`} className="max-w-full rounded-lg border border-[#383838] px-3 py-2 text-xs"><span className="block break-all">{file.name}</span><span className="mt-1 block text-[10px] text-[#888]">Local attachment · {Math.max(1, Math.round(file.size / 1024))} KB</span></li>)}</ul>}
              </>
            ) : message.status === "pending" ? (
              <p className="flex items-center gap-3 text-sm text-[#aaa]" role="status"><span className="spinner" />{env.useMocks ? "Preparing a reply…" : "Preparing a reply…"}</p>
            ) : (
              <>
                {message.status === "error" ? (
              <div
                className="whitespace-pre-wrap break-words text-red-500"
                role="alert"
              >
                {message.text}
              </div>
            ) : (
              <MessageContent text={message.text} />
            )}
                {onRetry && ["error", "stopped"].includes(message.status) && message === chat.messages.at(-1) && <button className="mt-4 rounded-lg border border-white/30 px-3 py-2 text-xs" type="button" onClick={onRetry} disabled={busy}>Retry response</button>}
                {message.status === "complete" && <ReplyActions message={message} />}
              </>
            )}
          </article>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

export default function ChatTabs({
  chat,
  onSelect,
  onAdd,
  onClose,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    rootRef.current
      ?.querySelector(
        '[role="tab"][aria-selected="true"]',
      )
      ?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
  }, [chat?.activeTabId]);

  function focusSelected() {
    requestAnimationFrame(() => {
      rootRef.current
        ?.querySelector(
          '[role="tab"][aria-selected="true"]',
        )
        ?.focus();
    });
  }

  function handleKey(event, index) {
    let next;

    if (event.key === "ArrowRight") {
      next = (index + 1) % chat.tabs.length;
    }

    if (event.key === "ArrowLeft") {
      next =
        (index - 1 + chat.tabs.length) %
        chat.tabs.length;
    }

    if (event.key === "Home") next = 0;
    if (event.key === "End") {
      next = chat.tabs.length - 1;
    }

    if (next === undefined) return;

    event.preventDefault();
    onSelect(chat.tabs[next].id);
    focusSelected();
  }

  return (
    <div className="chat-tabs" ref={rootRef}>
      <div
        className="chat-tab-list"
        role="tablist"
        aria-label="Conversation tabs"
      >
        {chat?.tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`chat-tab-item ${
              tab.id === chat.activeTabId
                ? "is-active"
                : ""
            }`}
          >
            <button
              type="button"
              role="tab"
              id={`chat-tab-${tab.id}`}
              aria-controls="chat-tab-panel"
              aria-selected={
                tab.id === chat.activeTabId
              }
              tabIndex={
                tab.id === chat.activeTabId ? 0 : -1
              }
              onClick={() => onSelect(tab.id)}
              onKeyDown={(event) =>
                handleKey(event, index)
              }
              title={tab.title}
            >
              {tab.title}
            </button>

            {chat.tabs.length > 1 && (
              <button
                type="button"
                className="chat-tab-close"
                aria-label={`Close tab: ${tab.title}`}
                onClick={() => {
                  onClose(tab.id);
                  focusSelected();
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="chat-add-tab"
        aria-label="Add tab"
        onClick={onAdd}
      >
        +
      </button>
    </div>
  );
}
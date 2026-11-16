import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router";

import { useChat } from "@/hooks/useChat";
import { chatPath } from "@/services/chatDestination";

import ChatSidebar from "./components/ChatSidebar";
import ChatSuggestions from "./components/ChatSuggestions";
import ChatMessages from "./components/ChatMessages";
import ChatComposer from "./components/ChatComposer";
import ChatTabs from "./components/ChatTabs";

import "./chat.css";

const modes = [
  ["general", "General", "general"],
  ["research", "Research", "research"],
  ["writing", "Content", "content"],
  ["api-platform", "Coding", "coding"],
  ["creatives", "Creative", "creative"],
];

const emptyDraft = () => ({
  text: "",
  attachments: [],
});

export default function ChatPage() {
  const { chatId } = useParams();
  const store = useChat();
  const navigate = useNavigate();

  const chat = store.conversations.find(
    (item) => item.id === chatId,
  );

  const tab = chat?.tabs.find(
    (item) => item.id === chat.activeTabId,
  );

  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);
  const [newDraft, setNewDraft] =
    useState(emptyDraft);
  const [newCategory, setNewCategory] =
    useState("general");

  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const reopenRef = useRef(null);
  const drawerRef = useRef(null);

  const busy =
    tab?.messages.some(
      (message) => message.status === "pending",
    ) || false;

  const category = tab?.category || newCategory;
  const title = chat?.title;

  useEffect(() => {
    if (sidebarCollapsed) {
      reopenRef.current?.focus();
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    document.title = title
      ? `${title} · NITO`
      : "Chat with NITO";

    return () => {
      document.title = "NITO";
    };
  }, [title]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const sidebar =
      drawerRef.current.querySelector("aside");

    const focusable = () =>
      [
        ...sidebar.querySelectorAll(
          "a[href], button:not(:disabled), input",
        ),
      ].filter(
        (element) =>
          element.getClientRects().length > 0,
      );

    focusable()[0]?.focus();

    function handleKey(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        menuRef.current?.focus();
      }

      if (
        event.key === "Tab" &&
        window.innerWidth <= 800
      ) {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last?.focus();
        }

        if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKey,
      );
    };
  }, [sidebarOpen]);

  function closeSidebar() {
    if (sidebarOpen) {
      setSidebarOpen(false);
      menuRef.current?.focus();
    }
  }

  function collapseSidebar() {
    if (
      window.matchMedia("(max-width: 800px)").matches
    ) {
      closeSidebar();
    } else {
      setSidebarOpen(false);
      setSidebarCollapsed(true);
    }
  }

  function newChat() {
    setNewDraft(emptyDraft());
    setNewCategory("general");
    navigate(chatPath());
    closeSidebar();
  }

  function addTab() {
    if (chat) {
      store.addTab(chat.id);
    } else {
      navigate(chatPath(store.create()));
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function setCategory(value) {
    if (tab) {
      store.setCategory(chat.id, tab.id, value);
    } else {
      setNewCategory(value);
    }
  }

  function setDraft(patch) {
    if (tab) {
      store.setDraft(chat.id, tab.id, patch);
    } else {
      setNewDraft((current) => ({
        ...current,
        ...patch,
      }));
    }
  }

  function sendMessage(text, attachments = []) {
    if (busy || (chatId && !chat)) return false;

    const nextId = store.send({
      chatId,
      tabId: tab?.id,
      text,
      attachments,
      category,
    });

    if (!nextId) return false;

    if (!chat) setNewDraft(emptyDraft());

    if (nextId !== chatId) {
      navigate(chatPath(nextId));
    }

    return true;
  }

  function deleteChat(targetId) {
    store.remove(targetId);

    if (targetId === chatId) {
      newChat();
    }
  }

  return (
      <div
        className={`
          chat-shell
          min-[961px]:[zoom:0.8]!
          min-[961px]:w-full!
          min-[961px]:h-[125dvh]!
          ${
            sidebarCollapsed
              ? "sidebar-collapsed min-[961px]:grid-cols-[minmax(0,1fr)_var(--chat-right)]!"
              : "min-[961px]:grid-cols-[var(--chat-left)_minmax(0,1fr)_var(--chat-right)]!"
          }
        `}
      >
      <a href="#chat-main" className="skip-link">
        Skip to conversation
      </a>

      {sidebarOpen && (
        <button
          type="button"
          className="chat-drawer-backdrop"
          aria-label="Close navigation"
          onClick={closeSidebar}
          tabIndex={-1}
        />
      )}

      <div
        ref={drawerRef}
        className="chat-sidebar-slot"
      >
        <ChatSidebar
          conversations={store.conversations}
          activeId={chatId}
          open={sidebarOpen}
          onClose={collapseSidebar}
          onNavigate={closeSidebar}
          onNew={newChat}
          onDelete={deleteChat}
        />
      </div>

      <main
        id="chat-main"
        tabIndex={-1}
        className="chat-main"
      >
        <header className="chat-toolbar">
          <button
            ref={menuRef}
            type="button"
            className="chat-menu-button"
            aria-label="Open chat navigation"
            aria-expanded={sidebarOpen}
            aria-controls="chat-sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          {sidebarCollapsed && (
            <button
              ref={reopenRef}
              type="button"
              className="chat-reopen-sidebar"
              aria-label="Open chat navigation"
              aria-expanded="false"
              aria-controls="chat-sidebar"
              onClick={() => {
                setSidebarCollapsed(false);

                requestAnimationFrame(() => {
                  drawerRef.current
                    ?.querySelector(
                      ".chat-close-sidebar",
                    )
                    ?.focus();
                });
              }}
            >
              <span
                className="chat-chevron"
                aria-hidden="true"
              />
            </button>
          )}

          {chat && (
            <ChatTabs
              chat={chat}
              onSelect={(tabId) =>
                store.selectTab(chat.id, tabId)
              }
              onAdd={addTab}
              onClose={(tabId) =>
                store.removeTab(chat.id, tabId)
              }
            />
          )}
        </header>

        {store.storageError && (
          <p
            className="mx-5 rounded-lg border border-amber-500/30 p-3 text-xs text-amber-200"
            role="alert"
          >
            {store.storageError}
          </p>
        )}

        {chatId && !chat ? (
          <div className="chat-empty">
            <h1 className="text-2xl">
              Conversation not found
            </h1>

            <p className="mt-4 text-sm text-[#888]">
              It may have been deleted or saved in
              another browser.
            </p>

            <button
              type="button"
              className="mt-6 rounded-lg border border-white/30 px-5 py-3"
              onClick={newChat}
            >
              Start a new chat
            </button>
          </div>
        ) : (
          <section
            id="chat-tab-panel"
            className="chat-tab-panel"
            role={tab ? "tabpanel" : undefined}
            aria-labelledby={
              tab
                ? `chat-tab-${tab.id}`
                : undefined
            }
          >
            {tab?.messages.length ? (
              <ChatMessages
                chat={tab}
                busy={busy}
                onRetry={() =>
                  store.retry(chat.id, tab.id)
                }
              />
            ) : (
              <div className="chat-empty">
                <h1 className="chat-greeting">
                  {chat
                    ? "Where to start today?"
                    : "Evening!"}
                </h1>

                <div
                  className="chat-modes"
                  role="group"
                  aria-label="Choose a chat category"
                >
                  {modes.map(([value, label, icon]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={category === value}
                      onClick={() => {
                        setCategory(value);
                        inputRef.current?.focus();
                      }}
                      className={`chat-mode overflow-hidden rounded-[11px] border-0! bg-transparent! p-0! hover:bg-transparent! ${
                        category === value
                          ? "ring-1 ring-[#0066ff]"
                          : "hover:ring-1 hover:ring-[#0066ff]"
                      }`}
                    >
                      <img
                        src={`/assets/icons/chat/modes/${icon}.svg`}
                        alt=""
                        draggable={false}
                        className="block h-full w-full"
                      />
                      <span className="sr-only">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ChatComposer
              key={tab?.id || "new"}
              draft={tab?.draft || newDraft}
              onDraftChange={setDraft}
              onSend={sendMessage}
              busy={busy}
              onStop={() =>
                store.stop(chat.id, tab.id)
              }
              inputRef={inputRef}
            />
          </section>
        )}
      </main>

      <ChatSuggestions
        onSuggest={(prompt) => {
          if (sendMessage(prompt)) {
            inputRef.current?.focus();
          }
        }}
      />
    </div>
  );
}
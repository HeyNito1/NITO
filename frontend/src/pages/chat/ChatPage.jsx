import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { useSettings, useAppearance } from "@/services/settingsStore";
import { useNotice } from "@/context/NoticeContext";
import "@/pages/settings/settings.css";
import { useChat } from "@/hooks/useChat";
import { chatSession, liveChat } from "@/services/chatBackend";
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
  const { data: settings } = useSettings();
  const appearance = useAppearance();
  const { notify } = useNotice();
  const store = useChat();
  const navigate = useNavigate();
  const sessionToken = liveChat ? chatSession()?.token : null;
  const { loadHistory, loadMessages } = store;
  const [historyLoading, setHistoryLoading] = useState(liveChat);
  const [loadedTabId, setLoadedTabId] = useState(null);
  const [messageLoadError, setMessageLoadError] = useState(null);

  const chat = store.conversations.find((item) => item.id === chatId);

  const tab = chat?.tabs.find((item) => item.id === chat.activeTabId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newDraft, setNewDraft] = useState(emptyDraft);
  const [newCategory, setNewCategory] = useState("general");

  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const drawerRef = useRef(null);

  const busy =
    tab?.messages.some((message) => message.status === "pending") || false;

  const selectedTabId = tab?.id;
  const needsMessages = Boolean(
    liveChat && tab?.conversationId && !tab.messages.length && loadedTabId !== tab.id,
  );

  useEffect(() => {
    if (!sessionToken) return;
    const controller = new AbortController();

    loadHistory(controller.signal)
      .catch((error) => {
        if (!controller.signal.aborted) notify(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });

    return () => controller.abort();
  }, [loadHistory, notify, sessionToken]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");

    function handleResize(event) {
      if (event.matches) {
        setSidebarCollapsed(false);
      }
    }

    media.addEventListener("change", handleResize);

    return () => {
      media.removeEventListener("change", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!needsMessages || !sessionToken) return;
    const controller = new AbortController();

    loadMessages(chatId, selectedTabId, controller.signal)
      .then(() => {
        if (!controller.signal.aborted) setLoadedTabId(selectedTabId);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setMessageLoadError({ tabId: selectedTabId, text: error.message });
        }
      });

    return () => controller.abort();
  }, [chatId, loadMessages, needsMessages, selectedTabId, sessionToken]);

  const category = tab?.category || newCategory;
  const title = chat?.title;


  useEffect(() => {
    document.title = title ? `${title} · NITO` : "Chat with NITO";

    return () => {
      document.title = "NITO";
    };
  }, [title]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const sidebar = drawerRef.current.querySelector("aside");

    const focusable = () =>
      [
        ...sidebar.querySelectorAll("a[href], button:not(:disabled), input"),
      ].filter((element) => element.getClientRects().length > 0);

    focusable()[0]?.focus();

    function handleKey(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        menuRef.current?.focus();
      }

      if (event.key === "Tab" && window.innerWidth <= 800) {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }

        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [sidebarOpen]);

  function closeSidebar() {
    if (sidebarOpen) {
      setSidebarOpen(false);
      menuRef.current?.focus();
    }
  }

  function collapseSidebar() {
    if (window.matchMedia("(max-width: 800px)").matches) {
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
    if (busy || needsMessages || (chatId && !chat)) return false;

    let nextId;
    try {
      nextId = store.send({
        chatId,
        tabId: tab?.id,
        text,
        attachments,
        category,
      });
    } catch (error) {
      notify(error.message);
      return false;
    }

    if (!nextId) return false;

    if (!chat) setNewDraft(emptyDraft());

    if (nextId !== chatId) {
      navigate(chatPath(nextId));
    }

    return true;
  }

  function deleteChat(targetId) {
    if (liveChat) {
      notify("Deleting saved conversations requires a backend API.");
      return;
    }
    store.remove(targetId);

    if (targetId === chatId) {
      newChat();
    }
  }

  if (liveChat && !sessionToken) return <Navigate to="/signup" replace />;

  return (
    <div
      {...appearance}
      className={`
          chat-shell nito-personalized
          min-[961px]:[zoom:0.8]!
          min-[961px]:w-full!
          min-[961px]:h-[125dvh]!
          ${
            sidebarCollapsed
              ? "sidebar-collapsed min-[801px]:grid-cols-[76px_minmax(0,1fr)]! min-[961px]:grid-cols-[76px_minmax(0,1fr)_var(--chat-right)]!"
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
        className="chat-sidebar-slot min-[801px]:block!"
      >
        <ChatSidebar
          conversations={store.conversations.filter((item) => !item.archived)}
          activeId={chatId}
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onExpand={() => setSidebarCollapsed(false)}
          onClose={collapseSidebar}
          onNavigate={closeSidebar}
          onNew={newChat}
          onDelete={deleteChat}
          onArchive={(id) => store.archive(id, true)}
        />
      </div>

      <main id="chat-main" tabIndex={-1} className="chat-main">
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

          {chat && (
            <ChatTabs
              chat={chat}
              onSelect={(tabId) => store.selectTab(chat.id, tabId)}
              onAdd={addTab}
              onClose={(tabId) => store.removeTab(chat.id, tabId)}
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

        {needsMessages && messageLoadError?.tabId === selectedTabId ? (
          <div className="chat-empty" role="alert">
            <p>{messageLoadError.text}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload chat
            </button>
          </div>
        ) : needsMessages || (historyLoading && chatId && !chat) ? (
          <div className="chat-empty" role="status">Loading conversation…</div>
        ) : chatId && !chat ? (
          <div className="chat-empty">
            <h1 className="text-2xl">Conversation not found</h1>

            <p className="mt-4 text-sm text-[#888]">
              It may have been deleted or saved in another browser.
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
            aria-labelledby={tab ? `chat-tab-${tab.id}` : undefined}
          >
            {tab?.messages.length ? (
              <ChatMessages
                chat={tab}
                busy={busy}
                onRetry={liveChat ? undefined : () => store.retry(chat.id, tab.id)}
              />
            ) : (
              <div className="chat-empty">
                <h1 className="chat-greeting">
                  {chat ? "Where to start today?" : "Evening!"}
                </h1>

                <div
                  className="chat-modes"
                  role="group"
                  aria-label="Choose a chat category"
                >
                  {modes
                    .filter(([value]) => settings.skills.includes(value))
                    .map(([value, label, icon]) => (
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
                            : "ring-1 ring-[var(--nito-line)] hover:ring-[#0066ff]"
                        }`}
                      >
                        <img
                          src={`/assets/icons/chat/modes/${icon}.svg`}
                          alt=""
                          draggable={false}
                          className="block h-full w-full"
                          style={{
                            filter: "var(--mode-card-filter, none)",
                          }}
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
              onStop={liveChat ? undefined : () => store.stop(chat.id, tab.id)}
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

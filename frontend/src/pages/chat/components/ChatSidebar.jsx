import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/services/settingsStore";
import Wordmark from "@/components/brand/Wordmark";
import { chatPath, marketingHome } from "@/services/chatDestination";
import { useNotice } from "@/context/NoticeContext";
import ProfileMenu from "./ProfileMenu";

const workspaceItems = [
  ["Library", "library.svg"],
  ["Images", "images.svg"],
  ["Skills", "skills.svg"],
  ["Projects", "projects.svg"],
];

export default function ChatSidebar({
  conversations,
  activeId,
  open,
  collapsed,
  onExpand,
  onClose,
  onNavigate,
  onNew,
  onDelete,
  onArchive,
}) {
  const { data } = useSettings();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);
  const { notify } = useNotice();
  const filtered = conversations.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase()),
  );
  useEffect(() => {
    if (searchOpen && (!collapsed || open)) {
      searchRef.current?.focus();
    }
  }, [searchOpen, collapsed, open]);


if (collapsed && !open) {
  return (
    <aside
      id="chat-sidebar"
      aria-label="Collapsed chat navigation"
      className="hidden h-full w-[76px] flex-col items-center gap-1 px-2 text-[var(--sidebar-text)] min-[801px]:flex"
    >
      {/* Expand sidebar */}
      <button
        type="button"
        onClick={onExpand}
        title="Expand sidebar"
        aria-label="Expand sidebar"
        aria-expanded={false}
        className="mb-5 flex h-[55px] w-full shrink-0 items-center justify-center rounded-lg hover:bg-[var(--sidebar-hover)]"
      >
        <span className="chat-chevron rotate-[225deg]!" />
      </button>

      {/* New chat */}
      <button
        type="button"
        onClick={onNew}
        title="New Chat"
        aria-label="New Chat"
        className="flex h-[50px] w-full shrink-0 items-center justify-center rounded-lg hover:bg-[var(--sidebar-hover)]"
      >
        <span className="chat-sidebar-icon">
          <img
            src="/assets/icons/chat/new-chat-icon.svg"
            alt=""
            width="25"
            height="25"
          />
        </span>
      </button>

      {/* Workspace navigation */}
      {workspaceItems.map(([name, icon]) => (
        <button
          key={name}
          type="button"
          title={name}
          aria-label={name}
          onClick={() => notify(`${name} is coming soon.`)}
          className="flex h-[50px] w-full shrink-0 items-center justify-center rounded-lg hover:bg-[var(--sidebar-hover)]"
        >
          <span className="chat-sidebar-icon">
            <img
              src={`/assets/icons/chat/${icon}`}
              alt=""
            />
          </span>
        </button>
      ))}

      {/* Search chats */}
      <button
        type="button"
        title="Search chats"
        aria-label="Search chats"
        onClick={() => {
          setSearchOpen(true);
          onExpand();
        }}
        className="flex h-[50px] w-full shrink-0 items-center justify-center rounded-lg hover:bg-[var(--sidebar-hover)]"
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="10"
            cy="10"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="m15 15 7 7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Settings */}
      <Link
        to="/settings/account"
        title="Settings"
        aria-label="Settings"
        className="mb-5 flex h-[50px] w-full shrink-0 items-center justify-center rounded-lg hover:bg-[var(--sidebar-hover)]"
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
          <path d="M10 2h4l.6 3 2 .9 2.6-1.7 2.8 2.8-1.7 2.6.9 2 2.8.6v4l-3 .6-.9 2 1.7 2.6-2.8 2.8-2.6-1.7-2 .9-.6 3h-4l-.6-3-2-.9-2.6 1.7-2.8-2.8 1.7-2.6-.9-2L0 16v-4l3-.6.9-2L2.2 6.8 5 4l2.6 1.7 2-.9L10 2Z" transform="translate(2 0) scale(.83)" />
        </svg>
      </Link>
    </aside>
  );
}


  return (
    <aside
      id="chat-sidebar"
      className={`chat-sidebar ${open ? "is-open" : ""}`}
      aria-label="Chat navigation"
    >
      <div className="chat-sidebar-heading">
        <Link to={marketingHome} aria-label="NITO home" className="chat-brand">
          <Wordmark />
        </Link>
        <button
          className="chat-close-sidebar"
          type="button"
          onClick={onClose}
          aria-label="Close chat navigation"
          title="Close sidebar"
        >
          <span className="chat-chevron" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="chat-new-button"
        aria-label="New Chat"
      >
        <img
          className="chat-new-background"
          src="/assets/icons/chat/new-chat-background.svg"
          alt=""
          width="290"
          height="50"
        />
        <span className="chat-sidebar-icon">
          <img
            src="/assets/icons/chat/new-chat-icon.svg"
            alt=""
            width="25"
            height="25"
          />
        </span>
        <img
          className="chat-new-label"
          src="/assets/icons/chat/new-chat-label.svg"
          alt=""
          width="94"
          height="17"
        />
      </button>
      <nav className="chat-workspace-nav" aria-label="Workspace">
        {workspaceItems.map(([name, icon]) => (
          <button
            key={name}
            className="chat-nav-item"
            type="button"
            onClick={() => notify(`${name} is coming soon.`)}
          >
            <span className="chat-sidebar-icon">
              <img src={`/assets/icons/chat/${icon}`} alt="" />
            </span>
            <span>{name}</span>
          </button>
        ))}
      </nav>
      <div className="chat-history-heading">
        <h2>Chats</h2>
        <button
          ref={searchButtonRef}
          type="button"
          className="chat-search-toggle"
          aria-label={searchOpen ? "Close chat search" : "Search chats"}
          aria-expanded={searchOpen}
          aria-controls="chat-search-field"
          onClick={() => {
            setSearchOpen(!searchOpen);
            setSearch("");
          }}
        >
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="10"
              cy="10"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="m15 15 7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div
        id="chat-search-field"
        hidden={!searchOpen}
        className="chat-search-field"
      >
        <label className="sr-only" htmlFor="chat-search">
          Search chats
        </label>
        <input
          ref={searchRef}
          id="chat-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search chats"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setSearchOpen(false);
              setSearch("");
              searchButtonRef.current?.focus();
            }
          }}
        />
      </div>
      <div className="chat-history-list" aria-label="Conversation history">
        {filtered.map((chat) => (
          <div
            key={chat.id}
            className={`chat-history-row ${activeId === chat.id ? "is-active" : ""}`}
          >
            <Link
              to={chatPath(chat.id)}
              onClick={onNavigate}
              aria-current={activeId === chat.id ? "page" : undefined}
              title={chat.title}
            >
              {chat.title}
            </Link>
            {onArchive && (
              <button
                type="button"
                onClick={() => onArchive(chat.id)}
                className="chat-delete-button inline-flex items-center justify-center"
                aria-label={`Archive chat: ${chat.title}`}
                title="Archive chat"
              >
                <img
                  src="/assets/icons/chat/archive.svg"
                  alt=""
                  width="24"
                  height="24"
                  className="block max-w-none"
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(chat.id)}
              className="chat-delete-button"
              aria-label={`Delete chat: ${chat.title}`}
            >
              ×
            </button>
          </div>
        ))}
        {!conversations.length && (
          <p className="chat-history-empty">
            Your conversations will appear here.
          </p>
        )}
        {!!conversations.length && !filtered.length && (
          <p className="chat-history-empty">No matching chats.</p>
        )}
      </div>
      <ProfileMenu>
        <span aria-hidden="true" className="chat-profile-avatar">
          {data.profile.avatar && (
            <img
              src={data.profile.avatar}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          )}
        </span>
        <div className="chat-profile-label">
          <p>{data.profile.name}</p>
          <p>NITO FREE</p>
        </div>
      </ProfileMenu>
    </aside>
  );
}

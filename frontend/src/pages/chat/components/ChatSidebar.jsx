import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import Wordmark from "@/components/brand/Wordmark";
import { chatPath, marketingHome } from "@/services/chatDestination";
import { useNotice } from "@/context/NoticeContext";
import ProfileMenu from "./ProfileMenu";

const workspaceItems = [
  ["Library", "library.svg"], ["Images", "images.svg"],
  ["Skills", "skills.svg"], ["Projects", "projects.svg"],
];

export default function ChatSidebar({ conversations, activeId, open, onClose, onNavigate, onNew, onDelete }) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);
  const { notify } = useNotice();
  const filtered = conversations.filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  return (
    <aside id="chat-sidebar" className={`chat-sidebar ${open ? "is-open" : ""}`} aria-label="Chat navigation">
      <div className="chat-sidebar-heading">
        <Link to={marketingHome} aria-label="NITO home" className="chat-brand"><Wordmark /></Link>
        <button className="chat-close-sidebar" type="button" onClick={onClose} aria-label="Close chat navigation" title="Close sidebar"><span className="chat-chevron" aria-hidden="true" /></button>
      </div>
      <button type="button" onClick={onNew} className="chat-new-button" aria-label="New Chat">
        <img className="chat-new-background" src="/assets/icons/chat/new-chat-background.svg" alt="" width="290" height="50" />
        <span className="chat-sidebar-icon"><img src="/assets/icons/chat/new-chat-icon.svg" alt="" width="25" height="25" /></span>
        <img className="chat-new-label" src="/assets/icons/chat/new-chat-label.svg" alt="" width="94" height="17" />
      </button>
      <nav className="chat-workspace-nav" aria-label="Workspace">
        {workspaceItems.map(([name, icon]) => (
          <button key={name} className="chat-nav-item" type="button" onClick={() => notify(`${name} is coming soon.`)}>
            <span className="chat-sidebar-icon"><img src={`/assets/icons/chat/${icon}`} alt="" /></span><span>{name}</span>
          </button>
        ))}
      </nav>
      <div className="chat-history-heading">
        <h2>Chats</h2>
        <button ref={searchButtonRef} type="button" className="chat-search-toggle" aria-label={searchOpen ? "Close chat search" : "Search chats"} aria-expanded={searchOpen} aria-controls="chat-search-field" onClick={() => { setSearchOpen(!searchOpen); setSearch(""); }}>
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.2" /><path d="m15 15 7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div id="chat-search-field" hidden={!searchOpen} className="chat-search-field">
        <label className="sr-only" htmlFor="chat-search">Search chats</label>
        <input ref={searchRef} id="chat-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search chats" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setSearchOpen(false); setSearch(""); searchButtonRef.current?.focus(); } }} />
      </div>
      <div className="chat-history-list" aria-label="Conversation history">
        {filtered.map((chat) => (
          <div key={chat.id} className={`chat-history-row ${activeId === chat.id ? "is-active" : ""}`}>
            <Link to={chatPath(chat.id)} onClick={onNavigate} aria-current={activeId === chat.id ? "page" : undefined} title={chat.title}>{chat.title}</Link>
            <button type="button" onClick={() => onDelete(chat.id)} className="chat-delete-button" aria-label={`Delete chat: ${chat.title}`}>×</button>
          </div>
        ))}
        {!conversations.length && <p className="chat-history-empty">Your conversations will appear here.</p>}
        {!!conversations.length && !filtered.length && <p className="chat-history-empty">No matching chats.</p>}
      </div>
      <ProfileMenu>
        <span aria-hidden="true" className="chat-profile-avatar" />
        <div className="chat-profile-label"><p>User</p><p>NITO FREE</p></div>
      </ProfileMenu>      
    </aside>
  );
}

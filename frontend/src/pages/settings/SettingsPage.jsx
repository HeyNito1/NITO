import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import Wordmark from "@/components/brand/Wordmark";
import { chatPath } from "@/services/chatDestination";
import { useChat } from "@/hooks/useChat";
import { useAppearance, useSettings } from "@/services/settingsStore";
import ChatSidebar from "@/pages/chat/components/ChatSidebar";
import ProfileMenu from "@/pages/chat/components/ProfileMenu";
import SettingsSuggestions from "./components/SettingsSuggestions";
import Account from "./sections/Account";
import Appearance from "./sections/Appearance";
import Notifications from "./sections/Notifications";
import Security from "./sections/Security";
import Usage from "./sections/Usage";
import Billing from "./sections/Billing";
import ArchivedChats from "./sections/ArchivedChats";
import DataControls from "./sections/DataControls";
import Skills from "./sections/Skills";
import ParentalControl from "./sections/ParentalControl";
import AdPreferences from "./sections/AdPreferences";
import Profile from "./sections/Profile";
import "@/pages/chat/chat.css";
import "./settings.css";

const sections = [
  ["account", "Account", Account],
  ["appearance", "Appearance", Appearance],
  ["notifications", "Notifications", Notifications],
  ["security", "Security & Privacy", Security],
  ["usage", "Usage", Usage],
  ["billing", "Billing", Billing],
  ["archived-chats", "Archived Chats", ArchivedChats],
  ["data-controls", "Data Controls", DataControls],
  ["skills", "Skills", Skills],
  ["parental-control", "Parental Control", ParentalControl],
  ["ad-preferences", "Ad Preferences", AdPreferences],
];
export default function SettingsPage({ profile = false }) {
  const { section = "account" } = useParams();
  const current = sections.find(([id]) => id === section);
  const Component = profile ? Profile : current?.[2];
  const title = profile ? "Your Profile" : current?.[1];
  const navigate = useNavigate();
  const location = useLocation();
  const appearance = useAppearance();
  const { data, error } = useSettings();
  const chats = useChat();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const headingRef = useRef(null);
  useEffect(() => {
    document.title = `${title || "Settings"} · NITO`;
    headingRef.current?.focus();
  }, [title]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const sidebar = sidebarRef.current;
    const elements = () =>
      [
        ...sidebar.querySelectorAll("a[href],button:not(:disabled),input"),
      ].filter((e) => e.getClientRects().length);
    elements()[0]?.focus();
    function keydown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
      if (e.key === "Tab") {
        const list = elements();
        if (e.shiftKey && document.activeElement === list[0]) {
          e.preventDefault();
          list.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === list.at(-1)) {
          e.preventDefault();
          list[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  if (!Component) return <Navigate to="/settings/account" replace />;
  function close() {
    setOpen(false);
  }
  function collapse() {
    if (window.matchMedia("(max-width: 800px)").matches) close();
    else setCollapsed(true);
  }
  return (
    <div
      {...appearance}
      className={`chat-shell settings-shell nito-personalized min-[961px]:[zoom:0.8]! min-[961px]:w-full! min-[961px]:h-[125dvh]! ${collapsed ? "settings-sidebar-collapsed" : ""}`}
    >
      <a className="skip-link" href="#settings-main">
        Skip to settings
      </a>
      {open && (
        <button
          type="button"
          className="settings-backdrop"
          aria-label="Close settings navigation"
          onClick={close}
        />
      )}
      <div
        ref={sidebarRef}
        className={`settings-sidebar-slot ${open ? "is-open" : ""}`}
        inert={collapsed || undefined}
      >
        {profile ? (
          <ChatSidebar
            conversations={chats.conversations.filter((c) => !c.archived)}
            open={open}
            onClose={collapse}
            onNavigate={close}
            onNew={() => navigate(chatPath())}
            onDelete={(id) => chats.remove(id)}
            onArchive={(id) => chats.archive(id, true)}
          />
        ) : (
          <aside className="settings-sidebar" aria-label="Settings navigation">
            <div className="chat-sidebar-heading">
              <Link
                to={chatPath()}
                className="chat-brand"
                aria-label="Back to chat"
              >
                <Wordmark />
              </Link>
              <button
                type="button"
                className="chat-close-sidebar"
                onClick={collapse}
                aria-label="Collapse settings navigation"
              >
                <span className="chat-chevron" />
              </button>
            </div>
            <nav aria-label="Settings sections">
              {sections.map(([id, label]) => (
                <NavLink
                  key={id}
                  to={`/settings/${id}`}
                  onClick={close}
                  style={{ fontSize: "18px" }}
                  className={({ isActive }) =>
                    `settings-nav-item ${isActive ? "is-active" : ""}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto">
              <ProfileMenu>
                <span className="chat-profile-avatar" aria-hidden="true">
                  {data.profile.avatar && (
                    <img
                      className="h-full w-full rounded-full object-cover"
                      src={data.profile.avatar}
                      alt=""
                    />
                  )}
                </span>
                <div className="chat-profile-label">
                  <p>{data.profile.name}</p>
                  <p>NITO FREE</p>
                </div>
              </ProfileMenu>
            </div>
          </aside>
        )}
      </div>
      <main
        id="settings-main"
        className={`chat-main settings-main ${profile ? "is-profile" : ""}`}
        tabIndex={-1}
      >
        <header className="settings-toolbar">
          <button
            type="button"
            className="settings-mobile-menu settings-action"
            ref={menuRef}
            aria-label="Open settings navigation"
            aria-expanded={open}
            onClick={() => {
              setCollapsed(false);
              setOpen(true);
            }}
          >
            ☰
          </button>
          {collapsed && (
            <button
              type="button"
              aria-label="Expand settings navigation"
              className="settings-action"
              onClick={() => setCollapsed(false)}
            >
              ›
            </button>
          )}
          <Link to={chatPath()} className="settings-back-link">
            ← Back to chat
          </Link>
        </header>
        <div
          key={location.pathname}
          className={`settings-content ${profile ? "settings-profile-content" : ""}`}
        >
          {!profile && (
            <h1 ref={headingRef} tabIndex={-1} className="settings-title">
              {title}
            </h1>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-amber-400/30 p-3 text-sm text-amber-300"
            >
              {error}
            </p>
          )}
          <Component />
        </div>
      </main>
      <SettingsSuggestions />
    </div>
  );
}

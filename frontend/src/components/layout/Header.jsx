import { Link, useNavigate } from "react-router";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Wordmark from "@/components/brand/Wordmark";
import { useNotice } from "@/context/NoticeContext";
import { navigation } from "@/data/navigation";
import { useNavigation } from "./useNavigation";
import { useChatEntry } from "@/hooks/useChatEntry";
export default function Header() {
  const navigate = useNavigate();
  const enterChat = useChatEntry();
  const { active, mobileOpen, rootRef, openMenu, toggleMenu, toggleMobile, close } =
    useNavigation();
  const { notify } = useNotice();
  const selected = navigation.find((item) => item.id === active);
  const showPanel = Boolean(selected || mobileOpen);
  const menuButtons = navigation.map((item) => (
  <button
    key={item.id}
    type="button"
    className="nav-trigger"
    aria-expanded={active === item.id}
    aria-controls="navigation-panel"
    onPointerEnter={(event) => {
      if (
        event.pointerType === "mouse" &&
        window.matchMedia("(min-width: 1101px)").matches
      ) {
        openMenu(item.id, event.currentTarget);
      }
    }}
    onClick={(event) => {
      if (mobileOpen) {
        toggleMenu(item.id, event.currentTarget);
      } else {
        openMenu(item.id, event.currentTarget);
      }
    }}
  >
    {item.label}
  </button>
));
  const actions = (
    <>
      <Button
        onClick={() => {
          close();
          navigate("/signup");
        }}
      >
        Sign Up
      </Button>
      <Button
        arrow
        onClick={() => {
          close();
          try { enterChat(); } catch (error) { notify(error.message); }
        }}
      >
        Try NITO
      </Button>
    </>
  );
  return (
      <header
        className="site-header"
        ref={rootRef}
        onPointerLeave={(event) => {
          if (
            event.pointerType === "mouse" &&
            window.matchMedia("(min-width: 1101px)").matches
          ) {
            close();
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            close();
          }
        }}
      >
      <Container className="header-row">
        <Link
          className="brand-link"
          to="/#hero"
          aria-label="NITO home"
          onClick={close}
        >
          <Wordmark />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {menuButtons}
        </nav>
        <div className="header-actions">{actions}</div>
        <IconButton
          className="mobile-toggle" 
          style={{
            padding: 0,
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
          label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="navigation-panel"
          onClick={(event) => toggleMobile(event.currentTarget)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="butt"
            aria-hidden="true"
            style={{ display: "block", flexShrink: 0 }}
          >
            {mobileOpen ? (
              <path d="M6 6L18 18M18 6L6 18" />
            ) : (
              <path d="M4 6H20M4 12H20M4 18H20" />
            )}
          </svg>
        </IconButton>
      </Container>
      <div
        id="navigation-panel"
        className={showPanel ? "mega-menu" : ""}
        hidden={!showPanel}
      >
        {mobileOpen && (
          <Container>
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {menuButtons}
            </nav>
            <div className="mobile-actions">{actions}</div>
          </Container>
        )}
        {selected && (
          <Container className="mega-grid">
            {selected.groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <h2 className="menu-heading">{group.label}</h2>
                <div className="menu-items">
                  {group.items.map((item) => (
                    <Link
                      className="menu-item"
                      key={item.id}
                      to={item.href}
                      onClick={close}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </Container>
        )}
      </div>
    </header>
  );
}

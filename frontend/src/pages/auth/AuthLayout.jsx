import { Link } from "react-router";
import { useNotice } from "@/context/NoticeContext";

export default function AuthLayout({ children, verification = false }) {
  const { notify } = useNotice();

  const footerButton = {
    border: "none",
    background: "transparent",
    color: "#fff",
    font: "inherit",
    padding: 0,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        boxSizing: "border-box",
        minHeight: "100dvh",
        width: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background: "#000",
        color: "#fff",
        border: "1px solid #777",
        borderRadius: 32,
        fontFamily:
          '"Google Sans Flex Settings", Manrope, Arial, sans-serif',
        fontWeight: 400,
      }}
    >
      <header
        style={{
          boxSizing: "border-box",
          width: "min(1340px, calc(100% - 48px))",
          margin: "0 auto",
          paddingTop: 28,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <Link
          to="/"
          aria-label="NITO home"
          style={{
            display: "block",
            width: "clamp(116px, 12vw, 184px)",
            flexShrink: 0,
          }}
        >
          <img
            src="/assets/brand/logo-text.svg"
            alt="NITO"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />
        </Link>

        <p
          style={{
            margin: 0,
            paddingTop: 2,
            textAlign: "right",
            fontSize: "clamp(10px, 0.85vw, 16px)",
            lineHeight: 1.15,
            fontWeight: 400,
          }}
        >
          {verification ? (
            <>
              MIRAYA
              <br />
              CORPORATION
            </>
          ) : (
            <>
              NEURAL INTELLIGENCE &amp;
              <br />
              TRANSHUMAN OMNISCIENCE
            </>
          )}
        </p>
      </header>

      <main
        style={{
          boxSizing: "border-box",
          minWidth: 0,
          display: "grid",
          placeItems: "center",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 556,
            transform: "translateY(clamp(-64px, -5vh, -24px))",
          }}
        >
          {children}
        </div>
      </main>

      <footer
        style={{
          padding: "24px 16px 68px",
          textAlign: "center",
          fontSize: 16,
          lineHeight: 1.4,
        }}
      >
        <button
          type="button"
          style={footerButton}
          onClick={() => notify("The Terms of Use page is not connected yet.")}
        >
          Terms of Use
        </button>

        <span aria-hidden="true"> | </span>

        <button
          type="button"
          style={footerButton}
          onClick={() => notify("The Privacy Policy page is not connected yet.")}
        >
          Privacy Policy
        </button>
      </footer>
    </div>
  );
}
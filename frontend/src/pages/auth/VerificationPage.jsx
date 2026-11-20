import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useNotice } from "@/context/NoticeContext";
import AuthLayout from "./AuthLayout";

export default function VerificationPage() {
  const location = useLocation();
  const { notify } = useNotice();
  const [code, setCode] = useState("");

  const email = location.state?.email;

  if (typeof email !== "string" || !email.trim()) {
    return <Navigate to="/signup" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();

    notify(
      "Code format accepted. Backend verification is not connected, so no account has been verified."
    );
  }

  return (
    <AuthLayout verification>
      <h1
        style={{
          margin: "0 0 16px",
          color: "#fff",
          textAlign: "center",
          fontSize: "clamp(30px, 3vw, 44px)",
          fontWeight: 400,
          lineHeight: 1.27,
          letterSpacing: "-1px",
        }}
      >
        VERIFICATION
      </h1>

      <p
        style={{
          margin: "0 0 32px",
          color: "#666",
          textAlign: "center",
          fontSize: 16,
          lineHeight: "22px",
          overflowWrap: "anywhere",
        }}
      >
        Enter verification code for
        <br />
        {email}
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="verificationCode"
          aria-label="Six-digit verification code"
          aria-describedby="verification-preview"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="XXXXXX"
          pattern="[0-9]{6}"
          title="Enter a six-digit code"
          maxLength={6}
          required
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          style={{
            boxSizing: "border-box",
            display: "block",
            width: "100%",
            height: 50,
            padding: "0 24px",
            border: "1px solid #808080",
            borderRadius: 999,
            background: "#000",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 20,
            textAlign: "center",
            letterSpacing: "6px",
          }}
        />

        <button
          type="submit"
          style={{
            boxSizing: "border-box",
            display: "block",
            width: "100%",
            height: 50,
            marginTop: 18,
            border: "none",
            borderRadius: 999,
            background: "#0066ff",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Proceed
        </button>
      </form>

      <p
        id="verification-preview"
        style={{
          margin: "16px 0 0",
          color: "#888",
          textAlign: "center",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        Frontend preview — no verification code has been sent.
      </p>
    </AuthLayout>
  );
}
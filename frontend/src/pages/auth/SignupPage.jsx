import { useState } from "react";
import { apiRequest } from "@/services/apiClient";
import { useNotice } from "@/context/NoticeContext";
import AuthLayout from "./AuthLayout";
import { chatPath } from "@/services/chatDestination";
import { useNavigate } from "react-router";

function GoogleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 32 14.1l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32 14.1l5.7-5.7A20 20 0 0 0 6.3 14.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.2 5.2A19.9 19.9 0 0 0 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="24"
      height="26"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.05 12.54c.03 3.25 2.85 4.33 2.88 4.35-.02.08-.45 1.54-1.49 3.05-.9 1.3-1.84 2.6-3.31 2.63-1.45.03-1.92-.85-3.58-.85-1.65 0-2.17.82-3.55.88-1.42.05-2.51-1.42-3.42-2.71C2.72 17.25 1.3 12.4 3.21 9.13a5.3 5.3 0 0 1 4.5-2.72c1.41-.03 2.74.94 3.59.94.85 0 2.44-1.16 4.12-.99.7.03 2.68.28 3.95 2.12-.1.06-2.35 1.37-2.32 4.06ZM14.33 4.6c.75-.91 1.26-2.17 1.12-3.43-1.08.04-2.4.72-3.18 1.63-.7.83-1.31 2.17-1.15 3.28 1.2.09 2.43-.62 3.21-1.48Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="m6.6 10.8 2.2-2.2a1 1 0 0 0 .24-1.02L7.8 3.9a1 1 0 0 0-.95-.69H3.8a1 1 0 0 0-1 1.1A19 19 0 0 0 19.7 21.2a1 1 0 0 0 1.1-1v-3.05a1 1 0 0 0-.69-.95l-3.68-1.24a1 1 0 0 0-1.02.24l-2.2 2.2a15.6 15.6 0 0 1-6.61-6.6Z" />
    </svg>
  );
}

const inputStyle = {
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
  fontSize: 18,
};

const secondaryButtonStyle = {
  boxSizing: "border-box",
  width: "100%",
  height: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "0 14px",
  border: "1px solid #808080",
  borderRadius: 999,
  background: "#000",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: "clamp(13px, 1.1vw, 16px)",
  fontWeight: 400,
  cursor: "pointer",
};

export default function SignupPage() {
  const { notify } = useNotice();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitLabel = isLogin ? "Log in" : "Create account";
  const pendingLabel = isLogin ? "Logging in…" : "Creating account…";

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const credentials = { email: email.trim(), password };

      if (isLogin) {
        const result = await apiRequest("auth/login", {
          method: "POST",
          body: credentials,
        });

        if (typeof result?.access_token !== "string" || !result.access_token) {
          throw new Error("The server did not return a login token.");
        }

        sessionStorage.setItem("nito.accessToken", result.access_token);
        notify("Logged in successfully.");
        navigate(chatPath(), { replace: true });
      } else {
        await apiRequest("auth/signup", {
          method: "POST",
          body: credentials,
        });

        notify("Account created successfully.");
      }

      setPassword("");
    } catch (error) {
      notify(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1
        style={{
          margin: "0 0 38px",
          color: "#fff",
          textAlign: "center",
          fontSize: "clamp(32px, 3vw, 44px)",
          fontWeight: 400,
          lineHeight: 1.27,
          letterSpacing: "-1px",
        }}
      >
        {isLogin ? "LOG IN" : "SIGN UP"}
      </h1>

      <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <input
          type="email"
          name="email"
          aria-label="Email address"
          placeholder="Enter Your Email"
          autoComplete="email"
          required
          disabled={isSubmitting}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          aria-label="Password"
          placeholder={isLogin ? "Enter Your Password" : "Create a Password"}
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={isLogin ? undefined : 8}
          maxLength={128}
          required
          disabled={isSubmitting}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ ...inputStyle, marginTop: 12 }}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            boxSizing: "border-box",
            display: "block",
            width: "100%",
            height: 50,
            marginTop: 17,
            border: "none",
            borderRadius: 999,
            background: "#0066ff",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 500,
            cursor: isSubmitting ? "wait" : "pointer",
          }}
        >
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
      </form>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => {
          setIsLogin((current) => !current);
          setPassword("");
        }}
        style={{ ...secondaryButtonStyle, marginTop: 12 }}
      >
        {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>

      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 21,
          color: "#fff",
          fontSize: 16,
        }}
      >
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(to right, transparent, #b0b0b0)",
          }}
        />
        <span>OR</span>
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(to left, transparent, #b0b0b0)",
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 17 }}>
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={() =>
            notify("Google sign-in is not connected in this frontend preview.")
          }
        >
          <GoogleIcon />
          <span>Continue with GOOGLE</span>
        </button>

        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={() =>
            notify("Apple sign-in is not connected in this frontend preview.")
          }
        >
          <AppleIcon />
          <span>Continue with APPLE</span>
        </button>

        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={() =>
            notify("Phone sign-in is not connected in this frontend preview.")
          }
        >
          <PhoneIcon />
          <span>Continue with Phone Number</span>
        </button>
      </div>
    </AuthLayout>
  );
}
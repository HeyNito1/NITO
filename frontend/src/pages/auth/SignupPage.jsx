
import { useState } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "@/services/apiClient";
import { useNotice } from "@/context/NoticeContext";
import { chatPath } from "@/services/chatDestination";
import AuthLayout from "./AuthLayout";

const inputClass =
  "box-border block h-[50px] w-full rounded-full border border-[#808080] bg-black px-6 text-[16px] text-white outline-none transition-colors placeholder:text-[#999] focus:border-[#0066ff] disabled:opacity-50";

export default function SignupPage() {
  const { notify } = useNotice();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const passwordsMismatch =
    !isLogin &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  function switchMode() {
    setIsLogin((current) => !current);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    // Validate passwords before creating an account
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    let accountCreated = false;

    try {
      const credentials = {
        email: email.trim(),
        password,
      };

      // Create account if the user is signing up
      if (!isLogin) {
        await apiRequest("auth/signup", {
          method: "POST",
          body: credentials,
        });

        accountCreated = true;
      }

      // Log in both existing and newly registered users
      const result = await apiRequest("auth/login", {
        method: "POST",
        body: credentials,
      });

      if (
        typeof result?.access_token !== "string" ||
        !result.access_token
      ) {
        throw new Error(
          "The server did not return a login token."
        );
      }

      // Store authentication token
      sessionStorage.setItem(
        "nito.accessToken",
        result.access_token
      );

      notify(
        isLogin
          ? "Logged in successfully."
          : "Account created successfully. Welcome to NITO!",
        "success"
      );

      // Redirect directly to chat
      navigate(chatPath(), { replace: true });
    } catch (error) {
      if (accountCreated) {
        setIsLogin(true);
        setConfirmPassword("");
        setShowConfirmPassword(false);

        const message =
          "Your account was created successfully. Please log in to continue.";

        setError(message);
        notify(message, "error");
      } else {
        const message =
          error.message ||
          "Something went wrong. Please try again.";

        setError(message);
        notify(message, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[440px]">
        {/* Heading */}
        <h1 className="mb-3 text-center text-[clamp(30px,3vw,42px)] font-normal leading-tight tracking-[-1px] text-white">
          {isLogin
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p className="mb-9 text-center text-[15px] text-[#999]">
          {isLogin
            ? "Log in to continue to NITO."
            : "Get started with NITO."}
        </p>

        {/* Authentication form */}
        <form
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          className="flex flex-col gap-4"
        >
          {/* Email */}
          <input
            type="email"
            name="email"
            aria-label="Email address"
            placeholder="Email address"
            autoComplete="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            className={inputClass}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              aria-label="Password"
              placeholder={
                isLogin ? "Password" : "Create a password"
              }
              autoComplete={
                isLogin
                  ? "current-password"
                  : "new-password"
              }
              minLength={isLogin ? undefined : 8}
              maxLength={128}
              required
              disabled={isSubmitting}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              className={`${inputClass} pr-[76px]`}
            />

            <button
              type="button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowPassword((current) => !current)
              }
              className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent text-[13px] text-[#aaa] hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm password — signup only */}
          {!isLogin && (
            <>
              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  aria-label="Confirm password"
                  aria-invalid={passwordsMismatch}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={isSubmitting}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  className={`${inputClass} pr-[76px] ${
                    passwordsMismatch
                      ? "border-red-500! focus:border-red-500!"
                      : ""
                  }`}
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent text-[13px] text-[#aaa] hover:text-white"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {passwordsMismatch ? (
                <p className="px-3 text-[12px] text-red-400">
                  Passwords do not match.
                </p>
              ) : (
                <p className="px-3 text-[12px] text-[#999]">
                  Password must contain at least 8 characters.
                </p>
              )}
            </>
          )}

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="px-3 text-[13px] text-red-400"
            >
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || passwordsMismatch}
            className="mt-1 h-[50px] w-full cursor-pointer rounded-full border-0 bg-[#0066ff] text-[16px] font-medium text-white transition-colors hover:bg-[#0055d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isLogin
                ? "Logging in..."
                : "Creating account..."
              : isLogin
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        {/* Switch between login and signup */}
        <p className="mt-6 text-center text-[14px] text-[#aaa]">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={switchMode}
            className="ml-2 cursor-pointer border-0 bg-transparent font-medium text-[#408cff] hover:underline disabled:opacity-50"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

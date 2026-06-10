import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Btn } from "../ui";

export function LoginForm({ onSuccess }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pendingEmail, setPendingEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError("");
    setInfo("");
    setPendingEmail(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setPendingEmail(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        onSuccess?.();
      } else if (mode === "register") {
        if (!username.trim()) throw new Error("Username is required.");
        const data = await signUp(email, password, username.trim(), displayName.trim() || username.trim());
        if (data.needsEmailConfirmation) {
          setPendingEmail(email.trim());
          toast.success("Confirmation email sent — check your inbox.");
          return;
        }
        onSuccess?.();
      } else if (mode === "forgot") {
        if (!email.trim()) throw new Error("Email is required.");
        await resetPassword(email.trim());
        setInfo("Password reset email sent. Check your inbox.");
        toast.success("Password reset email sent.");
        return;
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  if (pendingEmail) {
    return (
      <div className="login-form">
        <div className="login-confirm-box">
          <div className="login-confirm-icon">✉</div>
          <h2 className="login-confirm-title">Check your email</h2>
          <p className="login-confirm-text">
            We sent a confirmation link to <strong>{pendingEmail}</strong>.
            Open the email from Supabase and click <strong>Confirm email address</strong> to activate your account.
          </p>
          <p className="login-confirm-hint">
            After confirming, return here and sign in with your email and password.
          </p>
          <Btn
            type="button"
            variant="primary"
            style={{ width: "100%", padding: "12px 16px", marginTop: 8 }}
            onClick={() => { setPendingEmail(null); switchMode("login"); }}
          >
            Back to login
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="login-form">
      <div className="login-tabs">
        <button
          type="button"
          className={`login-tab${mode === "login" ? " login-tab-active" : ""}`}
          onClick={() => switchMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`login-tab${mode === "register" ? " login-tab-active" : ""}`}
          onClick={() => switchMode("register")}
        >
          Register
        </button>
      </div>

      <p className="login-form-hint">
        {mode === "login" && "Sign in with your email and password."}
        {mode === "register" && "Create an account and start the challenge."}
        {mode === "forgot" && "Enter your email to receive a reset link."}
      </p>

      <form onSubmit={handleSubmit} className="login-fields">
        {mode === "register" && (
          <>
            <Field label="Username" required>
              <input
                className="login-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="trader_ivan"
                autoComplete="username"
              />
            </Field>
            <Field label="Display name">
              <input
                className="login-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ivan"
                autoComplete="name"
              />
            </Field>
          </>
        )}

        <Field label="Email" required>
          <input
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            type="email"
            autoComplete="email"
          />
        </Field>

        {mode !== "forgot" && (
          <Field label="Password" required>
            <input
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </Field>
        )}

        {mode === "login" && (
          <button
            type="button"
            className="login-tab"
            style={{ alignSelf: "flex-start", padding: 0, background: "none", border: "none", color: "var(--color-accent)", fontSize: 12 }}
            onClick={() => switchMode("forgot")}
          >
            Forgot password?
          </button>
        )}

        {error && <div className="login-error">{error}</div>}
        {info && <div className="login-info">{info}</div>}

        <Btn type="submit" variant="primary" disabled={loading} style={{ width: "100%", padding: "12px 16px", marginTop: 4 }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
        </Btn>

        {mode === "forgot" && (
          <button
            type="button"
            className="login-tab"
            style={{ background: "none", border: "none", color: "var(--color-dim)", fontSize: 12 }}
            onClick={() => switchMode("login")}
          >
            Back to login
          </button>
        )}
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="login-field">
      <span className="login-field-label">
        {label}
        {required && <span className="login-required">*</span>}
      </span>
      {children}
    </label>
  );
}

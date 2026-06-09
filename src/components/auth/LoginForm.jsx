import { useState } from "react";
import { C } from "../../constants/palette";
import { useAuth } from "../../contexts/AuthContext";
import { Btn } from "../ui";

export function LoginForm({ onSuccess }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!username.trim()) throw new Error("Username is required.");
        await signUp(email, password, username.trim(), displayName.trim() || username.trim());
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
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
        {mode === "login"
          ? "Sign in with your email and password."
          : "Create an account and start the challenge."}
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

        {error && (
          <div className="login-error">{error}</div>
        )}

        <Btn type="submit" variant="primary" disabled={loading} style={{ width: "100%", padding: "12px 16px", marginTop: 4 }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Btn>
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

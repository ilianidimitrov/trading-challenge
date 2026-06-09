import { useState } from "react";
import { C } from "../../constants/palette";
import { useAuth } from "../../contexts/AuthContext";
import { Btn, Inp, Label } from "../ui";

export function LoginModal({ open, onClose }) {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  if (!isConfigured) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.6 }}>
          Supabase не е конфигуриран. Добави <code>VITE_SUPABASE_URL</code> и{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> в <code>.env</code> файл.
        </div>
        <div style={{ marginTop: 16 }}><Btn onClick={onClose}>Close</Btn></div>
      </Overlay>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!username.trim()) throw new Error("Username е задължителен.");
        await signUp(email, password, username.trim(), displayName.trim() || username.trim());
      }
      onClose();
    } catch (err) {
      setError(err.message || "Грешка при автентикация.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <Label color={C.muted}>{mode === "login" ? "Login" : "Register"}</Label>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {mode === "register" && (
          <>
            <Inp value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
            <Inp value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name (optional)" />
          </>
        )}
        <Inp value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
        <Inp value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <Btn type="submit" variant="primary" disabled={loading}>
          {loading ? "..." : mode === "login" ? "Login" : "Create account"}
        </Btn>
      </form>
      <button
        onClick={() => setMode(m => m === "login" ? "register" : "login")}
        style={{
          marginTop: 12, background: "none", border: "none", color: C.dim,
          cursor: "pointer", fontSize: 12, fontFamily: "inherit",
        }}
      >
        {mode === "login" ? "Нямаш акаунт? Register" : "Имаш акаунт? Login"}
      </button>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "#000000aa",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 24, width: "100%", maxWidth: 400,
        }}
      >
        {children}
      </div>
    </div>
  );
}

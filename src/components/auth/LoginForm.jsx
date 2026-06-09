import { useState } from "react";
import { C } from "../../constants/palette";
import { useAuth } from "../../contexts/AuthContext";
import { Btn, Inp, Label } from "../ui";

export function LoginForm({ onSuccess }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Грешка при автентикация.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
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
        onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }}
        style={{
          marginTop: 12, background: "none", border: "none", color: C.dim,
          cursor: "pointer", fontSize: 12, fontFamily: "inherit",
        }}
      >
        {mode === "login" ? "Нямаш акаунт? Register" : "Имаш акаунт? Login"}
      </button>
    </div>
  );
}

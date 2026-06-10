import { C } from "../../constants/palette";
import { useAuth } from "../../contexts/AuthContext";
import { Btn, Label } from "../ui";
import { LoginForm } from "./LoginForm";

export function LoginModal({ open, onClose }) {
  const { isConfigured } = useAuth();

  if (!open) return null;

  if (!isConfigured) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.6 }}>
          Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
        </div>
        <div style={{ marginTop: 16 }}><Btn onClick={onClose}>Close</Btn></div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <LoginForm onSuccess={onClose} />
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: C.overlay,
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

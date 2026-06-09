import { C } from "../../constants/palette";
import { EXCHANGE } from "../../constants/binance";
import { LoginForm } from "./LoginForm";

export function LoginScreen() {
  return (
    <div style={{
      background: C.bg, minHeight: "100vh",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: C.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>
            {EXCHANGE} FUTURES CHALLENGE
          </div>
          <div style={{ color: C.bright, fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            $5 → $1M USDT
          </div>
          <div style={{ color: C.dim, fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
            Влез или създай акаунт, за да започнеш challenge-а.
          </div>
        </div>

        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 24,
        }}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

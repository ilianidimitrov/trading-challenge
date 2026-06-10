import { C, STARTING_BALANCE, TARGET_BALANCE } from "../constants/palette";
import { fmt } from "../utils/format";
import { Btn, Label } from "./ui";

const FLAG = "tc_challenge_complete_shown";

export function shouldShowChallengeComplete(balance) {
  if (balance < TARGET_BALANCE) return false;
  try {
    return !localStorage.getItem(FLAG);
  } catch {
    return false;
  }
}

export function markChallengeCompleteShown() {
  try {
    localStorage.setItem(FLAG, "1");
  } catch { /* ignore */ }
}

export function ChallengeComplete({ open, balance, onClose }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: C.overlay,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-hi)",
          borderRadius: 16, padding: 32, maxWidth: 420, textAlign: "center",
        }}
      >
        <div className="text-title" style={{ fontSize: 24, marginBottom: 8 }}>Challenge Complete</div>
        <Label color="var(--color-dim)">You reached the goal</Label>
        <div className="text-stat" style={{ fontSize: 36, margin: "16px 0", color: "var(--color-green)" }}>
          {fmt(balance)}
        </div>
        <p style={{ color: "var(--color-dim)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
          From {fmt(STARTING_BALANCE)} to {fmt(TARGET_BALANCE)} USDT. Discipline wins.
        </p>
        <Btn onClick={onClose} variant="primary">Continue</Btn>
      </div>
    </div>
  );
}

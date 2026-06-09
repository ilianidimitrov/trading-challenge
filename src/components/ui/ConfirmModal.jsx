import { C } from "../../constants/palette";
import { Btn, Label } from "./index";

export function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete", danger = true }) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, background: "#000000aa",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1001, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 24, width: "100%", maxWidth: 380,
        }}
      >
        <Label color={C.muted}>{title}</Label>
        <div style={{ color: C.text, fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <Btn onClick={onConfirm} variant={danger ? "danger" : "primary"}>{confirmLabel}</Btn>
          <Btn onClick={onCancel} variant="default">Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

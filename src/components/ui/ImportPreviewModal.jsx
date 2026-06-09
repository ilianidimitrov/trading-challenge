import { Btn, Label } from "./index";

export function ImportPreviewModal({ open, trades, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, background: "#000000aa",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12, padding: 24, width: "100%", maxWidth: 480,
          maxHeight: "80vh", overflow: "auto",
        }}
      >
        <Label color="var(--color-muted)">Import Preview</Label>
        <p style={{ color: "var(--color-dim)", fontSize: 13, margin: "12px 0 16px" }}>
          {trades.length} trade{trades.length !== 1 ? "s" : ""} will be imported.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, maxHeight: 240, overflow: "auto" }}>
          {trades.slice(0, 20).map((t, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12, padding: "6px 0",
              borderBottom: "1px solid var(--color-border)",
            }}>
              <span style={{ color: "var(--color-text)" }}>{t.pair} · {t.dir}</span>
              <span style={{ color: parseFloat(t.pnl) >= 0 ? "var(--color-green)" : "var(--color-red)" }}>
                {parseFloat(t.pnl) >= 0 ? "+" : ""}{Number(t.pnl).toFixed(2)}
              </span>
            </div>
          ))}
          {trades.length > 20 && (
            <span style={{ color: "var(--color-muted)", fontSize: 11 }}>+{trades.length - 20} more</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onConfirm} variant="primary">Import</Btn>
          <Btn onClick={onCancel} variant="default">Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

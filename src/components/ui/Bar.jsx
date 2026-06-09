import { C } from "../../constants/palette";

export function Bar({ pct, color = C.green, height = 3 }) {
  return (
    <div style={{ background: C.border, borderRadius: 2, height, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%",
        background: color, transition: "width 0.5s ease",
      }} />
    </div>
  );
}

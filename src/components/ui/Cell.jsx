import { C } from "../../constants/palette";
import { Label } from "./Label";
import { Val } from "./Val";

export function Cell({ label, value, color = C.bright, sub }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 10px" }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 5 }}><Val color={color} size={18}>{value}</Val></div>
      {sub && <div style={{ marginTop: 3 }}><Label color={C.muted}>{sub}</Label></div>}
    </div>
  );
}

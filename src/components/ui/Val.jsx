import { C } from "../../constants/palette";

export function Val({ children, color = C.bright, size = 14 }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
      {children}
    </span>
  );
}

import { C } from "../../constants/palette";

export function Label({ children, color = C.dim }) {
  return (
    <span style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color, fontWeight: 600 }}>
      {children}
    </span>
  );
}

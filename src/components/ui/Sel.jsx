import { C } from "../../constants/palette";

export function Sel({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        background: C.surface, border: `1px solid ${C.borderHi}`,
        borderRadius: 6, color: C.text, padding: "8px 10px",
        fontSize: 13, outline: "none", width: "100%", fontFamily: "inherit",
      }}
    >
      {children}
    </select>
  );
}

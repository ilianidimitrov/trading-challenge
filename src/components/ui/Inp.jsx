import { C } from "../../constants/palette";

export function Inp({ value, onChange, placeholder, type = "text", step }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      step={step}
      style={{
        background: C.surface, border: `1px solid ${C.borderHi}`,
        borderRadius: 6, color: C.text, padding: "8px 10px",
        fontSize: 13, outline: "none", width: "100%",
        fontFamily: "inherit",
      }}
    />
  );
}

import { C } from "../../constants/palette";

export function Btn({ onClick, children, variant = "default", type = "button", disabled = false }) {
  const styles = {
    default: { background: C.surface, border: `1px solid ${C.borderHi}`, color: C.text },
    primary: { background: C.green, border: "none", color: "#000" },
    danger:  { background: C.redDim, border: `1px solid ${C.red}44`, color: C.red },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        borderRadius: 6, padding: "9px 16px", fontSize: 13,
        fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, fontFamily: "inherit",
        letterSpacing: 0.3,
      }}
    >
      {children}
    </button>
  );
}

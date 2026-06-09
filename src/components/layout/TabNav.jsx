import { C } from "../../constants/palette";

export function TabNav({ tabs, active, onChange }) {
  return (
    <div style={{
      display: "flex", borderBottom: `1px solid ${C.border}`,
      marginBottom: 20, gap: 0, overflowX: "auto",
    }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: "10px 18px", background: "transparent", cursor: "pointer",
            border: "none", borderBottom: `2px solid ${active === t.key ? C.green : "transparent"}`,
            color: active === t.key ? C.bright : C.dim,
            fontSize: 13, fontWeight: active === t.key ? 700 : 500,
            fontFamily: "inherit", transition: "all 0.15s", letterSpacing: 0.3,
            whiteSpace: "nowrap",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

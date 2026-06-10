import { useEffect, useState } from "react";
import { C } from "../constants/palette";
import { fmt, phaseMult } from "../utils/format";
import { loadChecklist, saveChecklist } from "../utils/phaseChecklist";
import { useAuth } from "../contexts/AuthContext";
import { Bar, Label } from "./ui";

export function PhaseCard({ phase, bal, selected, onSelect }) {
  const { user } = useAuth();
  const done = bal >= phase.to;
  const active = bal >= phase.from && bal < phase.to;
  const pct = done ? 100 : active ? ((bal - phase.from) / (phase.to - phase.from)) * 100 : 0;
  const beWR = Math.round(100 / (1 + phase.rr));
  const statusColor = done ? C.green : active ? C.yellow : C.muted;

  const [checked, setChecked] = useState(() => loadChecklist(user?.id, phase.id, phase.rules.length));

  useEffect(() => {
    setChecked(loadChecklist(user?.id, phase.id, phase.rules.length));
  }, [user?.id, phase.id, phase.rules.length]);

  function toggleRule(i) {
    const next = [...checked];
    next[i] = !next[i];
    setChecked(next);
    saveChecklist(user?.id, phase.id, next);
  }

  const doneCount = checked.filter(Boolean).length;

  return (
    <div
      onClick={() => onSelect(phase.id)}
      style={{
        background: selected ? C.surfaceSelected : C.surface,
        border: `1px solid ${selected ? C.borderHi : C.border}`,
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 8, padding: 18, cursor: "pointer",
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <Label color={statusColor}>{phase.tag}</Label>
          <span style={{ color: C.bright, fontSize: 15, fontWeight: 700 }}>
            {phase.from >= 1000 ? fmt(phase.from) : "$" + phase.from} → {fmt(phase.to)}
          </span>
          <span style={{ color: C.dim, fontSize: 12 }}>{phase.label}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {done && <Label color={C.green}>COMPLETED</Label>}
          {active && !done && <Label color={C.yellow}>ACTIVE</Label>}
          <Label color={C.muted}>×{phaseMult(phase)}</Label>
        </div>
      </div>

      <Bar pct={pct} color={statusColor} height={2} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 14 }}>
        <Label color={C.muted}>{fmt(phase.from)}</Label>
        <Label color={statusColor}>{pct.toFixed(0)}%</Label>
        <Label color={C.muted}>{fmt(phase.to)}</Label>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {[
          { l: "Risk / trade", v: phase.risk + "%" },
          { l: "RR",           v: phase.rrStr },
          { l: "Target WR",    v: phase.wr + "%" },
          { l: "Break-even",   v: beWR + "%" },
          { l: "Leverage",     v: phase.lev },
        ].map(s => (
          <div key={s.l}>
            <Label color={C.muted}>{s.l}</Label>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14 }} onClick={e => e.stopPropagation()}>
          <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>{phase.note}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Label>Rules Checklist</Label>
            <Label color={C.muted}>{doneCount}/{phase.rules.length}</Label>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 0 }}>
            {phase.rules.map((r, i) => (
              <label key={i} style={{
                display: "flex", gap: 10, padding: "7px 0", alignItems: "flex-start", cursor: "pointer",
                borderBottom: i < phase.rules.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => toggleRule(i)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ color: checked[i] ? C.muted : C.text, fontSize: 12, lineHeight: 1.5, textDecoration: checked[i] ? "line-through" : "none" }}>{r}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

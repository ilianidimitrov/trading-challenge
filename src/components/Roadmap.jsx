import { C } from "../constants/palette";
import { PHASES } from "../constants/phases";
import { fmt, phaseMult } from "../utils/format";
import { computeMilestoneHistory } from "../utils/milestones";
import { Bar, Label } from "./ui";

export function Roadmap({ bal, trades = [] }) {
  const milestones = computeMilestoneHistory(trades);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {milestones.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
          <Label color={C.dim}>Milestone History</Label>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.green, fontWeight: 700 }}>{m.phase.tag}</span>
                <span style={{ color: C.text }}>{fmt(m.balance)}</span>
                <span style={{ color: C.muted }}>{m.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>Phase Timeline</Label>
        <div style={{ marginTop: 14 }}>
          {PHASES.map((p, i) => {
            const done   = bal >= p.to;
            const active = bal >= p.from && bal < p.to;
            const sc     = done ? C.green : active ? C.yellow : C.muted;
            const pct    = done ? 100 : active ? ((bal - p.from) / (p.to - p.from)) * 100 : 0;
            const milestone = milestones.find(m => m.phase.id === p.id);
            return (
              <div key={p.id} style={{ display: "flex", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: done ? C.green : active ? C.yellow : C.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800,
                    color: done || active ? "#000" : C.muted,
                  }}>
                    {done ? "✓" : p.id}
                  </div>
                  {i < PHASES.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 24, background: done ? C.green + "44" : C.border }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < PHASES.length - 1 ? 18 : 0, flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ color: sc, fontSize: 12, fontWeight: 700 }}>
                        {fmt(p.from)} → {fmt(p.to)}
                      </span>
                      <Label color={C.muted}>{p.label}</Label>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      {milestone && <Label color={C.green}>Reached {milestone.date}</Label>}
                      <Label color={C.muted}>×{phaseMult(p)}</Label>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
                    <Label color={C.muted}>Risk {p.risk}%</Label>
                    <Label color={C.muted}>RR {p.rrStr}</Label>
                    <Label color={C.muted}>Lev {p.lev}</Label>
                  </div>
                  {active && (
                    <div style={{ marginTop: 6 }}>
                      <Bar pct={pct} color={C.yellow} height={2} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>Parameter Comparison</Label>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Phase", "Range", "Risk %", "RR", "WR %", "BE %", "Edge", "Leverage", "×"].map(h => (
                  <th key={h} style={{
                    color: C.dim, fontWeight: 600, padding: "6px 10px",
                    textAlign: "left", borderBottom: `1px solid ${C.border}`,
                    whiteSpace: "nowrap", letterSpacing: 0.5, fontSize: 10,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PHASES.map((p, i) => {
                const done   = bal >= p.to;
                const active = bal >= p.from && bal < p.to;
                const beWR   = Math.round(100 / (1 + p.rr));
                const edge   = p.wr - beWR;
                const rc     = done ? C.green : active ? C.yellow : C.dim;
                return (
                  <tr key={p.id} style={{ background: active ? "#ffffff05" : "transparent" }}>
                    <td style={{ padding: "8px 10px", color: rc, fontWeight: 700, borderBottom: i < 9 ? `1px solid ${C.border}` : "none" }}>{p.tag}</td>
                    <td style={{ padding: "8px 10px", color: active ? C.bright : C.text, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>
                      {fmt(p.from)} → {fmt(p.to)}
                    </td>
                    <td style={{ padding: "8px 10px", color: C.red, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>{p.risk}%</td>
                    <td style={{ padding: "8px 10px", color: C.text, borderBottom: i < 9 ? `1px solid ${C.border}` : "none" }}>{p.rrStr}</td>
                    <td style={{ padding: "8px 10px", color: C.green, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>{p.wr}%</td>
                    <td style={{ padding: "8px 10px", color: C.red, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>{beWR}%</td>
                    <td style={{ padding: "8px 10px", color: edge > 0 ? C.green : C.red, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>+{edge}pp</td>
                    <td style={{ padding: "8px 10px", color: C.purple, borderBottom: i < 9 ? `1px solid ${C.border}` : "none" }}>{p.lev}</td>
                    <td style={{ padding: "8px 10px", color: C.yellow, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>×{phaseMult(p)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

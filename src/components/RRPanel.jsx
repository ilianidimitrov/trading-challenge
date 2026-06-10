import { C } from "../constants/palette";
import { GLOBAL_RULES } from "../constants/globalRules";
import { fmt, phaseMult } from "../utils/format";
import { Bar, Label } from "./ui";

export function RRPanel({ phase }) {
  const risk   = phase.from * (phase.risk / 100);
  const reward = risk * phase.rr;
  const beWR   = Math.round(100 / (1 + phase.rr));
  const edge   = phase.wr - beWR;
  const w10    = Math.round(10 * phase.wr / 100);
  const net10  = w10 * reward - (10 - w10) * risk;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <Label color={C.dim}>{phase.tag} — {phase.label}</Label>
            <div style={{ color: C.bright, fontSize: 16, fontWeight: 700, marginTop: 4 }}>
              {fmt(phase.from)} → {fmt(phase.to)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Label color={C.dim}>Phase multiplier</Label>
            <div style={{ color: C.yellow, fontSize: 20, fontWeight: 800, marginTop: 4 }}>
              ×{phaseMult(phase)}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0, marginBottom: 16 }}>
          <div style={{ padding: "12px 16px 12px 0" }}>
            <Label color={C.dim}>Risk per trade</Label>
            <div style={{ color: C.red, fontSize: 24, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {fmt(risk)}
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginTop: 3 }}>{phase.risk}% of {fmt(phase.from)}</div>
          </div>
          <div style={{ background: C.border }} />
          <div style={{ padding: "12px 0 12px 16px" }}>
            <Label color={C.dim}>Reward per trade</Label>
            <div style={{ color: C.green, fontSize: 24, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {fmt(reward)}
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginTop: 3 }}>RR {phase.rrStr}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Label color={C.dim}>Break-even win rate</Label>
              <Label color={C.red}>{beWR}%</Label>
            </div>
            <Bar pct={beWR} color={C.red} height={4} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Label color={C.dim}>Target win rate</Label>
              <Label color={C.green}>{phase.wr}%</Label>
            </div>
            <Bar pct={phase.wr} color={C.green} height={4} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
            <Label color={C.dim}>Statistical edge</Label>
            <Label color={edge > 0 ? C.green : C.red}>+{edge}pp above break-even</Label>
          </div>
        </div>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>10-trade simulation at {phase.wr}% win rate</Label>
        <div style={{ display: "flex", gap: 4, marginTop: 10, marginBottom: 10 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const win = i < w10;
            return (
              <div key={i} style={{
                flex: 1, height: 40, borderRadius: 4,
                background: win ? C.greenDim : C.redDim,
                border: `1px solid ${win ? C.greenBorder : C.redBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: win ? C.green : C.red, fontSize: 11, fontWeight: 700 }}>
                  {win ? "W" : "L"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <div><Label color={C.dim}>Gross wins</Label><div style={{ color: C.green, fontWeight: 700, fontSize: 13, marginTop: 2 }}>+{fmt(w10 * reward)}</div></div>
          <div><Label color={C.dim}>Gross losses</Label><div style={{ color: C.red, fontWeight: 700, fontSize: 13, marginTop: 2 }}>−{fmt((10 - w10) * risk)}</div></div>
          <div style={{ textAlign: "right" }}><Label color={C.dim}>Net</Label><div style={{ color: net10 >= 0 ? C.green : C.red, fontWeight: 800, fontSize: 16, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{net10 >= 0 ? "+" : ""}{fmt(net10)}</div></div>
        </div>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>Global Rules — All Phases</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginTop: 12 }}>
          {GLOBAL_RULES.map((r, i) => (
            <div key={i} style={{
              padding: "12px 14px",
              borderBottom: i < GLOBAL_RULES.length - 2 ? `1px solid ${C.border}` : "none",
              borderRight: i % 2 === 0 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{r.title}</div>
              <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.6 }}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

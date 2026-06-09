import { useEffect, useRef, useState } from "react";
import { C, PHASE_COLORS, STARTING_BALANCE, TARGET_BALANCE } from "../../constants/palette";
import { PHASES } from "../../constants/phases";
import { fmt, getOverallProgress } from "../../utils/format";
import { daysInCurrentPhase } from "../../utils/milestones";
import { PhaseRing } from "../PhaseRing";
import { Cell, Label } from "../ui";

export function Header({ bal, active, trades = [] }) {
  const overall = getOverallProgress(bal, STARTING_BALANCE, TARGET_BALANCE);
  const { days } = daysInCurrentPhase(trades, bal);
  const accent = PHASE_COLORS[(active.id || 1) - 1];
  const prevTag = useRef(active.tag);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (prevTag.current !== active.tag) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      prevTag.current = active.tag;
      return () => clearTimeout(t);
    }
  }, [active.tag]);

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 20, flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {bal < TARGET_BALANCE && (
              <PhaseRing balance={bal} phase={active} pulse={pulse} />
            )}
            <div>
              <Label color={C.muted}>Binance Futures Challenge</Label>
              <div className="text-title" style={{ fontSize: 28, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                {fmt(STARTING_BALANCE)} <span style={{ color: C.muted, fontWeight: 300 }}>→</span> {fmt(TARGET_BALANCE)} USDT
              </div>
              <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>
                Binance USDT-M · 10 phases · {PHASES.length} risk tiers
                {bal < TARGET_BALANCE && (
                  <span> · {days} day{days !== 1 ? "s" : ""} in {active.tag}</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Label color={C.dim}>Current Balance</Label>
            <div className="text-stat" style={{ fontSize: 26, marginTop: 4 }}>
              {fmt(bal)}
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>
              {(bal / STARTING_BALANCE).toFixed(1)}× from start
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label color={C.dim}>Overall Progress</Label>
            <Label color={C.dim}>{overall.toFixed(4)}%</Label>
          </div>
          <div style={{
            display: "flex", gap: 2, height: 6, borderRadius: 3, overflow: "hidden",
            borderBottom: `2px solid ${accent}44`,
          }}>
            {PHASES.map(p => {
              const w = (p.to - p.from) / (TARGET_BALANCE - STARTING_BALANCE) * 100;
              const f = bal >= p.to ? 1 : bal > p.from ? (bal - p.from) / (p.to - p.from) : 0;
              return (
                <div key={p.id} style={{ flex: w, background: C.border, position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", inset: 0, right: `${(1 - f) * 100}%`,
                    background: PHASE_COLORS[p.id - 1],
                    transition: "right 0.5s ease",
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 4,
            flexWrap: "wrap", gap: 4,
          }}>
            <Label color={C.muted}>{fmt(STARTING_BALANCE)}</Label>
            {bal < TARGET_BALANCE && (
              <Label color={C.yellow}>
                {active.tag} — {active.label} · {fmt(active.to - bal)} to next milestone
              </Label>
            )}
            {bal >= TARGET_BALANCE && <Label color={C.green}>COMPLETED</Label>}
            <Label color={C.muted}>{fmt(TARGET_BALANCE)}</Label>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <Cell label="Balance" value={fmt(bal)} color={C.bright} />
        <Cell label="Remaining" value={fmt(Math.max(0, TARGET_BALANCE - bal))} color={C.dim} />
        <Cell label="Growth" value={`${((bal / STARTING_BALANCE - 1) * 100).toFixed(0)}%`} color={C.green} />
        <Cell
          label="Phase"
          value={bal < TARGET_BALANCE ? active.tag : "DONE"}
          color={C.yellow}
          sub={bal < TARGET_BALANCE ? active.label : "Challenge complete"}
        />
      </div>
    </>
  );
}

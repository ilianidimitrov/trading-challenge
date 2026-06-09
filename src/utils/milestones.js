import { PHASES } from "../constants/phases";
import { TARGET_BALANCE } from "../constants/palette";
import { buildEquityCurve } from "./equityCurve";

function tradeTimestamp(t) {
  return t.tradeAtMs || t.createdAt || 0;
}

export function getPhaseForBalance(bal) {
  if (bal >= TARGET_BALANCE) return PHASES[PHASES.length - 1];
  return PHASES.find(p => bal >= p.from && bal < p.to) || PHASES[0];
}

export function computeMilestoneHistory(trades) {
  const curve = buildEquityCurve(trades);
  const crossings = [];
  let phaseIdx = 0;

  for (const pt of curve) {
    while (phaseIdx < PHASES.length && pt.balance >= PHASES[phaseIdx].to) {
      crossings.push({
        phase: PHASES[phaseIdx],
        balance: PHASES[phaseIdx].to,
        ts: pt.ts,
        date: pt.ts ? new Date(pt.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      });
      phaseIdx++;
    }
  }

  return crossings;
}

export function daysInCurrentPhase(trades, balance) {
  const phase = getPhaseForBalance(balance);
  const curve = buildEquityCurve(trades);
  let enteredAt = null;

  for (let i = 0; i < curve.length; i++) {
    const pt = curve[i];
    const p = getPhaseForBalance(pt.balance);
    if (p.id === phase.id) {
      if (enteredAt == null) enteredAt = pt.ts || Date.now();
    } else if (enteredAt != null && p.id > phase.id) {
      enteredAt = pt.ts || Date.now();
    }
  }

  if (enteredAt == null) {
    const sorted = [...trades].sort((a, b) => tradeTimestamp(a) - tradeTimestamp(b));
    enteredAt = sorted[0] ? tradeTimestamp(sorted[0]) : Date.now();
  }

  const days = Math.max(1, Math.floor((Date.now() - enteredAt) / 86400000));
  return { phase, days };
}

export function phaseProgressPct(balance, phase) {
  if (balance >= phase.to) return 100;
  if (balance <= phase.from) return 0;
  return ((balance - phase.from) / (phase.to - phase.from)) * 100;
}

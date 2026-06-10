import { STARTING_BALANCE, TARGET_BALANCE } from "../constants/palette";

export function fmt(n) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(3).replace(/\.?0+$/, "") + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return "$" + n.toFixed(2);
}

export function phaseMult(p) {
  return (p.to / p.from).toFixed(1).replace(/\.0$/, "");
}

export function getActivePhase(phases, balance) {
  const idx = phases.findIndex(p => balance >= p.from && balance < p.to);
  return idx >= 0 ? phases[idx] : phases[phases.length - 1];
}

export function getOverallProgress(balance, start = STARTING_BALANCE, target = TARGET_BALANCE) {
  return Math.min(100, ((balance - start) / (target - start)) * 100);
}

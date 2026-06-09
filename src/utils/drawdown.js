import { buildEquityCurve } from "./equityCurve";

export function computeDrawdown(trades, start) {
  const curve = buildEquityCurve(trades, start);
  if (curve.length < 2) {
    return { maxDrawdownPct: 0, currentDrawdownPct: 0, peak: curve[0]?.balance ?? start };
  }

  let peak = curve[0].balance;
  let maxDd = 0;
  let currentDd = 0;

  for (const pt of curve) {
    if (pt.balance > peak) peak = pt.balance;
    const dd = peak > 0 ? ((peak - pt.balance) / peak) * 100 : 0;
    if (dd > maxDd) maxDd = dd;
    currentDd = dd;
  }

  return {
    maxDrawdownPct: +maxDd.toFixed(2),
    currentDrawdownPct: +currentDd.toFixed(2),
    peak,
  };
}

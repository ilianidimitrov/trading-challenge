import { STARTING_BALANCE } from "../constants/palette";

function tradeTimestamp(t) {
  return t.tradeAtMs || t.createdAt || 0;
}

export function buildEquityCurve(trades, start = STARTING_BALANCE) {
  const sorted = [...trades].sort((a, b) => tradeTimestamp(a) - tradeTimestamp(b));
  const points = [{ ts: 0, balance: start, label: "Start" }];
  let bal = start;

  for (const t of sorted) {
    bal = Math.max(0.01, bal + parseFloat(t.pnl || 0));
    points.push({
      ts: tradeTimestamp(t),
      balance: bal,
      tradeId: t.id,
      pnl: parseFloat(t.pnl || 0),
    });
  }

  return points;
}

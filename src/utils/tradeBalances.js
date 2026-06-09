import { STARTING_BALANCE } from "../constants/palette";

function tradeTimestamp(t) {
  return t.tradeAtMs || t.createdAt || 0;
}

export function attachBalances(trades, start = STARTING_BALANCE) {
  const sorted = [...trades].sort((a, b) => tradeTimestamp(a) - tradeTimestamp(b));
  let bal = start;

  const withBal = sorted.map(t => {
    const balBefore = bal;
    bal = Math.max(0.01, bal + parseFloat(t.pnl || 0));
    return { ...t, balBefore, balAfter: bal };
  });

  return withBal.reverse();
}

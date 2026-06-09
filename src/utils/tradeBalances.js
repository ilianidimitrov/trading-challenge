import { STARTING_BALANCE } from "../constants/palette";

/**
 * Attach running balances to trades (newest first for display).
 * @param {import("../types/trade").Trade[]} trades
 * @param {number} [start]
 */
export function attachBalances(trades, start = STARTING_BALANCE) {
  const sorted = [...trades].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  let bal = start;

  const withBal = sorted.map(t => {
    const balBefore = bal;
    bal = Math.max(0.01, bal + parseFloat(t.pnl || 0));
    return { ...t, balBefore, balAfter: bal };
  });

  return withBal.reverse();
}

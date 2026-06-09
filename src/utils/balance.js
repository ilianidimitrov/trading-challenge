import { STARTING_BALANCE } from "../constants/palette";

export function computeBalance(trades, start = STARTING_BALANCE) {
  const totalPnl = trades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  return Math.max(0.01, start + totalPnl);
}

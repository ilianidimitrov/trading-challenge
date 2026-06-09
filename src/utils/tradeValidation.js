import { PHASES } from "../constants/phases";
import { getActivePhase } from "./format";

export function validateTrade(trade, balanceBeforeTrade) {
  const errors = [];
  const warnings = [];

  if (!trade.pair?.trim()) {
    errors.push("Pair is required.");
  }

  const pnl = parseFloat(trade.pnl);
  if (trade.pnl === "" || trade.pnl === null || trade.pnl === undefined || isNaN(pnl)) {
    errors.push("PnL is required.");
  }

  if (!errors.length && balanceBeforeTrade > 0) {
    const phase = getActivePhase(PHASES, balanceBeforeTrade);
    const maxRisk = balanceBeforeTrade * (phase.risk / 100);
    const absPnl = Math.abs(pnl);

    if (absPnl > maxRisk * 1.1) {
      warnings.push(
        `PnL (${absPnl.toFixed(2)}$) exceeds max risk for ${phase.tag} (${maxRisk.toFixed(2)}$ at ${phase.risk}%).`
      );
    }
  }

  return { errors, warnings, valid: errors.length === 0 };
}

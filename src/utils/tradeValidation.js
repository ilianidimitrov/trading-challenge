import { PHASES } from "../constants/phases";
import { getActivePhase } from "./format";

export function validateTrade(trade, balanceBeforeTrade) {
  const errors = [];
  const warnings = [];

  if (!trade.pair?.trim()) {
    errors.push("Pair е задължителен.");
  }

  const pnl = parseFloat(trade.pnl);
  if (trade.pnl === "" || trade.pnl === null || trade.pnl === undefined || isNaN(pnl)) {
    errors.push("PnL е задължителен.");
  }

  if (!errors.length && balanceBeforeTrade > 0) {
    const phase = getActivePhase(PHASES, balanceBeforeTrade);
    const maxRisk = balanceBeforeTrade * (phase.risk / 100);
    const absPnl = Math.abs(pnl);

    if (absPnl > maxRisk * 1.1) {
      warnings.push(
        `PnL (${absPnl.toFixed(2)}$) надвишава max risk за ${phase.tag} (${maxRisk.toFixed(2)}$ при ${phase.risk}%).`
      );
    }
  }

  return { errors, warnings, valid: errors.length === 0 };
}

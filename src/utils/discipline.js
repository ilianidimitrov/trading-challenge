import { PHASES } from "../constants/phases";
import { getActivePhase } from "./format";

const DAILY_LOSS_LIMIT = 0.10;

export function checkDiscipline(trades, balance) {
  const today = new Date().toISOString().slice(0, 10);
  const todayTrades = trades.filter(t => t.date?.startsWith(today));
  const todayPnl = todayTrades.reduce((s, t) => s + parseFloat(t.pnl || 0), 0);
  const dailyLossPct = todayPnl < 0 ? Math.abs(todayPnl) / balance : 0;

  const sorted = [...trades].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  let consecutiveLosses = 0;
  for (const t of sorted) {
    if (t.result === "LOSS") consecutiveLosses++;
    else break;
  }

  const phase = getActivePhase(PHASES, balance);
  const phaseDailyLimit = phase.id >= 2 ? 0.15 : DAILY_LOSS_LIMIT;

  const alerts = [];

  if (dailyLossPct >= DAILY_LOSS_LIMIT) {
    alerts.push({
      level: "danger",
      title: "Daily Kill Switch",
      text: `Daily loss ${(dailyLossPct * 100).toFixed(1)}% of Binance futures wallet (limit ${DAILY_LOSS_LIMIT * 100}%). End session.`,
    });
  } else if (dailyLossPct >= DAILY_LOSS_LIMIT * 0.75) {
    alerts.push({
      level: "warning",
      title: "Approaching Daily Limit",
      text: `Daily loss ${(dailyLossPct * 100).toFixed(1)}% — approaching ${DAILY_LOSS_LIMIT * 100}% limit.`,
    });
  }

  if (consecutiveLosses >= 3) {
    alerts.push({
      level: "danger",
      title: "Loss Streak",
      text: `${consecutiveLosses} consecutive losses. Pause for the day per rules.`,
    });
  } else if (consecutiveLosses === 2) {
    alerts.push({
      level: "warning",
      title: "Loss Streak Warning",
      text: `${consecutiveLosses} consecutive losses — one more triggers a pause.`,
    });
  }

  if (phase.id >= 2 && dailyLossPct >= phaseDailyLimit) {
    const pct = dailyLossPct;
    if (!alerts.some(a => a.level === "danger")) {
      alerts.push({
        level: "danger",
        title: `Phase ${phase.tag} Limit`,
        text: `Phase ${phase.tag}: daily limit ${phaseDailyLimit * 100}%. Current: ${(pct * 100).toFixed(1)}%.`,
      });
    }
  }

  const canTrade = !alerts.some(a => a.level === "danger");

  return {
    todayTrades: todayTrades.length,
    todayPnl,
    consecutiveLosses,
    canTrade,
    alerts,
  };
}

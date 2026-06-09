import { STARTING_BALANCE } from "../constants/palette";
import { getActivePhase } from "./format";
import { PHASES } from "../constants/phases";

const DAILY_LOSS_LIMIT = 0.10; // 10% global kill switch
const CONSECUTIVE_LOSS_LIMIT = 3;

function isToday(ts) {
  const d = new Date(ts);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

/**
 * @param {import("../types/trade").Trade[]} trades - newest first
 * @param {number} balance
 */
export function checkDiscipline(trades, balance) {
  const alerts = [];
  const phase = getActivePhase(PHASES, balance);

  const todayTrades = trades.filter(t => isToday(t.createdAt || Date.now()));
  const todayPnl = todayTrades.reduce((s, t) => s + parseFloat(t.pnl || 0), 0);
  const dayStartBalance = balance - todayPnl;

  if (dayStartBalance > 0) {
    const dailyLossPct = todayPnl < 0 ? Math.abs(todayPnl) / dayStartBalance : 0;
    if (dailyLossPct >= DAILY_LOSS_LIMIT) {
      alerts.push({
        level: "danger",
        title: "Kill Switch — Daily Loss",
        text: `Дневна загуба ${(dailyLossPct * 100).toFixed(1)}% от Binance futures wallet (лимит ${DAILY_LOSS_LIMIT * 100}%). Край на сесията.`,
      });
    } else if (dailyLossPct >= DAILY_LOSS_LIMIT * 0.7) {
      alerts.push({
        level: "warning",
        title: "Daily Loss Warning",
        text: `Дневна загуба ${(dailyLossPct * 100).toFixed(1)}% — наближаваш лимита от ${DAILY_LOSS_LIMIT * 100}%.`,
      });
    }
  }

  // Consecutive losses (newest first)
  let consecutiveLosses = 0;
  for (const t of trades) {
    if (t.result === "LOSS") consecutiveLosses++;
    else break;
  }
  if (consecutiveLosses >= CONSECUTIVE_LOSS_LIMIT) {
    alerts.push({
      level: "danger",
      title: "Kill Switch — Losing Streak",
      text: `${consecutiveLosses} поредни загуби. Пауза за деня според правилата.`,
    });
  } else if (consecutiveLosses === CONSECUTIVE_LOSS_LIMIT - 1) {
    alerts.push({
      level: "warning",
      title: "Losing Streak Warning",
      text: `${consecutiveLosses} поредни загуби — още 1 и пауза.`,
    });
  }

  // Phase-specific daily limit (P02+ uses 15%)
  const phaseDailyLimit = phase.id >= 2 ? 0.15 : DAILY_LOSS_LIMIT;
  if (dayStartBalance > 0 && todayPnl < 0) {
    const pct = Math.abs(todayPnl) / dayStartBalance;
    if (pct >= phaseDailyLimit && pct < DAILY_LOSS_LIMIT) {
      alerts.push({
        level: "warning",
        title: `${phase.tag} Daily Limit`,
        text: `Фаза ${phase.tag}: дневен лимит ${phaseDailyLimit * 100}%. Текущо: ${(pct * 100).toFixed(1)}%.`,
      });
    }
  }

  return {
    alerts,
    todayTrades: todayTrades.length,
    todayPnl,
    consecutiveLosses,
    phase,
    canTrade: !alerts.some(a => a.level === "danger"),
  };
}

import { config } from "./config";
import { getActivePhase } from "../utils/format";
import { PHASES } from "../constants/phases";

export async function notifyTelegram(trade, balBefore, balAfter, traderName = "") {
  if (!config.telegramNotifyEnabled || !config.telegramWebhookUrl) return;

  const phase = getActivePhase(PHASES, balAfter);
  const emoji = trade.result === "WIN" ? "🟢" : trade.result === "LOSS" ? "🔴" : "🟡";
  const pnl = parseFloat(trade.pnl);
  const pnlStr = pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);
  const lev = trade.leverage ? `${trade.leverage}×` : "—";

  try {
    await fetch(config.telegramWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        traderName,
        pair: trade.pair,
        marketType: trade.marketType || "USDT-M",
        dir: trade.dir,
        leverage: lev,
        rr: trade.rr,
        pnl,
        pnlStr,
        emoji,
        balBefore,
        balAfter,
        phase: phase.tag,
        result: trade.result,
        exchange: "Binance",
      }),
    });
  } catch {
  }
}

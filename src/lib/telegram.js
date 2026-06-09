import { config } from "./config";

/**
 * Fire-and-forget Telegram notification via Supabase Edge Function.
 * @param {object} trade
 * @param {number} balBefore
 * @param {number} balAfter
 */
export async function notifyTelegram(trade, balBefore, balAfter) {
  if (!config.telegramNotifyEnabled || !config.telegramWebhookUrl) return;

  try {
    await fetch(config.telegramWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pair: trade.pair,
        dir: trade.dir,
        rr: trade.rr,
        pnl: trade.pnl,
        balBefore,
        balAfter,
        result: trade.result,
      }),
    });
  } catch {
    // Non-blocking — notification failure must not break trade save
  }
}

// Supabase Edge Function — Binance trade notifications to Telegram
// Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    return new Response(JSON.stringify({ error: "Telegram not configured" }), { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      traderName, pair, marketType, dir, leverage, rr,
      pnlStr, emoji, balBefore, balAfter, phase, exchange,
    } = body;

    const lines = [
      `${emoji} ${traderName || "Trader"} · ${exchange || "Binance"}`,
      `Pair: ${pair} (${marketType || "USDT-M"})`,
      `Side: ${dir} · Lev: ${leverage || "—"}`,
      rr ? `RR: ${rr}` : null,
      `PnL: ${pnlStr} USDT`,
      `Wallet: $${Number(balBefore).toFixed(2)} → $${Number(balAfter).toFixed(2)}`,
      phase ? `Phase: ${phase}` : null,
    ].filter(Boolean);

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: lines.join("\n") }),
    });

    const data = await tgRes.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...cors },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400 });
  }
});

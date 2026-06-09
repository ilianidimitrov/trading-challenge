// Supabase Edge Function — Telegram trade notifications
// Deploy: supabase functions deploy telegram-notify
// Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    return new Response(JSON.stringify({ error: "Telegram not configured" }), { status: 500 });
  }

  try {
    const { pair, dir, rr, pnl, balBefore, balAfter, result } = await req.json();
    const emoji = result === "WIN" ? "🟢" : result === "LOSS" ? "🔴" : "🟡";
    const pnlStr = pnl >= 0 ? `+${Number(pnl).toFixed(2)}` : Number(pnl).toFixed(2);

    const text = [
      `${emoji} New Trade`,
      `Pair: ${pair}`,
      `Direction: ${dir}`,
      rr ? `RR: ${rr}` : null,
      `PnL: ${pnlStr}$`,
      `Balance: $${Number(balBefore).toFixed(2)} → $${Number(balAfter).toFixed(2)}`,
    ].filter(Boolean).join("\n");

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });

    const data = await tgRes.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400 });
  }
});

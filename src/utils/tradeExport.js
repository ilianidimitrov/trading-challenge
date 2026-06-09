
export function exportTradesJson(trades) {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    trades: trades.map(({ balBefore, balAfter, ...t }) => t),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trading-challenge-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importTradesJson(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const raw = Array.isArray(data) ? data : data.trades;

  if (!Array.isArray(raw)) {
    throw new Error("Invalid JSON format.");
  }

  return raw.map((t, i) => ({
    id: t.id || Date.now() + i,
    pair: t.pair || "BTCUSDT",
    marketType: t.marketType ?? "USDT-M",
    dir: t.dir || "LONG",
    result: t.result || "WIN",
    entry: t.entry ?? "",
    exit: t.exit ?? "",
    sl: t.sl ?? "",
    tp: t.tp ?? "",
    quantity: t.quantity ?? "",
    positionUsdt: t.positionUsdt ?? "",
    leverage: t.leverage ?? "",
    pnl: parseFloat(t.pnl) || 0,
    rr: t.rr ?? "",
    riskPct: t.riskPct ?? "",
    setup: t.setup ?? "",
    notes: t.notes ?? "",
    screenshotUrl: t.screenshotUrl ?? "",
    date: t.date || new Date().toLocaleDateString("bg-BG"),
    createdAt: t.createdAt || Date.now() + i,
  }));
}

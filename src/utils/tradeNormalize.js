import { formatPairDisplay } from "./pnlCalc";

export function formatTradeDate(ms) {
  return new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function tradeAtToMs(tradeAt, fallback = Date.now()) {
  if (!tradeAt) return fallback;
  const d = new Date(tradeAt);
  return Number.isNaN(d.getTime()) ? fallback : d.getTime();
}

export function normalizeTrade(form, id = Date.now(), createdAt = Date.now()) {
  const tradeAtMs = tradeAtToMs(form.tradeAt, createdAt);
  const pad = n => String(n).padStart(2, "0");
  const td = new Date(tradeAtMs);
  const tradeAtLocal = `${td.getFullYear()}-${pad(td.getMonth() + 1)}-${pad(td.getDate())}T${pad(td.getHours())}:${pad(td.getMinutes())}`;

  return {
    ...form,
    id,
    pair: formatPairDisplay(form.pair),
    marketType: form.marketType || "USDT-M",
    pnl: parseFloat(form.pnl),
    entry: form.entry || "",
    exit: form.exit || "",
    sl: form.sl || "",
    tp: form.tp || "",
    quantity: form.quantity || "",
    positionUsdt: form.positionUsdt || "",
    leverage: form.leverage || "",
    fees: form.fees || "",
    funding: form.funding || "",
    tp1: form.tp1 || "",
    tp2: form.tp2 || "",
    qtyTp1: form.qtyTp1 || "",
    qtyTp2: form.qtyTp2 || "",
    plannedRiskUsdt: form.plannedRiskUsdt || "",
    tradeAt: tradeAtLocal,
    riskPct: form.riskPct ? parseFloat(form.riskPct) : null,
    date: formatTradeDate(tradeAtMs),
    createdAt,
    tradeAtMs,
  };
}

export function netPnl(trade) {
  const pnl = parseFloat(trade.pnl) || 0;
  const fees = parseFloat(trade.fees) || 0;
  const funding = parseFloat(trade.funding) || 0;
  return pnl - fees - funding;
}

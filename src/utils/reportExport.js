import { computeStats } from "./stats";
import { fmt } from "./format";
import { EXCHANGE } from "../constants/binance";

/**
 * @param {import("../types/trade").Trade[]} trades
 */
export function exportCsvReport(trades, balance) {
  const stats = computeStats(trades);
  const headers = [
    "Date", "Pair", "Market", "Direction", "Leverage", "Entry", "Exit", "SL", "TP",
    "Qty", "Position USDT", "PnL USDT", "RR", "Risk %", "Setup", "Result", "Notes",
  ];

  const rows = [...trades]
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .map(t => [
      t.date,
      t.pair,
      t.marketType || "USDT-M",
      t.dir,
      t.leverage ?? "",
      t.entry ?? "",
      t.exit ?? "",
      t.sl ?? "",
      t.tp ?? "",
      t.quantity ?? "",
      t.positionUsdt ?? "",
      t.pnl,
      t.rr ?? "",
      t.riskPct ?? "",
      t.setup ?? "",
      t.result,
      (t.notes || "").replace(/"/g, '""'),
    ]);

  const summary = [
    [],
    ["--- Summary ---"],
    ["Exchange", EXCHANGE],
    ["Balance", balance.toFixed(2)],
    ["Total Trades", stats.total],
    ["Win Rate", stats.winRate != null ? `${stats.winRate}%` : ""],
    ["Total PnL", stats.totalPnl.toFixed(2)],
    ["Profit Factor", stats.profitFactor ?? ""],
  ];

  const lines = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(r => r.map(c => `"${c}"`).join(",")),
    ...summary.map(r => r.map(c => `"${c}"`).join(",")),
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `binance-challenge-${monthLabel()}.csv`);
}

/**
 * @param {import("../types/trade").Trade[]} trades
 */
export function exportPdfReport(trades, balance, profileName = "Trader") {
  const stats = computeStats(trades);
  const month = monthLabel();
  const sorted = [...trades].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  const tradeRows = sorted.map(t => `
    <tr>
      <td>${t.date}</td>
      <td><strong>${t.pair}</strong></td>
      <td>${t.marketType || "USDT-M"}</td>
      <td>${t.dir}</td>
      <td>${t.leverage ? t.leverage + "×" : "—"}</td>
      <td style="color:${t.pnl >= 0 ? "#00d4aa" : "#ff4d6d"}">${t.pnl >= 0 ? "+" : ""}${Number(t.pnl).toFixed(2)}</td>
      <td>${t.result}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Binance Challenge Report ${month}</title>
<style>
  body { font-family: Inter, system-ui, sans-serif; background: #080810; color: #c8c8e0; padding: 40px; }
  h1 { color: #e8e8f8; font-size: 24px; }
  .sub { color: #555577; font-size: 13px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 32px; }
  .card { background: #0d0d1a; border: 1px solid #1c1c2e; border-radius: 8px; padding: 16px; }
  .card label { font-size: 10px; text-transform: uppercase; color: #555577; letter-spacing: 1px; }
  .card val { display: block; font-size: 20px; font-weight: 800; color: #e8e8f8; margin-top: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; color: #555577; padding: 8px; border-bottom: 1px solid #1c1c2e; font-size: 10px; text-transform: uppercase; }
  td { padding: 8px; border-bottom: 1px solid #1c1c2e; }
  @media print { body { background: white; color: black; } .card { border-color: #ccc; } }
</style></head><body>
  <h1>Binance Futures Challenge — ${month}</h1>
  <div class="sub">${EXCHANGE} USDT-M · ${profileName} · Generated ${new Date().toLocaleString("bg-BG")}</div>
  <div class="grid">
    <div class="card"><label>Balance</label><val>${fmt(balance)}</val></div>
    <div class="card"><label>Trades</label><val>${stats.total}</val></div>
    <div class="card"><label>Win Rate</label><val>${stats.winRate ?? "—"}%</val></div>
    <div class="card"><label>Total PnL</label><val style="color:${stats.totalPnl >= 0 ? "#00d4aa" : "#ff4d6d"}">${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)} USDT</val></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Pair</th><th>Market</th><th>Side</th><th>Lev</th><th>PnL</th><th>Result</th></tr></thead>
    <tbody>${tradeRows || "<tr><td colspan='7'>No trades</td></tr>"}</tbody>
  </table>
  <script>window.onload = () => window.print()</script>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function monthLabel() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

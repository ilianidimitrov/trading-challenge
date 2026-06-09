import { DEFAULT_LEVERAGE, DEFAULT_MARKET } from "../constants/binance";

export const SETUP_TYPES = [
  "Breakout",
  "Range Retest",
  "Liquidity Sweep",
  "Order Block",
  "FVG / Imbalance",
  "Trend Continuation",
  "Reversal",
  "Funding Fade",
  "Other",
];

export function mergeSetupTypes(customSetups = []) {
  const custom = Array.isArray(customSetups) ? customSetups.filter(Boolean) : [];
  const base = SETUP_TYPES.filter(s => !custom.includes(s));
  return [...base, ...custom];
}

export function createEmptyTradeForm(riskPct = "", leverage = DEFAULT_LEVERAGE) {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const tradeAtLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return {
    pair: "BTCUSDT",
    marketType: DEFAULT_MARKET,
    dir: "LONG",
    result: "WIN",
    entry: "",
    exit: "",
    sl: "",
    tp: "",
    quantity: "",
    positionUsdt: "",
    leverage: String(leverage),
    pnl: "",
    rr: "",
    riskPct: riskPct !== "" ? String(riskPct) : "",
    setup: "",
    notes: "",
    screenshotUrl: "",
    tradeAt: tradeAtLocal,
    fees: "",
    funding: "",
    tp1: "",
    tp2: "",
    qtyTp1: "",
    qtyTp2: "",
    plannedRiskUsdt: "",
  };
}

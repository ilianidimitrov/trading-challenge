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

export function createEmptyTradeForm(riskPct = "", leverage = DEFAULT_LEVERAGE) {
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
  };
}

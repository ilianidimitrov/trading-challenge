import { DEFAULT_LEVERAGE, DEFAULT_MARKET } from "../constants/binance";

/**
 * @typedef {Object} Trade
 * @property {number} id
 * @property {string} [userId]
 * @property {string} pair - e.g. BTCUSDT
 * @property {string} marketType - USDT-M | COIN-M | SPOT
 * @property {"LONG"|"SHORT"} dir
 * @property {"WIN"|"LOSS"|"BE"} result
 * @property {number|string} [entry]
 * @property {number|string} [exit]
 * @property {number|string} [sl]
 * @property {number|string} [tp]
 * @property {number|string} [quantity] - base asset qty (e.g. BTC)
 * @property {number|string} [positionUsdt] - notional in USDT
 * @property {number|string} [leverage]
 * @property {number} pnl - realized PnL in USDT
 * @property {string} [rr]
 * @property {number} [riskPct]
 * @property {string} [setup]
 * @property {string} [notes]
 * @property {string} [screenshotUrl]
 * @property {string} date
 * @property {number} createdAt
 * @property {number} [balBefore]
 * @property {number} [balAfter]
 */

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

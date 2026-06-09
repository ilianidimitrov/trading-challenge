/**
 * @typedef {Object} Trade
 * @property {number} id
 * @property {string} [userId]
 * @property {string} pair
 * @property {"LONG"|"SHORT"} dir
 * @property {"WIN"|"LOSS"|"BE"} result
 * @property {number|string} [entry]
 * @property {number|string} [exit]
 * @property {number|string} [sl]
 * @property {number|string} [tp]
 * @property {number} pnl
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
  "Retest",
  "Liquidity Grab",
  "Order Block",
  "FVG Fill",
  "Trend Continuation",
  "Reversal",
  "Other",
];

export function createEmptyTradeForm(riskPct = "") {
  return {
    pair: "",
    dir: "LONG",
    result: "WIN",
    entry: "",
    exit: "",
    sl: "",
    tp: "",
    pnl: "",
    rr: "",
    riskPct: riskPct !== "" ? String(riskPct) : "",
    setup: "",
    notes: "",
    screenshotUrl: "",
  };
}

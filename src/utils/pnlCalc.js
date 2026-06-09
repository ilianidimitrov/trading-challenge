/**
 * Binance USDT-M Perpetual PnL (without fees/funding):
 * LONG:  (exit - entry) × quantity
 * SHORT: (entry - exit) × quantity
 *
 * quantity can be derived from position USDT notional: positionUsdt / entry
 */

export function calcQuantity({ entry, positionUsdt, quantity }) {
  const e = parseFloat(entry);
  const q = parseFloat(quantity);
  if (q > 0) return q;
  const notional = parseFloat(positionUsdt);
  if (e > 0 && notional > 0) return notional / e;
  return null;
}

export function calcPnlFromPrices({ dir, entry, exit, quantity, positionUsdt }) {
  const e = parseFloat(entry);
  const x = parseFloat(exit);
  if (!e || !x) return null;

  const qty = calcQuantity({ entry: e, positionUsdt, quantity });
  if (!qty) return null;

  const raw = dir === "LONG" ? (x - e) * qty : (e - x) * qty;
  return Math.round(raw * 100) / 100;
}

/**
 * Suggested position USDT from balance, risk %, leverage, and stop distance.
 */
export function calcSuggestedPositionUsdt({ balance, riskPct, entry, sl, leverage }) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const risk = parseFloat(riskPct);
  const lev = parseFloat(leverage) || 1;
  if (!e || !s || !risk || !balance) return null;

  const stopDistPct = Math.abs(e - s) / e;
  if (stopDistPct <= 0) return null;

  const riskAmount = balance * (risk / 100);
  // notional such that loss at SL ≈ riskAmount (approx, ignores fees)
  const notional = riskAmount / stopDistPct;
  return Math.round(notional * 100) / 100;
}

export function calcRrFromPrices({ dir, entry, exit, sl }) {
  const e = parseFloat(entry);
  const x = parseFloat(exit);
  const s = parseFloat(sl);
  if (!e || !x || !s) return "";

  const reward = Math.abs(x - e);
  const risk = Math.abs(e - s);
  if (risk <= 0) return "";

  const rr = reward / risk;
  return `1:${rr % 1 === 0 ? rr : rr.toFixed(1)}`;
}

export function formatPairDisplay(pair) {
  if (!pair) return "";
  const p = pair.toUpperCase().replace("/", "");
  if (p.endsWith("USDT")) return p;
  return p + "USDT";
}

const BINANCE_MIN_NOTIONAL = 5;

function round(n, decimals) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function calcPositionSize({ dir, entry, sl, riskUsdt, marginUsdt, leverage }) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const risk = parseFloat(riskUsdt);
  const margin = parseFloat(marginUsdt);
  const lev = parseFloat(leverage);

  if (!e || !s || !risk || risk <= 0) return null;
  if (!margin || margin <= 0) return { error: "Enter margin (wallet USDT allocated to this trade)" };
  if (!lev || lev <= 0) return { error: "Enter leverage — on small wallets Binance needs higher leverage for min size" };

  const stopDist = Math.abs(e - s);
  if (stopDist <= 0) return { error: "Entry and stop-loss must differ" };

  if (dir === "LONG" && s >= e) return { error: "LONG: stop-loss must be below entry" };
  if (dir === "SHORT" && s <= e) return { error: "SHORT: stop-loss must be above entry" };

  const stopPct = (stopDist / e) * 100;

  // Risk-based ideal size (max loss at SL = risk)
  const idealQty = risk / stopDist;
  const idealNotional = idealQty * e;
  const idealMargin = idealNotional / lev;

  // Size at user leverage with full allocated margin (Binance: notional = margin × leverage)
  const maxNotional = margin * lev;
  const maxQty = maxNotional / e;
  const lossAtMaxSize = maxQty * stopDist;

  // Use the smaller notional so loss never exceeds target risk
  const cappedByRisk = idealNotional <= maxNotional;
  const quantity = cappedByRisk ? idealQty : maxQty;
  const notional = cappedByRisk ? idealNotional : maxNotional;
  const marginUsed = notional / lev;
  const actualLoss = quantity * stopDist;

  const result = {
    quantity: round(quantity, 8),
    notional: round(notional, 2),
    stopPct: round(stopPct, 3),
    stopDist: round(stopDist, 8),
    riskUsdt: round(risk, 2),
    actualLoss: round(actualLoss, 2),
    leverage: round(lev, 2),
    marginUsdt: round(margin, 2),
    marginUsed: round(marginUsed, 2),
    maxNotional: round(maxNotional, 2),
    idealNotional: round(idealNotional, 2),
    cappedByRisk,
    minLeverage: round(idealNotional / margin, 1),
  };

  const warnings = [];

  if (!cappedByRisk) {
    warnings.push(
      `At ${lev}× with ${round(margin, 2)} USDT margin, max notional is ${round(maxNotional, 2)} USDT — ` +
      `loss at SL would be ${round(actualLoss, 2)} USDT (target ${round(risk, 2)}). ` +
      `Need at least ${result.minLeverage}× leverage for exact risk.`,
    );
  }

  if (notional < BINANCE_MIN_NOTIONAL) {
    const minLevForBinance = BINANCE_MIN_NOTIONAL / margin;
    warnings.push(
      `Notional ${round(notional, 2)} USDT is below Binance minimum (~$${BINANCE_MIN_NOTIONAL}). ` +
      `Try ≥${round(minLevForBinance, 0)}× leverage or more margin.`,
    );
  }

  if (marginUsed > margin + 0.01) {
    warnings.push(`Margin required (${round(marginUsed, 2)} USDT) exceeds allocated margin.`);
  }

  if (warnings.length) result.warnings = warnings;

  return result;
}

export function formatQuantity(qty) {
  if (qty >= 1) return qty.toFixed(4).replace(/\.?0+$/, "");
  if (qty >= 0.001) return qty.toFixed(6).replace(/\.?0+$/, "");
  return qty.toFixed(8).replace(/\.?0+$/, "");
}

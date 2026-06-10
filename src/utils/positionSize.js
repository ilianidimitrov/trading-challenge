function round(n, decimals) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function calcPositionSize({ dir, entry, sl, riskUsdt, marginUsdt }) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const risk = parseFloat(riskUsdt);
  const margin = parseFloat(marginUsdt);

  if (!e || !s || !risk || risk <= 0) return null;

  const stopDist = Math.abs(e - s);
  if (stopDist <= 0) return { error: "Entry and stop-loss must differ" };

  if (dir === "LONG" && s >= e) return { error: "LONG: stop-loss must be below entry" };
  if (dir === "SHORT" && s <= e) return { error: "SHORT: stop-loss must be above entry" };

  const quantity = risk / stopDist;
  const notional = quantity * e;
  const stopPct = (stopDist / e) * 100;

  const result = {
    quantity: round(quantity, 8),
    notional: round(notional, 2),
    stopPct: round(stopPct, 3),
    stopDist: round(stopDist, 8),
    riskUsdt: round(risk, 2),
  };

  if (margin > 0) {
    result.leverage = round(notional / margin, 2);
    result.marginUsdt = round(margin, 2);
  }

  return result;
}

export function formatQuantity(qty) {
  if (qty >= 1) return qty.toFixed(4).replace(/\.?0+$/, "");
  if (qty >= 0.001) return qty.toFixed(6).replace(/\.?0+$/, "");
  return qty.toFixed(8).replace(/\.?0+$/, "");
}

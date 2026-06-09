export function computeRiskAnalysis(trades) {
  const losing = trades.filter(t => t.result === "LOSS");
  const withPlanned = losing.filter(t => t.plannedRiskUsdt != null && t.plannedRiskUsdt !== "");

  if (!withPlanned.length) {
    return { avgPlanned: null, avgActual: null, count: 0 };
  }

  const avgPlanned = withPlanned.reduce((s, t) => s + parseFloat(t.plannedRiskUsdt), 0) / withPlanned.length;
  const avgActual = withPlanned.reduce((s, t) => s + Math.abs(parseFloat(t.pnl || 0)), 0) / withPlanned.length;

  return {
    avgPlanned: +avgPlanned.toFixed(2),
    avgActual: +avgActual.toFixed(2),
    count: withPlanned.length,
  };
}

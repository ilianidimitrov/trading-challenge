export const SORT_OPTIONS = [
  { key: "date-desc", label: "Date (newest)" },
  { key: "date-asc", label: "Date (oldest)" },
  { key: "pnl-desc", label: "PnL (high)" },
  { key: "pnl-asc", label: "PnL (low)" },
  { key: "pair-asc", label: "Pair (A–Z)" },
];

function tradeTimestamp(t) {
  return t.tradeAtMs || t.createdAt || 0;
}

export function filterAndSortTrades(trades, { search = "", filterResult = "ALL", filterSetup = "", sort = "date-desc" } = {}) {
  const q = search.trim().toLowerCase();

  let list = trades.filter(e => {
    if (filterResult !== "ALL" && e.result !== filterResult) return false;
    if (filterSetup && e.setup !== filterSetup) return false;
    if (q) {
      const hay = [e.pair, e.notes, e.setup, e.dir].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  list = [...list].sort((a, b) => {
    switch (sort) {
      case "date-asc": return tradeTimestamp(a) - tradeTimestamp(b);
      case "pnl-desc": return parseFloat(b.pnl) - parseFloat(a.pnl);
      case "pnl-asc": return parseFloat(a.pnl) - parseFloat(b.pnl);
      case "pair-asc": return (a.pair || "").localeCompare(b.pair || "");
      default: return tradeTimestamp(b) - tradeTimestamp(a);
    }
  });

  return list;
}

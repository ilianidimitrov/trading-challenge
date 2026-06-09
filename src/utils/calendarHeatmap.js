function tradeTimestamp(t) {
  return t.tradeAtMs || t.createdAt || 0;
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function buildDailyPnlMap(trades, weeks = 12) {
  const map = {};
  for (const t of trades) {
    const key = dayKey(tradeTimestamp(t));
    if (!map[key]) map[key] = { date: key, pnl: 0, count: 0 };
    map[key].pnl += parseFloat(t.pnl || 0);
    map[key].count++;
  }

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - weeks * 7);

  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = dayKey(cursor.getTime());
    days.push(map[key] || { date: key, pnl: 0, count: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const maxAbs = Math.max(...days.map(d => Math.abs(d.pnl)), 1);
  return { days, maxAbs };
}

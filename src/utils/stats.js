import { STARTING_BALANCE } from "../constants/palette";

export function computeStats(trades) {
  if (!trades.length) {
    return {
      total: 0, wins: 0, losses: 0, breakeven: 0,
      winRate: null, totalPnl: 0, avgWin: 0, avgLoss: 0,
      profitFactor: null, bestTrade: 0, worstTrade: 0,
      currentStreak: 0, streakType: null,
      bySetup: [], byPair: [], weeklyPnl: [],
    };
  }

  const wins = trades.filter(t => t.result === "WIN");
  const losses = trades.filter(t => t.result === "LOSS");
  const be = trades.filter(t => t.result === "BE");

  const totalPnl = trades.reduce((s, t) => s + parseFloat(t.pnl || 0), 0);
  const grossWin = wins.reduce((s, t) => s + parseFloat(t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + parseFloat(t.pnl || 0), 0));

  const pnls = trades.map(t => parseFloat(t.pnl || 0));
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;

  let streak = 0;
  let streakType = trades[0]?.result;
  for (const t of trades) {
    if (t.result === streakType && t.result !== "BE") streak++;
    else break;
  }

  const setupMap = {};
  for (const t of trades) {
    const key = t.setup || "Unlabeled";
    if (!setupMap[key]) setupMap[key] = { setup: key, count: 0, wins: 0, pnl: 0 };
    setupMap[key].count++;
    if (t.result === "WIN") setupMap[key].wins++;
    setupMap[key].pnl += parseFloat(t.pnl || 0);
  }
  const bySetup = Object.values(setupMap)
    .map(s => ({ ...s, winRate: Math.round(s.wins / s.count * 100) }))
    .sort((a, b) => b.count - a.count);

  const pairMap = {};
  for (const t of trades) {
    const key = t.pair;
    if (!pairMap[key]) pairMap[key] = { pair: key, count: 0, wins: 0, pnl: 0 };
    pairMap[key].count++;
    if (t.result === "WIN") pairMap[key].wins++;
    pairMap[key].pnl += parseFloat(t.pnl || 0);
  }
  const byPair = Object.values(pairMap)
    .map(p => ({ ...p, winRate: Math.round(p.wins / p.count * 100) }))
    .sort((a, b) => b.count - a.count);

  const weekMap = {};
  const now = Date.now();
  for (const t of trades) {
    const ts = t.createdAt || now;
    const weekStart = getWeekStart(ts);
    if (!weekMap[weekStart]) weekMap[weekStart] = { week: weekStart, pnl: 0, count: 0 };
    weekMap[weekStart].pnl += parseFloat(t.pnl || 0);
    weekMap[weekStart].count++;
  }
  const weeklyPnl = Object.values(weekMap)
    .sort((a, b) => a.week - b.week)
    .slice(-8);

  return {
    total: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: be.length,
    winRate: Math.round(wins.length / trades.length * 100),
    totalPnl,
    avgWin,
    avgLoss,
    profitFactor: grossLoss > 0 ? +(grossWin / grossLoss).toFixed(2) : null,
    bestTrade: Math.max(...pnls),
    worstTrade: Math.min(...pnls),
    currentStreak: streak,
    streakType,
    bySetup,
    byPair,
    weeklyPnl,
    growthMultiple: (STARTING_BALANCE + totalPnl) / STARTING_BALANCE,
  };
}

function getWeekStart(ts) {
  const d = new Date(ts);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatWeekLabel(weekTs) {
  const d = new Date(weekTs);
  return d.toLocaleDateString("bg-BG", { day: "numeric", month: "short" });
}

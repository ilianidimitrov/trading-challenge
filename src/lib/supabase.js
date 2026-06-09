import { createClient } from "@supabase/supabase-js";
import { config, isSupabaseConfigured } from "./config";

export const supabase = isSupabaseConfigured()
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

export async function fetchUserTrades(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToTrade);
}

export async function insertTrade(userId, trade) {
  if (!supabase) return trade;
  const row = tradeToDb(trade, userId);
  const { data, error } = await supabase.from("trades").insert(row).select().single();
  if (error) throw error;
  return dbToTrade(data);
}

export async function updateTradeDb(userId, id, trade) {
  if (!supabase) return trade;
  const row = tradeToDb(trade, userId);
  delete row.user_id;
  delete row.created_at;
  const { data, error } = await supabase
    .from("trades")
    .update(row)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return dbToTrade(data);
}

export async function deleteTradeDb(userId, id) {
  if (!supabase) return;
  const { error } = await supabase.from("trades").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function fetchLeaderboard() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("balance", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function fetchProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function fetchUserPublicTrades(userId, limit = 10) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("trades")
    .select("pair, dir, result, pnl, rr, setup, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

function parseOptionalFloat(val) {
  if (val === "" || val == null) return null;
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : null;
}

function tradeAtToIso(trade) {
  if (trade.tradeAt) {
    const d = new Date(trade.tradeAt);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  if (trade.createdAt) return new Date(trade.createdAt).toISOString();
  return new Date().toISOString();
}

function formatTradeDate(isoOrMs) {
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function tradeToDb(trade, userId) {
  return {
    user_id: userId,
    pair: trade.pair,
    market_type: trade.marketType || "USDT-M",
    dir: trade.dir,
    result: trade.result,
    entry: trade.entry ? parseFloat(trade.entry) : null,
    exit: trade.exit ? parseFloat(trade.exit) : null,
    sl: trade.sl ? parseFloat(trade.sl) : null,
    tp: trade.tp ? parseFloat(trade.tp) : null,
    leverage: trade.leverage ? parseFloat(trade.leverage) : null,
    quantity: trade.quantity ? parseFloat(trade.quantity) : null,
    position_usdt: trade.positionUsdt ? parseFloat(trade.positionUsdt) : null,
    pnl: parseFloat(trade.pnl),
    rr: trade.rr || null,
    risk_pct: trade.riskPct ?? null,
    setup: trade.setup || null,
    notes: trade.notes || null,
    screenshot_url: trade.screenshotUrl || null,
    trade_at: tradeAtToIso(trade),
    fees: parseOptionalFloat(trade.fees),
    funding: parseOptionalFloat(trade.funding),
    tp1: parseOptionalFloat(trade.tp1),
    tp2: parseOptionalFloat(trade.tp2),
    qty_tp1: parseOptionalFloat(trade.qtyTp1),
    qty_tp2: parseOptionalFloat(trade.qtyTp2),
    planned_risk_usdt: parseOptionalFloat(trade.plannedRiskUsdt),
    created_at: trade.createdAt ? new Date(trade.createdAt).toISOString() : new Date().toISOString(),
  };
}

function dbToTrade(row) {
  const createdAt = new Date(row.created_at).getTime();
  const tradeAtMs = row.trade_at ? new Date(row.trade_at).getTime() : createdAt;
  const pad = n => String(n).padStart(2, "0");
  const td = new Date(tradeAtMs);
  const tradeAtLocal = `${td.getFullYear()}-${pad(td.getMonth() + 1)}-${pad(td.getDate())}T${pad(td.getHours())}:${pad(td.getMinutes())}`;

  return {
    id: row.id,
    userId: row.user_id,
    pair: row.pair,
    marketType: row.market_type ?? "USDT-M",
    dir: row.dir,
    result: row.result,
    entry: row.entry ?? "",
    exit: row.exit ?? "",
    sl: row.sl ?? "",
    tp: row.tp ?? "",
    leverage: row.leverage ?? "",
    quantity: row.quantity ?? "",
    positionUsdt: row.position_usdt ?? "",
    pnl: parseFloat(row.pnl),
    rr: row.rr ?? "",
    riskPct: row.risk_pct,
    setup: row.setup ?? "",
    notes: row.notes ?? "",
    screenshotUrl: row.screenshot_url ?? "",
    tradeAt: tradeAtLocal,
    fees: row.fees ?? "",
    funding: row.funding ?? "",
    tp1: row.tp1 ?? "",
    tp2: row.tp2 ?? "",
    qtyTp1: row.qty_tp1 ?? "",
    qtyTp2: row.qty_tp2 ?? "",
    plannedRiskUsdt: row.planned_risk_usdt ?? "",
    date: formatTradeDate(tradeAtMs),
    createdAt,
    tradeAtMs,
  };
}

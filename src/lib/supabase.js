import { createClient } from "@supabase/supabase-js";
import { config, isSupabaseConfigured } from "./config";

export const supabase = isSupabaseConfigured()
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

/** @param {string} userId */
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

/** @param {string} userId @param {object} trade */
export async function insertTrade(userId, trade) {
  if (!supabase) return trade;
  const row = tradeToDb(trade, userId);
  const { data, error } = await supabase.from("trades").insert(row).select().single();
  if (error) throw error;
  return dbToTrade(data);
}

/** @param {string} userId @param {number} id @param {object} trade */
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

/** @param {string} userId @param {number} id */
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

/** @param {string} userId */
export async function fetchProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

/** @param {string} userId */
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
    created_at: trade.createdAt ? new Date(trade.createdAt).toISOString() : new Date().toISOString(),
  };
}

function dbToTrade(row) {
  const createdAt = new Date(row.created_at).getTime();
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
    date: new Date(row.created_at).toLocaleDateString("bg-BG"),
    createdAt,
  };
}

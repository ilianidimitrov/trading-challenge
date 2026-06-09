import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTrades } from "./useTrades";
import {
  fetchUserTrades,
  insertTrade,
  updateTradeDb,
  deleteTradeDb,
} from "../lib/supabase";
import { attachBalances } from "../utils/tradeBalances";
import { computeBalance } from "../utils/balance";
import { validateTrade } from "../utils/tradeValidation";
import { notifyTelegram } from "../lib/telegram";
import { formatPairDisplay } from "../utils/pnlCalc";

export function useTradeSync() {
  const { user, profile, isConfigured } = useAuth();
  const local = useTrades();
  const [cloudTrades, setCloudTrades] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const useCloud = isConfigured && user;

  useEffect(() => {
    if (!useCloud) return;
    setSyncing(true);
    fetchUserTrades(user.id)
      .then(setCloudTrades)
      .catch(console.error)
      .finally(() => setSyncing(false));
  }, [useCloud, user?.id]);

  const rawTrades = useCloud ? cloudTrades : local.rawTrades;
  const trades = useMemo(() => attachBalances(rawTrades), [rawTrades]);
  const balance = useMemo(() => computeBalance(rawTrades), [rawTrades]);

  const addTrade = useCallback(async (form, balanceBefore) => {
    const validation = validateTrade(form, balanceBefore);
    if (!validation.valid) return validation;

    const trade = normalizeTrade(form);

    if (useCloud) {
      try {
        const saved = await insertTrade(user.id, trade);
        setCloudTrades(prev => [saved, ...prev]);
        notifyTelegram(saved, balanceBefore, balanceBefore + saved.pnl, profile?.display_name || profile?.username);
      } catch (err) {
        validation.errors.push(err.message);
        validation.valid = false;
        return validation;
      }
    } else {
      local.addTrade(form, balanceBefore);
    }
    return validation;
  }, [useCloud, user, profile, local]);

  const updateTrade = useCallback(async (id, form, balanceBeforeEdit) => {
    const validation = validateTrade(form, balanceBeforeEdit);
    if (!validation.valid) return validation;

    if (useCloud) {
      try {
        const updated = await updateTradeDb(user.id, id, form);
        setCloudTrades(prev => prev.map(t => t.id === id ? updated : t));
      } catch (err) {
        validation.errors.push(err.message);
        validation.valid = false;
      }
    } else {
      return local.updateTrade(id, form, balanceBeforeEdit);
    }
    return validation;
  }, [useCloud, user, local]);

  const deleteTrade = useCallback(async (id) => {
    if (useCloud) {
      await deleteTradeDb(user.id, id);
      setCloudTrades(prev => prev.filter(t => t.id !== id));
    } else {
      local.deleteTrade(id);
    }
  }, [useCloud, user, local]);

  const replaceAllTrades = useCallback(async (newTrades) => {
    if (useCloud) {
      for (const t of newTrades) {
        await insertTrade(user.id, t);
      }
      const fresh = await fetchUserTrades(user.id);
      setCloudTrades(fresh);
    } else {
      local.replaceAllTrades(newTrades);
    }
  }, [useCloud, user, local]);

  const importLocalToCloud = useCallback(async () => {
    if (!useCloud || !local.rawTrades.length) return;
    setSyncing(true);
    try {
      for (const t of local.rawTrades) {
        await insertTrade(user.id, t);
      }
      const fresh = await fetchUserTrades(user.id);
      setCloudTrades(fresh);
    } finally {
      setSyncing(false);
    }
  }, [useCloud, user, local.rawTrades]);

  const getBalanceBeforeTrade = useCallback((tradeId) => {
    const sorted = [...rawTrades].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    let bal = 5;
    for (const t of sorted) {
      if (t.id === tradeId) return bal;
      bal = Math.max(0.01, bal + parseFloat(t.pnl || 0));
    }
    return bal;
  }, [rawTrades]);

  return {
    trades,
    rawTrades,
    balance,
    addTrade,
    updateTrade,
    deleteTrade,
    replaceAllTrades,
    getBalanceBeforeTrade,
    useCloud,
    syncing,
    importLocalToCloud,
    localTradeCount: local.rawTrades.length,
  };
}

function normalizeTrade(form, id = Date.now(), createdAt = Date.now()) {
  return {
    ...form,
    id,
    pair: formatPairDisplay(form.pair),
    marketType: form.marketType || "USDT-M",
    pnl: parseFloat(form.pnl),
    entry: form.entry || "",
    exit: form.exit || "",
    sl: form.sl || "",
    tp: form.tp || "",
    quantity: form.quantity || "",
    positionUsdt: form.positionUsdt || "",
    leverage: form.leverage || "",
    riskPct: form.riskPct ? parseFloat(form.riskPct) : null,
    date: new Date(createdAt).toLocaleDateString("bg-BG"),
    createdAt,
  };
}

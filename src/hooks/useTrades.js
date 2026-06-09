import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { computeBalance } from "../utils/balance";
import { attachBalances } from "../utils/tradeBalances";
import { validateTrade } from "../utils/tradeValidation";
import { notifyTelegram } from "../lib/telegram";

const STORAGE_KEY = "tc_trades";

export function useTrades() {
  const [rawTrades, setRawTrades] = useLocalStorage(STORAGE_KEY, []);

  const trades = useMemo(() => attachBalances(rawTrades), [rawTrades]);
  const balance = useMemo(() => computeBalance(rawTrades), [rawTrades]);

  const addTrade = useCallback((form, balanceBefore) => {
    const validation = validateTrade(form, balanceBefore);
    if (!validation.valid) return validation;

    const trade = {
      ...form,
      id: Date.now(),
      pnl: parseFloat(form.pnl),
      entry: form.entry || "",
      exit: form.exit || "",
      sl: form.sl || "",
      tp: form.tp || "",
      riskPct: form.riskPct ? parseFloat(form.riskPct) : null,
      date: new Date().toLocaleDateString("bg-BG"),
      createdAt: Date.now(),
    };

    setRawTrades(prev => [trade, ...prev]);
    notifyTelegram(trade, balanceBefore, balanceBefore + trade.pnl);
    return validation;
  }, [setRawTrades]);

  const updateTrade = useCallback((id, form, balanceBeforeEdit) => {
    const validation = validateTrade(form, balanceBeforeEdit);
    if (!validation.valid) return validation;

    setRawTrades(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              ...form,
              pnl: parseFloat(form.pnl),
              riskPct: form.riskPct ? parseFloat(form.riskPct) : null,
            }
          : t
      )
    );
    return validation;
  }, [setRawTrades]);

  const deleteTrade = useCallback((id) => {
    setRawTrades(prev => prev.filter(t => t.id !== id));
  }, [setRawTrades]);

  const replaceAllTrades = useCallback((newTrades) => {
    setRawTrades(newTrades);
  }, [setRawTrades]);

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
  };
}

import { useCallback, useMemo } from "react";
import { STARTING_BALANCE } from "../constants/palette";
import { useLocalStorage } from "./useLocalStorage";
import { computeBalance } from "../utils/balance";
import { attachBalances } from "../utils/tradeBalances";
import { validateTrade } from "../utils/tradeValidation";
import { notifyTelegram } from "../lib/telegram";
import { normalizeTrade } from "../utils/tradeNormalize";

const STORAGE_KEY = "tc_trades";

export function useTrades() {
  const [rawTrades, setRawTrades] = useLocalStorage(STORAGE_KEY, []);

  const trades = useMemo(() => attachBalances(rawTrades), [rawTrades]);
  const balance = useMemo(() => computeBalance(rawTrades), [rawTrades]);

  const addTrade = useCallback((form, balanceBefore) => {
    const validation = validateTrade(form, balanceBefore);
    if (!validation.valid) return validation;

    const trade = normalizeTrade(form);

    setRawTrades(prev => [trade, ...prev]);
    notifyTelegram(trade, balanceBefore, balanceBefore + trade.pnl);
    return validation;
  }, [setRawTrades]);

  const updateTrade = useCallback((id, form, balanceBeforeEdit) => {
    const validation = validateTrade(form, balanceBeforeEdit);
    if (!validation.valid) return validation;

    setRawTrades(prev =>
      prev.map(t => t.id === id ? { ...t, ...normalizeTrade(form, id, t.createdAt) } : t)
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
    let bal = STARTING_BALANCE;
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


export const EXCHANGE = "Binance";

export const MARKET_TYPES = [
  { value: "USDT-M", label: "USDT-M Perpetual (Futures)" },
  { value: "COIN-M", label: "COIN-M Perpetual (Futures)" },
  { value: "SPOT",   label: "Spot" },
];

export const BINANCE_PAIRS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
  "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "LINKUSDT", "DOTUSDT",
  "MATICUSDT", "LTCUSDT", "ARBUSDT", "OPUSDT", "SUIUSDT",
];

export const DEFAULT_MARKET = "USDT-M";
export const DEFAULT_LEVERAGE = 20;

/** Quick-pick leverage values for journal & calculator (Binance min notional needs higher lev on small wallets) */
export const LEVERAGE_PRESETS = [10, 15, 20, 25, 50, 75, 125];

export function leverageFromPhase(phase) {
  const nums = phase?.lev?.match(/\d+/g)?.map(Number);
  if (!nums?.length) return DEFAULT_LEVERAGE;
  return Math.max(...nums);
}

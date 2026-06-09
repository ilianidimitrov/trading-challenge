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
export const DEFAULT_LEVERAGE = 10;

export const PHASES = [
  {
    id: 1, tag: "P01", label: "Survival Mode",
    from: 100, to: 1_500,
    risk: 5, rr: 2, rrStr: "1:2", wr: 55, lev: "15–25×",
    note:
      "You start with $100 USDT. On Binance Futures you often need 15–25× just to open a valid position — " +
      "that is fine as long as stop-loss and risk % stay disciplined. Each trade risks ~$5 (5%). " +
      "Master isolated margin, SL before entry, and walking away after a bad streak.",
    rules: [
      "USDT-M Perpetuals only — no Spot gambling or random alt pumps",
      "Set stop-loss on Binance before opening any position",
      "Isolated margin only — Cross is banned until P04",
      "Max 2 open positions; if both are red, do not add a third",
      "Trade BTC or ETH only — highest liquidity at small size",
      "Leverage 15–25× is OK for min notional — size from risk %, not from max leverage",
      "3 losses in a row → close charts for 24 hours",
      "Daily loss cap: 10% of wallet (~$10 at start)",
    ],
  },
  {
    id: 2, tag: "P02", label: "Process Over Luck",
    from: 1_500, to: 2_500,
    risk: 4, rr: 2.5, rrStr: "1:2.5", wr: 55, lev: "10–20×",
    note:
      "P01 taught you not to blow up. Now prove you can repeat good decisions. " +
      "At $1.5K–$2.5K, each trade risks $60–$100 — journal every trade with screenshot. " +
      "Leverage is a tool for position access, not a reason to widen your stop.",
    rules: [
      "Log every trade: pair, direction, entry, exit, SL, TP, leverage, RR, setup tag",
      "Attach a chart screenshot before closing the journal entry",
      "Define setup criteria in writing — no impulsive market orders",
      "Skip CPI, FOMC, ETF decisions, and major token unlock days",
      "Check funding rate before holding overnight",
      "Weekly review: export Binance history and compare to your journal",
      "Daily loss cap: 12% — session ends, no revenge trades",
    ],
  },
  {
    id: 3, tag: "P03", label: "Rhythm & Repetition",
    from: 2_500, to: 4_000,
    risk: 3.5, rr: 2.5, rrStr: "1:2.5", wr: 52, lev: "10–15×",
    note:
      "$2.5K+ means you survived the early grind. Your edge is repeating the same A-setup — " +
      "not chasing higher leverage. Learn partial closes and protecting winners.",
    rules: [
      "Partial close: 50% at TP1, runner to TP2",
      "Move SL to breakeven after TP1 fills",
      "Max 3 trades per day — overtrading kills accounts at every size",
      "Keep liquidation price visible on every open position",
      "Do not raise leverage during a winning streak",
      "One setup focus per week (breakout OR retest, not both randomly)",
      "Risk per trade: ~$87–$140 at this phase",
    ],
  },
  {
    id: 4, tag: "P04", label: "Steady Compounding",
    from: 4_000, to: 6_500,
    risk: 3, rr: 3, rrStr: "1:3", wr: 50, lev: "5–10×",
    note:
      "Steady growth without reckless weeks. You can lower leverage now — notional is no longer the bottleneck. " +
      "FOMO and random 50× trades will erase months of work.",
    rules: [
      "A+ setups only: HTF trend + structure + clear invalidation",
      "BTC/ETH core; max 1 alt if BTC dominance supports it",
      "Default 5–10× leverage — only go higher if size math requires it",
      "No trading within 2 hours of major macro news",
      "Log every new wallet ATH with what you did right",
      "Monthly drawdown cap: 15%",
      "Isolated margin — one bad trade must not kill the wallet",
    ],
  },
  {
    id: 5, tag: "P05", label: "Portfolio Mindset",
    from: 6_500, to: 10_000,
    risk: 2.5, rr: 3, rrStr: "1:3", wr: 50, lev: "5–8×",
    note:
      "$6.5K–$10K is a real portfolio. Think manager, not degen. " +
      "Futures engine, Spot vault — start moving profits off the hot wallet.",
    rules: [
      "Pre-session plan: bias, max trades, max daily loss in USDT",
      "Diversify: BTC + ETH core, max 1 uncorrelated alt",
      "Check BTC dominance before alt longs",
      "Move 10% of profits to Spot after each milestone",
      "Max portfolio drawdown: 20% from peak",
      "Fewer entries, higher confluence — 1–2 quality trades per day max",
      "Risk per trade: $162–$250",
    ],
  },
  {
    id: 6, tag: "P06", label: "Size with Discipline",
    from: 10_000, to: 16_000,
    risk: 2, rr: 3, rrStr: "1:3", wr: 50, lev: "3–5×",
    note:
      "A mistake here costs $200–$320. Position sizing is everything — " +
      "scale through execution quality, not through leverage.",
    rules: [
      "Limit orders for entries — no chasing candles",
      "Max 5× leverage; default 3×",
      "After 10% monthly drawdown → cut risk 50% until month ends",
      "Monthly audit: win rate and expectancy by setup",
      "Correlated positions count as one directional bet",
      "Max notional per pair: 30% of active capital",
      "Risk per trade: $200–$320",
    ],
  },
  {
    id: 7, tag: "P07", label: "Capital Guardian",
    from: 16_000, to: 25_000,
    risk: 1.5, rr: 3.5, rrStr: "1:3.5", wr: 48, lev: "2–5×",
    note:
      "$16K+ took real discipline. Protection beats aggression — " +
      "split active capital and reserves.",
    rules: [
      "Capital split: ~70% Futures, ~30% Spot or stable reserve",
      "Hedge with BTC short when alt-heavy in risk-off",
      "Track open interest and liquidation clusters",
      "Max 5× leverage; prefer 2–3× on swings",
      "Accountability check-in before increasing size",
      "Weekly max loss in USDT — hard stop",
      "Risk per trade: $240–$375",
    ],
  },
  {
    id: 8, tag: "P08", label: "Precision Execution",
    from: 25_000, to: 40_000,
    risk: 1.5, rr: 3.5, rrStr: "1:3.5", wr: 48, lev: "2–3×",
    note:
      "Monthly % return matters more than daily screenshots. " +
      "Slippage and correlation are real risks at this size.",
    rules: [
      "Conservative Kelly or fixed fractional sizing",
      "Map correlation across BTC, ETH, alts",
      "TWAP for positions above $2K notional",
      "Max 3× leverage; 2× default on majors",
      "Backtest setups on 50+ historical examples",
      "Proven playbook only — no experiments",
      "Target 3–8% monthly, not 50% weeks",
    ],
  },
  {
    id: 9, tag: "P09", label: "Liquidity & Impact",
    from: 40_000, to: 65_000,
    risk: 1, rr: 4, rrStr: "1:4", wr: 45, lev: "1–3×",
    note:
      "Large orders move thin books. 1% risk = $400–$650 per trade — triple-check every input.",
    rules: [
      "TWAP/VWAP for entries above $3K notional",
      "Check order book depth before sizing",
      "Majors and top-20 only at this size",
      "Monitor liquidation heatmaps",
      "Keep 20–30% off-exchange",
      "Max 3× leverage",
      "Pre-trade checklist: size, SL, funding, correlation, news",
    ],
  },
  {
    id: 10, tag: "P10", label: "The Finish Line",
    from: 65_000, to: 100_000,
    risk: 0.75, rr: 4, rrStr: "1:4", wr: 45, lev: "1–2×",
    note:
      "Final stretch: $65K → $100K. Biggest risk is overtrading when victory feels close. " +
      "0.75% risk = $487–$750 per trade. Protect the stack.",
    rules: [
      "1–2× leverage or Spot — no degen final push",
      "BTC/ETH A+ setups only",
      "Risk cap: 0.75% per trade — never exceed",
      "Move 25% to cold storage before the final push",
      "Max 1–2 trades per day",
      "Write post-$100K allocation plan now",
      "Hitting $100K proves the process — do not celebrate with size",
    ],
  },
];

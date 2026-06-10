export const PHASES = [
  {
    id: 1, tag: "P01", label: "Survival Mode",
    from: 5, to: 25,
    risk: 5, rr: 2, rrStr: "1:2", wr: 55, lev: "3–5×",
    note:
      "You have $5 USDT — enough to learn, not enough to gamble. " +
      "This phase is about staying in the game: every trade risks ~$0.25 (5%), " +
      "so one bad streak cannot wipe you out. Master stop-loss, isolated margin, and closing the platform when tilted.",
    rules: [
      "USDT-M Perpetuals only — no Spot gambling or random alt pumps",
      "Set stop-loss on Binance before opening any position",
      "Isolated margin only — Cross is banned until P04",
      "Max 2 open positions; if both are red, do not add a third",
      "Trade BTC or ETH only — highest liquidity, tightest spreads at small size",
      "3 losses in a row → close charts for 24 hours",
      "Daily loss cap: 10% of wallet (~$0.50 at start)",
    ],
  },
  {
    id: 2, tag: "P02", label: "Process Over Luck",
    from: 25, to: 100,
    risk: 4, rr: 2.5, rrStr: "1:2.5", wr: 55, lev: "3–5×",
    note:
      "P01 taught you not to blow up. Now prove you can repeat good decisions. " +
      "At $25–$100, each trade risks $1–$4 — small enough to experiment, large enough that sloppiness hurts. " +
      "If it is not in the journal with a screenshot, it did not happen.",
    rules: [
      "Log every trade: pair, direction, entry, exit, SL, TP, leverage, RR, setup tag",
      "Attach a chart screenshot before closing the journal entry",
      "Define setup criteria in writing — no impulsive market orders",
      "Skip CPI, FOMC, ETF decisions, and major token unlock days",
      "Check funding rate before holding overnight (avoid paying heavy long funding)",
      "Weekly review: export Binance history and compare to your journal",
      "Daily loss cap: 12% — session ends, no revenge trades",
    ],
  },
  {
    id: 3, tag: "P03", label: "Rhythm & Repetition",
    from: 100, to: 300,
    risk: 3.5, rr: 2.5, rrStr: "1:2.5", wr: 52, lev: "3–5×",
    note:
      "$100 is the first psychological milestone — many traders never get here from $5. " +
      "Your edge is not one perfect trade; it is taking the same A-setup again and again. " +
      "Learn to bank partial profits and protect winners instead of giving them back.",
    rules: [
      "Partial close: 50% at TP1, runner to TP2 — do not full-close early out of fear",
      "Move SL to breakeven after TP1 fills (manual or Binance trailing stop)",
      "Max 3 trades per day — overtrading is the #1 killer at this size",
      "Keep liquidation price visible on every open position",
      "Do not raise leverage during a winning streak — same rules, same size",
      "One setup focus per week (e.g. breakout OR retest, not both randomly)",
      "Risk per trade: ~$3.50–$10 — if SL feels too tight, reduce size, not the stop",
    ],
  },
  {
    id: 4, tag: "P04", label: "Steady Compounding",
    from: 300, to: 1_000,
    risk: 3, rr: 3, rrStr: "1:3", wr: 50, lev: "2–4×",
    note:
      "Triple your account three times ($300 → $1K) without a single reckless week. " +
      "Altseason FOMO and 20× leverage will erase months of work in one candle. " +
      "Trade less, wait more — your job is to protect the stack while it grows.",
    rules: [
      "A+ setups only: HTF trend aligned + clear structure + defined invalidation",
      "BTC/ETH as core; max 1 alt position if BTC dominance supports it",
      "Max 4× leverage — if you need more, the setup is not good enough",
      "No trading within 2 hours of major macro news or after cascade liquidations",
      "Log every new wallet ATH with what you did right (build a playbook)",
      "Monthly drawdown cap: 15% — if hit, halve risk for the rest of the month",
      "Cross margin still banned — isolated keeps one bad trade from killing the wallet",
    ],
  },
  {
    id: 5, tag: "P05", label: "Portfolio Mindset",
    from: 1_000, to: 5_000,
    risk: 2.5, rr: 3, rrStr: "1:3", wr: 50, lev: "2–4×",
    note:
      "$1K USDT changes how you feel about money — respect that. " +
      "You are no longer trying to 'make it back'; you are managing a small portfolio. " +
      "Start treating Futures as the engine and Spot as the vault.",
    rules: [
      "Pre-session plan: bias, max trades, max daily loss in USDT — written before opening Binance",
      "Diversify exposure: BTC + ETH core, max 1 uncorrelated alt",
      "Check BTC dominance before alt longs — alts bleed when BTC runs",
      "Move 10% of profits to Spot after each phase milestone (profit securing)",
      "Max portfolio drawdown: 20% from peak — reduce size if approaching",
      "Fewer entries, higher confluence — aim for 1–2 quality trades per day max",
      "Risk per trade: $25–$125 — size from the plan, not from emotion",
    ],
  },
  {
    id: 6, tag: "P06", label: "Size with Discipline",
    from: 5_000, to: 15_000,
    risk: 2, rr: 3, rrStr: "1:3", wr: 50, lev: "2–3×",
    note:
      "A single bad trade can now cost $100–$300. Position sizing is no longer abstract — " +
      "it is the difference between a setback and a blown account. " +
      "Scale through better execution, not through higher leverage.",
    rules: [
      "Limit orders for entries — no chasing green candles on illiquid pairs",
      "Max 3× leverage; default to 2× unless setup is exceptional",
      "After 10% monthly drawdown → cut risk per trade by 50% until month ends",
      "Monthly audit: win rate and expectancy broken down by setup tag",
      "Correlated positions count as one (e.g. ETH long + alt long = one directional bet)",
      "Define max notional per pair (e.g. no single position > 30% of active capital)",
      "Risk per trade: $100–$300 — double-check SL distance and liquidation price",
    ],
  },
  {
    id: 7, tag: "P07", label: "Capital Guardian",
    from: 15_000, to: 35_000,
    risk: 1.5, rr: 3.5, rrStr: "1:3.5", wr: 48, lev: "1–3×",
    note:
      "You have built something real — $15K+ took discipline most traders never develop. " +
      "The goal shifts from aggressive growth to not giving it back. " +
      "Split capital between active trading and reserves; think defense first.",
    rules: [
      "Capital split: ~70% active Futures, ~30% Spot or stable reserve (untouchable in revenge mode)",
      "Hedge directional risk: BTC short hedge when running multiple alt longs in risk-off",
      "Track open interest and liquidation clusters before sizing into crowded levels",
      "Max 3× leverage; prefer 1–2× on swing trades",
      "Accountability check-in with your group before increasing size",
      "Weekly max loss in USDT — hard stop, no exceptions",
      "Risk per trade: $225–$525 — one mistake should never cost more than a planned day’s edge",
    ],
  },
  {
    id: 8, tag: "P08", label: "Precision Execution",
    from: 35_000, to: 55_000,
    risk: 1.5, rr: 3.5, rrStr: "1:3.5", wr: 48, lev: "1–2×",
    note:
      "At $35K+, monthly returns matter more than daily PnL screenshots. " +
      "You are competing with slippage, correlation, and your own overconfidence. " +
      "Trade like you intend to keep this capital for years, not like you need one more 10×.",
    rules: [
      "Position size from conservative Kelly or fixed fractional — no gut-feel sizing",
      "Map correlation: BTC, ETH, and alts often move together — count net exposure",
      "TWAP entries for positions above $2K notional to reduce market impact",
      "Max 2× leverage; 1× default on majors",
      "Backtest each active setup on at least 50 historical examples before trusting it",
      "No new experimental setups — only proven playbook entries",
      "Target 3–8% monthly return, not 50% weeks — compounding does the heavy lifting",
    ],
  },
  {
    id: 9, tag: "P09", label: "Liquidity & Impact",
    from: 55_000, to: 75_000,
    risk: 1, rr: 4, rrStr: "1:4", wr: 45, lev: "1–2×",
    note:
      "Your orders can move thin order books. Slippage on a $500 trade is noise; " +
      "on a $5K+ clip it is a real cost. Liquidity, funding, and exchange risk become first-class concerns. " +
      "1% risk here is $550–$750 per trade — triple-check every input.",
    rules: [
      "TWAP/VWAP for entries above $3K notional — never full-size market on illiquid alts",
      "Check order book depth: if your size is >5% of visible liquidity, split the order",
      "No large positions in low-cap alts — majors and top-20 only at this size",
      "Monitor liquidation heatmaps — avoid entries into obvious squeeze zones",
      "Keep 20–30% of total capital off-exchange (cold storage or separate wallet)",
      "Max 2× leverage; consider Spot for long-term core holdings",
      "Pre-trade checklist: size, SL, funding, correlation, news calendar — all boxes ticked",
    ],
  },
  {
    id: 10, tag: "P10", label: "The Finish Line",
    from: 75_000, to: 100_000,
    risk: 0.75, rr: 4, rrStr: "1:4", wr: 45, lev: "1×",
    note:
      "Final stretch: $75K → $100K. The biggest risk is not the market — it is overtrading " +
      "when victory feels close. Protect the stack. Trade Spot or 1× Futures on highest-conviction setups only. " +
      "0.75% risk = $560–$750 per trade. One disciplined month beats ten reckless ones.",
    rules: [
      "1× leverage or Spot only — no leverage for 'one last push'",
      "BTC/ETH A+ setups only — no experimental alts in the final phase",
      "Risk cap: 0.75% per trade (~$560–$750) — never exceed even on 'sure' trades",
      "Move 25% of capital to cold storage before the final push (worst case: you still win)",
      "Max 1–2 trades per day; if flat for a week, that is acceptable",
      "Write your post-$100K allocation plan now (Spot, stables, withdrawal schedule)",
      "Hitting $100K is not the end — it is proof the process works; do not celebrate with size",
    ],
  },
];

/**
 * Generates supabase/seed.sql with realistic demo community data.
 * Run: node scripts/generate-seed.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const USERS = [
  { id: "11111111-1111-4111-8111-111111111101", email: "ilian@challenge.demo",   username: "ilian",   display: "Ilian",   targetPnl: 138.72 },
  { id: "11111111-1111-4111-8111-111111111102", email: "ivan@challenge.demo",    username: "ivan",    display: "Ivan",    targetPnl: 97.40 },
  { id: "11111111-1111-4111-8111-111111111107", email: "dimitar@challenge.demo", username: "dimitar", display: "Dimitar", targetPnl: 84.30 },
  { id: "11111111-1111-4111-8111-111111111103", email: "georgi@challenge.demo",  username: "georgi",  display: "Georgi",  targetPnl: 62.15 },
  { id: "11111111-1111-4111-8111-111111111104", email: "petar@challenge.demo",   username: "petar",   display: "Petar",   targetPnl: 36.80 },
  { id: "11111111-1111-4111-8111-111111111105", email: "maria@challenge.demo",   username: "maria",   display: "Maria",   targetPnl: 23.50 },
  { id: "11111111-1111-4111-8111-111111111108", email: "nina@challenge.demo",    username: "nina",    display: "Nina",    targetPnl: 14.85 },
  { id: "11111111-1111-4111-8111-111111111106", email: "alex@challenge.demo",    username: "alex",    display: "Alex",    targetPnl: 6.20 },
];

// Ilian — full realistic journal (same as demoTrades.js)
const ILIAN_TRADES = [
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 94200, exit: 95180, sl: 93650, tp: 95200, qty: 0.0047, pos: 443, lev: 8, pnl: 4.20,  rr: "1:2",   risk: 5,   setup: "Breakout",          notes: "4H breakout + volume, isolated 8x", daysAgo: 44 },
  { pair: "ETHUSDT", dir: "LONG",  result: "LOSS", entry: 3380,  exit: 3345,  sl: 3345,  tp: 3460,  qty: 0.14,  pos: 473, lev: 10, pnl: -1.85, rr: "1:2.5", risk: 5,   setup: "FVG / Imbalance",   notes: "High funding — stopped out", daysAgo: 42 },
  { pair: "BTCUSDT", dir: "SHORT", result: "WIN",  entry: 96800, exit: 96150, sl: 97200, tp: 96100, qty: 0.0035, pos: 339, lev: 8, pnl: 3.10,  rr: "1:2",   risk: 4.5, setup: "Liquidity Sweep",   notes: "Asia high sweep", daysAgo: 40 },
  { pair: "SOLUSDT", dir: "LONG",  result: "LOSS", entry: 178.5, exit: 175.2, sl: 175.0,  tp: 185.0,  qty: 2.8,   pos: 500, lev: 10, pnl: -2.40, rr: "1:2",   risk: 5,   setup: "Retest",            notes: "Alt weak vs BTC", daysAgo: 38 },
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 95500, exit: 96450, sl: 95000, tp: 96500, qty: 0.0055, pos: 525, lev: 8, pnl: 6.80,  rr: "1:2.5", risk: 4,   setup: "Order Block",       notes: "Daily OB + 1H BOS", daysAgo: 35 },
  { pair: "ETHUSDT", dir: "LONG",  result: "WIN",  entry: 3290,  exit: 3365,  sl: 3260,  tp: 3370,  qty: 0.16,  pos: 526, lev: 8, pnl: 5.50,  rr: "1:2",   risk: 4,   setup: "Trend Continuation", notes: "ETH/BTC ratio up", daysAgo: 33 },
  { pair: "BTCUSDT", dir: "LONG",  result: "LOSS", entry: 97100, exit: 96600, sl: 96600, tp: 98200, qty: 0.0048, pos: 466, lev: 8, pnl: -3.20, rr: "1:2.5", risk: 4,   setup: "Breakout",          notes: "False breakout CME gap", daysAgo: 30 },
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 96200, exit: 97250, sl: 95750, tp: 97300, qty: 0.0065, pos: 625, lev: 7, pnl: 8.90,  rr: "1:2.5", risk: 3.5, setup: "Range Retest",      notes: "Broken range retest", daysAgo: 28 },
  { pair: "ETHUSDT", dir: "SHORT", result: "WIN",  entry: 3450,  exit: 3395,  sl: 3480,  tp: 3390,  qty: 0.18,  pos: 621, lev: 7, pnl: 7.40,  rr: "1:2",   risk: 3.5, setup: "Reversal",          notes: "4H bear div + liquidity", daysAgo: 25 },
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 97800, exit: 99200, sl: 97200, tp: 99300, qty: 0.0075, pos: 734, lev: 7, pnl: 12.30, rr: "1:3",   risk: 3.5, setup: "Breakout",          notes: "Weekly close above resistance", daysAgo: 22 },
  { pair: "SOLUSDT", dir: "LONG",  result: "LOSS", entry: 185.0, exit: 181.5, sl: 181.0, tp: 192.0, qty: 3.2,   pos: 592, lev: 8, pnl: -4.50, rr: "1:2.5", risk: 3.5, setup: "Breakout",          notes: "BTC dump dragged alts", daysAgo: 20 },
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 98500, exit: 100100, sl: 97900, tp: 100200, qty: 0.008, pos: 788, lev: 6, pnl: 15.80, rr: "1:3",   risk: 3,   setup: "Order Block",       notes: "A+ 3 confluences", daysAgo: 18 },
  { pair: "ETHUSDT", dir: "LONG",  result: "WIN",  entry: 3420,  exit: 3510,  sl: 3385,  tp: 3520,  qty: 0.22,  pos: 752, lev: 6, pnl: 11.20, rr: "1:2.5", risk: 3,   setup: "FVG / Imbalance",   notes: "FVG fill + BOS", daysAgo: 15 },
  { pair: "BTCUSDT", dir: "LONG",  result: "LOSS", entry: 100500, exit: 99800, sl: 99800, tp: 101800, qty: 0.0055, pos: 553, lev: 6, pnl: -6.10, rr: "1:3",   risk: 3,   setup: "Trend Continuation", notes: "Revenge entry — broke rules", daysAgo: 13 },
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 99100, exit: 100600, sl: 98600, tp: 100700, qty: 0.009, pos: 892, lev: 5, pnl: 18.50, rr: "1:3",   risk: 3,   setup: "Liquidity Sweep",   notes: "NY open sweep", daysAgo: 10 },
  { pair: "ETHUSDT", dir: "LONG",  result: "WIN",  entry: 3480,  exit: 3585,  sl: 3440,  tp: 3590,  qty: 0.25,  pos: 870, lev: 5, pnl: 14.30, rr: "1:2.5", risk: 2.5, setup: "Breakout",          notes: "ETH leading BTC", daysAgo: 8 },
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 100800, exit: 102900, sl: 100200, tp: 103000, qty: 0.0095, pos: 958, lev: 5, pnl: 22.10, rr: "1:3.5", risk: 2.5, setup: "Order Block",       notes: "Best trade so far", daysAgo: 6 },
  { pair: "SOLUSDT", dir: "LONG",  result: "LOSS", entry: 192.0, exit: 188.5, sl: 188.0, tp: 199.0, qty: 4.0,   pos: 768, lev: 5, pnl: -5.80, rr: "1:2.5", risk: 2.5, setup: "Retest",            notes: "Overextended alt", daysAgo: 4 },
  { pair: "BTCUSDT", dir: "LONG",  result: "WIN",  entry: 102200, exit: 103800, sl: 101700, tp: 103900, qty: 0.0095, pos: 971, lev: 5, pnl: 19.40, rr: "1:3",   risk: 2.5, setup: "Trend Continuation", notes: "Pullback to EMA21", daysAgo: 2 },
  { pair: "ETHUSDT", dir: "LONG",  result: "WIN",  entry: 3550,  exit: 3632,  sl: 3515,  tp: 3640,  qty: 0.28,  pos: 994, lev: 5, pnl: 13.07, rr: "1:2.5", risk: 2.5, setup: "Range Retest",      notes: "Disciplined size", daysAgo: 0 },
];

// Shorter realistic sets for other traders
const OTHER_TRADES = {
  ivan: [
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 95000, exit: 95800, sl: 94500, tp: 95900, qty: 0.005, pos: 475, lev: 10, pnl: 8.20, rr: "1:2", risk: 5, setup: "Breakout", notes: "Clean 4H break", daysAgo: 30 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 96200, exit: 95700, sl: 95700, tp: 97200, qty: 0.004, pos: 385, lev: 10, pnl: -4.50, rr: "1:2.5", risk: 5, setup: "Retest", notes: "Stopped at SL", daysAgo: 28 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3350, exit: 3420, sl: 3320, tp: 3430, qty: 0.15, pos: 502, lev: 8, pnl: 6.80, rr: "1:2", risk: 4, setup: "Order Block", notes: "", daysAgo: 25 },
    { pair: "BTCUSDT", dir: "SHORT", result: "WIN", entry: 97500, exit: 96800, sl: 98000, tp: 96700, qty: 0.004, pos: 390, lev: 8, pnl: 5.60, rr: "1:2", risk: 4, setup: "Liquidity Sweep", notes: "", daysAgo: 22 },
    { pair: "SOLUSDT", dir: "LONG", result: "LOSS", entry: 180, exit: 176, sl: 176, tp: 188, qty: 3, pos: 540, lev: 10, pnl: -3.80, rr: "1:2", risk: 4, setup: "Breakout", notes: "Alt dump", daysAgo: 20 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 96800, exit: 98100, sl: 96200, tp: 98200, qty: 0.006, pos: 581, lev: 7, pnl: 11.40, rr: "1:2.5", risk: 3.5, setup: "Trend Continuation", notes: "", daysAgo: 17 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3400, exit: 3495, sl: 3365, tp: 3500, qty: 0.18, pos: 612, lev: 7, pnl: 9.50, rr: "1:2.5", risk: 3.5, setup: "FVG / Imbalance", notes: "", daysAgo: 14 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 99000, exit: 98400, sl: 98400, tp: 100200, qty: 0.005, pos: 495, lev: 7, pnl: -5.20, rr: "1:3", risk: 3.5, setup: "Breakout", notes: "False break", daysAgo: 11 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 98200, exit: 99600, sl: 97700, tp: 99700, qty: 0.007, pos: 687, lev: 6, pnl: 14.80, rr: "1:3", risk: 3, setup: "Order Block", notes: "", daysAgo: 8 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 100100, exit: 101500, sl: 99600, tp: 101600, qty: 0.0075, pos: 751, lev: 5, pnl: 16.20, rr: "1:3", risk: 3, setup: "Range Retest", notes: "", daysAgo: 5 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3520, exit: 3610, sl: 3485, tp: 3620, qty: 0.22, pos: 774, lev: 5, pnl: 12.90, rr: "1:2.5", risk: 2.5, setup: "Breakout", notes: "", daysAgo: 3 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 102000, exit: 101400, sl: 101400, tp: 103200, qty: 0.006, pos: 612, lev: 5, pnl: -6.50, rr: "1:3", risk: 2.5, setup: "Trend Continuation", notes: "", daysAgo: 1 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 101500, exit: 102800, sl: 101000, tp: 102900, qty: 0.008, pos: 812, lev: 5, pnl: 11.40, rr: "1:2.5", risk: 2.5, setup: "Liquidity Sweep", notes: "Latest", daysAgo: 0 },
  ],
  dimitar: [
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 93800, exit: 94600, sl: 93300, tp: 94700, qty: 0.004, pos: 375, lev: 10, pnl: 6.40, rr: "1:2", risk: 5, setup: "Breakout", notes: "", daysAgo: 35 },
    { pair: "ETHUSDT", dir: "SHORT", result: "WIN", entry: 3420, exit: 3360, sl: 3455, tp: 3355, qty: 0.12, pos: 410, lev: 8, pnl: 5.20, rr: "1:2", risk: 4, setup: "Reversal", notes: "", daysAgo: 32 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 96000, exit: 95500, sl: 95500, tp: 97000, qty: 0.0045, pos: 432, lev: 8, pnl: -4.10, rr: "1:2.5", risk: 4, setup: "Retest", notes: "", daysAgo: 28 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 95200, exit: 96400, sl: 94700, tp: 96500, qty: 0.0055, pos: 524, lev: 7, pnl: 9.80, rr: "1:2.5", risk: 3.5, setup: "Order Block", notes: "", daysAgo: 24 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 97800, exit: 99100, sl: 97200, tp: 99200, qty: 0.006, pos: 587, lev: 6, pnl: 11.60, rr: "1:3", risk: 3, setup: "Breakout", notes: "", daysAgo: 18 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3450, exit: 3540, sl: 3415, tp: 3550, qty: 0.2, pos: 690, lev: 6, pnl: 10.20, rr: "1:2.5", risk: 3, setup: "FVG / Imbalance", notes: "", daysAgo: 14 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 100200, exit: 99700, sl: 99700, tp: 101500, qty: 0.005, pos: 501, lev: 5, pnl: -5.50, rr: "1:3", risk: 2.5, setup: "Trend Continuation", notes: "", daysAgo: 10 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 99500, exit: 101000, sl: 99000, tp: 101100, qty: 0.007, pos: 697, lev: 5, pnl: 15.40, rr: "1:3", risk: 2.5, setup: "Liquidity Sweep", notes: "", daysAgo: 6 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 101800, exit: 103200, sl: 101300, tp: 103300, qty: 0.0075, pos: 764, lev: 5, pnl: 14.30, rr: "1:3", risk: 2.5, setup: "Order Block", notes: "", daysAgo: 2 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3580, exit: 3660, sl: 3545, tp: 3670, qty: 0.24, pos: 859, lev: 5, pnl: 11.00, rr: "1:2.5", risk: 2.5, setup: "Range Retest", notes: "", daysAgo: 0 },
  ],
  georgi: [
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 94500, exit: 95200, sl: 94100, tp: 95300, qty: 0.004, pos: 378, lev: 10, pnl: 5.60, rr: "1:2", risk: 5, setup: "Breakout", notes: "", daysAgo: 28 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 95800, exit: 95300, sl: 95300, tp: 96800, qty: 0.004, pos: 383, lev: 10, pnl: -4.00, rr: "1:2.5", risk: 5, setup: "Retest", notes: "", daysAgo: 25 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3320, exit: 3390, sl: 3290, tp: 3400, qty: 0.14, pos: 465, lev: 8, pnl: 5.80, rr: "1:2", risk: 4, setup: "Order Block", notes: "", daysAgo: 22 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 96500, exit: 97600, sl: 96000, tp: 97700, qty: 0.005, pos: 483, lev: 8, pnl: 8.20, rr: "1:2.5", risk: 4, setup: "Trend Continuation", notes: "", daysAgo: 18 },
    { pair: "SOLUSDT", dir: "LONG", result: "LOSS", entry: 182, exit: 178, sl: 178, tp: 190, qty: 2.5, pos: 455, lev: 10, pnl: -3.50, rr: "1:2", risk: 4, setup: "Breakout", notes: "", daysAgo: 15 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 98000, exit: 99200, sl: 97500, tp: 99300, qty: 0.0055, pos: 539, lev: 7, pnl: 10.40, rr: "1:2.5", risk: 3.5, setup: "Range Retest", notes: "", daysAgo: 12 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 99500, exit: 99000, sl: 99000, tp: 100500, qty: 0.005, pos: 498, lev: 6, pnl: -4.80, rr: "1:3", risk: 3, setup: "Breakout", notes: "", daysAgo: 9 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 98800, exit: 100200, sl: 98300, tp: 100300, qty: 0.006, pos: 593, lev: 6, pnl: 12.60, rr: "1:3", risk: 3, setup: "Liquidity Sweep", notes: "", daysAgo: 6 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3500, exit: 3590, sl: 3465, tp: 3600, qty: 0.18, pos: 630, lev: 5, pnl: 10.80, rr: "1:2.5", risk: 2.5, setup: "FVG / Imbalance", notes: "", daysAgo: 3 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 101200, exit: 102400, sl: 100700, tp: 102500, qty: 0.007, pos: 708, lev: 5, pnl: 12.15, rr: "1:2.5", risk: 2.5, setup: "Order Block", notes: "", daysAgo: 0 },
  ],
  petar: [
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 94000, exit: 94700, sl: 93600, tp: 94800, qty: 0.0035, pos: 329, lev: 10, pnl: 4.20, rr: "1:2", risk: 5, setup: "Breakout", notes: "", daysAgo: 25 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 95500, exit: 95000, sl: 95000, tp: 96500, qty: 0.0035, pos: 334, lev: 10, pnl: -3.50, rr: "1:2.5", risk: 5, setup: "Retest", notes: "", daysAgo: 22 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3300, exit: 3360, sl: 3270, tp: 3370, qty: 0.12, pos: 396, lev: 8, pnl: 4.80, rr: "1:2", risk: 4, setup: "Order Block", notes: "", daysAgo: 18 },
    { pair: "BTCUSDT", dir: "SHORT", result: "LOSS", entry: 97000, exit: 97400, sl: 97400, tp: 96200, qty: 0.003, pos: 291, lev: 8, pnl: -2.80, rr: "1:2", risk: 4, setup: "Reversal", notes: "Wrong bias", daysAgo: 15 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 96800, exit: 97800, sl: 96300, tp: 97900, qty: 0.0045, pos: 436, lev: 7, pnl: 7.20, rr: "1:2.5", risk: 3.5, setup: "Trend Continuation", notes: "", daysAgo: 12 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 98500, exit: 99600, sl: 98000, tp: 99700, qty: 0.005, pos: 493, lev: 6, pnl: 9.50, rr: "1:3", risk: 3, setup: "Breakout", notes: "", daysAgo: 8 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 100000, exit: 99500, sl: 99500, tp: 101000, qty: 0.004, pos: 400, lev: 5, pnl: -4.20, rr: "1:3", risk: 3, setup: "Breakout", notes: "", daysAgo: 5 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3480, exit: 3560, sl: 3445, tp: 3570, qty: 0.15, pos: 522, lev: 5, pnl: 7.60, rr: "1:2.5", risk: 2.5, setup: "Range Retest", notes: "", daysAgo: 2 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 101000, exit: 102100, sl: 100500, tp: 102200, qty: 0.0055, pos: 556, lev: 5, pnl: 8.00, rr: "1:2.5", risk: 2.5, setup: "Liquidity Sweep", notes: "", daysAgo: 0 },
  ],
  maria: [
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 93500, exit: 94100, sl: 93100, tp: 94200, qty: 0.003, pos: 281, lev: 10, pnl: 3.60, rr: "1:2", risk: 5, setup: "Breakout", notes: "", daysAgo: 20 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 94800, exit: 94300, sl: 94300, tp: 95800, qty: 0.003, pos: 284, lev: 10, pnl: -2.80, rr: "1:2.5", risk: 5, setup: "Retest", notes: "", daysAgo: 17 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3280, exit: 3340, sl: 3250, tp: 3350, qty: 0.1, pos: 328, lev: 8, pnl: 3.80, rr: "1:2", risk: 4, setup: "Order Block", notes: "", daysAgo: 14 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 96000, exit: 95500, sl: 95500, tp: 97000, qty: 0.003, pos: 288, lev: 8, pnl: -2.50, rr: "1:2.5", risk: 4, setup: "Breakout", notes: "", daysAgo: 11 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 95200, exit: 96100, sl: 94800, tp: 96200, qty: 0.004, pos: 381, lev: 7, pnl: 5.40, rr: "1:2.5", risk: 3.5, setup: "Trend Continuation", notes: "", daysAgo: 8 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 97500, exit: 98400, sl: 97100, tp: 98500, qty: 0.0045, pos: 439, lev: 6, pnl: 6.20, rr: "1:3", risk: 3, setup: "Range Retest", notes: "", daysAgo: 5 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 99000, exit: 100100, sl: 98600, tp: 100200, qty: 0.005, pos: 495, lev: 5, pnl: 7.80, rr: "1:2.5", risk: 2.5, setup: "Liquidity Sweep", notes: "", daysAgo: 2 },
  ],
  nina: [
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 93000, exit: 93600, sl: 92600, tp: 93700, qty: 0.0025, pos: 233, lev: 10, pnl: 2.80, rr: "1:2", risk: 5, setup: "Breakout", notes: "", daysAgo: 18 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 94200, exit: 93800, sl: 93800, tp: 95000, qty: 0.0025, pos: 236, lev: 10, pnl: -2.20, rr: "1:2.5", risk: 5, setup: "Retest", notes: "", daysAgo: 15 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3250, exit: 3300, sl: 3220, tp: 3310, qty: 0.08, pos: 260, lev: 8, pnl: 2.40, rr: "1:2", risk: 4, setup: "Order Block", notes: "", daysAgo: 12 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 95500, exit: 95100, sl: 95100, tp: 96300, qty: 0.003, pos: 287, lev: 8, pnl: -2.40, rr: "1:2.5", risk: 4, setup: "Breakout", notes: "", daysAgo: 9 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 94800, exit: 95600, sl: 94400, tp: 95700, qty: 0.0035, pos: 332, lev: 7, pnl: 4.20, rr: "1:2.5", risk: 3.5, setup: "Trend Continuation", notes: "", daysAgo: 6 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 96800, exit: 97600, sl: 96400, tp: 97700, qty: 0.004, pos: 387, lev: 6, pnl: 5.60, rr: "1:3", risk: 3, setup: "Range Retest", notes: "", daysAgo: 3 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 98500, exit: 99300, sl: 98100, tp: 99400, qty: 0.0045, pos: 443, lev: 5, pnl: 4.45, rr: "1:2.5", risk: 2.5, setup: "Liquidity Sweep", notes: "", daysAgo: 0 },
  ],
  alex: [
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 92800, exit: 93300, sl: 92500, tp: 93400, qty: 0.002, pos: 186, lev: 10, pnl: 2.20, rr: "1:2", risk: 5, setup: "Breakout", notes: "First win", daysAgo: 14 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 93800, exit: 93400, sl: 93400, tp: 94600, qty: 0.002, pos: 188, lev: 10, pnl: -1.80, rr: "1:2.5", risk: 5, setup: "Retest", notes: "", daysAgo: 11 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 94500, exit: 94100, sl: 94100, tp: 95300, qty: 0.002, pos: 189, lev: 10, pnl: -1.60, rr: "1:2.5", risk: 5, setup: "Breakout", notes: "FOMO entry", daysAgo: 8 },
    { pair: "ETHUSDT", dir: "LONG", result: "WIN", entry: 3220, exit: 3265, sl: 3195, tp: 3270, qty: 0.06, pos: 193, lev: 8, pnl: 1.90, rr: "1:2", risk: 4, setup: "Order Block", notes: "", daysAgo: 5 },
    { pair: "BTCUSDT", dir: "LONG", result: "LOSS", entry: 95200, exit: 94800, sl: 94800, tp: 96000, qty: 0.002, pos: 190, lev: 8, pnl: -1.40, rr: "1:2.5", risk: 4, setup: "Trend Continuation", notes: "", daysAgo: 3 },
    { pair: "BTCUSDT", dir: "LONG", result: "WIN", entry: 94600, exit: 95200, sl: 94300, tp: 95300, qty: 0.0025, pos: 237, lev: 7, pnl: 2.90, rr: "1:2.5", risk: 3.5, setup: "Liquidity Sweep", notes: "Learning", daysAgo: 0 },
  ],
};

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function tradeInsert(userId, t) {
  const ts = `now() - interval '${t.daysAgo} days'`;
  return `  ('${userId}', '${t.pair}', '${t.dir}', '${t.result}', ${t.entry}, ${t.exit}, ${t.sl}, ${t.tp}, ${t.pnl}, '${t.rr}', ${t.risk}, '${esc(t.setup)}', '${esc(t.notes)}', 'USDT-M', ${t.lev}, ${t.qty}, ${t.pos}, ${ts})`;
}

let sql = `-- Trading Challenge — DEMO SEED DATA
-- Generated by scripts/generate-seed.mjs
--
-- HOW TO USE:
-- 1. Run schema.sql first in Supabase SQL Editor
-- 2. Run migrations/002_storage_and_trade_fields.sql
-- 3. Run this file
--
-- Demo login (all users):
--   Password: Demo1234!
--   Emails: ilian@challenge.demo, ivan@challenge.demo, etc.
--
-- Leaderboard after seed:
--   Ilian ~$143 · Ivan ~$102 · Dimitar ~$89 · Georgi ~$67 · ...

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clean previous demo data
DELETE FROM public.trades WHERE user_id IN (
  ${USERS.map(u => `'${u.id}'`).join(", ")}
);
DELETE FROM public.profiles WHERE id IN (
  ${USERS.map(u => `'${u.id}'`).join(", ")}
);
DELETE FROM auth.identities WHERE user_id IN (
  ${USERS.map(u => `'${u.id}'`).join(", ")}
);
DELETE FROM auth.users WHERE email LIKE '%@challenge.demo';

`;

for (const u of USERS) {
  sql += `
-- User: ${u.display}
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '${u.id}',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  '${u.email}',
  crypt('Demo1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"${u.username}","display_name":"${u.display}"}',
  false, ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(), '${u.id}',
  jsonb_build_object('sub', '${u.id}', 'email', '${u.email}'),
  'email', '${u.id}', now(), now(), now()
);

INSERT INTO public.profiles (id, username, display_name)
VALUES ('${u.id}', '${u.username}', '${u.display}')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

`;
}

sql += `
INSERT INTO public.trades (
  user_id, pair, dir, result, entry, exit, sl, tp, pnl, rr, risk_pct, setup, notes,
  market_type, leverage, quantity, position_usdt, created_at
) VALUES
`;

const allTradeLines = [];

// Ilian
allTradeLines.push(...ILIAN_TRADES.map(t => tradeInsert(USERS[0].id, t)));

// Others
for (const u of USERS.slice(1)) {
  const trades = OTHER_TRADES[u.username] || [];
  allTradeLines.push(...trades.map(t => tradeInsert(u.id, t)));
}

sql += allTradeLines.join(",\n") + ";\n";

const outPath = join(__dirname, "..", "supabase", "seed.sql");
writeFileSync(outPath, sql, "utf8");
console.log("Written:", outPath);
console.log("Users:", USERS.length);
console.log("Trades:", allTradeLines.length);

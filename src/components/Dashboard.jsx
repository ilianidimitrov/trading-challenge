import { useMemo, useState } from "react";
import { C, TARGET_BALANCE } from "../constants/palette";
import { EXCHANGE } from "../constants/binance";
import { fmt } from "../utils/format";
import { computeStats, formatWeekLabel } from "../utils/stats";
import { checkDiscipline } from "../utils/discipline";
import { computeDrawdown } from "../utils/drawdown";
import { computeRiskAnalysis } from "../utils/riskAnalysis";
import { exportCsvReport, exportPdfReport } from "../utils/reportExport";
import { enableNotifications } from "../hooks/useKillSwitchNotifications";
import { EquityCurve } from "./charts/EquityCurve";
import { CalendarHeatmap } from "./charts/CalendarHeatmap";
import { ChallengeComplete, shouldShowChallengeComplete, markChallengeCompleteShown } from "./ChallengeComplete";
import { Bar, Btn, Cell, Inp, Label } from "./ui";
import { EmptyState } from "./ui/EmptyState";

function tradeTimestamp(t) {
  return t.tradeAtMs || t.createdAt || 0;
}

function filterByDateRange(trades, from, to) {
  if (!from && !to) return trades;
  const fromMs = from ? new Date(from).getTime() : 0;
  const toMs = to ? new Date(to + "T23:59:59").getTime() : Infinity;
  return trades.filter(t => {
    const ts = tradeTimestamp(t);
    return ts >= fromMs && ts <= toMs;
  });
}

function monthlyRecap(trades) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthTrades = trades.filter(t => tradeTimestamp(t) >= monthStart);
  const wins = monthTrades.filter(t => t.result === "WIN").length;
  const pnl = monthTrades.reduce((s, t) => s + parseFloat(t.pnl || 0), 0);
  const wr = monthTrades.length ? Math.round(wins / monthTrades.length * 100) : null;
  return { count: monthTrades.length, pnl, wr };
}

export function Dashboard({ trades, balance, profileName = "Trader" }) {
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [showComplete, setShowComplete] = useState(() => shouldShowChallengeComplete(balance));

  const stats = computeStats(trades);
  const discipline = checkDiscipline(trades, balance);
  const drawdown = computeDrawdown(trades);
  const risk = computeRiskAnalysis(trades);
  const month = useMemo(() => monthlyRecap(trades), [trades]);
  const maxWeekPnl = Math.max(...stats.weeklyPnl.map(w => Math.abs(w.pnl)), 1);

  function handleCloseComplete() {
    markChallengeCompleteShown();
    setShowComplete(false);
  }

  function getExportTrades() {
    return filterByDateRange(trades, exportFrom, exportTo);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ChallengeComplete open={showComplete} balance={balance} onClose={handleCloseComplete} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Inp type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} style={{ width: "auto" }} />
        <Label color={C.muted}>to</Label>
        <Inp type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} style={{ width: "auto" }} />
        <Btn onClick={() => exportCsvReport(getExportTrades(), balance)} variant="default" disabled={!trades.length}>Export CSV</Btn>
        <Btn onClick={() => exportPdfReport(getExportTrades(), balance, profileName)} variant="default" disabled={!trades.length}>Export PDF</Btn>
        <Btn onClick={enableNotifications} variant="default">Enable Alerts</Btn>
        <Label color={C.muted}>{EXCHANGE} · USDT PnL</Label>
      </div>

      {discipline.alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {discipline.alerts.map((a, i) => (
            <div key={i} style={{
              background: a.level === "danger" ? C.redDim : "var(--color-yellow-dim)",
              border: `1px solid ${a.level === "danger" ? C.redBorder : C.yellowBorder}`,
              borderRadius: 8, padding: "12px 16px",
            }}>
              <div style={{ color: a.level === "danger" ? C.red : C.yellow, fontWeight: 700, fontSize: 13 }}>
                {a.title}
              </div>
              <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>{a.text}</div>
            </div>
          ))}
        </div>
      )}

      {stats.total > 0 && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 16,
        }}>
          <Label color={C.dim}>Equity Curve</Label>
          <div style={{ marginTop: 12 }}>
            <EquityCurve trades={trades} height={140} />
          </div>
        </div>
      )}

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>Today</Label>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 16, marginTop: 12,
        }}>
          <MiniStat label="Trades today" value={discipline.todayTrades} />
          <MiniStat
            label="Today PnL"
            value={`${discipline.todayPnl >= 0 ? "+" : ""}${discipline.todayPnl.toFixed(2)} USDT`}
            color={discipline.todayPnl >= 0 ? C.green : C.red}
          />
          <MiniStat label="Losing streak" value={discipline.consecutiveLosses} color={discipline.consecutiveLosses >= 2 ? C.red : C.text} />
          <MiniStat
            label="Status"
            value={discipline.canTrade ? "OK" : "PAUSE"}
            color={discipline.canTrade ? C.green : C.red}
          />
        </div>
      </div>

      {stats.total > 0 && (
        <>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: 16,
          }}>
            <Label color={C.dim}>This Month</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 12 }}>
              <MiniStat label="Trades" value={month.count} />
              <MiniStat label="Win Rate" value={month.wr != null ? `${month.wr}%` : "—"} color={month.wr >= 50 ? C.green : C.red} />
              <MiniStat label="PnL" value={`${month.pnl >= 0 ? "+" : ""}${month.pnl.toFixed(2)} USDT`} color={month.pnl >= 0 ? C.green : C.red} />
            </div>
          </div>

          <div className="stats-grid">
            <Cell label="Max Drawdown" value={`${drawdown.maxDrawdownPct}%`} color={C.red} />
            <Cell label="Current DD" value={`${drawdown.currentDrawdownPct}%`} color={drawdown.currentDrawdownPct > 5 ? C.red : C.dim} />
            <Cell
              label="Risk vs Actual"
              value={risk.count ? `${risk.avgPlanned} / ${risk.avgActual}` : "—"}
              color={C.yellow}
              sub={risk.count ? "planned / avg loss" : "add planned risk on losses"}
            />
            <Cell label="Peak Balance" value={fmt(drawdown.peak)} color={C.green} />
          </div>

          <div className="stats-grid">
            <Cell label="Win Rate" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? C.green : C.red} />
            <Cell label="Profit Factor" value={stats.profitFactor ?? "—"} color={stats.profitFactor >= 1 ? C.green : C.red} />
            <Cell label="Avg Win" value={`+${stats.avgWin.toFixed(2)}$`} color={C.green} />
            <Cell label="Avg Loss" value={`−${stats.avgLoss.toFixed(2)}$`} color={C.red} />
            <Cell label="Best Trade" value={`+${stats.bestTrade.toFixed(2)}$`} color={C.green} />
            <Cell label="Worst Trade" value={`${stats.worstTrade.toFixed(2)}$`} color={C.red} />
            <Cell label="Growth" value={`${stats.growthMultiple.toFixed(1)}×`} color={C.yellow} />
            <Cell
              label="Streak"
              value={stats.currentStreak > 0 ? `${stats.currentStreak}${stats.streakType?.[0]}` : "—"}
              color={stats.streakType === "WIN" ? C.green : stats.streakType === "LOSS" ? C.red : C.dim}
              sub={stats.streakType === "WIN" ? "wins" : stats.streakType === "LOSS" ? "losses" : ""}
            />
          </div>

          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: 16,
          }}>
            <Label color={C.dim}>Daily PnL Heatmap (12 weeks)</Label>
            <div style={{ marginTop: 12 }}>
              <CalendarHeatmap trades={trades} />
            </div>
          </div>

          {stats.weeklyPnl.length > 0 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 16,
            }}>
              <Label color={C.dim}>Weekly PnL</Label>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 16, height: 80 }}>
                {stats.weeklyPnl.map(w => {
                  const h = Math.max(4, (Math.abs(w.pnl) / maxWeekPnl) * 70);
                  const positive = w.pnl >= 0;
                  return (
                    <div key={w.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: "100%", height: h,
                        background: positive ? C.green : C.red,
                        borderRadius: 3, opacity: 0.8,
                      }} />
                      <span style={{ color: C.muted, fontSize: 9 }}>{formatWeekLabel(w.week)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stats.bySetup.length > 0 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 16,
            }}>
              <Label color={C.dim}>Performance by Setup</Label>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.bySetup.slice(0, 6).map(s => (
                  <div key={s.setup}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{s.setup}</span>
                      <span style={{ color: C.dim, fontSize: 11 }}>
                        {s.count} trades · {s.winRate}% WR ·{" "}
                        <span style={{ color: s.pnl >= 0 ? C.green : C.red }}>
                          {s.pnl >= 0 ? "+" : ""}{s.pnl.toFixed(2)}$
                        </span>
                      </span>
                    </div>
                    <Bar pct={s.winRate} color={s.winRate >= 50 ? C.green : C.red} height={3} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.byPair.length > 1 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 16,
            }}>
              <Label color={C.dim}>Performance by Pair</Label>
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Pair", "Trades", "WR", "PnL"].map(h => (
                        <th key={h} style={{
                          color: C.dim, textAlign: "left", padding: "6px 10px",
                          borderBottom: `1px solid ${C.border}`, fontSize: 10,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byPair.map((p, i) => (
                      <tr key={p.pair}>
                        <td style={{ padding: "8px 10px", color: C.bright, fontWeight: 600, borderBottom: i < stats.byPair.length - 1 ? `1px solid ${C.border}` : "none" }}>{p.pair}</td>
                        <td style={{ padding: "8px 10px", color: C.text, borderBottom: i < stats.byPair.length - 1 ? `1px solid ${C.border}` : "none" }}>{p.count}</td>
                        <td style={{ padding: "8px 10px", color: p.winRate >= 50 ? C.green : C.red, borderBottom: i < stats.byPair.length - 1 ? `1px solid ${C.border}` : "none" }}>{p.winRate}%</td>
                        <td style={{ padding: "8px 10px", color: p.pnl >= 0 ? C.green : C.red, fontWeight: 700, borderBottom: i < stats.byPair.length - 1 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>
                          {p.pnl >= 0 ? "+" : ""}{p.pnl.toFixed(2)}$
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {stats.total === 0 && (
        <EmptyState title="No data yet">
          Log your first trade in Journal to see statistics.
        </EmptyState>
      )}

      {balance >= TARGET_BALANCE && !showComplete && (
        <div style={{ textAlign: "center", padding: 8 }}>
          <Btn onClick={() => setShowComplete(true)} variant="primary">View Challenge Complete</Btn>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color = C.bright }) {
  return (
    <div>
      <Label color={C.dim}>{label}</Label>
      <div style={{ color, fontWeight: 700, fontSize: 16, marginTop: 4 }}>{value}</div>
    </div>
  );
}

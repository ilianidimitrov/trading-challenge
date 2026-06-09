import { C } from "../constants/palette";
import { EXCHANGE } from "../constants/binance";
import { fmt } from "../utils/format";
import { computeStats, formatWeekLabel } from "../utils/stats";
import { checkDiscipline } from "../utils/discipline";
import { exportCsvReport, exportPdfReport } from "../utils/reportExport";
import { enableNotifications } from "../hooks/useKillSwitchNotifications";
import { Bar, Btn, Cell, Label } from "./ui";

export function Dashboard({ trades, balance, profileName = "Trader" }) {
  const stats = computeStats(trades);
  const discipline = checkDiscipline(trades, balance);
  const maxWeekPnl = Math.max(...stats.weeklyPnl.map(w => Math.abs(w.pnl)), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Btn onClick={() => exportCsvReport(trades, balance)} variant="default" disabled={!trades.length}>Export CSV</Btn>
        <Btn onClick={() => exportPdfReport(trades, balance, profileName)} variant="default" disabled={!trades.length}>Export PDF</Btn>
        <Btn onClick={enableNotifications} variant="default">Enable Alerts</Btn>
        <Label color={C.muted}>{EXCHANGE} · USDT PnL</Label>
      </div>

      {discipline.alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {discipline.alerts.map((a, i) => (
            <div key={i} style={{
              background: a.level === "danger" ? C.redDim : "#f0c04015",
              border: `1px solid ${a.level === "danger" ? C.red + "55" : C.yellow + "55"}`,
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
          <div className="stats-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
          }}>
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
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 40, textAlign: "center",
        }}>
          <Label color={C.muted}>No data yet</Label>
          <div style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>
            Log your first trade in Journal to see statistics.
          </div>
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

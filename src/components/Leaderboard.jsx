import { useCallback, useEffect, useMemo, useState } from "react";
import { C } from "../constants/palette";
import { PHASES } from "../constants/phases";
import { fetchLeaderboard } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/config";
import { useAuth } from "../contexts/AuthContext";
import { fmt } from "../utils/format";
import { Btn, Label, Sel } from "./ui";
import { EmptyState } from "./ui/EmptyState";
import { SkeletonCard } from "./ui/Skeleton";

const REFRESH_INTERVAL = 30_000;

export function Leaderboard({ onSelectUser }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterPhase, setFilterPhase] = useState("");
  const [minTrades, setMinTrades] = useState("");
  const [last30Days, setLast30Days] = useState(false);

  const load = useCallback(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchLeaderboard()
      .then(data => {
        setRows(data);
        setLastUpdated(new Date());
        setError("");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (filterPhase) {
      list = list.filter(r => r.current_phase === filterPhase);
    }
    if (minTrades) {
      const min = parseInt(minTrades, 10);
      if (!Number.isNaN(min)) list = list.filter(r => r.trade_count >= min);
    }
    if (last30Days) {
      const cutoff = Date.now() - 30 * 86400000;
      list = list.filter(r => r.last_trade_at && new Date(r.last_trade_at).getTime() >= cutoff);
    }
    return list;
  }, [rows, filterPhase, minTrades, last30Days]);

  const myRank = useMemo(() => {
    if (!user) return null;
    const idx = filtered.findIndex(r => r.user_id === user.id);
    return idx >= 0 ? idx + 1 : null;
  }, [filtered, user]);

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState title="Leaderboard">
        Configure Supabase in <code>.env</code> for a shared leaderboard.
      </EmptyState>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <Label color={C.dim}>Trading Challenge Leaderboard</Label>
          {myRank != null && (
            <div style={{ color: C.yellow, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
              You are #{myRank}
            </div>
          )}
          {lastUpdated && (
            <span style={{ color: C.muted, fontSize: 11, display: "block", marginTop: 4 }}>
              Updated {lastUpdated.toLocaleTimeString("en-US")}
            </span>
          )}
        </div>
        <Btn onClick={load} variant="default" disabled={loading}>
          {loading ? "..." : "Refresh"}
        </Btn>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Sel value={filterPhase} onChange={e => setFilterPhase(e.target.value)} style={{ width: "auto", minWidth: 100 }}>
          <option value="">All phases</option>
          {PHASES.map(p => <option key={p.tag} value={p.tag}>{p.tag}</option>)}
        </Sel>
        <Sel value={minTrades} onChange={e => setMinTrades(e.target.value)} style={{ width: "auto", minWidth: 120 }}>
          <option value="">Min trades</option>
          {[5, 10, 20, 50].map(n => <option key={n} value={String(n)}>{n}+ trades</option>)}
        </Sel>
        <label style={{ display: "flex", alignItems: "center", gap: 6, color: C.dim, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={last30Days} onChange={e => setLast30Days(e.target.checked)} />
          Active last 30 days
        </label>
      </div>

      {error && <div style={{ color: C.red, padding: 12 }}>{error}</div>}

      {loading && rows.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No participants yet" />
      )}

      {filtered.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["#", "Trader", "Balance", "Phase", "Trades", "Win Rate", "Avg RR"].map(h => (
                    <th key={h} style={{
                      color: C.dim, fontWeight: 600, padding: "10px 14px",
                      textAlign: "left", borderBottom: `1px solid ${C.border}`,
                      fontSize: 10, letterSpacing: 0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const isMe = user && r.user_id === user.id;
                  return (
                    <tr
                      key={r.user_id}
                      onClick={() => onSelectUser?.(r.user_id)}
                      style={{
                        cursor: onSelectUser ? "pointer" : "default",
                        background: isMe ? C.greenDim : i === 0 ? "#ffffff05" : "transparent",
                        outline: isMe ? `2px solid ${C.green}44` : "none",
                      }}
                    >
                      <td style={{ padding: "10px 14px", color: i < 3 ? C.yellow : C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: "10px 14px", color: C.bright, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>
                        {r.display_name || r.username}
                        {isMe && <span style={{ color: C.green, fontSize: 10, marginLeft: 6 }}>YOU</span>}
                      </td>
                      <td style={{ padding: "10px 14px", color: C.green, fontWeight: 700, borderBottom: `1px solid ${C.border}`, fontVariantNumeric: "tabular-nums" }}>
                        {fmt(parseFloat(r.balance))}
                      </td>
                      <td style={{ padding: "10px 14px", color: C.yellow, borderBottom: `1px solid ${C.border}` }}>
                        {r.current_phase || "—"}
                      </td>
                      <td style={{ padding: "10px 14px", color: C.text, borderBottom: `1px solid ${C.border}` }}>
                        {r.trade_count}
                      </td>
                      <td style={{ padding: "10px 14px", color: C.text, borderBottom: `1px solid ${C.border}` }}>
                        {r.win_rate != null ? `${Math.round(r.win_rate)}%` : "—"}
                      </td>
                      <td style={{ padding: "10px 14px", color: C.dim, borderBottom: `1px solid ${C.border}` }}>
                        {r.avg_rr || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

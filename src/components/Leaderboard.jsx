import { useCallback, useEffect, useState } from "react";
import { C } from "../constants/palette";
import { fetchLeaderboard } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/config";
import { fmt } from "../utils/format";
import { Btn, Label } from "./ui";

const REFRESH_INTERVAL = 30_000;

export function Leaderboard({ onSelectUser }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

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

  if (!isSupabaseConfigured()) {
    return (
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 40, textAlign: "center",
      }}>
        <Label color={C.muted}>Leaderboard</Label>
        <div style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>
          Конфигурирай Supabase в <code>.env</code> за споделена класация.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label color={C.dim}>
          # Trading Challenge Leaderboard
          {lastUpdated && (
            <span style={{ color: C.muted, marginLeft: 8 }}>
              · updated {lastUpdated.toLocaleTimeString("bg-BG")}
            </span>
          )}
        </Label>
        <Btn onClick={load} variant="default" disabled={loading}>
          {loading ? "..." : "Refresh"}
        </Btn>
      </div>

      {error && <div style={{ color: C.red, padding: 12 }}>{error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 40, textAlign: "center",
        }}>
          <Label color={C.muted}>Няма участници още</Label>
        </div>
      )}

      {rows.length > 0 && (
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
                {rows.map((r, i) => (
                  <tr
                    key={r.user_id}
                    onClick={() => onSelectUser?.(r.user_id)}
                    style={{
                      cursor: onSelectUser ? "pointer" : "default",
                      background: i === 0 ? "#ffffff05" : "transparent",
                    }}
                  >
                    <td style={{ padding: "10px 14px", color: i < 3 ? C.yellow : C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "10px 14px", color: C.bright, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>
                      {r.display_name || r.username}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

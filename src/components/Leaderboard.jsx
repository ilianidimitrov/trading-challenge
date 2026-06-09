import { useEffect, useState } from "react";
import { C } from "../constants/palette";
import { fetchLeaderboard } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/config";
import { fmt } from "../utils/format";
import { Label } from "./ui";

export function Leaderboard({ onSelectUser }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    fetchLeaderboard()
      .then(setRows)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return <div style={{ color: C.dim, padding: 20 }}>Зареждане...</div>;
  }

  if (error) {
    return <div style={{ color: C.red, padding: 20 }}>{error}</div>;
  }

  if (!rows.length) {
    return (
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 40, textAlign: "center",
      }}>
        <Label color={C.muted}>Няма участници още</Label>
      </div>
    );
  }

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
        <Label color={C.dim}># Trading Challenge Leaderboard</Label>
      </div>
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
  );
}

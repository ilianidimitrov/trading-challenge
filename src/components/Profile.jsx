import { useEffect, useMemo, useState } from "react";
import { C } from "../constants/palette";
import { fetchProfile, fetchUserPublicTrades, fetchLeaderboard } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/config";
import { computeStats } from "../utils/stats";
import { fmt } from "../utils/format";
import { Btn, Label } from "./ui";
import { SkeletonCard } from "./ui/Skeleton";

export function Profile({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetchProfile(userId),
      fetchLeaderboard(),
      fetchUserPublicTrades(userId, 100),
    ])
      .then(([prof, board, recent]) => {
        setProfile(prof);
        setStats(board.find(r => r.user_id === userId) || null);
        setTrades(recent);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const tradeStats = useMemo(() => {
    if (!trades.length) return null;
    const normalized = trades.map((t, i) => ({
      ...t,
      pnl: parseFloat(t.pnl),
      createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now() - i,
    }));
    return computeStats(normalized);
  }, [trades]);

  if (!userId) return null;

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  if (!profile) {
    return <div style={{ color: C.red, padding: 20 }}>Profile not found.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {onBack && <Btn onClick={onBack} variant="default">← Back to Leaderboard</Btn>}

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 20,
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
          )}
          <div>
            <Label color={C.muted}>Public Profile</Label>
            <div className="text-title" style={{ fontSize: 22, marginTop: 8 }}>
              {profile.display_name || profile.username}
            </div>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>@{profile.username}</div>
          </div>
        </div>

        {stats && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: 16, marginTop: 20,
          }}>
            <Stat label="Balance" value={fmt(parseFloat(stats.balance))} color={C.green} />
            <Stat label="Phase" value={stats.current_phase || "—"} color={C.yellow} />
            <Stat label="Trades" value={stats.trade_count} />
            <Stat label="Win Rate" value={stats.win_rate != null ? `${Math.round(stats.win_rate)}%` : "—"} />
            <Stat label="Avg RR" value={stats.avg_rr || "—"} />
          </div>
        )}

        {tradeStats && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: 16, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`,
          }}>
            <Stat label="Best Streak" value={tradeStats.currentStreak > 0 ? `${tradeStats.currentStreak} ${tradeStats.streakType}` : "—"} color={tradeStats.streakType === "WIN" ? C.green : C.red} />
            <Stat label="Profit Factor" value={tradeStats.profitFactor ?? "—"} />
            {tradeStats.bySetup.slice(0, 3).map(s => (
              <Stat key={s.setup} label={`WR ${s.setup}`} value={`${s.winRate}%`} color={s.winRate >= 50 ? C.green : C.red} />
            ))}
          </div>
        )}
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>Recent Trades</Label>
        {trades.length === 0 ? (
          <div style={{ color: C.dim, fontSize: 12, marginTop: 12 }}>No public trades.</div>
        ) : (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {trades.slice(0, 15).map((t, i) => {
              const pnl = parseFloat(t.pnl);
              const rc = t.result === "WIN" ? C.green : t.result === "LOSS" ? C.red : C.yellow;
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: i < Math.min(trades.length, 15) - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: rc, fontSize: 10, fontWeight: 800 }}>{t.dir}</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{t.pair}</span>
                    {t.setup && <Label color={C.muted}>{t.setup}</Label>}
                    {t.rr && <Label color={C.muted}>RR {t.rr}</Label>}
                  </div>
                  <span style={{ color: rc, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {pnl > 0 ? "+" : ""}{pnl.toFixed(2)}$
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color = C.bright }) {
  return (
    <div>
      <Label color={C.dim}>{label}</Label>
      <div style={{ color, fontWeight: 700, fontSize: 16, marginTop: 4 }}>{value}</div>
    </div>
  );
}

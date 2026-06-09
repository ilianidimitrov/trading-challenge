import { useState } from "react";
import { PHASES } from "./constants/phases";
import { getActivePhase } from "./utils/format";
import { useTradeSync } from "./hooks/useTradeSync";
import { useKillSwitchNotifications } from "./hooks/useKillSwitchNotifications";
import { useAuth } from "./contexts/AuthContext";
import { Header } from "./components/layout/Header";
import { AuthBar } from "./components/layout/AuthBar";
import { Sidebar } from "./components/layout/Sidebar";
import { BottomNav } from "./components/layout/BottomNav";
import { MoreMenu } from "./components/layout/MoreMenu";
import { PhaseCard } from "./components/PhaseCard";
import { RRPanel } from "./components/RRPanel";
import { Roadmap } from "./components/Roadmap";
import { Journal } from "./components/Journal";
import { Dashboard } from "./components/Dashboard";
import { Leaderboard } from "./components/Leaderboard";
import { Profile } from "./components/Profile";
import { LoginModal } from "./components/auth/LoginModal";
import { LoginScreen } from "./components/auth/LoginScreen";
import { SettingsModal } from "./components/auth/SettingsModal";
import { SkeletonCard } from "./components/ui/Skeleton";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [selId, setSelId] = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const { user, profile, loading: authLoading, isConfigured } = useAuth();
  const {
    trades, balance, addTrade, updateTrade, deleteTrade,
    replaceAllTrades, getBalanceBeforeTrade,
    useCloud, syncing, importLocalToCloud, localTradeCount,
  } = useTradeSync();

  useKillSwitchNotifications(trades, balance);

  const active = getActivePhase(PHASES, balance);
  const profileName = profile?.display_name || profile?.username || "Trader";
  const sel = PHASES.find(p => p.id === selId) || PHASES[0];

  async function handleSave(_id, form, balanceBefore) {
    return addTrade(form, balanceBefore);
  }

  async function handleUpdate(id, form, balanceBeforeEdit) {
    return updateTrade(id, form, balanceBeforeEdit);
  }

  function handleTabChange(key) {
    setTab(key);
    setProfileUserId(null);
    setMoreOpen(false);
  }

  if (isConfigured && authLoading) {
    return (
      <div className="app-layout" style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: 280 }}>
          <SkeletonCard lines={2} />
        </div>
      </div>
    );
  }

  if (isConfigured && !user) {
    return <LoginScreen />;
  }

  return (
    <div className="app-layout">
      <Sidebar active={tab} onChange={handleTabChange} activePhaseId={active.id} />
      <div className="app-main">
        <div className="app-shell">
          <AuthBar
            onLoginClick={() => setLoginOpen(true)}
            onSettingsClick={() => setSettingsOpen(true)}
          />
          <Header bal={balance} active={active} trades={trades} />

          {tab === "dashboard" && (
            <Dashboard
              trades={trades}
              balance={balance}
              profileName={profileName}
            />
          )}

          {tab === "phases" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PHASES.map(p => (
                <PhaseCard key={p.id} phase={p} bal={balance} selected={selId === p.id} onSelect={setSelId} />
              ))}
            </div>
          )}

          {tab === "rr" && (
            <div>
              <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
                {PHASES.map(p => {
                  const done = balance >= p.to;
                  const activeP = balance >= p.from && balance < p.to;
                  return (
                    <button key={p.id} onClick={() => setSelId(p.id)} style={{
                      padding: "5px 12px", borderRadius: 4, cursor: "pointer",
                      background: selId === p.id ? "var(--color-border-hi)" : "transparent",
                      border: `1px solid ${selId === p.id ? "var(--color-border-hi)" : "var(--color-border)"}`,
                      color: done ? "var(--color-green)" : activeP ? "var(--color-yellow)" : (selId === p.id ? "var(--color-bright)" : "var(--color-dim)"),
                      fontSize: 11, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.5,
                    }}>{p.tag}</button>
                  );
                })}
              </div>
              <RRPanel phase={sel} />
            </div>
          )}

          {tab === "roadmap" && <Roadmap bal={balance} trades={trades} />}

          {tab === "journal" && (
            <Journal
              entries={trades}
              balance={balance}
              onSave={handleSave}
              onUpdate={handleUpdate}
              onDelete={deleteTrade}
              onImport={replaceAllTrades}
              getBalanceBeforeTrade={getBalanceBeforeTrade}
              useCloud={useCloud}
              syncing={syncing}
              importLocalToCloud={importLocalToCloud}
              localTradeCount={localTradeCount}
            />
          )}

          {tab === "leaderboard" && (
            profileUserId
              ? <Profile userId={profileUserId} onBack={() => setProfileUserId(null)} />
              : <Leaderboard onSelectUser={setProfileUserId} />
          )}

          <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      </div>
      <BottomNav
        active={tab}
        onChange={handleTabChange}
        moreOpen={moreOpen}
        onMore={() => setMoreOpen(o => !o)}
      />
      <MoreMenu
        open={moreOpen}
        active={tab}
        onSelect={handleTabChange}
        onClose={() => setMoreOpen(false)}
      />
    </div>
  );
}

import { useState } from "react";
import { C } from "./constants/palette";
import { PHASES } from "./constants/phases";
import { getActivePhase } from "./utils/format";
import { useTradeSync } from "./hooks/useTradeSync";
import { Header } from "./components/layout/Header";
import { TabNav } from "./components/layout/TabNav";
import { AuthBar } from "./components/layout/AuthBar";
import { PhaseCard } from "./components/PhaseCard";
import { RRPanel } from "./components/RRPanel";
import { Roadmap } from "./components/Roadmap";
import { Journal } from "./components/Journal";
import { Leaderboard } from "./components/Leaderboard";
import { Profile } from "./components/Profile";
import { LoginModal } from "./components/auth/LoginModal";

const TABS = [
  { key: "phases",      label: "Phases" },
  { key: "rr",          label: "RR / Rules" },
  { key: "roadmap",     label: "Roadmap" },
  { key: "journal",     label: "Journal" },
  { key: "leaderboard", label: "Leaderboard" },
];

export default function App() {
  const [tab, setTab] = useState("phases");
  const [selId, setSelId] = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  const {
    trades, balance, addTrade, updateTrade, deleteTrade,
    replaceAllTrades,
    useCloud, syncing, importLocalToCloud, localTradeCount,
  } = useTradeSync();

  const active = getActivePhase(PHASES, balance);
  const sel = PHASES.find(p => p.id === selId) || PHASES[0];

  async function handleSave(_id, form, balanceBefore) {
    return addTrade(form, balanceBefore);
  }

  async function handleUpdate(id, form, balanceBeforeEdit) {
    return updateTrade(id, form, balanceBeforeEdit);
  }

  return (
    <div style={{
      background: C.bg, minHeight: "100vh",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: C.text, maxWidth: 960, margin: "0 auto", padding: "32px 20px 80px",
    }}>
      <AuthBar onLoginClick={() => setLoginOpen(true)} />
      <Header bal={balance} active={active} />
      <TabNav tabs={TABS} active={tab} onChange={key => { setTab(key); setProfileUserId(null); }} />

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
                  background: selId === p.id ? C.borderHi : "transparent",
                  border: `1px solid ${selId === p.id ? C.borderHi : C.border}`,
                  color: done ? C.green : activeP ? C.yellow : (selId === p.id ? C.bright : C.dim),
                  fontSize: 11, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.5,
                }}>{p.tag}</button>
              );
            })}
          </div>
          <RRPanel phase={sel} />
        </div>
      )}

      {tab === "roadmap" && <Roadmap bal={balance} />}

      {tab === "journal" && (
        <Journal
          entries={trades}
          balance={balance}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onDelete={deleteTrade}
          onImport={replaceAllTrades}
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
    </div>
  );
}

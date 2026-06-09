import { C, STARTING_BALANCE, TARGET_BALANCE } from "../../constants/palette";
import { EXCHANGE } from "../../constants/binance";
import { fmt } from "../../utils/format";
import { LoginForm } from "./LoginForm";

const FEATURES = [
  { tag: "JNL", title: "Journal", desc: "USDT-M трейдове с SL/TP и PnL", accent: C.green },
  { tag: "TOP", title: "Leaderboard", desc: "Класация на общността", accent: C.yellow },
  { tag: "P10", title: "10 Phases", desc: `${fmt(STARTING_BALANCE)} → ${fmt(TARGET_BALANCE)} с risk rules`, accent: C.blue },
];

export function LoginScreen() {
  return (
    <div className="login-page">
      <div className="login-glow login-glow-a" />
      <div className="login-glow login-glow-b" />

      <div className="login-shell">
        <section className="login-hero">
          <div className="login-badge">{EXCHANGE} · USDT-M Futures</div>

          <h1 className="login-title">
            <span className="login-title-muted">Challenge</span>
            <span className="login-title-main">
              {fmt(STARTING_BALANCE)}
              <span className="login-arrow">→</span>
              {fmt(TARGET_BALANCE)}
            </span>
          </h1>

          <p className="login-subtitle">
            Трейдинг журнал за Binance Futures. Записвай сделки, следи фазите и се състезавай с групата.
          </p>

          <div className="login-stats">
            <Stat label="Start" value={fmt(STARTING_BALANCE)} accent={C.green} />
            <Stat label="Target" value={fmt(TARGET_BALANCE)} accent={C.yellow} />
            <Stat label="Phases" value="10" accent={C.blue} />
          </div>

          <ul className="login-features">
            {FEATURES.map(f => (
              <li
                key={f.title}
                className="login-feature"
                style={{ borderLeftColor: f.accent }}
              >
                <span className="login-feature-tag" style={{ color: f.accent }}>{f.tag}</span>
                <div>
                  <div className="login-feature-title">{f.title}</div>
                  <div className="login-feature-desc">{f.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <LoginForm />
          </div>
          <p className="login-footer">
            Стартираш от {fmt(STARTING_BALANCE)} USDT · цел {fmt(TARGET_BALANCE)} USDT
          </p>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="login-stat">
      <div className="login-stat-label">{label}</div>
      <div className="login-stat-value" style={{ color: accent }}>{value}</div>
    </div>
  );
}

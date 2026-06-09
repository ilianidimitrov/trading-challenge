import { useState, useMemo } from "react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:       "#080810",
  surface:  "#0d0d1a",
  border:   "#1c1c2e",
  borderHi: "#2e2e48",
  muted:    "#3a3a5c",
  dim:      "#555577",
  text:     "#c8c8e0",
  bright:   "#e8e8f8",
  green:    "#00d4aa",
  greenDim: "#00d4aa22",
  red:      "#ff4d6d",
  redDim:   "#ff4d6d22",
  yellow:   "#f0c040",
  blue:     "#4d9fff",
  purple:   "#9b72ff",
  accent:   "#00d4aa",
};

// ─── PHASES ───────────────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 1,  tag: "P01", label: "Capital Preservation",
    from: 5,        to: 25,
    risk: 5,   rr: 2,    rrStr: "1:2",   wr: 55, lev: "5–10×",
    note: "Приоритет е да не губиш. Грешките в тази фаза струват центове, не хиляди.",
    rules: [
      "Максимум 2 отворени позиции едновременно",
      "Stop-loss се поставя преди вход — без изключения",
      "Минимум 3 независими потвърждения за всеки сетъп",
      "При 3 поредни загуби — пауза за деня",
      "Дневен max drawdown: 10% от баланса",
    ],
  },
  {
    id: 2,  tag: "P02", label: "Process Discipline",
    from: 25,       to: 100,
    risk: 4,   rr: 2.5,  rrStr: "1:2.5", wr: 55, lev: "5–10×",
    note: "Доказваш, че резултатът от P01 не е случаен. Журналът започва тук.",
    rules: [
      "Журнал за всеки трейд: вход, изход, RR, причина",
      "Без новинарски трейдинг",
      "При дневна загуба над 15% — сесията приключва",
      "Седмичен преглед на всички записи",
      "Не се влиза в позиция след 22:00",
    ],
  },
  {
    id: 3,  tag: "P03", label: "Consistency",
    from: 100,      to: 300,
    risk: 3.5, rr: 2.5,  rrStr: "1:2.5", wr: 52, lev: "5–8×",
    note: "Психологията се появява когато парите стават 'реални'. Процесът е отговорът.",
    rules: [
      "Частично затваряне: 50% на TP1, 50% на TP2",
      "SL се мести на breakeven след TP1",
      "Leverage не се увеличава в winning streak",
      "Максимум 3 трейда на ден",
      "Месечен performance review",
    ],
  },
  {
    id: 4,  tag: "P04", label: "Capital Accumulation",
    from: 300,      to: 1_000,
    risk: 3,   rr: 3,    rrStr: "1:3",   wr: 50, lev: "3–5×",
    note: "Методичен растеж. Бързането тук унищожава предишния труд.",
    rules: [
      "Само A+ сетъпи — качество над количество",
      "Leverage максимум 5×",
      "Без трейдинг при стрес или умора",
      "Всяка нова ATH се документира с анализ",
      "Drawdown лимит за месеца: 15%",
    ],
  },
  {
    id: 5,  tag: "P05", label: "Institutional Mindset",
    from: 1_000,    to: 5_000,
    risk: 2.5, rr: 3,    rrStr: "1:3",   wr: 50, lev: "3–5×",
    note: "$1K е психологически праг. Мисленето трябва да се промени преди капиталът.",
    rules: [
      "Drawdown лимит: максимум 20% от сметката",
      "Диверсификация между 2–3 инструмента",
      "Корелационен анализ преди всяка позиция",
      "Качество над честота — по-малко трейдове",
      "Тримесечен стратегически преглед",
    ],
  },
  {
    id: 6,  tag: "P06", label: "Scaling",
    from: 5_000,    to: 15_000,
    risk: 2,   rr: 3,    rrStr: "1:3",   wr: 50, lev: "2–3×",
    note: "Грешките на това ниво струват стотици долари. Процесът е всичко.",
    rules: [
      "Трейдинг план се пише преди всяка сесия",
      "Без импулсивни входове",
      "Месечен audit на стратегията",
      "Leverage максимум 3×",
      "При drawdown над 10% в месеца — размерът се намалява наполовина",
    ],
  },
  {
    id: 7,  tag: "P07", label: "Professional",
    from: 15_000,   to: 50_000,
    risk: 1.5, rr: 3.5,  rrStr: "1:3.5", wr: 48, lev: "2–3×",
    note: "Капиталът е значим. Защитата му е по-важна от растежа му.",
    rules: [
      "Хеджинг стратегии при повишена волатилност",
      "Диверсификация между spot и futures",
      "Accountability partner или ментор",
      "Полугодишен стратегически overhaul",
      "Leverage максимум 3×",
    ],
  },
  {
    id: 8,  tag: "P08", label: "Elite",
    from: 50_000,   to: 150_000,
    risk: 1.5, rr: 3.5,  rrStr: "1:3.5", wr: 48, lev: "1–2×",
    note: "Мисли в % годишна доходност. Мултипли мислене е грешка на това ниво.",
    rules: [
      "Position sizing по Kelly Criterion",
      "Корелационен риск мениджмънт между позициите",
      "Leverage максимум 2×",
      "Данъчно планиране — CPA консултация тримесечно",
      "Всяка стратегия се backtestва преди имплементация",
    ],
  },
  {
    id: 9,  tag: "P09", label: "Whale Tier",
    from: 150_000,  to: 500_000,
    risk: 1,   rr: 4,    rrStr: "1:4",   wr: 45, lev: "1–2×",
    note: "Позициите ти вече влияят на order book-а. Ликвидността е нов риск.",
    rules: [
      "TWAP/VWAP изпълнение за избягване на slippage",
      "Мониторинг на order flow и ликвидност преди вход",
      "Правен и данъчен framework задължителен",
      "Обмисляне на fund структура",
      "Риск 1% — при $150K това е $1,500 на трейд",
    ],
  },
  {
    id: 10, tag: "P10", label: "Seven Figures",
    from: 500_000,  to: 1_000_000,
    risk: 0.75, rr: 4,   rrStr: "1:4",   wr: 45, lev: "1×",
    note: "Без leverage. Грешка тук означава десетки хиляди долара. Само A+ сетъпи.",
    rules: [
      "Без leverage или максимум 1× spot equivalent",
      "Риск 0.75% — при $500K това е $3,750 на трейд",
      "Само най-висококонвергентни сетъпи",
      "Частично разпределение в cold storage",
      "Планиране на капиталова алокация след $1M",
    ],
  },
];

const GLOBAL_RULES = [
  { title: "Risk First",      text: "Рискът е единственото, което контролираш. Всичко друго е вероятност." },
  { title: "Journal",         text: "Записвай всеки трейд. Без данни няма подобрение — само предположения." },
  { title: "Psychology",      text: "Revenge trading = 24-часова пауза. Euphoria при winning streak = намали размера наполовина." },
  { title: "Confluence",      text: "Минимум 3 независими потвърждения: структура + тренд + обем/индикатор." },
  { title: "Timeframes",      text: "Анализ: Daily / 4H. Вход: 1H / 15M. Никога под 15M за вход." },
  { title: "Kill Switch",     text: "Дневна загуба над 10% или 3 поредни загуби → края на деня." },
  { title: "Size Scaling",    text: "Увеличавай размера само след 20 трейда с положителна очаквана стойност." },
  { title: "Capital Rule",    text: "Никога не трейдвай с пари, загубата на които би повлияла на живота ти." },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(3).replace(/\.?0+$/, "") + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return "$" + n.toFixed(2);
}

function phaseMult(p) { return (p.to / p.from).toFixed(1).replace(/\.0$/, ""); }

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Bar({ pct, color = C.green, height = 3 }) {
  return (
    <div style={{ background: C.border, borderRadius: 2, height, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%",
        background: color, transition: "width 0.5s ease",
      }} />
    </div>
  );
}

function Label({ children, color = C.dim }) {
  return <span style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color, fontWeight: 600 }}>{children}</span>;
}

function Val({ children, color = C.bright, size = 14 }) {
  return <span style={{ fontSize: size, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{children}</span>;
}

function Cell({ label, value, color = C.bright, sub }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 10px" }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 5 }}><Val color={color} size={18}>{value}</Val></div>
      {sub && <div style={{ marginTop: 3 }}><Label color={C.muted}>{sub}</Label></div>}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = "text", step }) {
  return (
    <input
      value={value} onChange={onChange} placeholder={placeholder}
      type={type} step={step}
      style={{
        background: C.surface, border: `1px solid ${C.borderHi}`,
        borderRadius: 6, color: C.text, padding: "8px 10px",
        fontSize: 13, outline: "none", width: "100%",
        fontFamily: "inherit",
      }}
    />
  );
}

function Sel({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} style={{
      background: C.surface, border: `1px solid ${C.borderHi}`,
      borderRadius: 6, color: C.text, padding: "8px 10px",
      fontSize: 13, outline: "none", width: "100%", fontFamily: "inherit",
    }}>{children}</select>
  );
}

function Btn({ onClick, children, variant = "default" }) {
  const styles = {
    default: { background: C.surface, border: `1px solid ${C.borderHi}`, color: C.text },
    primary: { background: C.green, border: "none", color: "#000" },
    danger:  { background: C.redDim, border: `1px solid ${C.red}44`, color: C.red },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant],
      borderRadius: 6, padding: "9px 16px", fontSize: 13,
      fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      letterSpacing: 0.3,
    }}>{children}</button>
  );
}

// ─── PHASE CARD ───────────────────────────────────────────────────────────────
function PhaseCard({ phase, bal, selected, onSelect }) {
  const done = bal >= phase.to;
  const active = bal >= phase.from && bal < phase.to;
  const pct = done ? 100 : active ? ((bal - phase.from) / (phase.to - phase.from)) * 100 : 0;
  const beWR = Math.round(100 / (1 + phase.rr));

  const statusColor = done ? C.green : active ? C.yellow : C.muted;

  return (
    <div
      onClick={() => onSelect(phase.id)}
      style={{
        background: selected ? "#0d0d20" : C.surface,
        border: `1px solid ${selected ? C.borderHi : C.border}`,
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 8, padding: 18, cursor: "pointer",
        transition: "border-color 0.15s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <Label color={statusColor}>{phase.tag}</Label>
          <span style={{ color: C.bright, fontSize: 15, fontWeight: 700 }}>{phase.from >= 1000 ? fmt(phase.from) : "$" + phase.from} → {fmt(phase.to)}</span>
          <span style={{ color: C.dim, fontSize: 12 }}>{phase.label}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {done   && <Label color={C.green}>COMPLETED</Label>}
          {active && !done && <Label color={C.yellow}>ACTIVE</Label>}
          <Label color={C.muted}>×{phaseMult(phase)}</Label>
        </div>
      </div>

      {/* Progress */}
      <Bar pct={pct} color={statusColor} height={2} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 14 }}>
        <Label color={C.muted}>{fmt(phase.from)}</Label>
        <Label color={statusColor}>{pct.toFixed(0)}%</Label>
        <Label color={C.muted}>{fmt(phase.to)}</Label>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 24 }}>
        {[
          { l: "Risk / trade", v: phase.risk + "%" },
          { l: "RR",           v: phase.rrStr },
          { l: "Target WR",    v: phase.wr + "%" },
          { l: "Break-even",   v: beWR + "%" },
          { l: "Leverage",     v: phase.lev },
        ].map(s => (
          <div key={s.l}>
            <Label color={C.muted}>{s.l}</Label>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Expandable: note + rules */}
      {selected && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>{phase.note}</div>
          <Label>Rules</Label>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 0 }}>
            {phase.rules.map((r, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, padding: "7px 0",
                borderBottom: i < phase.rules.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{ color: C.muted, fontSize: 11, minWidth: 18, fontVariantNumeric: "tabular-nums" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ color: C.text, fontSize: 12, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RR PANEL ─────────────────────────────────────────────────────────────────
function RRPanel({ phase }) {
  const risk   = phase.from * (phase.risk / 100);
  const reward = risk * phase.rr;
  const beWR   = Math.round(100 / (1 + phase.rr));
  const edge   = phase.wr - beWR;
  const w10    = Math.round(10 * phase.wr / 100);
  const net10  = w10 * reward - (10 - w10) * risk;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Phase selector info */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <Label color={C.dim}>{phase.tag} — {phase.label}</Label>
            <div style={{ color: C.bright, fontSize: 16, fontWeight: 700, marginTop: 4 }}>
              {fmt(phase.from)} → {fmt(phase.to)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Label color={C.dim}>Phase multiplier</Label>
            <div style={{ color: C.yellow, fontSize: 20, fontWeight: 800, marginTop: 4 }}>
              ×{phaseMult(phase)}
            </div>
          </div>
        </div>

        {/* Risk / Reward */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0, marginBottom: 16 }}>
          <div style={{ padding: "12px 16px 12px 0" }}>
            <Label color={C.dim}>Risk per trade</Label>
            <div style={{ color: C.red, fontSize: 24, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {fmt(risk)}
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginTop: 3 }}>{phase.risk}% of {fmt(phase.from)}</div>
          </div>
          <div style={{ background: C.border }} />
          <div style={{ padding: "12px 0 12px 16px" }}>
            <Label color={C.dim}>Reward per trade</Label>
            <div style={{ color: C.green, fontSize: 24, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {fmt(reward)}
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginTop: 3 }}>RR {phase.rrStr}</div>
          </div>
        </div>

        {/* Break-even vs target */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Label color={C.dim}>Break-even win rate</Label>
              <Label color={C.red}>{beWR}%</Label>
            </div>
            <Bar pct={beWR} color={C.red} height={4} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Label color={C.dim}>Target win rate</Label>
              <Label color={C.green}>{phase.wr}%</Label>
            </div>
            <Bar pct={phase.wr} color={C.green} height={4} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
            <Label color={C.dim}>Statistical edge</Label>
            <Label color={edge > 0 ? C.green : C.red}>+{edge}pp above break-even</Label>
          </div>
        </div>
      </div>

      {/* 10-trade simulation */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>10-trade simulation at {phase.wr}% win rate</Label>
        <div style={{ display: "flex", gap: 4, marginTop: 10, marginBottom: 10 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const win = i < w10;
            return (
              <div key={i} style={{
                flex: 1, height: 40, borderRadius: 4,
                background: win ? C.greenDim : C.redDim,
                border: `1px solid ${win ? C.green + "44" : C.red + "44"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: win ? C.green : C.red, fontSize: 11, fontWeight: 700 }}>
                  {win ? "W" : "L"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <div><Label color={C.dim}>Gross wins</Label><div style={{ color: C.green, fontWeight: 700, fontSize: 13, marginTop: 2 }}>+{fmt(w10 * reward)}</div></div>
          <div><Label color={C.dim}>Gross losses</Label><div style={{ color: C.red, fontWeight: 700, fontSize: 13, marginTop: 2 }}>−{fmt((10 - w10) * risk)}</div></div>
          <div style={{ textAlign: "right" }}><Label color={C.dim}>Net</Label><div style={{ color: net10 >= 0 ? C.green : C.red, fontWeight: 800, fontSize: 16, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{net10 >= 0 ? "+" : ""}{fmt(net10)}</div></div>
        </div>
      </div>

      {/* Global rules */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>Global Rules — All Phases</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginTop: 12 }}>
          {GLOBAL_RULES.map((r, i) => (
            <div key={i} style={{
              padding: "12px 14px",
              borderBottom: i < GLOBAL_RULES.length - 2 ? `1px solid ${C.border}` : "none",
              borderRight: i % 2 === 0 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{r.title}</div>
              <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.6 }}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROADMAP ──────────────────────────────────────────────────────────────────
function Roadmap({ bal }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Timeline */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>Phase Timeline</Label>
        <div style={{ marginTop: 14 }}>
          {PHASES.map((p, i) => {
            const done   = bal >= p.to;
            const active = bal >= p.from && bal < p.to;
            const sc     = done ? C.green : active ? C.yellow : C.muted;
            const pct    = done ? 100 : active ? ((bal - p.from) / (p.to - p.from)) * 100 : 0;
            return (
              <div key={p.id} style={{ display: "flex", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: done ? C.green : active ? C.yellow : C.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800,
                    color: done || active ? "#000" : C.muted,
                  }}>
                    {done ? "✓" : p.id}
                  </div>
                  {i < PHASES.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 24, background: done ? C.green + "44" : C.border }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < PHASES.length - 1 ? 18 : 0, flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ color: sc, fontSize: 12, fontWeight: 700 }}>
                        {fmt(p.from)} → {fmt(p.to)}
                      </span>
                      <Label color={C.muted}>{p.label}</Label>
                    </div>
                    <Label color={C.muted}>×{phaseMult(p)}</Label>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
                    <Label color={C.muted}>Risk {p.risk}%</Label>
                    <Label color={C.muted}>RR {p.rrStr}</Label>
                    <Label color={C.muted}>Lev {p.lev}</Label>
                  </div>
                  {active && (
                    <div style={{ marginTop: 6 }}>
                      <Bar pct={pct} color={C.yellow} height={2} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>Parameter Comparison</Label>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Phase", "Range", "Risk %", "RR", "WR %", "BE %", "Edge", "Leverage", "×"].map(h => (
                  <th key={h} style={{
                    color: C.dim, fontWeight: 600, padding: "6px 10px",
                    textAlign: "left", borderBottom: `1px solid ${C.border}`,
                    whiteSpace: "nowrap", letterSpacing: 0.5, fontSize: 10,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PHASES.map((p, i) => {
                const done   = bal >= p.to;
                const active = bal >= p.from && bal < p.to;
                const beWR   = Math.round(100 / (1 + p.rr));
                const edge   = p.wr - beWR;
                const rc     = done ? C.green : active ? C.yellow : C.dim;
                return (
                  <tr key={p.id} style={{ background: active ? "#ffffff05" : "transparent" }}>
                    <td style={{ padding: "8px 10px", color: rc, fontWeight: 700, borderBottom: i < 9 ? `1px solid ${C.border}` : "none" }}>{p.tag}</td>
                    <td style={{ padding: "8px 10px", color: active ? C.bright : C.text, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>
                      {fmt(p.from)} → {fmt(p.to)}
                    </td>
                    <td style={{ padding: "8px 10px", color: C.red,    borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>{p.risk}%</td>
                    <td style={{ padding: "8px 10px", color: C.text,   borderBottom: i < 9 ? `1px solid ${C.border}` : "none" }}>{p.rrStr}</td>
                    <td style={{ padding: "8px 10px", color: C.green,  borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>{p.wr}%</td>
                    <td style={{ padding: "8px 10px", color: C.red,    borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>{beWR}%</td>
                    <td style={{ padding: "8px 10px", color: edge > 0 ? C.green : C.red, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontVariantNumeric: "tabular-nums" }}>+{edge}pp</td>
                    <td style={{ padding: "8px 10px", color: C.purple, borderBottom: i < 9 ? `1px solid ${C.border}` : "none" }}>{p.lev}</td>
                    <td style={{ padding: "8px 10px", color: C.yellow, borderBottom: i < 9 ? `1px solid ${C.border}` : "none", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>×{phaseMult(p)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function Journal({ bal, setBal }) {
  const [entries, setEntries] = useState([]);
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState({ pair: "", dir: "LONG", result: "WIN", pnl: "", rr: "", notes: "" });

  const wins  = entries.filter(e => e.result === "WIN").length;
  const loss  = entries.filter(e => e.result === "LOSS").length;
  const pnl   = entries.reduce((s, e) => s + parseFloat(e.pnl || 0), 0);
  const wr    = entries.length ? Math.round(wins / entries.length * 100) : null;

  function save() {
    if (!form.pair || !form.pnl) return;
    const p = parseFloat(form.pnl);
    const nb = Math.max(0.01, bal + p);
    setEntries([{
      ...form, id: Date.now(),
      date: new Date().toLocaleDateString("bg-BG"),
      balBefore: bal, balAfter: nb,
    }, ...entries]);
    setBal(nb);
    setForm({ pair: "", dir: "LONG", result: "WIN", pnl: "", rr: "", notes: "" });
    setOpen(false);
  }

  const f = form;
  const sf = (k, v) => setForm(x => ({ ...x, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Stats header */}
      {entries.length > 0 && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "12px 16px",
          display: "flex", gap: 24, flexWrap: "wrap",
        }}>
          <div><Label color={C.dim}>Trades</Label><div style={{ color: C.bright, fontWeight: 700, marginTop: 2 }}>{entries.length}</div></div>
          <div><Label color={C.dim}>Win Rate</Label><div style={{ color: wr >= 50 ? C.green : C.red, fontWeight: 700, marginTop: 2 }}>{wr}%</div></div>
          <div><Label color={C.dim}>W / L</Label><div style={{ color: C.text, fontWeight: 700, marginTop: 2 }}><span style={{ color: C.green }}>{wins}</span> / <span style={{ color: C.red }}>{loss}</span></div></div>
          <div><Label color={C.dim}>Total PnL</Label><div style={{ color: pnl >= 0 ? C.green : C.red, fontWeight: 700, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}$</div></div>
        </div>
      )}

      {/* Add trade */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: "100%", padding: "13px 16px", background: "transparent",
            border: "none", color: C.text, fontSize: 13, fontWeight: 600,
            cursor: "pointer", textAlign: "left", fontFamily: "inherit",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span>New Trade</span>
          <span style={{ color: C.muted, fontSize: 16 }}>{open ? "−" : "+"}</span>
        </button>

        {open && (
          <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14, marginBottom: 12 }}>
              <div>
                <Label color={C.dim}>Pair</Label>
                <div style={{ marginTop: 4 }}><Inp value={f.pair} onChange={e => sf("pair", e.target.value)} placeholder="BTC/USDT" /></div>
              </div>
              <div>
                <Label color={C.dim}>Direction</Label>
                <div style={{ marginTop: 4 }}>
                  <Sel value={f.dir} onChange={e => sf("dir", e.target.value)}>
                    <option>LONG</option><option>SHORT</option>
                  </Sel>
                </div>
              </div>
              <div>
                <Label color={C.dim}>Result</Label>
                <div style={{ marginTop: 4 }}>
                  <Sel value={f.result} onChange={e => sf("result", e.target.value)}>
                    <option>WIN</option><option>LOSS</option><option>BE</option>
                  </Sel>
                </div>
              </div>
              <div>
                <Label color={C.dim}>PnL ($)</Label>
                <div style={{ marginTop: 4 }}><Inp value={f.pnl} onChange={e => sf("pnl", e.target.value)} placeholder="+5.00 / −2.50" type="number" step="0.01" /></div>
              </div>
              <div>
                <Label color={C.dim}>RR</Label>
                <div style={{ marginTop: 4 }}><Inp value={f.rr} onChange={e => sf("rr", e.target.value)} placeholder="1:2.5" /></div>
              </div>
              <div>
                <Label color={C.dim}>Notes</Label>
                <div style={{ marginTop: 4 }}><Inp value={f.notes} onChange={e => sf("notes", e.target.value)} placeholder="Setup reason..." /></div>
              </div>
            </div>
            <Btn onClick={save} variant="primary">Save Trade</Btn>
          </div>
        )}
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 40, textAlign: "center",
        }}>
          <Label color={C.muted}>No trades recorded</Label>
        </div>
      ) : (
        entries.map(e => {
          const p = parseFloat(e.pnl);
          const rc = e.result === "WIN" ? C.green : e.result === "LOSS" ? C.red : C.yellow;
          return (
            <div key={e.id} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${rc}`,
              borderRadius: 8, padding: "12px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{
                    background: e.dir === "LONG" ? C.greenDim : C.redDim,
                    color: e.dir === "LONG" ? C.green : C.red,
                    fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3,
                    letterSpacing: 0.5,
                  }}>{e.dir}</span>
                  <span style={{ color: C.bright, fontWeight: 700 }}>{e.pair}</span>
                  {e.rr && <Label color={C.dim}>RR {e.rr}</Label>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: rc, fontWeight: 800, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>
                    {p > 0 ? "+" : ""}{p.toFixed(2)}$
                  </div>
                  <Label color={C.muted}>{e.date}</Label>
                </div>
              </div>
              {e.notes && (
                <div style={{ color: C.dim, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>"{e.notes}"</div>
              )}
              <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                <Label color={C.muted}>{fmt(e.balBefore)}</Label>
                <Label color={C.muted}>→</Label>
                <Label color={e.balAfter > e.balBefore ? C.green : C.red}>{fmt(e.balAfter)}</Label>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [bal, setBal]     = useState(5);
  const [inp, setInp]     = useState("5");
  const [tab, setTab]     = useState("phases");
  const [selId, setSelId] = useState(1);

  const activeIdx = PHASES.findIndex(p => bal >= p.from && bal < p.to);
  const active    = activeIdx >= 0 ? PHASES[activeIdx] : PHASES[PHASES.length - 1];
  const sel       = PHASES.find(p => p.id === selId) || PHASES[0];
  const overall   = Math.min(100, ((bal - 5) / (1_000_000 - 5)) * 100);

  function applyBal() {
    const v = parseFloat(inp);
    if (!isNaN(v) && v > 0) setBal(v);
  }

  const TABS = [
    { key: "phases",  label: "Phases" },
    { key: "rr",      label: "RR / Rules" },
    { key: "roadmap", label: "Roadmap" },
    { key: "journal", label: "Journal" },
  ];

  return (
    <div style={{
      background: C.bg, minHeight: "100vh",
      fontFamily: "'Inter', 'SF Mono', system-ui, sans-serif",
      color: C.text, maxWidth: 960, margin: "0 auto", padding: "32px 20px 80px",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0; }
        input::placeholder { color: ${C.muted}; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <Label color={C.muted}>Trading Challenge</Label>
            <div style={{ color: C.bright, fontSize: 28, fontWeight: 900, letterSpacing: -1, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              $5 <span style={{ color: C.muted, fontWeight: 300 }}>→</span> $1,000,000
            </div>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>
              10 phases · 200,000× growth · {PHASES.length} risk tiers
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Label color={C.dim}>Current Balance</Label>
            <div style={{ color: C.bright, fontSize: 26, fontWeight: 800, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {fmt(bal)}
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>
              {(bal / 5).toFixed(1)}× from start
            </div>
          </div>
        </div>

        {/* Master progress */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label color={C.dim}>Overall Progress</Label>
            <Label color={C.dim}>{overall.toFixed(4)}%</Label>
          </div>
          {/* Segmented bar */}
          <div style={{ display: "flex", gap: 2, height: 6, borderRadius: 3, overflow: "hidden" }}>
            {PHASES.map(p => {
              const w = (p.to - p.from) / (1_000_000 - 5) * 100;
              const f = bal >= p.to ? 1 : bal > p.from ? (bal - p.from) / (p.to - p.from) : 0;
              const colors = ["#ef4444","#f97316","#f59e0b","#84cc16","#22c55e","#14b8a6","#3b82f6","#8b5cf6","#a855f7","#f0c040"];
              return (
                <div key={p.id} style={{ flex: w, background: C.border, position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", inset: 0, right: `${(1 - f) * 100}%`,
                    background: colors[p.id - 1],
                    transition: "right 0.5s ease",
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <Label color={C.muted}>$5</Label>
            {bal < 1_000_000 && (
              <Label color={C.yellow}>
                {active.tag} — {active.label} · {fmt(active.to - bal)} to next milestone
              </Label>
            )}
            {bal >= 1_000_000 && <Label color={C.green}>COMPLETED</Label>}
            <Label color={C.muted}>$1M</Label>
          </div>
        </div>

        {/* Balance input */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Inp
            value={inp}
            onChange={e => setInp(e.target.value)}
            placeholder="Update balance..."
            type="number"
          />
          <Btn onClick={applyBal}>Update</Btn>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
        <Cell label="Balance"   value={fmt(bal)}                           color={C.bright} />
        <Cell label="Remaining" value={fmt(Math.max(0, 1_000_000 - bal))} color={C.dim} />
        <Cell label="Growth"    value={`${((bal / 5 - 1) * 100).toFixed(0)}%`} color={C.green} />
        <Cell label="Phase"     value={bal < 1_000_000 ? active.tag : "DONE"} color={C.yellow} sub={bal < 1_000_000 ? active.label : "Challenge complete"} />
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${C.border}`,
        marginBottom: 20, gap: 0,
      }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "10px 18px", background: "transparent", cursor: "pointer",
            border: "none", borderBottom: `2px solid ${tab === t.key ? C.green : "transparent"}`,
            color: tab === t.key ? C.bright : C.dim,
            fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            fontFamily: "inherit", transition: "all 0.15s", letterSpacing: 0.3,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      {tab === "phases" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {PHASES.map(p => (
            <PhaseCard key={p.id} phase={p} bal={bal} selected={selId === p.id} onSelect={setSelId} />
          ))}
        </div>
      )}

      {tab === "rr" && (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
            {PHASES.map(p => {
              const done   = bal >= p.to;
              const active = bal >= p.from && bal < p.to;
              return (
                <button key={p.id} onClick={() => setSelId(p.id)} style={{
                  padding: "5px 12px", borderRadius: 4, cursor: "pointer",
                  background: selId === p.id ? C.borderHi : "transparent",
                  border: `1px solid ${selId === p.id ? C.borderHi : C.border}`,
                  color: done ? C.green : active ? C.yellow : (selId === p.id ? C.bright : C.dim),
                  fontSize: 11, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.5,
                }}>{p.tag}</button>
              );
            })}
          </div>
          <RRPanel phase={sel} />
        </div>
      )}

      {tab === "roadmap" && <Roadmap bal={bal} />}
      {tab === "journal" && <Journal bal={bal} setBal={setBal} />}
    </div>
  );
}

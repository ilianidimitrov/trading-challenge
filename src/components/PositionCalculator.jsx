import { useMemo, useState } from "react";
import { C } from "../constants/palette";
import { fmt } from "../utils/format";
import { calcPositionSize, formatQuantity } from "../utils/positionSize";
import { Bar, Btn, Inp, Label, Sel } from "./ui";

const QUICK_LEV = [5, 10, 15, 20, 25, 50];

function Field({ label, children }) {
  return (
    <div>
      <Label color={C.dim}>{label}</Label>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function ResultRow({ label, value, accent, sub }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "12px 0", borderBottom: `1px solid ${C.border}`,
    }}>
      <div>
        <Label color={C.dim}>{label}</Label>
        {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ color: accent || C.bright, fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
    </div>
  );
}

export function PositionCalculator({ balance, activePhase }) {
  const [dir, setDir] = useState("LONG");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [riskUsdt, setRiskUsdt] = useState("");
  const [marginUsdt, setMarginUsdt] = useState("");
  const [leverage, setLeverage] = useState("20");

  const margin = marginUsdt || (balance > 0 ? String(round2(balance)) : "");

  const result = useMemo(
    () => calcPositionSize({ dir, entry, sl, riskUsdt, marginUsdt: margin, leverage }),
    [dir, entry, sl, riskUsdt, margin, leverage],
  );

  const phaseRisk = balance > 0 ? round2(balance * (activePhase.risk / 100)) : null;
  const levNum = parseFloat(leverage) || 0;
  const levOverLimit = levNum > 0 && activePhase?.lev
    ? levNum > parseMaxLev(activePhase.lev)
    : false;

  function applyPhaseRisk() {
    if (phaseRisk != null) setRiskUsdt(String(phaseRisk));
  }

  function useFullBalance() {
    if (balance > 0) setMarginUsdt(String(round2(balance)));
  }

  const lossOk = result && !result.error && Math.abs(result.actualLoss - result.riskUsdt) < 0.02;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>Position Size Calculator</Label>
        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>
          Set entry, stop-loss, max loss, margin, and leverage (as on Binance). Notional = margin × leverage, then sized so loss at SL matches your risk when possible.
        </p>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <div className="journal-grid" style={{ marginBottom: 4 }}>
          <Field label="Direction">
            <Sel value={dir} onChange={e => setDir(e.target.value)}>
              <option value="LONG">LONG</option>
              <option value="SHORT">SHORT</option>
            </Sel>
          </Field>
          <Field label="Entry Price">
            <Inp value={entry} onChange={e => setEntry(e.target.value)} placeholder="65000.00" type="number" step="any" />
          </Field>
          <Field label="Stop Loss">
            <Inp value={sl} onChange={e => setSl(e.target.value)} placeholder="64000.00" type="number" step="any" />
          </Field>
          <Field label="Max Loss (USDT)">
            <div style={{ display: "flex", gap: 6 }}>
              <Inp
                value={riskUsdt}
                onChange={e => setRiskUsdt(e.target.value)}
                placeholder="0.25"
                type="number"
                step="0.01"
              />
              {phaseRisk != null && (
                <Btn onClick={applyPhaseRisk} variant="default" title={`${activePhase.risk}% of ${fmt(balance)}`}>
                  {activePhase.tag}
                </Btn>
              )}
            </div>
          </Field>
          <Field label="Margin (USDT)">
            <div style={{ display: "flex", gap: 6 }}>
              <Inp
                value={marginUsdt}
                onChange={e => setMarginUsdt(e.target.value)}
                placeholder={balance > 0 ? String(round2(balance)) : "5"}
                type="number"
                step="0.01"
              />
              {balance > 0 && (
                <Btn onClick={useFullBalance} variant="default">Balance</Btn>
              )}
            </div>
          </Field>
          <Field label="Leverage (×)">
            <Inp
              value={leverage}
              onChange={e => setLeverage(e.target.value)}
              placeholder="20"
              type="number"
              step="1"
              min="1"
            />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {QUICK_LEV.map(l => (
            <Btn
              key={l}
              onClick={() => setLeverage(String(l))}
              variant={String(l) === leverage ? "primary" : "default"}
              style={{ padding: "4px 10px", fontSize: 11 }}
            >
              {l}×
            </Btn>
          ))}
        </div>

        {!marginUsdt && balance > 0 && (
          <div style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>
            Using wallet balance {fmt(balance)} as margin.
          </div>
        )}
      </div>

      <div style={{
        background: C.surface,
        border: `1px solid ${result?.error ? C.redBorder : result?.notional ? (lossOk ? C.greenBorder : C.yellowBorder) : C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>Result</Label>

        {result?.error && (
          <div style={{ color: C.red, fontSize: 13, marginTop: 12 }}>{result.error}</div>
        )}

        {!result && !result?.error && (
          <div style={{ color: C.muted, fontSize: 13, marginTop: 12 }}>
            Fill all fields including leverage to calculate.
          </div>
        )}

        {result && !result.error && (
          <div style={{ marginTop: 8 }}>
            <ResultRow
              label="Position Size (notional)"
              value={`${fmt(result.notional)} USDT`}
              accent={C.yellow}
              sub={`margin ${fmt(result.marginUsed)} × ${result.leverage}× (max ${fmt(result.maxNotional)} USDT)`}
            />
            <ResultRow
              label="Quantity"
              value={formatQuantity(result.quantity)}
              accent={C.bright}
              sub="Set this size on Binance Futures"
            />
            <ResultRow
              label="Leverage"
              value={`${result.leverage}×`}
              accent={levOverLimit ? C.red : C.purple}
              sub="Your input — set the same on Binance"
            />
            <ResultRow
              label="Margin used"
              value={`${fmt(result.marginUsed)} USDT`}
              accent={C.blue}
              sub={`Of ${fmt(result.marginUsdt)} allocated`}
            />
            <ResultRow
              label="Loss at SL"
              value={`${fmt(result.actualLoss)} USDT`}
              accent={lossOk ? C.green : C.yellow}
              sub={lossOk
                ? `Matches target risk ${fmt(result.riskUsdt)}`
                : `Target was ${fmt(result.riskUsdt)} — adjust leverage or margin`}
            />
            <ResultRow
              label="Stop distance"
              value={`${result.stopPct}%`}
              accent={C.red}
              sub={`${result.stopDist} price units`}
            />

            {result.warnings?.map((w, i) => (
              <div
                key={i}
                style={{
                  marginTop: 12, padding: 10, borderRadius: 6,
                  background: "var(--color-yellow-dim)",
                  border: `1px solid ${C.yellowBorder}`,
                  color: C.yellow,
                  fontSize: 12, lineHeight: 1.5,
                }}
              >
                {w}
              </div>
            ))}

            {levOverLimit && (
              <div style={{
                marginTop: 12, padding: 10, borderRadius: 6,
                background: C.redDim, border: `1px solid ${C.redBorder}`,
                color: C.red, fontSize: 12, lineHeight: 1.5,
              }}>
                {result.leverage}× exceeds {activePhase.tag} limit ({activePhase.lev}).
              </div>
            )}

            {levNum > 0 && !levOverLimit && activePhase && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Label color={C.dim}>Leverage vs {activePhase.tag} max ({activePhase.lev})</Label>
                  <Label color={C.green}>{Math.min(100, (levNum / parseMaxLev(activePhase.lev)) * 100).toFixed(0)}%</Label>
                </div>
                <Bar
                  pct={(levNum / parseMaxLev(activePhase.lev)) * 100}
                  color={levNum / parseMaxLev(activePhase.lev) > 0.8 ? C.yellow : C.green}
                  height={4}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>How it works</Label>
        <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, marginTop: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: C.text }}>1.</strong> Max notional = margin × leverage (what Binance allows).
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: C.text }}>2.</strong> Ideal size from risk: qty = loss ÷ |entry − SL|.
          </div>
          <div>
            <strong style={{ color: C.text }}>3.</strong> If ideal size fits in max notional → exact risk. If not → position uses full margin×leverage and loss at SL will be higher; raise leverage to {result?.minLeverage ? `${result.minLeverage}×` : "match"}.
          </div>
        </div>
      </div>
    </div>
  );
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function parseMaxLev(levStr) {
  const nums = levStr.match(/\d+/g);
  if (!nums?.length) return 125;
  return Math.max(...nums.map(Number));
}

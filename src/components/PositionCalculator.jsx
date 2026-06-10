import { useMemo, useState } from "react";
import { C } from "../constants/palette";
import { fmt } from "../utils/format";
import { calcPositionSize, formatQuantity } from "../utils/positionSize";
import { Bar, Btn, Inp, Label, Sel } from "./ui";

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

  const margin = marginUsdt || (balance > 0 ? String(balance) : "");

  const result = useMemo(
    () => calcPositionSize({ dir, entry, sl, riskUsdt, marginUsdt: margin }),
    [dir, entry, sl, riskUsdt, margin],
  );

  const phaseRisk = balance > 0 ? round2(balance * (activePhase.risk / 100)) : null;
  const levOverLimit = result?.leverage && activePhase?.lev
    ? result.leverage > parseMaxLev(activePhase.lev)
    : false;

  function applyPhaseRisk() {
    if (phaseRisk != null) setRiskUsdt(String(phaseRisk));
  }

  function useFullBalance() {
    if (balance > 0) setMarginUsdt(String(round2(balance)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>Position Size Calculator</Label>
        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>
          Enter entry, stop-loss, and max loss in USDT. The calculator returns notional size, quantity, and leverage based on your margin.
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
                placeholder="5.00"
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
          <Field label="Margin / Wallet (USDT)">
            <div style={{ display: "flex", gap: 6 }}>
              <Inp
                value={marginUsdt}
                onChange={e => setMarginUsdt(e.target.value)}
                placeholder={balance > 0 ? String(round2(balance)) : "100"}
                type="number"
                step="0.01"
              />
              {balance > 0 && (
                <Btn onClick={useFullBalance} variant="default">Balance</Btn>
              )}
            </div>
          </Field>
        </div>
        {!marginUsdt && balance > 0 && (
          <div style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>
            Using wallet balance {fmt(balance)} for leverage — override margin if you allocate less.
          </div>
        )}
      </div>

      <div style={{
        background: C.surface,
        border: `1px solid ${result?.error ? C.redBorder : result?.notional ? C.greenBorder : C.border}`,
        borderRadius: 8, padding: 16,
      }}>
        <Label color={C.dim}>Result</Label>

        {result?.error && (
          <div style={{ color: C.red, fontSize: 13, marginTop: 12 }}>{result.error}</div>
        )}

        {!result && !result?.error && (
          <div style={{ color: C.muted, fontSize: 13, marginTop: 12 }}>
            Fill entry, stop-loss, and max loss to calculate.
          </div>
        )}

        {result && !result.error && (
          <div style={{ marginTop: 8 }}>
            <ResultRow
              label="Position Size (notional)"
              value={`${fmt(result.notional)} USDT`}
              accent={C.yellow}
              sub="Total contract value on Binance Futures"
            />
            <ResultRow
              label="Quantity"
              value={formatQuantity(result.quantity)}
              accent={C.bright}
              sub="Base asset units (qty = risk ÷ |entry − SL|)"
            />
            {result.leverage != null ? (
              <ResultRow
                label="Leverage"
                value={`${result.leverage}×`}
                accent={levOverLimit ? C.red : C.purple}
                sub={`Notional ${fmt(result.notional)} ÷ margin ${fmt(result.marginUsdt)}`}
              />
            ) : (
              <ResultRow
                label="Leverage"
                value="—"
                sub="Enter margin to calculate leverage"
              />
            )}
            <ResultRow
              label="Stop distance"
              value={`${result.stopPct}%`}
              accent={C.red}
              sub={`${result.stopDist} price units — loss at SL = ${fmt(result.riskUsdt)}`}
            />

            {levOverLimit && (
              <div style={{
                marginTop: 12, padding: 10, borderRadius: 6,
                background: C.redDim, border: `1px solid ${C.redBorder}`,
                color: C.red, fontSize: 12, lineHeight: 1.5,
              }}>
                Leverage {result.leverage}× exceeds {activePhase.tag} limit ({activePhase.lev}). Reduce size or increase margin.
              </div>
            )}

            {result.leverage != null && !levOverLimit && activePhase && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Label color={C.dim}>Leverage vs {activePhase.tag} max ({activePhase.lev})</Label>
                  <Label color={C.green}>{Math.min(100, (result.leverage / parseMaxLev(activePhase.lev)) * 100).toFixed(0)}%</Label>
                </div>
                <Bar
                  pct={(result.leverage / parseMaxLev(activePhase.lev)) * 100}
                  color={result.leverage / parseMaxLev(activePhase.lev) > 0.8 ? C.yellow : C.green}
                  height={4}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <Label color={C.dim}>Formula</Label>
        <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, marginTop: 10, fontFamily: "monospace" }}>
          <div>qty = risk ÷ |entry − SL|</div>
          <div>notional = qty × entry</div>
          <div>leverage = notional ÷ margin</div>
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

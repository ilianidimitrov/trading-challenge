import { useRef, useState } from "react";
import { C } from "../constants/palette";
import { PHASES } from "../constants/phases";
import { createEmptyTradeForm, SETUP_TYPES } from "../types/trade";
import { fmt, getActivePhase } from "../utils/format";
import { exportTradesJson, importTradesJson } from "../utils/tradeExport";
import { Btn, Inp, Label, Sel } from "./ui";

export function Journal({
  entries,
  balance,
  onSave,
  onUpdate,
  onDelete,
  onImport,
  useCloud,
  syncing,
  importLocalToCloud,
  localTradeCount,
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyTradeForm());
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const fileRef = useRef(null);

  const activePhase = getActivePhase(PHASES, balance);
  const wins = entries.filter(e => e.result === "WIN").length;
  const loss = entries.filter(e => e.result === "LOSS").length;
  const pnl  = entries.reduce((s, e) => s + parseFloat(e.pnl || 0), 0);
  const wr   = entries.length ? Math.round(wins / entries.length * 100) : null;

  function openNew() {
    setEditingId(null);
    setForm(createEmptyTradeForm(activePhase.risk));
    setErrors([]);
    setWarnings([]);
    setOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry.id);
    setForm({
      pair: entry.pair,
      dir: entry.dir,
      result: entry.result,
      entry: entry.entry ?? "",
      exit: entry.exit ?? "",
      sl: entry.sl ?? "",
      tp: entry.tp ?? "",
      pnl: String(entry.pnl),
      rr: entry.rr ?? "",
      riskPct: entry.riskPct != null ? String(entry.riskPct) : String(activePhase.risk),
      setup: entry.setup ?? "",
      notes: entry.notes ?? "",
      screenshotUrl: entry.screenshotUrl ?? "",
    });
    setErrors([]);
    setWarnings([]);
    setOpen(true);
  }

  async function save() {
    const handler = editingId ? onUpdate : onSave;
    const balanceBefore = editingId
      ? entries.find(e => e.id === editingId)?.balBefore ?? balance
      : balance;

    const result = await handler(editingId, form, balanceBefore);
    if (!result) return;

    if (!result.valid) {
      setErrors(result.errors);
      setWarnings(result.warnings || []);
      return;
    }

    setErrors([]);
    setWarnings(result.warnings || []);
    setForm(createEmptyTradeForm(activePhase.risk));
    setEditingId(null);
    setOpen(false);
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importTradesJson(file);
      await onImport(imported);
    } catch (err) {
      alert(err.message || "Грешка при import.");
    }
    e.target.value = "";
  }

  const sf = (k, v) => setForm(x => ({ ...x, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn onClick={openNew} variant="primary">+ New Trade</Btn>
        <Btn onClick={() => exportTradesJson(entries)} variant="default">Export JSON</Btn>
        <Btn onClick={() => fileRef.current?.click()} variant="default">Import JSON</Btn>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
        {useCloud && localTradeCount > 0 && (
          <Btn onClick={importLocalToCloud} variant="default" disabled={syncing}>
            {syncing ? "Syncing..." : `Import ${localTradeCount} local trades`}
          </Btn>
        )}
      </div>

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
          <div><Label color={C.dim}>Phase Risk</Label><div style={{ color: C.yellow, fontWeight: 700, marginTop: 2 }}>{activePhase.risk}%</div></div>
        </div>
      )}

      {/* Form */}
      {open && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
          <Label color={C.dim}>{editingId ? "Edit Trade" : "New Trade"}</Label>
          <div className="journal-grid" style={{ marginTop: 14, marginBottom: 12 }}>
            <Field label="Pair">
              <Inp value={form.pair} onChange={e => sf("pair", e.target.value)} placeholder="BTC/USDT" />
            </Field>
            <Field label="Direction">
              <Sel value={form.dir} onChange={e => sf("dir", e.target.value)}>
                <option>LONG</option><option>SHORT</option>
              </Sel>
            </Field>
            <Field label="Result">
              <Sel value={form.result} onChange={e => sf("result", e.target.value)}>
                <option>WIN</option><option>LOSS</option><option>BE</option>
              </Sel>
            </Field>
            <Field label="Entry Price">
              <Inp value={form.entry} onChange={e => sf("entry", e.target.value)} placeholder="65000" type="number" step="any" />
            </Field>
            <Field label="Exit Price">
              <Inp value={form.exit} onChange={e => sf("exit", e.target.value)} placeholder="66500" type="number" step="any" />
            </Field>
            <Field label="Stop Loss">
              <Inp value={form.sl} onChange={e => sf("sl", e.target.value)} placeholder="64000" type="number" step="any" />
            </Field>
            <Field label="Take Profit">
              <Inp value={form.tp} onChange={e => sf("tp", e.target.value)} placeholder="68000" type="number" step="any" />
            </Field>
            <Field label="PnL ($)">
              <Inp value={form.pnl} onChange={e => sf("pnl", e.target.value)} placeholder="+5.00 / −2.50" type="number" step="0.01" />
            </Field>
            <Field label="RR">
              <Inp value={form.rr} onChange={e => sf("rr", e.target.value)} placeholder="1:2.5" />
            </Field>
            <Field label={`Risk % (${activePhase.tag})`}>
              <Inp value={form.riskPct} onChange={e => sf("riskPct", e.target.value)} placeholder={String(activePhase.risk)} type="number" step="0.1" />
            </Field>
            <Field label="Setup Type">
              <Sel value={form.setup} onChange={e => sf("setup", e.target.value)}>
                <option value="">— Select —</option>
                {SETUP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </Field>
            <Field label="Screenshot URL">
              <Inp value={form.screenshotUrl} onChange={e => sf("screenshotUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Notes" className="journal-full">
              <Inp value={form.notes} onChange={e => sf("notes", e.target.value)} placeholder="Setup reason..." />
            </Field>
          </div>

          {errors.length > 0 && (
            <div style={{ color: C.red, fontSize: 12, marginBottom: 8 }}>
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
          {warnings.length > 0 && (
            <div style={{ color: C.yellow, fontSize: 12, marginBottom: 8 }}>
              {warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={save} variant="primary">{editingId ? "Update" : "Save Trade"}</Btn>
            <Btn onClick={() => { setOpen(false); setEditingId(null); }} variant="default">Cancel</Btn>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 40, textAlign: "center",
        }}>
          <Label color={C.muted}>No trades recorded</Label>
          <div style={{ color: C.dim, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
            Балансът се изчислява автоматично от записаните трейдове.<br />
            Записвай всеки трейд с Entry, SL, TP и RR за дисциплина.
          </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    background: e.dir === "LONG" ? C.greenDim : C.redDim,
                    color: e.dir === "LONG" ? C.green : C.red,
                    fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3,
                  }}>{e.dir}</span>
                  <span style={{ color: C.bright, fontWeight: 700 }}>{e.pair}</span>
                  {e.rr && <Label color={C.dim}>RR {e.rr}</Label>}
                  {e.setup && <Label color={C.dim}>{e.setup}</Label>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: rc, fontWeight: 800, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>
                    {p > 0 ? "+" : ""}{p.toFixed(2)}$
                  </div>
                  <Label color={C.muted}>{e.date}</Label>
                </div>
              </div>

              {(e.entry || e.exit || e.sl || e.tp) && (
                <div style={{ color: C.dim, fontSize: 11, marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {e.entry && <span>Entry: {e.entry}</span>}
                  {e.exit && <span>Exit: {e.exit}</span>}
                  {e.sl && <span>SL: {e.sl}</span>}
                  {e.tp && <span>TP: {e.tp}</span>}
                  {e.riskPct != null && <span>Risk: {e.riskPct}%</span>}
                </div>
              )}

              {e.screenshotUrl && (
                <a href={e.screenshotUrl} target="_blank" rel="noreferrer" style={{ color: C.blue, fontSize: 11, marginTop: 6, display: "inline-block" }}>
                  View screenshot
                </a>
              )}

              {e.notes && (
                <div style={{ color: C.dim, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>"{e.notes}"</div>
              )}

              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <Label color={C.muted}>{fmt(e.balBefore)}</Label>
                  <Label color={C.muted}>→</Label>
                  <Label color={e.balAfter > e.balBefore ? C.green : C.red}>{fmt(e.balAfter)}</Label>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn onClick={() => openEdit(e)} variant="default">Edit</Btn>
                  <Btn onClick={() => onDelete(e.id)} variant="danger">Delete</Btn>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <Label color={C.dim}>{label}</Label>
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}

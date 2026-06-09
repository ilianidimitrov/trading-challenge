import { useMemo, useRef, useState } from "react";
import { C } from "../constants/palette";
import { PHASES } from "../constants/phases";
import { BINANCE_PAIRS, MARKET_TYPES, EXCHANGE, DEFAULT_LEVERAGE } from "../constants/binance";
import { createEmptyTradeForm, mergeSetupTypes } from "../types/trade";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { isSupabaseConfigured } from "../lib/config";
import { uploadTradeScreenshot, fileToDataUrl } from "../lib/storage";
import { fmt, getActivePhase } from "../utils/format";
import { checkDiscipline } from "../utils/discipline";
import { filterAndSortTrades, SORT_OPTIONS } from "../utils/tradeFilters";
import { netPnl } from "../utils/tradeNormalize";
import {
  calcPnlFromPrices, calcRrFromPrices, calcSuggestedPositionUsdt,
} from "../utils/pnlCalc";
import { exportTradesJson, importTradesJson } from "../utils/tradeExport";
import { Btn, Inp, Label, Sel } from "./ui";
import { ConfirmModal } from "./ui/ConfirmModal";
import { EmptyState } from "./ui/EmptyState";
import { Lightbox } from "./ui/Lightbox";
import { ImportPreviewModal } from "./ui/ImportPreviewModal";

export function Journal({
  entries, balance, onSave, onUpdate, onDelete, onImport,
  getBalanceBeforeTrade, useCloud, syncing, importLocalToCloud, localTradeCount,
}) {
  const { user, profile } = useAuth();
  const toast = useToast();
  const setupTypes = mergeSetupTypes(profile?.custom_setups);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyTradeForm());
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [filterResult, setFilterResult] = useState("ALL");
  const [filterSetup, setFilterSetup] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [compact, setCompact] = useState(false);
  const [partialOpen, setPartialOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const fileRef = useRef(null);
  const screenshotRef = useRef(null);

  const activePhase = getActivePhase(PHASES, balance);
  const discipline = checkDiscipline(entries, balance);

  const filtered = useMemo(() => filterAndSortTrades(entries, {
    search, filterResult, filterSetup, sort,
  }), [entries, search, filterResult, filterSetup, sort]);

  const wins = entries.filter(e => e.result === "WIN").length;
  const loss = entries.filter(e => e.result === "LOSS").length;
  const pnl  = entries.reduce((s, e) => s + parseFloat(e.pnl || 0), 0);
  const wr   = entries.length ? Math.round(wins / entries.length * 100) : null;

  const suggestedNotional = calcSuggestedPositionUsdt({
    balance, riskPct: form.riskPct || activePhase.risk,
    entry: form.entry, sl: form.sl, leverage: form.leverage,
  });

  function sf(k, v) {
    setForm(x => {
      const next = { ...x, [k]: v };
      if (["entry", "exit", "quantity", "positionUsdt", "dir"].includes(k)) {
        const auto = calcPnlFromPrices(next);
        if (auto !== null) next.pnl = String(auto);
      }
      if (["entry", "exit", "sl", "dir"].includes(k) && !next.rr) {
        const rr = calcRrFromPrices(next);
        if (rr) next.rr = rr;
      }
      return next;
    });
  }

  function autoCalcPnl() {
    const pnlVal = calcPnlFromPrices(form);
    if (pnlVal !== null) sf("pnl", String(pnlVal));
    const rr = calcRrFromPrices(form);
    if (rr) sf("rr", rr);
  }

  function formFromEntry(entry) {
    return {
      pair: entry.pair,
      marketType: entry.marketType || "USDT-M",
      dir: entry.dir,
      result: entry.result,
      entry: entry.entry ?? "",
      exit: entry.exit ?? "",
      sl: entry.sl ?? "",
      tp: entry.tp ?? "",
      quantity: entry.quantity ?? "",
      positionUsdt: entry.positionUsdt ?? "",
      leverage: entry.leverage != null ? String(entry.leverage) : "",
      pnl: String(entry.pnl),
      rr: entry.rr ?? "",
      riskPct: entry.riskPct != null ? String(entry.riskPct) : String(activePhase.risk),
      setup: entry.setup ?? "",
      notes: entry.notes ?? "",
      screenshotUrl: entry.screenshotUrl ?? "",
      tradeAt: entry.tradeAt ?? createEmptyTradeForm().tradeAt,
      fees: entry.fees != null ? String(entry.fees) : "",
      funding: entry.funding != null ? String(entry.funding) : "",
      tp1: entry.tp1 ?? "",
      tp2: entry.tp2 ?? "",
      qtyTp1: entry.qtyTp1 ?? "",
      qtyTp2: entry.qtyTp2 ?? "",
      plannedRiskUsdt: entry.plannedRiskUsdt != null ? String(entry.plannedRiskUsdt) : "",
    };
  }

  function openNew() {
    setEditingId(null);
    setForm(createEmptyTradeForm(activePhase.risk, DEFAULT_LEVERAGE));
    setPartialOpen(false);
    setErrors([]);
    setWarnings(discipline.canTrade ? [] : discipline.alerts.filter(a => a.level === "danger").map(a => a.text));
    setOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry.id);
    setForm(formFromEntry(entry));
    setPartialOpen(Boolean(entry.tp1 || entry.tp2));
    setErrors([]);
    setWarnings([]);
    setOpen(true);
  }

  function openDuplicate(entry) {
    setEditingId(null);
    setForm(formFromEntry(entry));
    setPartialOpen(Boolean(entry.tp1 || entry.tp2));
    setErrors([]);
    setWarnings([]);
    setOpen(true);
  }

  async function handleScreenshot(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let url;
      if (useCloud && user && isSupabaseConfigured()) {
        url = await uploadTradeScreenshot(user.id, file);
      } else {
        url = await fileToDataUrl(file);
      }
      sf("screenshotUrl", url);
    } catch (err) {
      setErrors([err.message]);
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    const handler = editingId ? onUpdate : onSave;
    const balanceBefore = editingId ? getBalanceBeforeTrade(editingId) : balance;
    const result = await handler(editingId, form, balanceBefore);
    if (!result) return;
    if (!result.valid) {
      setErrors(result.errors);
      setWarnings(result.warnings || []);
      return;
    }
    toast.success(editingId ? "Trade updated" : "Trade saved");
    setErrors([]);
    setWarnings(result.warnings || []);
    setForm(createEmptyTradeForm(activePhase.risk));
    setEditingId(null);
    setOpen(false);
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const trades = await importTradesJson(file);
      setImportPreview(trades);
    } catch (err) {
      toast.error(err.message || "Import failed.");
    }
    e.target.value = "";
  }

  async function confirmImport() {
    if (!importPreview) return;
    try {
      await onImport(importPreview);
      toast.success(`Imported ${importPreview.length} trades`);
      setImportPreview(null);
    } catch (err) {
      toast.error(err.message || "Import failed.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Btn onClick={openNew} variant="primary">+ New Trade</Btn>
        <Btn onClick={() => exportTradesJson(entries)} variant="default">Export JSON</Btn>
        <Btn onClick={() => fileRef.current?.click()} variant="default">Import JSON</Btn>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: "none" }} />
        {useCloud && localTradeCount > 0 && (
          <Btn onClick={importLocalToCloud} variant="default" disabled={syncing}>
            {syncing ? "Syncing..." : `Import ${localTradeCount} local`}
          </Btn>
        )}
        <Btn onClick={() => setCompact(c => !c)} variant="default">
          {compact ? "Expanded" : "Compact"}
        </Btn>
        <Label color={C.muted}>{EXCHANGE} Futures · USDT PnL</Label>
      </div>

      {entries.length > 0 && (
        <>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "12px 16px",
            display: "flex", gap: 24, flexWrap: "wrap",
          }}>
            <Stat label="Trades" value={entries.length} />
            <Stat label="Win Rate" value={`${wr}%`} color={wr >= 50 ? C.green : C.red} />
            <Stat label="W / L" value={<><span style={{ color: C.green }}>{wins}</span> / <span style={{ color: C.red }}>{loss}</span></>} />
            <Stat label="Total PnL" value={`${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDT`} color={pnl >= 0 ? C.green : C.red} />
            <Stat label={`${activePhase.tag} Risk`} value={`${activePhase.risk}%`} color={C.yellow} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pair, setup, notes..." style={{ minWidth: 180, flex: 1 }} />
            <Sel value={sort} onChange={e => setSort(e.target.value)} style={{ width: "auto", minWidth: 130 }}>
              {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </Sel>
            <Sel value={filterResult} onChange={e => setFilterResult(e.target.value)} style={{ width: "auto", minWidth: 100 }}>
              <option value="ALL">All</option>
              <option value="WIN">Wins</option>
              <option value="LOSS">Losses</option>
              <option value="BE">Breakeven</option>
            </Sel>
            <Sel value={filterSetup} onChange={e => setFilterSetup(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
              <option value="">All setups</option>
              {setupTypes.map(s => <option key={s} value={s}>{s}</option>)}
            </Sel>
          </div>
        </>
      )}

      {open && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
          <Label color={C.dim}>{editingId ? "Edit Trade" : "New Binance Trade"}</Label>
          {!discipline.canTrade && !editingId && (
            <div style={{ color: C.red, fontSize: 12, marginTop: 8, padding: 10, background: C.redDim, borderRadius: 6 }}>
              Kill switch active — pause recommended for this Binance Futures session.
            </div>
          )}
          <div className="journal-grid" style={{ marginTop: 14, marginBottom: 12 }}>
            <Field label="Trade Date & Time">
              <Inp type="datetime-local" value={form.tradeAt} onChange={e => sf("tradeAt", e.target.value)} />
            </Field>
            <Field label="Pair (Binance)">
              <Sel value={form.pair} onChange={e => sf("pair", e.target.value)}>
                {BINANCE_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
              </Sel>
            </Field>
            <Field label="Market">
              <Sel value={form.marketType} onChange={e => sf("marketType", e.target.value)}>
                {MARKET_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </Sel>
            </Field>
            <Field label="Side">
              <Sel value={form.dir} onChange={e => sf("dir", e.target.value)}>
                <option>LONG</option><option>SHORT</option>
              </Sel>
            </Field>
            <Field label="Leverage">
              <Inp value={form.leverage} onChange={e => sf("leverage", e.target.value)} placeholder="10" type="number" step="1" />
            </Field>
            <Field label="Entry Price">
              <Inp value={form.entry} onChange={e => sf("entry", e.target.value)} placeholder="65000.00" type="number" step="any" />
            </Field>
            <Field label="Exit Price">
              <Inp value={form.exit} onChange={e => sf("exit", e.target.value)} placeholder="66500.00" type="number" step="any" />
            </Field>
            <Field label="Stop Loss">
              <Inp value={form.sl} onChange={e => sf("sl", e.target.value)} placeholder="64000.00" type="number" step="any" />
            </Field>
            <Field label="Take Profit">
              <Inp value={form.tp} onChange={e => sf("tp", e.target.value)} placeholder="68000.00" type="number" step="any" />
            </Field>
            <Field label="Quantity (base asset)">
              <Inp value={form.quantity} onChange={e => sf("quantity", e.target.value)} placeholder="0.015 BTC" type="number" step="any" />
            </Field>
            <Field label="Position Size (USDT)">
              <Inp value={form.positionUsdt} onChange={e => sf("positionUsdt", e.target.value)} placeholder="1000" type="number" step="any" />
            </Field>
            <Field label="PnL (USDT)">
              <div style={{ display: "flex", gap: 6 }}>
                <Inp value={form.pnl} onChange={e => sf("pnl", e.target.value)} placeholder="+12.50" type="number" step="0.01" />
                <Btn onClick={autoCalcPnl} variant="default">Auto</Btn>
              </div>
            </Field>
            <Field label="Fees (USDT)">
              <Inp value={form.fees} onChange={e => sf("fees", e.target.value)} placeholder="0.50" type="number" step="0.01" />
            </Field>
            <Field label="Funding (USDT)">
              <Inp value={form.funding} onChange={e => sf("funding", e.target.value)} placeholder="0.20" type="number" step="0.01" />
            </Field>
            <Field label="RR">
              <Inp value={form.rr} onChange={e => sf("rr", e.target.value)} placeholder="1:2.5" />
            </Field>
            <Field label={`Risk % (${activePhase.tag})`}>
              <Inp value={form.riskPct} onChange={e => sf("riskPct", e.target.value)} type="number" step="0.1" />
            </Field>
            <Field label="Planned Risk (USDT)">
              <Inp value={form.plannedRiskUsdt} onChange={e => sf("plannedRiskUsdt", e.target.value)} placeholder="5.00" type="number" step="0.01" />
            </Field>
            <Field label="Setup">
              <Sel value={form.setup} onChange={e => sf("setup", e.target.value)}>
                <option value="">— Select —</option>
                {setupTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </Field>
            <Field label="Screenshot">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <Btn onClick={() => screenshotRef.current?.click()} variant="default" disabled={uploading}>
                  {uploading ? "..." : "Upload"}
                </Btn>
                <Inp value={form.screenshotUrl} onChange={e => sf("screenshotUrl", e.target.value)} placeholder="URL or upload" />
                <input ref={screenshotRef} type="file" accept="image/*" onChange={handleScreenshot} style={{ display: "none" }} />
                {form.screenshotUrl && (
                  <img src={form.screenshotUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, cursor: "pointer" }} onClick={() => setLightboxSrc(form.screenshotUrl)} />
                )}
              </div>
            </Field>
            <Field label="Result">
              <Sel value={form.result} onChange={e => sf("result", e.target.value)}>
                <option>WIN</option><option>LOSS</option><option>BE</option>
              </Sel>
            </Field>
            <Field label="Notes" className="journal-full">
              <Inp value={form.notes} onChange={e => sf("notes", e.target.value)} placeholder="Funding, liquidation risk, setup notes..." />
            </Field>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Btn onClick={() => setPartialOpen(o => !o)} variant="default">
              {partialOpen ? "Hide" : "Show"} Partial Close (TP1/TP2)
            </Btn>
            {partialOpen && (
              <div className="journal-grid" style={{ marginTop: 10 }}>
                <Field label="TP1 Price"><Inp value={form.tp1} onChange={e => sf("tp1", e.target.value)} type="number" step="any" /></Field>
                <Field label="TP1 Qty"><Inp value={form.qtyTp1} onChange={e => sf("qtyTp1", e.target.value)} type="number" step="any" /></Field>
                <Field label="TP2 Price"><Inp value={form.tp2} onChange={e => sf("tp2", e.target.value)} type="number" step="any" /></Field>
                <Field label="TP2 Qty"><Inp value={form.qtyTp2} onChange={e => sf("qtyTp2", e.target.value)} type="number" step="any" /></Field>
              </div>
            )}
          </div>

          {suggestedNotional && (
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 10 }}>
              Suggested notional at {form.riskPct || activePhase.risk}% risk + SL: ~{suggestedNotional} USDT
              <span style={{ marginLeft: 8 }}>
                <Btn onClick={() => sf("positionUsdt", String(suggestedNotional))} variant="default">Apply</Btn>
              </span>
            </div>
          )}

          {errors.length > 0 && <div style={{ color: C.red, fontSize: 12, marginBottom: 8 }}>{errors.map((e, i) => <div key={i}>{e}</div>)}</div>}
          {warnings.length > 0 && <div style={{ color: C.yellow, fontSize: 12, marginBottom: 8 }}>{warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={save} variant="primary">{editingId ? "Update" : "Save Trade"}</Btn>
            <Btn onClick={() => { setOpen(false); setEditingId(null); }} variant="default">Cancel</Btn>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={entries.length > 0 ? "No trades match filter" : "No trades recorded"}>
          {entries.length > 0
            ? "Try changing search or filters."
            : "Log every Binance Futures trade with entry, SL, TP, and leverage. PnL is entered in USDT."}
        </EmptyState>
      ) : (
        filtered.map(e => (
          <TradeCard
            key={e.id}
            e={e}
            compact={compact}
            onEdit={openEdit}
            onDuplicate={openDuplicate}
            onDelete={setDeleteId}
            onLightbox={setLightboxSrc}
          />
        ))
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Trade"
        message="Are you sure? USDT balance will be recalculated from trade history."
        onConfirm={() => { onDelete(deleteId); setDeleteId(null); toast.success("Trade deleted"); }}
        onCancel={() => setDeleteId(null)}
      />
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <ImportPreviewModal
        open={importPreview != null}
        trades={importPreview || []}
        onConfirm={confirmImport}
        onCancel={() => setImportPreview(null)}
      />
    </div>
  );
}

function TradeCard({ e, compact, onEdit, onDuplicate, onDelete, onLightbox }) {
  const p = parseFloat(e.pnl);
  const net = netPnl(e);
  const rc = e.result === "WIN" ? C.green : e.result === "LOSS" ? C.red : C.yellow;
  const hasFees = parseFloat(e.fees) || parseFloat(e.funding);

  if (compact) {
    return (
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${rc}`, borderRadius: 8, padding: "8px 12px",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ color: rc, fontWeight: 800, fontSize: 11 }}>{e.dir}</span>
          <span style={{ color: C.bright, fontWeight: 700, fontSize: 13 }}>{e.pair}</span>
          {e.setup && <Label color={C.muted}>{e.setup}</Label>}
          <Label color={C.muted}>{e.date}</Label>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: rc, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{p > 0 ? "+" : ""}{p.toFixed(2)}</span>
          <Btn onClick={() => onEdit(e)} variant="default">Edit</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${rc}`, borderRadius: 8, padding: "12px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ background: e.dir === "LONG" ? C.greenDim : C.redDim, color: e.dir === "LONG" ? C.green : C.red, fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3 }}>{e.dir}</span>
          <span style={{ color: C.bright, fontWeight: 700 }}>{e.pair}</span>
          <Label color={C.muted}>{e.marketType || "USDT-M"}</Label>
          {e.leverage && <Label color={C.purple}>{e.leverage}×</Label>}
          {e.rr && <Label color={C.dim}>RR {e.rr}</Label>}
          {e.setup && <Label color={C.dim}>{e.setup}</Label>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: rc, fontWeight: 800, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{p > 0 ? "+" : ""}{p.toFixed(2)} USDT</div>
          {hasFees && (
            <Label color={C.muted}>Net {net >= 0 ? "+" : ""}{net.toFixed(2)} after fees</Label>
          )}
          <Label color={C.muted}>{e.date}</Label>
        </div>
      </div>
      <div style={{ color: C.dim, fontSize: 11, marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {e.entry && <span>Entry: {e.entry}</span>}
        {e.exit && <span>Exit: {e.exit}</span>}
        {e.sl && <span>SL: {e.sl}</span>}
        {e.tp && <span>TP: {e.tp}</span>}
        {(e.tp1 || e.tp2) && <span>Partial: TP1 {e.tp1 || "—"} / TP2 {e.tp2 || "—"}</span>}
        {e.positionUsdt && <span>Size: {e.positionUsdt} USDT</span>}
        {e.quantity && <span>Qty: {e.quantity}</span>}
      </div>
      {e.screenshotUrl && (
        <img
          src={e.screenshotUrl}
          alt="Chart"
          onClick={() => onLightbox(e.screenshotUrl)}
          style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4, marginTop: 8, cursor: "pointer", border: `1px solid ${C.border}` }}
        />
      )}
      {e.notes && <div style={{ color: C.dim, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>"{e.notes}"</div>}
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <Label color={C.muted}>{fmt(e.balBefore)}</Label><Label color={C.muted}>→</Label>
          <Label color={e.balAfter > e.balBefore ? C.green : C.red}>{fmt(e.balAfter)}</Label>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn onClick={() => onDuplicate(e)} variant="default">Duplicate</Btn>
          <Btn onClick={() => onEdit(e)} variant="default">Edit</Btn>
          <Btn onClick={() => onDelete(e.id)} variant="danger">Delete</Btn>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = C.bright }) {
  return (
    <div>
      <Label color={C.dim}>{label}</Label>
      <div style={{ color, fontWeight: 700, marginTop: 2 }}>{value}</div>
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

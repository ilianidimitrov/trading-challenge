import { buildDailyPnlMap } from "../../utils/calendarHeatmap";

export function CalendarHeatmap({ trades }) {
  const { days, maxAbs } = buildDailyPnlMap(trades);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {days.map(d => {
        const intensity = d.count ? Math.min(1, Math.abs(d.pnl) / maxAbs) : 0;
        let bg = "var(--color-border)";
        if (d.pnl > 0) bg = `color-mix(in srgb, var(--color-green) ${30 + intensity * 70}%, var(--color-border))`;
        else if (d.pnl < 0) bg = `color-mix(in srgb, var(--color-red) ${30 + intensity * 70}%, var(--color-border))`;

        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)} USDT (${d.count} trades)`}
            style={{
              width: 12, height: 12, borderRadius: 2, background: bg,
              opacity: d.count ? 1 : 0.35,
            }}
          />
        );
      })}
    </div>
  );
}

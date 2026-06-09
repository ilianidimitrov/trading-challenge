import { buildEquityCurve } from "../../utils/equityCurve";
import { STARTING_BALANCE } from "../../constants/palette";

export function EquityCurve({ trades, height = 120 }) {
  const points = buildEquityCurve(trades);
  if (points.length < 2) return null;

  const balances = points.map(p => p.balance);
  const min = Math.min(...balances, STARTING_BALANCE);
  const max = Math.max(...balances, STARTING_BALANCE);
  const range = max - min || 1;
  const w = 100;
  const h = height;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p.balance - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");

  const last = points[points.length - 1];
  const positive = last.balance >= STARTING_BALANCE;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
        <polyline
          fill="none"
          stroke={positive ? "var(--color-green)" : "var(--color-red)"}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          points={coords}
        />
        <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "var(--color-green)" : "var(--color-red)"} stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <polygon
          fill="url(#eq-fill)"
          points={`0,${h} ${coords} ${w},${h}`}
        />
      </svg>
    </div>
  );
}

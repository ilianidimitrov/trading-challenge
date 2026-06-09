import { phaseProgressPct } from "../utils/milestones";
import { PHASE_COLORS } from "../constants/palette";

export function PhaseRing({ balance, phase, size = 56, pulse = false }) {
  const pct = phaseProgressPct(balance, phase);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = PHASE_COLORS[(phase.id || 1) - 1];

  return (
    <svg
      width={size}
      height={size}
      className={pulse ? "phase-ring-pulse" : undefined}
      style={{ flexShrink: 0 }}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="var(--color-bright)" fontSize="11" fontWeight="800">
        {phase.tag}
      </text>
    </svg>
  );
}

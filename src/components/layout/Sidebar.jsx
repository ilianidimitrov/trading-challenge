import { NAV_ITEMS } from "../../constants/nav";
import { PHASE_COLORS } from "../../constants/palette";

export function Sidebar({ active, onChange, activePhaseId }) {
  const accent = PHASE_COLORS[(activePhaseId || 1) - 1];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-tag">TC</span>
        <span className="sidebar-brand-text">Challenge</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`sidebar-nav-item${isActive ? " sidebar-nav-item-active" : ""}`}
              style={isActive ? { borderLeftColor: accent, color: "var(--color-bright)" } : undefined}
              onClick={() => onChange(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

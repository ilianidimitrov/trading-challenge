import { NAV_ITEMS } from "../../constants/nav";

export function MoreMenu({ open, active, onSelect, onClose }) {
  if (!open) return null;

  const extra = NAV_ITEMS.filter(i => !["dashboard", "journal", "phases", "leaderboard"].includes(i.key));

  return (
    <>
      <div className="more-menu-backdrop" onClick={onClose} />
      <div className="more-menu">
        <div className="more-menu-title">More</div>
        {extra.map(item => (
          <button
            key={item.key}
            type="button"
            className={`more-menu-item${active === item.key ? " more-menu-item-active" : ""}`}
            onClick={() => { onSelect(item.key); onClose(); }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

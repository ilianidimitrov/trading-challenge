import { MOBILE_NAV } from "../../constants/nav";

export function BottomNav({ active, onChange, moreOpen, onMore }) {
  return (
    <nav className="bottom-nav">
      {MOBILE_NAV.map(item => {
        const isActive = item.key === "more" ? moreOpen : active === item.key;
        const onClick = item.key === "more" ? onMore : () => onChange(item.key);
        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item${isActive ? " bottom-nav-item-active" : ""}`}
            onClick={onClick}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

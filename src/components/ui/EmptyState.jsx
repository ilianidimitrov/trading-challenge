import { Label } from "./Label";

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state">
      <Label color="var(--color-muted)">{title}</Label>
      {children && (
        <div className="empty-state-body">{children}</div>
      )}
      {action}
    </div>
  );
}

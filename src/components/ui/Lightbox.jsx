export function Lightbox({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1500,
        background: "#000000dd", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <img
        src={src}
        alt="Trade screenshot"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 8 }}
      />
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "fixed", top: 16, right: 16,
          border: "none", background: "var(--color-surface)",
          color: "var(--color-bright)", fontSize: 24, width: 40, height: 40,
          borderRadius: 8, cursor: "pointer",
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

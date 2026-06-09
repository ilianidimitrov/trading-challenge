import { useEffect, useState } from "react";
import { C } from "../../constants/palette";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Btn, Inp, Label } from "../ui";

export function SettingsModal({ open, onClose }) {
  const { user, profile, isConfigured, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (open && profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
    }
  }, [open, profile]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!open || !user) return null;

  async function handleSave(e) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const { error: err } = await supabase.from("profiles").update({
        display_name: displayName.trim(),
        username: username.trim(),
      }).eq("id", user.id);
      if (err) throw err;
      await refreshProfile();
      setSuccess(true);
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isConfigured) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "#000000aa",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 24, width: "100%", maxWidth: 400,
        }}
      >
        <Label color={C.muted}>Profile Settings</Label>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          <div>
            <Label color={C.dim}>Username</Label>
            <div style={{ marginTop: 4 }}>
              <Inp value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
            </div>
          </div>
          <div>
            <Label color={C.dim}>Display Name</Label>
            <div style={{ marginTop: 4 }}>
              <Inp value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ilian" />
            </div>
          </div>
          <div style={{ color: C.dim, fontSize: 11 }}>Email: {user.email}</div>
          {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
          {success && <div style={{ color: C.green, fontSize: 12 }}>Saved!</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn type="submit" variant="primary" disabled={saving}>{saving ? "..." : "Save"}</Btn>
            <Btn type="button" onClick={onClose} variant="default">Cancel</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

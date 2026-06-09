import { useEffect, useRef, useState } from "react";
import { C } from "../../constants/palette";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { supabase } from "../../lib/supabase";
import { uploadAvatar } from "../../lib/storage";
import { Btn, Inp, Label } from "../ui";

export function SettingsModal({ open, onClose }) {
  const { user, profile, isConfigured, refreshProfile, updatePassword } = useAuth();
  const toast = useToast();
  const avatarRef = useRef(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [customSetup, setCustomSetup] = useState("");
  const [customSetups, setCustomSetups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setCustomSetups(Array.isArray(profile.custom_setups) ? profile.custom_setups : []);
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [open, profile]);

  if (!open || !user) return null;
  if (!isConfigured) return null;

  function addSetup() {
    const name = customSetup.trim();
    if (!name || customSetups.includes(name)) return;
    setCustomSetups(prev => [...prev, name]);
    setCustomSetup("");
  }

  function removeSetup(name) {
    setCustomSetups(prev => prev.filter(s => s !== name));
  }

  async function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      await refreshProfile();
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError("");
    try {
      const { error: err } = await supabase.from("profiles").update({
        display_name: displayName.trim(),
        username: username.trim(),
        custom_setups: customSetups,
      }).eq("id", user.id);
      if (err) throw err;

      if (newPassword) {
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
        await updatePassword(newPassword);
      }

      await refreshProfile();
      toast.success("Settings saved");
      setTimeout(onClose, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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
          borderRadius: 12, padding: 24, width: "100%", maxWidth: 440,
          maxHeight: "90vh", overflow: "auto",
        }}
      >
        <Label color={C.muted}>Profile Settings</Label>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.border, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 18 }}>?</div>
            )}
            <Btn type="button" onClick={() => avatarRef.current?.click()} variant="default" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Avatar"}
            </Btn>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
          </div>

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

          <div>
            <Label color={C.dim}>Change Password</Label>
            <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 8 }}>
              <Inp type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
              <Inp type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
            </div>
          </div>

          <div>
            <Label color={C.dim}>Custom Setups</Label>
            <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
              <Inp value={customSetup} onChange={e => setCustomSetup(e.target.value)} placeholder="My setup name" />
              <Btn type="button" onClick={addSetup} variant="default">Add</Btn>
            </div>
            {customSetups.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {customSetups.map(s => (
                  <span key={s} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 4, background: C.border, fontSize: 12,
                  }}>
                    {s}
                    <button type="button" onClick={() => removeSetup(s)} style={{ border: "none", background: "none", color: C.red, cursor: "pointer" }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ color: C.dim, fontSize: 11 }}>Email: {user.email}</div>
          {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn type="submit" variant="primary" disabled={saving}>{saving ? "..." : "Save"}</Btn>
            <Btn type="button" onClick={onClose} variant="default">Cancel</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

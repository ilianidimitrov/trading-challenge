import { C } from "../../constants/palette";
import { useAuth } from "../../contexts/AuthContext";
import { Btn, Label } from "../ui";

export function AuthBar({ onLoginClick, onSettingsClick }) {
  const { user, profile, signOut, isConfigured } = useAuth();

  if (!isConfigured) return null;

  return (
    <div style={{
      display: "flex", justifyContent: "flex-end", alignItems: "center",
      gap: 12, marginBottom: 16,
    }}>
      {user ? (
        <>
          <Label color={C.dim}>
            {profile?.display_name || profile?.username || user.email}
          </Label>
          <Btn onClick={onSettingsClick} variant="default">Settings</Btn>
          <Btn onClick={signOut} variant="default">Logout</Btn>
        </>
      ) : (
        <Btn onClick={onLoginClick} variant="primary">Login / Register</Btn>
      )}
    </div>
  );
}

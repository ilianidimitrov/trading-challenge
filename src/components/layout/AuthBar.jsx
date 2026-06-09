import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Btn, Label } from "../ui";

export function AuthBar({ onLoginClick, onSettingsClick }) {
  const { user, profile, signOut, isConfigured } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isConfigured) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn onClick={toggleTheme} variant="default" title="Toggle theme">
          {theme === "dark" ? "Light" : "Dark"}
        </Btn>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", justifyContent: "flex-end", alignItems: "center",
      gap: 12, marginBottom: 16,
    }}>
      <Btn onClick={toggleTheme} variant="default" title="Toggle theme">
        {theme === "dark" ? "Light" : "Dark"}
      </Btn>
      {user ? (
        <>
          <Label color="var(--color-dim)">
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

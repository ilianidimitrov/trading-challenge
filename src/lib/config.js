const PRODUCTION_SITE_URL = "https://trading-challenge-psi.vercel.app";

export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "",
  siteUrl: import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") || "",
  telegramNotifyEnabled: import.meta.env.VITE_TELEGRAM_NOTIFY_ENABLED === "true",
  telegramWebhookUrl: import.meta.env.VITE_TELEGRAM_WEBHOOK_URL || "",
};

export const isSupabaseConfigured = () =>
  Boolean(config.supabaseUrl && config.supabaseAnonKey);

/** Redirect target for Supabase email links (confirm signup, reset password). */
export function getAuthRedirectUrl() {
  if (config.siteUrl) return `${config.siteUrl}/`;

  if (typeof window !== "undefined") {
    const { origin } = window.location;
    if (origin && !origin.includes("localhost")) return `${origin}/`;
  }

  if (import.meta.env.PROD) return `${PRODUCTION_SITE_URL}/`;

  if (typeof window !== "undefined") return `${window.location.origin}/`;

  return `${PRODUCTION_SITE_URL}/`;
}

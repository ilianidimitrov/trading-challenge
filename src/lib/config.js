export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "",
  telegramNotifyEnabled: import.meta.env.VITE_TELEGRAM_NOTIFY_ENABLED === "true",
  telegramWebhookUrl: import.meta.env.VITE_TELEGRAM_WEBHOOK_URL || "",
};

export const isSupabaseConfigured = () =>
  Boolean(config.supabaseUrl && config.supabaseAnonKey);

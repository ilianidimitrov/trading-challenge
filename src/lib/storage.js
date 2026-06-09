import { supabase } from "./supabase";

const BUCKET = "trade-screenshots";
const MAX_SIZE_MB = 2;

export async function uploadTradeScreenshot(userId, file) {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Maximum file size: ${MAX_SIZE_MB}MB`);
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

const AVATAR_BUCKET = "avatars";

export async function uploadAvatar(userId, file) {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Maximum file size: ${MAX_SIZE_MB}MB`);
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function fileToDataUrl(file) {
  if (file.size > 500 * 1024) {
    throw new Error("Local limit: 500KB max. Sign in to upload larger files.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

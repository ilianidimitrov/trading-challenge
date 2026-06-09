import { supabase } from "./supabase";

const BUCKET = "trade-screenshots";
const MAX_SIZE_MB = 2;

export async function uploadTradeScreenshot(userId, file) {
  if (!supabase) throw new Error("Supabase не е конфигуриран.");
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Максимален размер: ${MAX_SIZE_MB}MB`);
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

export async function fileToDataUrl(file) {
  if (file.size > 500 * 1024) {
    throw new Error("Локално: макс. 500KB. Качи в cloud акаунт за по-големи файлове.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

-- Trade date/time, fees, funding, partial close, planned risk
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS trade_at timestamptz,
  ADD COLUMN IF NOT EXISTS fees numeric,
  ADD COLUMN IF NOT EXISTS funding numeric,
  ADD COLUMN IF NOT EXISTS tp1 numeric,
  ADD COLUMN IF NOT EXISTS tp2 numeric,
  ADD COLUMN IF NOT EXISTS qty_tp1 numeric,
  ADD COLUMN IF NOT EXISTS qty_tp2 numeric,
  ADD COLUMN IF NOT EXISTS planned_risk_usdt numeric;

-- User-defined setup names
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS custom_setups jsonb DEFAULT '[]'::jsonb;

-- Avatar storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Leaderboard: add last trade timestamp for activity filter
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  p.display_name,
  coalesce(sum(t.pnl), 0) + 100 AS balance,
  count(t.id) AS trade_count,
  CASE
    WHEN count(t.id) > 0
    THEN round(100.0 * count(t.id) FILTER (WHERE t.result = 'WIN') / count(t.id), 1)
    ELSE NULL
  END AS win_rate,
  (
    SELECT t2.rr FROM public.trades t2
    WHERE t2.user_id = p.id AND t2.rr IS NOT NULL AND t2.rr != ''
    GROUP BY t2.rr
    ORDER BY count(*) DESC
    LIMIT 1
  ) AS avg_rr,
  CASE
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 6500  THEN 'P10'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 4000  THEN 'P09'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 2500  THEN 'P08'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 1600  THEN 'P07'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 1000  THEN 'P06'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 650   THEN 'P05'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 400   THEN 'P04'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 250   THEN 'P03'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 150   THEN 'P02'
    WHEN coalesce(sum(t.pnl), 0) + 100 >= 100   THEN 'P01'
    ELSE 'P01'
  END AS current_phase,
  max(t.created_at) AS last_trade_at
FROM public.profiles p
LEFT JOIN public.trades t ON t.user_id = p.id
GROUP BY p.id, p.username, p.display_name
ORDER BY balance DESC;

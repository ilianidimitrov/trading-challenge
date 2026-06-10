-- Challenge: $5 → $100K USDT (phase thresholds match src/constants/phases.js)

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  p.display_name,
  coalesce(sum(t.pnl), 0) + 5 AS balance,
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
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 75000  THEN 'P10'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 55000  THEN 'P09'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 35000  THEN 'P08'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 15000  THEN 'P07'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 5000   THEN 'P06'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 1000   THEN 'P05'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 300    THEN 'P04'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 100    THEN 'P03'
    WHEN coalesce(sum(t.pnl), 0) + 5 >= 25     THEN 'P02'
  ELSE 'P01'
  END AS current_phase,
  max(t.created_at) AS last_trade_at
FROM public.profiles p
LEFT JOIN public.trades t ON t.user_id = p.id
GROUP BY p.id, p.username, p.display_name
ORDER BY balance DESC;

CREATE OR REPLACE FUNCTION public.validate_trade_pnl()
RETURNS trigger AS $$
DECLARE
  user_balance numeric;
  max_allowed numeric;
BEGIN
  SELECT coalesce(sum(pnl), 0) + 5 INTO user_balance
  FROM public.trades
  WHERE user_id = new.user_id
    AND id IS DISTINCT FROM new.id;

  max_allowed := greatest(user_balance * 0.5, 1);

  IF abs(new.pnl) > max_allowed THEN
    RAISE EXCEPTION 'Trade PnL (%) exceeds maximum allowed (%) for balance %',
      new.pnl, max_allowed, user_balance;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql;

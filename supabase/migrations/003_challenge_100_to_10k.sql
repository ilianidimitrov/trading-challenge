create or replace view public.leaderboard as
select
  p.id as user_id,
  p.username,
  p.display_name,
  coalesce(sum(t.pnl), 0) + 100 as balance,
  count(t.id) as trade_count,
  case
    when count(t.id) > 0
    then round(100.0 * count(t.id) filter (where t.result = 'WIN') / count(t.id), 1)
    else null
  end as win_rate,
  (
    select t2.rr from public.trades t2
    where t2.user_id = p.id and t2.rr is not null and t2.rr != ''
    group by t2.rr
    order by count(*) desc
    limit 1
  ) as avg_rr,
  case
    when coalesce(sum(t.pnl), 0) + 100 >= 6500  then 'P10'
    when coalesce(sum(t.pnl), 0) + 100 >= 4000  then 'P09'
    when coalesce(sum(t.pnl), 0) + 100 >= 2500  then 'P08'
    when coalesce(sum(t.pnl), 0) + 100 >= 1600  then 'P07'
    when coalesce(sum(t.pnl), 0) + 100 >= 1000  then 'P06'
    when coalesce(sum(t.pnl), 0) + 100 >= 650   then 'P05'
    when coalesce(sum(t.pnl), 0) + 100 >= 400   then 'P04'
    when coalesce(sum(t.pnl), 0) + 100 >= 250   then 'P03'
    when coalesce(sum(t.pnl), 0) + 100 >= 150   then 'P02'
    when coalesce(sum(t.pnl), 0) + 100 >= 100   then 'P01'
    else 'P01'
  end as current_phase
from public.profiles p
left join public.trades t on t.user_id = p.id
group by p.id, p.username, p.display_name
order by balance desc;

create or replace function public.validate_trade_pnl()
returns trigger as $$
declare
  user_balance numeric;
  max_allowed numeric;
begin
  select coalesce(sum(pnl), 0) + 100 into user_balance
  from public.trades
  where user_id = new.user_id
    and id is distinct from new.id;

  max_allowed := greatest(user_balance * 0.5, 1);

  if abs(new.pnl) > max_allowed then
    raise exception 'Trade PnL (%) exceeds maximum allowed (%) for balance %',
      new.pnl, max_allowed, user_balance;
  end if;

  return new;
end;
$$ language plpgsql;

-- Anti-cheat: reject trades where |pnl| exceeds 50% of balance at time of trade
-- Run after schema.sql if you want server-side validation

create or replace function public.validate_trade_pnl()
returns trigger as $$
declare
  user_balance numeric;
  max_allowed numeric;
begin
  select coalesce(sum(pnl), 0) + 5 into user_balance
  from public.trades
  where user_id = new.user_id
    and id is distinct from new.id;

  -- Max single trade loss/gain: 50% of current balance (generous for all phases)
  max_allowed := greatest(user_balance * 0.5, 1);

  if abs(new.pnl) > max_allowed then
    raise exception 'Trade PnL (%) exceeds maximum allowed (%) for balance %',
      new.pnl, max_allowed, user_balance;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_trade_pnl_trigger on public.trades;
create trigger validate_trade_pnl_trigger
  before insert or update on public.trades
  for each row execute function public.validate_trade_pnl();

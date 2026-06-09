
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

drop trigger if exists validate_trade_pnl_trigger on public.trades;
create trigger validate_trade_pnl_trigger
  before insert or update on public.trades
  for each row execute function public.validate_trade_pnl();

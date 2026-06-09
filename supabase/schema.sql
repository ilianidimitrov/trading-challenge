
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create table if not exists public.trades (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  pair text not null,
  dir text not null check (dir in ('LONG', 'SHORT')),
  result text not null check (result in ('WIN', 'LOSS', 'BE')),
  entry numeric,
  exit numeric,
  sl numeric,
  tp numeric,
  pnl numeric not null,
  rr text,
  risk_pct numeric,
  setup text,
  notes text,
  screenshot_url text,
  market_type text default 'USDT-M',
  leverage numeric,
  quantity numeric,
  position_usdt numeric,
  created_at timestamptz default now()
);

create index if not exists trades_user_id_idx on public.trades(user_id);
create index if not exists trades_created_at_idx on public.trades(created_at desc);

alter table public.trades enable row level security;

create policy "Trades are viewable by everyone"
  on public.trades for select using (true);

create policy "Users can insert own trades"
  on public.trades for insert with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trades for update using (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trades for delete using (auth.uid() = user_id);

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

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

